'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChild } from '@/hooks/useChild'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from '@phosphor-icons/react'

// PICTOGRAMS — 80+ ícones
const PICTOGRAMS: Record<string, { emoji: string; label: string; category: string }> = {
  wake: { emoji: '⏰', label: 'Acordar', category: 'manha' },
  teeth: { emoji: '🪥', label: 'Escovar dentes', category: 'manha' },
  bath: { emoji: '🚿', label: 'Banho', category: 'manha' },
  breakfast: { emoji: '🥣', label: 'Café da manhã', category: 'manha' },
  clothes: { emoji: '👕', label: 'Vestir roupa', category: 'manha' },
  backpack: { emoji: '🎒', label: 'Mochila', category: 'manha' },
  shoes: { emoji: '👟', label: 'Calçar tênis', category: 'manha' },
  bus: { emoji: '🚌', label: 'Ônibus', category: 'escola' },
  school: { emoji: '🏫', label: 'Escola', category: 'escola' },
  classroom: { emoji: '📚', label: 'Sala de aula', category: 'escola' },
  snack: { emoji: '🍎', label: 'Lanche', category: 'escola' },
  recess: { emoji: '⚽', label: 'Recreio', category: 'escola' },
  library: { emoji: '📖', label: 'Biblioteca', category: 'escola' },
  lunch: { emoji: '🍽️', label: 'Almoço', category: 'tarde' },
  rest: { emoji: '😴', label: 'Descanso', category: 'tarde' },
  homework: { emoji: '✏️', label: 'Dever', category: 'tarde' },
  therapy: { emoji: '🧩', label: 'Terapia', category: 'tarde' },
  exercise: { emoji: '🏃', label: 'Exercício', category: 'tarde' },
  kimono: { emoji: '🥋', label: 'Kimono', category: 'academia' },
  oss: { emoji: '🤜', label: 'Oss!', category: 'academia' },
  warmup: { emoji: '🔥', label: 'Aquecimento', category: 'academia' },
  technique: { emoji: '🤼', label: 'Técnica', category: 'academia' },
  roll: { emoji: '🥊', label: 'Rola', category: 'academia' },
  dinner: { emoji: '🍜', label: 'Jantar', category: 'noite' },
  bath2: { emoji: '🛁', label: 'Banho noturno', category: 'noite' },
  pajama: { emoji: '🌙', label: 'Pijama', category: 'noite' },
  story: { emoji: '📗', label: 'Leitura', category: 'noite' },
  sleep: { emoji: '💤', label: 'Dormir', category: 'noite' },
  water: { emoji: '💧', label: 'Água', category: 'geral' },
  bathroom: { emoji: '🚻', label: 'Banheiro', category: 'geral' },
  medicine: { emoji: '💊', label: 'Remédio', category: 'geral' },
  music: { emoji: '🎵', label: 'Música', category: 'geral' },
  tablet: { emoji: '📱', label: 'Tablet', category: 'geral' },
  play: { emoji: '🧸', label: 'Brincar', category: 'geral' },
  walk: { emoji: '🚶', label: 'Passeio', category: 'geral' },
  car: { emoji: '🚗', label: 'Carro', category: 'geral' },
  hug: { emoji: '🤗', label: 'Abraço', category: 'geral' },
  prize: { emoji: '⭐', label: 'Recompensa', category: 'geral' },
  cooking: { emoji: '🍳', label: 'Cozinhar', category: 'geral' },
  garden: { emoji: '🌱', label: 'Jardim', category: 'geral' },
  draw: { emoji: '🎨', label: 'Desenhar', category: 'geral' },
  puzzle: { emoji: '🧩', label: 'Quebra-cabeça', category: 'geral' },
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DAY_NUMS = [0, 1, 2, 3, 4, 5, 6]

type Step = {
  id: string
  title: string
  icon_key: string
  duration_minutes: number | null
  position: number
}

type Routine = {
  id: string
  name: string
  days_of_week: number[]
  is_active: boolean
  steps?: Step[]
}

export default function RotinasPage() {
  const supabase = createClient()
  const { activeChild } = useChild()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)

  // Editor state
  const [routineName, setRoutineName] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [steps, setSteps] = useState<Step[]>([])
  const [showPictoGrid, setShowPictoGrid] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchRoutines = async () => {
    if (!activeChild) return
    const { data } = await supabase
      .from('routines')
      .select('*, routine_steps(*)')
      .eq('child_id', (activeChild as Record<string, string>).id)
      .order('created_at', { ascending: false })
    setRoutines((data || []) as Routine[])
    setLoading(false)
  }

  useEffect(() => { fetchRoutines() }, [activeChild])

  const openEditor = (routine?: Routine) => {
    if (routine) {
      setEditingRoutine(routine)
      setRoutineName(routine.name)
      setSelectedDays(routine.days_of_week)
      setSteps(routine.steps || [])
    } else {
      setEditingRoutine(null)
      setRoutineName('')
      setSelectedDays([1, 2, 3, 4, 5])
      setSteps([])
    }
    setShowEditor(true)
  }

  const addStep = () => {
    const newStep: Step = {
      id: `temp_${Date.now()}`,
      title: 'Novo passo',
      icon_key: 'water',
      duration_minutes: null,
      position: steps.length,
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id: string, field: keyof Step, value: string | number | null) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeStep = (id: string) => setSteps(steps.filter(s => s.id !== id))

  const toggleDay = (d: number) => {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const saveRoutine = async () => {
    if (!activeChild || !routineName.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let routineId = editingRoutine?.id

    if (!routineId) {
      const { data: newR } = await supabase
        .from('routines')
        .insert({
          child_id: (activeChild as Record<string, string>).id,
          parent_id: user.id,
          name: routineName,
          days_of_week: selectedDays,
        })
        .select()
        .single()
      routineId = newR?.id
    } else {
      await supabase.from('routines').update({
        name: routineName,
        days_of_week: selectedDays,
      }).eq('id', routineId)
      await supabase.from('routine_steps').delete().eq('routine_id', routineId)
    }

    if (routineId && steps.length > 0) {
      await supabase.from('routine_steps').insert(
        steps.map((s, i) => ({
          routine_id: routineId,
          position: i,
          title: s.title,
          icon_key: s.icon_key,
          duration_minutes: s.duration_minutes,
        }))
      )
    }

    setSaving(false)
    setShowEditor(false)
    fetchRoutines()
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem' }}>
            🗓️ Rotinas
          </h1>
          {activeChild && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {(activeChild as Record<string, string>).name}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => openEditor()}
          id="create-routine-btn"
        >
          <Plus size={16} weight="bold" />
          Nova rotina
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '16px' }} />)}
        </div>
      ) : routines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhuma rotina criada</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Rotinas visuais ajudam seu filho a se preparar para as transições do dia.
          </p>
          <button className="btn btn-primary" onClick={() => openEditor()}>
            + Criar primeira rotina
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {routines.map(routine => (
            <div key={routine.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {routine.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {DAYS.map((d, i) => (
                      <span key={i} style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: routine.days_of_week.includes(i) ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)',
                        color: routine.days_of_week.includes(i) ? 'var(--amber-core)' : 'var(--text-muted)',
                      }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEditor(routine)}
                    id={`edit-routine-${routine.id}`}
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Steps preview */}
              {(routine.steps || []).length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {(routine.steps || []).slice(0, 8).map(step => (
                    <div key={step.id} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.2rem', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {PICTOGRAMS[step.icon_key]?.emoji || '⭐'}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', maxWidth: '44px', textAlign: 'center' }}>
                        {PICTOGRAMS[step.icon_key]?.label || step.title}
                      </span>
                    </div>
                  ))}
                  {(routine.steps || []).length > 8 && (
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        +{(routine.steps || []).length - 8}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDITOR MODAL */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={e => { if (e.target === e.currentTarget) setShowEditor(false) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-sheet"
              style={{ maxHeight: '92vh' }}
            >
              <div className="modal-handle" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.4rem' }}>
                  {editingRoutine ? 'Editar rotina' : 'Nova rotina'}
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowEditor(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                <div>
                  <label className="input-label">Nome da rotina</label>
                  <input
                    className="input"
                    placeholder="Ex: Rotina da Manhã, Dia de Academia..."
                    value={routineName}
                    onChange={e => setRoutineName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Dias da semana</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {DAYS.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        style={{
                          flex: 1, height: '40px', borderRadius: '10px',
                          border: `2px solid ${selectedDays.includes(i) ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                          background: selectedDays.includes(i) ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)',
                          color: selectedDays.includes(i) ? 'var(--amber-core)' : 'var(--text-muted)',
                          fontWeight: 700, cursor: 'pointer', fontSize: '0.7rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="input-label" style={{ margin: 0 }}>Passos da rotina</label>
                    <button className="btn btn-ghost btn-sm" onClick={addStep}>
                      <Plus size={14} /> Passo
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {steps.map((step, idx) => (
                      <div key={step.id} className="card" style={{ padding: '0.875rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {/* Pictogram picker */}
                          <button
                            onClick={() => setShowPictoGrid(showPictoGrid === step.id ? null : step.id)}
                            style={{
                              width: '48px', height: '48px', flexShrink: 0,
                              borderRadius: '12px', background: 'var(--navy-deep)',
                              border: '1.5px solid var(--navy-light)',
                              fontSize: '1.5rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {PICTOGRAMS[step.icon_key]?.emoji || '⭐'}
                          </button>
                          <div style={{ flex: 1 }}>
                            <input
                              className="input"
                              value={step.title}
                              onChange={e => updateStep(step.id, 'title', e.target.value)}
                              style={{ marginBottom: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                              placeholder="Nome do passo"
                            />
                            <input
                              className="input"
                              type="number"
                              placeholder="Minutos (opcional)"
                              value={step.duration_minutes || ''}
                              onChange={e => updateStep(step.id, 'duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                            />
                          </div>
                          <button
                            onClick={() => removeStep(step.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-alert)', padding: '0.25rem' }}
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Pictogram grid */}
                        <AnimatePresence>
                          {showPictoGrid === step.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden', marginTop: '0.75rem' }}
                            >
                              <div className="picto-grid">
                                {Object.entries(PICTOGRAMS).map(([key, val]) => (
                                  <button
                                    key={key}
                                    className={`picto-item ${step.icon_key === key ? 'selected' : ''}`}
                                    onClick={() => {
                                      updateStep(step.id, 'icon_key', key)
                                      updateStep(step.id, 'title', val.label)
                                      setShowPictoGrid(null)
                                    }}
                                  >
                                    <span style={{ fontSize: '1.5rem' }}>{val.emoji}</span>
                                    <span className="picto-label">{val.label}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={saveRoutine}
                  disabled={saving || !routineName.trim()}
                  id="save-routine-btn"
                  style={{ marginTop: '0.5rem' }}
                >
                  {saving ? 'Salvando...' : '💾 Salvar rotina'}
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
