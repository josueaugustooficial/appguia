'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChild } from '@/hooks/useChild'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { InstallPWA } from '@/components/InstallPWA'
import {
  Lightbulb,
  ArrowRight, Smiley, SmileySad, SmileyMeh,
  SmileyWink, SmileyXEyes, CheckCircle, ArrowClockwise
} from '@phosphor-icons/react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Bom dia', icon: '☀️' }
  if (hour < 18) return { text: 'Boa tarde', icon: '🌤️' }
  return { text: 'Boa noite', icon: '🌙' }
}

function getChildAge(birthDate: string | null): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months
  if (totalMonths < 24) return `${totalMonths} meses`
  return `${years} anos`
}

const DAILY_TIP = {
  title: 'O limiar sensorial é mais baixo de manhã',
  content: 'Evite transições complexas nas 2h após acordar. O sistema nervoso ainda está "esquentando" e o limiar para sobrecarga é significativamente menor.',
  source: 'Sensory Processing Disorder Foundation',
  category: 'crises',
}

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// ✅ Mock data mantido por decisão do produto (dados reais na próxima fase)
const MOCK_WEEK_DATA = [
  { status: 'green' }, { status: 'yellow' }, { status: 'green' },
  { status: 'red' }, { status: 'yellow' }, { status: 'green' },
  { status: null }, // hoje
]

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { activeChild, loading: childLoading } = useChild()
  const [greeting] = useState(getGreeting())
  const [checkinDone, setCheckinDone] = useState(false)
  const [checkinMood, setCheckinMood] = useState<number | null>(null)
  const [showCheckin, setShowCheckin] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkinError, setCheckinError] = useState<string | null>(null)

  // ✅ FIX: Timeout de segurança na própria página.
  // Se os hooks não resolverem em 10s (ex: problema de rede fora do loop),
  // força saída do estado de loading e exibe error state.
  const [timedOut, setTimedOut] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true)
    }, 10000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Quando os hooks resolverem, cancela o timeout de segurança
  useEffect(() => {
    if (!authLoading && !childLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setTimedOut(false)
    }
  }, [authLoading, childLoading])

  const parentName = (profile as Record<string, string> | null)?.full_name?.split(' ')[0] || 'você'
  const childName = (activeChild as Record<string, string> | null)?.name || ''
  const childAge = getChildAge((activeChild as Record<string, string> | null)?.birth_date ?? null)

  const handleCheckin = async (mood: number) => {
    if (!user || isCheckingIn) return
    setIsCheckingIn(true)
    setCheckinError(null)
    try {
      const { error } = await supabase
        .from('parent_checkins')
        .insert({
          user_id: user.id,
          mood_score: mood,
        })
      if (error) {
        console.error('[CHECKIN ERROR]', error)
        setCheckinError('Erro ao registrar. Tente novamente.')
        return
      }
      setCheckinMood(mood)
      setCheckinDone(true)
      setTimeout(() => setShowCheckin(false), 2000)
    } catch (err) {
      console.error('[CHECKIN UNEXPECTED]', err)
      setCheckinError('Erro inesperado.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  // ─── ESTADO: LOADING (com proteção de timeout) ─────────────────────────────
  if ((authLoading || childLoading) && !timedOut) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '0.5rem' }}>
          <div>
            <div className="skeleton" style={{ height: '18px', width: '120px', borderRadius: '8px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '36px', width: '180px', borderRadius: '8px' }} />
          </div>
          <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
        </div>
        <div className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '72px', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '80px', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
      </div>
    )
  }

  // ─── ESTADO: TIMEOUT / ERRO ────────────────────────────────────────────────
  if (timedOut) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem' }}>⚡</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
          Demora mais que o esperado
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '280px' }}>
          Pode ser instabilidade temporária na conexão. Tente recarregar a página.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          id="home-retry-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowClockwise size={18} weight="bold" />
          Tentar novamente
        </button>
      </div>
    )
  }

  // ─── ESTADO: CONTEÚDO ──────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* HEADER — SAUDAÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingTop: '0.5rem',
        }}
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {greeting.icon} {greeting.text},
          </p>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '1.75rem',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            {parentName}!
          </h1>
          {childName && (
            <p style={{
              color: 'var(--amber-core)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}>
              {childName} {childAge && `· ${childAge}`}
            </p>
          )}
        </div>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          background: 'var(--navy-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--navy-light)',
          fontSize: '1.25rem',
        }}>
          {greeting.icon}
        </div>
      </motion.div>

      {/* DICA DO DIA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="section-title">💡 Dica do dia</p>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(22,32,56,1) 60%)',
          border: '1px solid rgba(245,158,11,0.3)',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px', height: '40px', flexShrink: 0,
              background: 'rgba(245,158,11,0.15)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lightbulb size={20} color="var(--amber-core)" weight="fill" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                {DAILY_TIP.title}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {DAILY_TIP.content}
              </p>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.72rem',
                marginTop: '0.5rem', fontStyle: 'italic',
              }}>
                📚 {DAILY_TIP.source}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MODO SOS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Link href="/sos" id="home-sos-button" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: 'var(--grad-sos)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(239,68,68,0.25)',
            cursor: 'pointer',
          }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', lineHeight: 1 }}>
                🚨 MODO FAROL
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Protocolo de crise — toque aqui
              </p>
            </div>
            <ArrowRight size={24} color="white" weight="bold" />
          </div>
        </Link>
      </motion.div>

      {/* ROTINA DE HOJE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p className="section-title" style={{ margin: 0 }}>📅 Hoje</p>
          <Link href="/rotinas" style={{ color: 'var(--amber-core)', fontSize: '0.8rem', textDecoration: 'none' }}>
            Ver rotinas →
          </Link>
        </div>
        <div className="card">
          {childName ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem 0' }}>
              <Link href="/rotinas" style={{ color: 'var(--amber-core)', textDecoration: 'none' }}>
                + Criar rotina para {childName}
              </Link>
            </p>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                Nenhum filho cadastrado ainda
              </p>
              <Link href="/perfil" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                + Cadastrar filho
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* SEMÁFORO SEMANAL — mock data por decisão de produto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <p className="section-title">📊 Últimos 7 dias</p>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {WEEK_DAYS.map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{day}</span>
                <div
                  className={`traffic-light ${
                    MOCK_WEEK_DATA[i].status === 'green' ? 'traffic-green' :
                    MOCK_WEEK_DATA[i].status === 'yellow' ? 'traffic-yellow' :
                    MOCK_WEEK_DATA[i].status === 'red' ? 'traffic-red' : ''
                  }`}
                  style={{
                    opacity: MOCK_WEEK_DATA[i].status ? 1 : 0.3,
                    background: !MOCK_WEEK_DATA[i].status ? 'var(--navy-light)' : undefined,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="traffic-light traffic-green" style={{ width: '10px', height: '10px' }} /> Tranquilo
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="traffic-light traffic-yellow" style={{ width: '10px', height: '10px' }} /> Alerta
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="traffic-light traffic-red" style={{ width: '10px', height: '10px' }} /> Crise
            </span>
          </div>
        </div>
      </motion.div>

      {/* CHECK-IN DOS PAIS */}
      {showCheckin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, var(--navy-mid) 100%)',
            border: '1px solid rgba(167,139,250,0.2)',
          }}>
            {!checkinDone ? (
              <>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  🧘 Como você está hoje?
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Cuidar de você é parte do cuidado com seu filho.
                </p>
                <div className="emoji-rating">
                  {[
                    { emoji: '😫', mood: 1 },
                    { emoji: '😟', mood: 2 },
                    { emoji: '😐', mood: 3 },
                    { emoji: '🙂', mood: 4 },
                    { emoji: '😊', mood: 5 },
                  ].map(({ emoji, mood }) => (
                    <button
                      key={mood}
                      className={`emoji-btn ${checkinMood === mood ? 'selected' : ''}`}
                      onClick={() => handleCheckin(mood)}
                      disabled={isCheckingIn}
                      id={`checkin-mood-${mood}`}
                      aria-label={`Humor ${mood} de 5`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {checkinError && (
                  <p style={{ color: 'var(--red-alert)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                    ⚠️ {checkinError}
                  </p>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={24} color="var(--teal-vivid)" weight="fill" />
                <p style={{ color: 'var(--teal-vivid)', fontWeight: 600 }}>
                  Check-in registrado. Obrigado por se cuidar! 💛
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* MÓDULOS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <p className="section-title">🗂️ Módulos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { href: '/passaporte', emoji: '🪪', title: 'Passaporte', desc: 'QR Code do filho' },
            { href: '/documentos', emoji: '📄', title: 'Documentos', desc: 'Legais e oficiais', premium: true },
            { href: '/atividades', emoji: '💪', title: 'Atividades', desc: 'Biblioteca completa' },
            { href: '/comunicacao', emoji: '🗣️', title: 'Comunicação', desc: 'Pranchas visuais' },
            { href: '/meu-espaco', emoji: '🧘', title: 'Meu Espaço', desc: 'Autocuidado' },
            { href: '/diario', emoji: '📓', title: 'Diário', desc: 'Registro de dias' },
          ].map(mod => (
            <Link
              key={mod.href}
              href={mod.href}
              style={{ textDecoration: 'none' }}
              id={`module-${mod.title.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="card card-hover" style={{ height: '100%' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{mod.emoji}</div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{mod.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{mod.desc}</p>
                {mod.premium && (
                  <span className="badge badge-warning" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
                    Premium
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* BANNER DE INSTALAÇÃO PWA — aparece 5s após load, apenas mobile */}
      <InstallPWA />

      {/* SPACER para a bottom nav */}
      <div style={{ height: '1rem' }} />
    </div>
  )
}
