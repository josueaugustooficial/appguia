'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useChild } from '@/hooks/useChild'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Timer, Warning } from '@phosphor-icons/react'

// ════════════════════════════════════════
// PROTOCOLO HARDCODED (funciona offline)
// ════════════════════════════════════════

const CRISIS_TYPES = [
  {
    id: 'meltdown',
    emoji: '🌋',
    title: 'Explosão / Choro intenso',
    subtitle: 'Meltdown — perda de controle involuntária',
    color: 'var(--red-alert)',
  },
  {
    id: 'shutdown',
    emoji: '🫧',
    title: 'Silêncio / Retirada',
    subtitle: 'Shutdown — fechamento sensorial',
    color: 'var(--lilac-calm)',
  },
  {
    id: 'tantrum',
    emoji: '😤',
    title: 'Birra intencional',
    subtitle: 'Comportamento com objetivo claro',
    color: 'var(--coral-soft)',
  },
  {
    id: 'unknown',
    emoji: '❓',
    title: 'Não sei identificar',
    subtitle: 'Protocolo geral de crise',
    color: 'var(--text-secondary)',
  },
]

const MELTDOWN_STEPS = [
  {
    id: 'breathe',
    title: 'RESPIRE primeiro',
    detail: 'Sua calma é literalmente contagiosa — o sistema nervoso do seu filho detecta sua frequência cardíaca e estado emocional. Faça 3 respirações profundas.',
    color: 'var(--teal-vivid)',
  },
  {
    id: 'safety',
    title: 'SEGURANÇA imediata',
    detail: 'Remova objetos que podem machucar. Afaste móveis de canto. Não precisa segurar — apenas garanta o espaço seguro.',
    color: 'var(--amber-core)',
  },
  {
    id: 'reduce',
    title: 'REDUZA os estímulos',
    detail: 'Diminua a luz se possível. Reduza o barulho. Afaste outras pessoas. Fale em voz baixa e devagar.',
    color: 'var(--amber-core)',
  },
  {
    id: 'communicate',
    title: 'COMUNICAÇÃO mínima',
    detail: 'Use frases de 2-3 palavras no máximo: "Estou aqui." "Você está seguro." Não faça perguntas. Não explique.',
    color: 'var(--amber-core)',
  },
  {
    id: 'touch',
    title: 'Apoio físico APENAS se aceito',
    detail: 'Ofereça pressão profunda nas costas ou ombros se ele permitir. Toque inesperado pode intensificar a crise.',
    color: 'var(--coral-soft)',
  },
  {
    id: 'wait',
    title: 'AGUARDE — o ciclo tem fim',
    detail: 'Uma crise de meltdown libera cortisol como uma situação de perigo real. O tempo de recuperação é de 20-30 minutos, não 2 minutos. Não force o fim.',
    color: 'var(--teal-vivid)',
  },
]

const SHUTDOWN_STEPS = [
  { id: 'calm', title: 'FIQUE CALMAMENTE PRESENTE', detail: 'Não force interação. Não faça perguntas. Apenas esteja presente a uma distância confortável.', color: 'var(--lilac-calm)' },
  { id: 'space', title: 'DÊ ESPAÇO SEGURO', detail: 'Se ele se recolheu a um canto ou debaixo de algo — deixe. É autorregulação. Garanta apenas que o ambiente é seguro.', color: 'var(--lilac-calm)' },
  { id: 'light', title: 'REDUZA ESTIMULAÇÃO', detail: 'Diminua luzes, sons. Evite movimento de pessoas ao redor. Silêncio é protetor.', color: 'var(--amber-core)' },
  { id: 'signal', title: 'SINALIZE QUE ESTÁ LÁ', detail: 'Diga suavemente uma vez: "Estou aqui se precisar de mim." Não repita. Não espere resposta.', color: 'var(--lilac-calm)' },
  { id: 'wait2', title: 'AGUARDE E OBSERVE', detail: 'Shutdown pode durar de 20 minutos a horas. Observe sinais de que ele está saindo — olho que procura, movimento do corpo.', color: 'var(--teal-vivid)' },
]

const NEVER_DO = [
  'Gritar ou punir durante a crise',
  'Argumentar ou tentar racionalizar',
  'Forçar contato físico ou olhar nos olhos',
  'Ceder a birra intencional por exaustão',
  'Deixar outros filhos/pessoas cutucando',
  'Usar sarcasmo ou ironia',
]

const GATILHOS_CHIPS = [
  'Barulho alto', 'Mudança de rotina', 'Fome', 'Cansaço',
  'Toque inesperado', 'Luz intensa', 'Multidão', 'Frustração',
  'Transições', 'Temperatura', 'Cheiro forte', 'Outro',
]

export default function SOSPage() {
  const { activeChild, children, setActiveChild } = useChild()
  // ✅ FIX: useMemo evita nova instância a cada render
  const supabase = useMemo(() => createClient(), [])

  const [phase, setPhase] = useState<'select_child' | 'crisis_type' | 'protocol' | 'done' | 'register'>('crisis_type')
  const [crisisType, setCrisisType] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [trigger, setTrigger] = useState('')
  const [whatHelped, setWhatHelped] = useState('')
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  // ✅ FIX: estado de loading/erro para o botão de salvar
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start timer when entering protocol phase
  useEffect(() => {
    if (phase === 'protocol') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const steps = crisisType === 'shutdown' ? SHUTDOWN_STEPS : MELTDOWN_STEPS

  const toggleStep = (id: string) => {
    setCompletedSteps(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleTrigger = (t: string) => {
    setSelectedTriggers(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const handleSave = async () => {
    if (!activeChild) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveError('Sessão expirada. Faça login novamente.')
        return
      }

      // ✅ Salva sessão SOS
      const { error: sosError } = await supabase.from('sos_sessions').insert({
        child_id: (activeChild as Record<string, string>).id,
        parent_id: user.id,
        crisis_type: crisisType,
        duration_seconds: seconds,
        intensity,
        trigger_identified: selectedTriggers.join(', '),
        what_worked: whatHelped,
        steps_completed: completedSteps,
      })

      if (sosError) {
        console.error('[SOS] Erro ao salvar sessão:', sosError.message)
        setSaveError('Erro ao salvar. Tente novamente.')
        return
      }

      // ✅ Salva também no diário
      const { error: diaryError } = await supabase.from('diary_entries').insert({
        child_id: (activeChild as Record<string, string>).id,
        parent_id: user.id,
        entry_type: 'crisis',
        title: `Crise: ${CRISIS_TYPES.find(c => c.id === crisisType)?.title || 'Crise'}`,
        intensity,
        traffic_light: intensity && intensity >= 4 ? 'red' : intensity === 3 ? 'yellow' : 'green',
        duration_minutes: Math.round(seconds / 60),
        possible_trigger: selectedTriggers.join(', '),
        what_helped: whatHelped,
      })

      if (diaryError) {
        // Sessão SOS salva, mas diário falhou — não bloqueia o fluxo
        console.error('[SOS] Erro ao salvar no diário:', diaryError.message)
      }

      setPhase('done')
    } catch (err) {
      console.error('[SOS] Exceção:', err)
      setSaveError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (phase === 'select_child') {
    return (
      <div style={{ minHeight: '100vh', padding: '1.5rem', background: 'var(--navy-deep)' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
          🚨 Para qual filho?
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {children.map(child => (
            <button
              key={(child as Record<string, string>).id}
              className="btn btn-ghost btn-block"
              onClick={() => { setActiveChild(child); setPhase('crisis_type') }}
              style={{ justifyContent: 'flex-start', padding: '1rem', fontSize: '1rem' }}
            >
              👤 {(child as Record<string, string>).name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'crisis_type') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a0505 0%, #2a0a0a 100%)',
        padding: '1.5rem',
        borderTop: '3px solid var(--red-alert)',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="animate-pulse-red" style={{
              width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red-alert)',
            }} />
            <span style={{ color: 'var(--red-alert)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem' }}>
              MODO FAROL ATIVADO
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '1.75rem',
            marginBottom: '0.5rem',
          }}>
            O que está acontecendo?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Para {(activeChild as Record<string, string>)?.name || 'seu filho'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CRISIS_TYPES.map(ct => (
            <motion.button
              key={ct.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setCrisisType(ct.id); setPhase('protocol') }}
              style={{
                background: 'rgba(239,68,68,0.05)',
                border: `1.5px solid ${ct.color}40`,
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              id={`crisis-type-${ct.id}`}
            >
              <span style={{ fontSize: '1.75rem' }}>{ct.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, color: ct.color, fontSize: '0.95rem' }}>{ct.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{ct.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'protocol') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a0505 0%, #2a0a0a 100%)',
        borderTop: '3px solid var(--red-alert)',
      }}>
        {/* TIMER FIXO */}
        <div style={{
          position: 'sticky', top: 0,
          background: 'rgba(26, 5, 5, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(239,68,68,0.2)',
          zIndex: 10,
        }}>
          <div>
            <div className="timer-display">{formatTime(seconds)}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center' }}>Em crise</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
              {CRISIS_TYPES.find(c => c.id === crisisType)?.emoji}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              {completedSteps.length}/{steps.length} passos
            </p>
          </div>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* PASSOS DO PROTOCOLO */}
          <p style={{ color: 'var(--red-alert)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            PROTOCOLO
          </p>

          {steps.map((step, idx) => {
            const done = completedSteps.includes(step.id)
            const expanded = expandedStep === step.id
            return (
              <div key={step.id} className={`sos-step ${done ? 'completed' : ''}`} id={`sos-step-${step.id}`}>
                <button
                  onClick={() => toggleStep(step.id)}
                  style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                  aria-label={done ? 'Desmarcar passo' : 'Marcar passo como feito'}
                >
                  {done
                    ? <CheckCircle size={28} weight="fill" color="var(--teal-vivid)" />
                    : <Circle size={28} color="var(--text-muted)" />
                  }
                </button>
                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => setExpandedStep(expanded ? null : step.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', padding: 0, width: '100%',
                    }}
                  >
                    <p style={{
                      fontWeight: 700,
                      color: done ? 'var(--teal-vivid)' : 'var(--text-primary)',
                      textDecoration: done ? 'line-through' : 'none',
                      opacity: done ? 0.7 : 1,
                      fontSize: '0.9rem',
                    }}>
                      {idx + 1}. {step.title}
                    </p>
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          lineHeight: 1.6,
                          marginTop: '0.5rem',
                          overflow: 'hidden',
                        }}
                      >
                        {step.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}

          {/* NUNCA FAZER */}
          <div className="sos-never">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Warning size={18} color="var(--red-alert)" weight="fill" />
              <p style={{ fontWeight: 700, color: 'var(--red-alert)', fontSize: '0.85rem' }}>NUNCA FAZER</p>
            </div>
            {NEVER_DO.map((item, i) => (
              <p key={i} style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                paddingLeft: '0.5rem',
                marginBottom: '0.4rem',
                display: 'flex',
                gap: '0.5rem',
              }}>
                <span style={{ color: 'var(--red-alert)' }}>✗</span> {item}
              </p>
            ))}
          </div>

          {/* BOTÃO CRISE PASSOU */}
          <button
            className="btn btn-teal btn-block btn-lg"
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('register') }}
            style={{ marginTop: '0.5rem' }}
            id="sos-crisis-ended"
          >
            ✅ A crise passou — Registrar
          </button>

          <div style={{ height: '2rem' }} />
        </div>
      </div>
    )
  }

  if (phase === 'register') {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            📝 Registrar crise
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Duração: <strong style={{ color: 'var(--amber-core)' }}>{formatTime(seconds)}</strong>
          </p>
        </div>

        {/* Intensidade */}
        <div className="card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Intensidade da crise</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  border: `2px solid ${intensity === i ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                  background: intensity === i ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)',
                  color: intensity === i ? 'var(--amber-core)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                }}
                id={`intensity-${i}`}
              >{i}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Leve</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Intensa</span>
          </div>
        </div>

        {/* Gatilhos */}
        <div className="card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Possível gatilho</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {GATILHOS_CHIPS.map(t => (
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
        <div className="card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>O que ajudou? (opcional)</p>
          <textarea
            className="input"
            placeholder="Ex: presão profunda, música, espaço quieto..."
            value={whatHelped}
            onChange={e => setWhatHelped(e.target.value)}
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>

        {saveError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.875rem', color: 'var(--red-alert)', fontSize: '0.85rem', textAlign: 'center' }}>
            ⚠️ {saveError}
          </div>
        )}
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleSave}
          disabled={isSaving}
          id="sos-save-register"
        >
          {isSaving ? 'Salvando...' : '💾 Salvar no diário'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setPhase('done')}
          style={{ textAlign: 'center' }}
        >
          Pular registro
        </button>
      </div>
    )
  }

  // DONE
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌊</div>
        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: '2rem',
          color: 'var(--teal-vivid)',
          marginBottom: '0.75rem',
        }}>
          Passou.
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '280px' }}>
          Você ficou presente. Isso é exatamente o que seu filho precisava.
          Dê-se crédito por ter estado lá.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px' }}>
          <a href="/home" className="btn btn-primary btn-block">
            Voltar ao início
          </a>
          <a href="/meu-espaco" className="btn btn-calm btn-block">
            🧘 Cuidar de mim agora
          </a>
        </div>
      </motion.div>
    </div>
  )
}
