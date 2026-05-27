'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Opções do Passo 3 — Perfil Sensorial ──────────────────────────────────
const SENSORY_OPTIONS = [
  { id: 'sound', emoji: '🔊', label: 'Sensível a sons altos' },
  { id: 'light', emoji: '💡', label: 'Sensível a luzes fortes' },
  { id: 'texture', emoji: '👕', label: 'Sensível a texturas no corpo' },
  { id: 'touch', emoji: '🤝', label: 'Evita contato físico' },
  { id: 'food', emoji: '🍽️', label: 'Alimentação muito seletiva' },
  { id: 'seeking', emoji: '🌀', label: 'Busca estímulo (gira, pula, balança)' },
  { id: 'sleep', emoji: '😴', label: 'Dificuldades com sono' },
  { id: 'verbal', emoji: '🗣️', label: 'Comunicação verbal limitada' },
]

const GENDER_OPTIONS = [
  { id: 'male', label: 'Menino' },
  { id: 'female', label: 'Menina' },
  { id: 'other', label: 'Prefiro não informar' },
]

const DIAGNOSIS_OPTIONS = [
  { id: 'mild', label: 'Leve' },
  { id: 'moderate', label: 'Moderado' },
  { id: 'severe', label: 'Severo' },
  { id: 'investigating', label: 'Em investigação' },
]

const TOTAL_STEPS = 4

// ─── Barra de Progresso ─────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ width: '100%', maxWidth: '440px', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: i < step ? 'var(--amber-core)' : 'var(--navy-light)',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'right' }}>
        Passo {step} de {TOTAL_STEPS}
      </p>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  // Passo 1 — Nome do pai
  const [parentName, setParentName] = useState('')

  // Passo 2 — Dados do filho
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [diagnosis, setDiagnosis] = useState('')

  // Passo 3 — Perfil sensorial
  const [sensoryProfile, setSensoryProfile] = useState<string[]>([])

  const toggleSensory = (id: string) => {
    setSensoryProfile(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // ─── Salvar no Supabase e redirecionar ─────────────────────────────────
  const handleFinish = async () => {
    setLoading(true)
    setFinishError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 1. Upsert no perfil do pai
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: parentName,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('[Onboarding] Erro ao salvar perfil:', profileError.message)
        setFinishError('Erro ao salvar seu perfil. Tente novamente.')
        return
      }

      // 2. Criar filho com todos os dados coletados
      const { error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: user.id,
          name: childName,
          birth_date: birthDate || null,
          sensory_profile: {
            gender,
            diagnosis,
            sensory_flags: sensoryProfile,
          },
          // Mapear flags sensoriais para campos estruturados do schema
          triggers: sensoryProfile
            .filter(s => ['sound', 'light', 'texture', 'touch', 'food'].includes(s))
            .map(s => SENSORY_OPTIONS.find(o => o.id === s)?.label ?? s),
          calming_strategies: [],
          hyperfocos: [],
        })

      if (childError) {
        console.error('[Onboarding] Erro ao criar filho:', childError.message)
        setFinishError('Erro ao criar o perfil do seu filho. Tente novamente.')
        return
      }

      router.push('/home')
    } catch (err) {
      console.error('[Onboarding] Exceção:', err)
      setFinishError('Erro inesperado. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F1729 0%, #162038 55%, #1a2a4a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>

      {/* Header com logo */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{
          fontSize: '2.5rem',
          marginBottom: '0.25rem',
          filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.5))',
        }}>
          🏮
        </div>
        <p style={{
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--amber-core)',
        }}>
          FAROL
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        <ProgressBar step={step} />

        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════
              PASSO 1 — Boas-vindas
          ═══════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '2.1rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  lineHeight: 1.2,
                }}>
                  Bem-vindo ao Farol 🌟
                </h1>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  fontSize: '1rem',
                  marginBottom: '0.75rem',
                }}>
                  Seu guia diário para os dias com seu filho.
                </p>
                <p style={{
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  fontSize: '0.9rem',
                }}>
                  Em 2 minutos, vamos configurar o Farol para a realidade da sua família.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">Como podemos te chamar?</label>
                  <input
                    className="input"
                    placeholder="Seu nome"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    autoFocus
                    autoComplete="given-name"
                  />
                </div>
                <button
                  className="btn btn-primary btn-block"
                  disabled={!parentName.trim()}
                  onClick={() => setStep(2)}
                  style={{ marginTop: '0.25rem' }}
                >
                  Vamos começar →
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════
              PASSO 2 — Dados do filho
          ═══════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '2rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                }}>
                  Sobre seu filho 💛
                </h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Vamos criar o perfil para personalizar o Farol para vocês.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Nome */}
                <div>
                  <label className="input-label">Nome *</label>
                  <input
                    className="input"
                    placeholder="Nome do seu filho"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {/* Data de nascimento */}
                <div>
                  <label className="input-label">Data de nascimento</label>
                  <input
                    className="input"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Gênero */}
                <div>
                  <label className="input-label">Gênero</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {GENDER_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setGender(opt.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${gender === opt.id ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                          background: gender === opt.id ? 'rgba(245,158,11,0.12)' : 'var(--navy-light)',
                          color: gender === opt.id ? 'var(--amber-core)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagnóstico */}
                <div>
                  <label className="input-label">Diagnóstico de TEA</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {DIAGNOSIS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDiagnosis(opt.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${diagnosis === opt.id ? 'var(--teal-vivid)' : 'var(--navy-light)'}`,
                          background: diagnosis === opt.id ? 'rgba(20,184,166,0.12)' : 'var(--navy-light)',
                          color: diagnosis === opt.id ? 'var(--teal-vivid)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    ← Voltar
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!childName.trim()}
                    onClick={() => setStep(3)}
                    style={{ flex: 2 }}
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════
              PASSO 3 — Perfil sensorial
          ═══════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '2rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                }}>
                  Perfil sensorial {childName ? `de ${childName}` : ''} 🧩
                </h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Selecione os que se aplicam. Você pode ajustar depois.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SENSORY_OPTIONS.map(opt => {
                  const selected = sensoryProfile.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleSensory(opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selected ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                        background: selected ? 'rgba(245,158,11,0.1)' : 'var(--navy-light)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{opt.emoji}</span>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: selected ? 'var(--amber-core)' : 'var(--text-secondary)',
                        flex: 1,
                      }}>
                        {opt.label}
                      </span>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: `2px solid ${selected ? 'var(--amber-core)' : 'var(--navy-light)'}`,
                        background: selected ? 'var(--amber-core)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}>
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#0F1729" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                    </button>
                  )
                })}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>
                    ← Voltar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(4)}
                    style={{ flex: 2 }}
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════
              PASSO 4 — Confirmação
          ═══════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '2rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                }}>
                  Tudo pronto! 🎉
                </h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Veja o que configuramos para vocês.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {/* Resumo: Pai */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'rgba(245,158,11,0.12)',
                    border: '1.5px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    👋
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seu nome</p>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{parentName}</p>
                  </div>
                </div>

                {/* Resumo: Filho */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'rgba(20,184,166,0.12)',
                    border: '1.5px solid rgba(20,184,166,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    💛
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seu filho</p>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{childName}</p>
                    {(gender || diagnosis) && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {GENDER_OPTIONS.find(g => g.id === gender)?.label}
                        {gender && diagnosis ? ' · ' : ''}
                        {DIAGNOSIS_OPTIONS.find(d => d.id === diagnosis)?.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resumo: Perfil sensorial */}
                {sensoryProfile.length > 0 && (
                  <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'rgba(167,139,250,0.12)',
                      border: '1.5px solid rgba(167,139,250,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0,
                    }}>
                      🧩
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                        Perfil sensorial — {sensoryProfile.length} selecionados
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {sensoryProfile.map(id => {
                          const opt = SENSORY_OPTIONS.find(o => o.id === id)
                          return opt ? (
                            <span key={id} style={{
                              fontSize: '0.78rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(167,139,250,0.15)',
                              color: 'var(--lilac-calm)',
                              border: '1px solid rgba(167,139,250,0.3)',
                            }}>
                              {opt.emoji} {opt.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensagem de erro */}
              {finishError && (
                <div style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--red-alert)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span>⚠️</span>
                  <span>{finishError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setStep(3)}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  ← Voltar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFinish}
                  disabled={loading}
                  style={{ flex: 2, position: 'relative' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '16px', height: '16px',
                        border: '2px solid rgba(15,23,41,0.3)',
                        borderTopColor: 'var(--navy-deep)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Criando...
                    </span>
                  ) : (
                    '🚀 Entrar no Farol'
                  )}
                </button>
              </div>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
