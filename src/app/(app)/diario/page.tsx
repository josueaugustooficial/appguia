'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChild } from '@/hooks/useChild'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from '@phosphor-icons/react'

const ENTRY_TYPES = [
  { id: 'crisis', label: 'Crise', emoji: '🔴', color: 'var(--red-alert)' },
  { id: 'observation', label: 'Alerta', emoji: '🟡', color: 'var(--amber-core)' },
  { id: 'victory', label: 'Conquista', emoji: '🟢', color: 'var(--teal-vivid)' },
  { id: 'activity', label: 'Atividade', emoji: '💪', color: 'var(--lilac-calm)' },
]

const TRIGGER_CHIPS = [
  'Barulho', 'Rotina quebrada', 'Fome', 'Cansaço',
  'Toque', 'Luz', 'Multidão', 'Frustração',
  'Temperatura', 'Cheiro', 'Transição', 'Outro',
]

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type DiaryEntry = {
  id: string
  entry_date: string
  entry_type: string
  title: string
  intensity: number | null
  traffic_light: string | null
  description: string | null
  possible_trigger: string | null
  what_helped: string | null
  duration_minutes: number | null
  created_at: string
}

export default function DiarioPage() {
  // ✅ FIX: useMemo evita nova instância a cada render
  const supabase = useMemo(() => createClient(), [])
  const { activeChild } = useChild()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Form state
  const [entryType, setEntryType] = useState('observation')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [intensity, setIntensity] = useState<number | null>(null)
  const [duration, setDuration] = useState('')
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [whatHelped, setWhatHelped] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchEntries = async () => {
    if (!activeChild) return
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('child_id', (activeChild as Record<string, string>).id)
      .gte('entry_date', start)
      .lte('entry_date', end)
      .order('entry_date', { ascending: false })
    setEntries((data || []) as DiaryEntry[])
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [activeChild, currentMonth])

  const toggleTrigger = (t: string) => {
    setSelectedTriggers(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  }

  const getTrafficLight = (type: string, int: number | null): string => {
    if (type === 'crisis') return int && int >= 4 ? 'red' : 'yellow'
    if (type === 'victory') return 'green'
    return int && int >= 4 ? 'red' : int === 3 ? 'yellow' : 'green'
  }

  const save = async () => {
    if (!activeChild || !entryType) return
    setSaving(true)
    setSaveError(null)
    try {
      // ✅ FIX: getSession() é instantâneo (cache local), getUser() faz HTTP round-trip
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setSaveError('Sessão expirada. Faça login novamente.')
        return
      }

      const { error } = await supabase.from('diary_entries').insert({
        child_id: (activeChild as Record<string, string>).id,
        parent_id: session.user.id,
        entry_type: entryType,
        title: title || ENTRY_TYPES.find(e => e.id === entryType)?.label || '',
        description,
        intensity,
        traffic_light: getTrafficLight(entryType, intensity),
        duration_minutes: duration ? parseInt(duration) : null,
        possible_trigger: selectedTriggers.join(', ') || null,
        what_helped: whatHelped || null,
      })

      // ✅ FIX: trata erro de RLS/DB com código do erro visível
      if (error) {
        console.error('[Diário] Erro ao salvar:', error.code, error.message, error.details)
        setSaveError(`Erro ao salvar: ${error.message}`)
        return
      }

      // Sucesso
      setShowForm(false)
      setTitle(''); setDescription(''); setIntensity(null); setDuration('')
      setSelectedTriggers([]); setWhatHelped('')
      fetchEntries()
    } catch (err) {
      console.error('[Diário] Exceção:', err)
      setSaveError('Erro inesperado. Tente novamente.')
    } finally {
      // ✅ FIX: sempre reseta o loading, em qualquer caminho
      setSaving(false)
    }
  }

  // Build calendar data
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const entriesByDate: Record<string, string> = {}
    entries.forEach(e => {
      const day = e.entry_date
      if (!entriesByDate[day] || e.traffic_light === 'red') {
        entriesByDate[day] = e.traffic_light || 'green'
      }
    })

    return { daysInMonth, firstDay, entriesByDate }
  }

  const { daysInMonth, firstDay, entriesByDate } = getDaysInMonth()

  const getEntryEmoji = (type: string) =>
    ENTRY_TYPES.find(e => e.id === type)?.emoji || '📝'

  return (
    <div style={{ padding: '1rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem' }}>
          📓 Diário
        </h1>
        {activeChild && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {(activeChild as Record<string, string>).name}
          </p>
        )}
      </div>

      {/* MONTH NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          ←
        </button>
        <p style={{ fontWeight: 700, fontSize: '1rem' }}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </p>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          →
        </button>
      </div>

      {/* CALENDAR */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const status = entriesByDate[dateStr]
            const isToday = new Date().toISOString().split('T')[0] === dateStr
            return (
              <div
                key={day}
                className={`cal-day ${status === 'green' ? 'cal-day-green' : status === 'yellow' ? 'cal-day-yellow' : status === 'red' ? 'cal-day-red' : ''} ${isToday ? 'cal-day-today' : ''}`}
                style={{ margin: '0 auto' }}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>

      {/* ENTRIES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '5rem' }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '16px' }} />)
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
            <p>Nenhum registro neste mês</p>
          </div>
        ) : (
          entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '1rem' }}
            >
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  {getEntryEmoji(entry.entry_type)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {entry.title}
                    </p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(entry.entry_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  {entry.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                      {entry.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {entry.intensity && (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Intensidade {entry.intensity}/5
                      </span>
                    )}
                    {entry.possible_trigger && (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {entry.possible_trigger.split(',')[0]}
                      </span>
                    )}
                    {entry.duration_minutes && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {entry.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
        id="diary-new-entry-btn"
        aria-label="Novo registro"
      >
        <Plus size={24} weight="bold" />
      </button>

      {/* FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-sheet"
            >
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem' }}>
                  Novo registro
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>
                {/* Tipo */}
                <div>
                  <label className="input-label">Tipo de registro</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {ENTRY_TYPES.map(et => (
                      <button
                        key={et.id}
                        onClick={() => setEntryType(et.id)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: `2px solid ${entryType === et.id ? et.color : 'var(--navy-light)'}`,
                          background: entryType === et.id ? `${et.color}15` : 'var(--navy-light)',
                          color: entryType === et.id ? et.color : 'var(--text-secondary)',
                          fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                          transition: 'all 0.2s',
                        }}
                        id={`entry-type-${et.id}`}
                      >
                        {et.emoji} {et.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="input-label">Título (opcional)</label>
                  <input
                    className="input"
                    placeholder="Ex: Crise no supermercado, Falou 'quero água'..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="input-label">Descrição</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="O que aconteceu?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Intensidade */}
                <div>
                  <label className="input-label">Intensidade</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        onClick={() => setIntensity(i)}
                        style={{
                          flex: 1, height: '40px', borderRadius: '10px',
                          border: `2px solid ${intensity === i ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                          background: intensity === i ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)',
                          color: intensity === i ? 'var(--amber-core)' : 'var(--text-secondary)',
                          fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        id={`diary-intensity-${i}`}
                      >{i}</button>
                    ))}
                  </div>
                </div>

                {/* Duração */}
                <div>
                  <label className="input-label">Duração (minutos)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="Ex: 20"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>

                {/* Gatilhos */}
                <div>
                  <label className="input-label">Possível gatilho</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {TRIGGER_CHIPS.map(t => (
                      <button
                        key={t}
                        className={`chip ${selectedTriggers.includes(t) ? 'selected' : ''}`}
                        onClick={() => toggleTrigger(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* O que ajudou */}
                <div>
                  <label className="input-label">O que ajudou?</label>
                  <input
                    className="input"
                    placeholder="Ex: música calma, espaço quieto..."
                    value={whatHelped}
                    onChange={e => setWhatHelped(e.target.value)}
                  />
                </div>

                {/* ✅ FIX: exibe erro se o save falhar */}
                {saveError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem', color: 'var(--red-alert)', fontSize: '0.85rem', textAlign: 'center' }}>
                    ⚠️ {saveError}
                  </div>
                )}
                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={save}
                  disabled={saving}
                  id="save-diary-entry"
                >
                  {saving ? 'Salvando...' : '💾 Salvar registro'}
                </button>
                <div style={{ height: '1rem' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
