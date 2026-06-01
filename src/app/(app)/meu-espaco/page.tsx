'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const AFFIRMATIONS = [
  'Você não está falhando. Você está aprendendo em tempo real.',
  'Cuidar de uma criança com necessidades especiais é uma das coisas mais difíceis e mais bonitas do mundo.',
  'Seu filho é sortudo de ter você.',
  'Não precisa ser perfeito. Precisa ser presente.',
  'A crise de hoje não define o dia de amanhã.',
  'Você faz mais do que imagina.',
  'Pedir ajuda é força, não fraqueza.',
  'Você merece descanso sem culpa.',
]

const BREATH_STEPS = [
  { label: 'Inspire', duration: 4, color: 'var(--teal-vivid)' },
  { label: 'Segure', duration: 7, color: 'var(--amber-core)' },
  { label: 'Expire', duration: 8, color: 'var(--lilac-calm)' },
]

const GROUNDING = [
  { num: 5, sense: 'coisas que você VÊ', emoji: '👁️' },
  { num: 4, sense: 'coisas que você pode TOCAR', emoji: '🤲' },
  { num: 3, sense: 'coisas que você OUVE', emoji: '👂' },
  { num: 2, sense: 'coisas que você CHEIRA', emoji: '👃' },
  { num: 1, sense: 'coisa que você SENTE (emoção)', emoji: '💛' },
]

export default function MeuEspacoPage() {
  // ✅ FIX: useMemo evita nova instância a cada render
  const supabase = useMemo(() => createClient(), [])
  const [activeTab, setActiveTab] = useState<'checkin' | 'breath' | 'grounding' | 'affirmation'>('checkin')
  const [mood, setMood] = useState<number | null>(null)
  const [checkinSaved, setCheckinSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathActive, setBreathActive] = useState(false)
  const [breathCount, setBreathCount] = useState(0)
  const [breathTimer, setBreathTimer] = useState(BREATH_STEPS[0].duration)
  const [groundingStep, setGroundingStep] = useState(0)
  const [todayAffirmation] = useState(() => AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length])
  const breathRef = useRef<NodeJS.Timeout | null>(null)

  // Breath 4-7-8 logic
  useEffect(() => {
    if (!breathActive) { if (breathRef.current) clearInterval(breathRef.current); return }
    setBreathPhase(0)
    setBreathTimer(BREATH_STEPS[0].duration)

    let phase = 0
    let timer = BREATH_STEPS[0].duration

    breathRef.current = setInterval(() => {
      timer--
      setBreathTimer(timer)
      if (timer <= 0) {
        phase = (phase + 1) % BREATH_STEPS.length
        if (phase === 0) setBreathCount(c => c + 1)
        timer = BREATH_STEPS[phase].duration
        setBreathPhase(phase)
        setBreathTimer(timer)
      }
    }, 1000)

    return () => { if (breathRef.current) clearInterval(breathRef.current) }
  }, [breathActive])

  const saveCheckin = async () => {
    if (!mood || isSaving) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setSaveError('Sessão expirada. Faça login novamente.')
        return
      }
      // ✅ FIX CRÍTICO: tabela parent_checkins tem apenas: id, user_id, mood_score, notes, created_at
      // energy_score e stress_score não existem ainda — insert estava falhando com PGRST204
      const { error } = await supabase.from('parent_checkins').insert({
        user_id: session.user.id,
        mood_score: mood,
      })
      if (error) {
        console.error('[MEU-ESPACO SAVE ERROR]', error.code, error.message, error.details)
        setSaveError(`Erro ao salvar: ${error.message}`)
        return
      }
      setCheckinSaved(true)
    } catch (err) {
      console.error('[Meu Espaço] Exceção:', err)
      setSaveError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const TABS = [
    { id: 'checkin', label: 'Check-in', emoji: '💛' },
    { id: 'breath', label: 'Respiração', emoji: '🌬️' },
    { id: 'grounding', label: 'Grounding', emoji: '🌱' },
    { id: 'affirmation', label: 'Afirmação', emoji: '✨' },
  ]

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          🧘 Meu Espaço
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Cuidar de você é cuidar do seu filho
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} style={{ flexShrink: 0, padding: '0.5rem 1rem', borderRadius: '100px', border: `2px solid ${activeTab === t.id ? 'var(--lilac-calm)' : 'var(--navy-light)'}`, background: activeTab === t.id ? 'rgba(167,139,250,0.15)' : 'var(--navy-light)', color: activeTab === t.id ? 'var(--lilac-calm)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }} id={`tab-${t.id}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* CHECK-IN */}
        {activeTab === 'checkin' && (
          <motion.div key="checkin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {checkinSaved ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: 'rgba(167,139,250,0.3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💛</div>
                <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', color: 'var(--lilac-calm)', marginBottom: '0.75rem' }}>Check-in salvo!</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Obrigado por se cuidar. Você merece atenção e descanso.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
                  <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>😊 Como você está hoje?</p>
                  <div className="emoji-rating">
                    {[{ e: '😫', v: 1 }, { e: '😟', v: 2 }, { e: '😐', v: 3 }, { e: '🙂', v: 4 }, { e: '😊', v: 5 }].map(({ e, v }) => (
                      <button key={v} className={`emoji-btn ${mood === v ? 'selected' : ''}`} onClick={() => setMood(v)} id={`mood-${v}`}>{e}</button>
                    ))}
                  </div>
                </div>

                {/* Energia e Estresse — em breve (aguarda migration no banco) */}

                {saveError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem', color: 'var(--red-alert)', fontSize: '0.85rem', textAlign: 'center' }}>
                    ⚠️ {saveError}
                  </div>
                )}
                <button className="btn btn-calm btn-block btn-lg" onClick={saveCheckin} disabled={!mood || isSaving} id="save-checkin">
                  {isSaving ? 'Salvando...' : '💾 Salvar check-in'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* RESPIRAÇÃO 4-7-8 */}
        {activeTab === 'breath' && (
          <motion.div key="breath" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <div className="card" style={{ padding: '2.5rem 1.5rem', borderColor: 'rgba(167,139,250,0.2)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Técnica 4-7-8 — Uma das mais eficazes para acalmar o sistema nervoso
              </p>

              {/* Circle animation */}
              <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 2rem' }}>
                <motion.div
                  animate={breathActive ? {
                    scale: breathPhase === 0 ? 1.3 : breathPhase === 1 ? 1.3 : 0.8,
                    backgroundColor: BREATH_STEPS[breathPhase].color,
                  } : { scale: 1, backgroundColor: 'var(--navy-light)' }}
                  transition={{ duration: BREATH_STEPS[breathPhase]?.duration || 4 }}
                  style={{ width: '160px', height: '160px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}
                >
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>
                    {breathActive ? breathTimer : '▶'}
                  </span>
                  {breathActive && (
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 700 }}>
                      {BREATH_STEPS[breathPhase].label}
                    </span>
                  )}
                </motion.div>
              </div>

              {breathActive && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Ciclo {breathCount + 1} de 4</p>}

              <button
                className={`btn btn-block btn-lg ${breathActive ? 'btn-ghost' : 'btn-calm'}`}
                onClick={() => setBreathActive(!breathActive)}
                id="breath-toggle"
              >
                {breathActive ? '⏸ Pausar' : '▶ Iniciar respiração'}
              </button>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-around' }}>
                {BREATH_STEPS.map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.duration}s</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* GROUNDING 5-4-3-2-1 */}
        {activeTab === 'grounding' && (
          <motion.div key="grounding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card" style={{ borderColor: 'rgba(20,184,166,0.2)', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                O método Grounding 5-4-3-2-1 usa os sentidos para trazer você de volta ao momento presente. Respire fundo e responda mentalmente cada pergunta.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {GROUNDING.map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                  style={{
                    opacity: groundingStep >= i ? 1 : 0.4,
                    borderColor: groundingStep >= i ? 'rgba(20,184,166,0.3)' : 'var(--navy-light)',
                    cursor: groundingStep >= i ? 'default' : 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => { if (groundingStep < i) setGroundingStep(i) }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 700, color: 'var(--teal-vivid)', minWidth: '36px' }}>{g.num}</span>
                    <div>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{g.emoji}</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{g.sense}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {groundingStep >= GROUNDING.length - 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1.5rem' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌟</p>
                <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.25rem', color: 'var(--teal-vivid)' }}>Você está presente.</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }} onClick={() => setGroundingStep(0)}>Recomeçar</button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* AFIRMAÇÃO DO DIA */}
        {activeTab === 'affirmation' && (
          <motion.div key="affirmation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, var(--navy-mid) 100%)', borderColor: 'rgba(167,139,250,0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>✨</div>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.25rem', color: 'var(--lilac-calm)', marginBottom: '0.5rem' }}>
                Afirmação do dia
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <blockquote style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, borderLeft: 'none', padding: 0 }}>
                &ldquo;{todayAffirmation}&rdquo;
              </blockquote>
            </div>

            <div className="card" style={{ marginTop: '1.25rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem' }}>✅ Micro-hábitos de hoje</p>
              {['Tomei água suficiente', 'Saí de casa por 5 min', 'Fiz algo só para mim', 'Falei com alguém'].map((habit, i) => (
                <HabitItem key={i} label={habit} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '3rem' }} />
    </div>
  )
}

function HabitItem({ label }: { label: string }) {
  const [done, setDone] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0', borderBottom: '1px solid var(--navy-light)' }}>
      <button onClick={() => setDone(!done)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${done ? 'var(--teal-vivid)' : 'var(--navy-light)'}`, background: done ? 'var(--teal-vivid)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
      </button>
      <span style={{ color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', fontSize: '0.9rem', transition: 'all 0.2s' }}>{label}</span>
    </div>
  )
}
