'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeSlash, EnvelopeSimple, LockSimple, ArrowRight, ArrowLeft } from '@phosphor-icons/react'

type View = 'login' | 'forgot' | 'sent'

export default function LoginPage() {
  const supabase = createClient()
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha.'); return }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique e tente novamente.')
      } else {
        setError('Erro ao entrar. Tente novamente.')
      }
      setLoading(false)
      return
    }

    // Redirect handled by middleware
    window.location.href = '/home'
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Insira seu email para continuar.'); return }
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError('Erro ao enviar email. Verifique o endereço e tente novamente.')
      setLoading(false)
      return
    }

    setLoading(false)
    setView('sent')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--grad-hero)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', left: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
      >
        {/* LOGO */}
        <motion.div
          className="animate-float"
          style={{ marginBottom: '1.5rem', display: 'inline-block' }}
        >
          <div className="animate-glow-farol" style={{ display: 'inline-block' }}>
            <FarolIcon />
          </div>
        </motion.div>

        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: '2.75rem',
          fontWeight: 900,
          color: 'var(--amber-core)',
          marginBottom: '0.35rem',
          lineHeight: 1.1,
        }}>
          Farol
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          fontStyle: 'italic',
        }}>
          O guia que sua família precisava
        </p>

        <AnimatePresence mode="wait">
          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ textAlign: 'left', padding: '1.75rem' }}>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}>
                  Entre com seu <strong style={{ color: 'var(--amber-core)' }}>email e senha</strong> para acessar o Farol.
                </p>

                {/* Email */}
                <label className="input-label">Email</label>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <EnvelopeSimple
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    id="login-email"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>

                {/* Senha */}
                <label className="input-label">Senha</label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <LockSimple
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    id="login-password"
                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: 'var(--text-muted)',
                    }}
                    tabIndex={-1}
                    id="toggle-password"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Esqueci a senha */}
                <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError('') }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--amber-core)', fontSize: '0.8rem',
                      textDecoration: 'underline', padding: 0,
                    }}
                    id="forgot-password-link"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: 'var(--red-alert)', fontSize: '0.85rem',
                      marginBottom: '0.75rem', textAlign: 'center',
                      background: 'rgba(239,68,68,0.08)', borderRadius: '8px',
                      padding: '0.6rem',
                    }}
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading}
                  id="login-submit"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Entrando...
                    </span>
                  ) : (
                    <>Entrar <ArrowRight size={18} weight="bold" /></>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <motion.form
              key="forgot"
              onSubmit={handleForgotPassword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ textAlign: 'left', padding: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => { setView('login'); setError('') }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    marginBottom: '1.25rem', padding: 0,
                  }}
                >
                  <ArrowLeft size={16} /> Voltar ao login
                </button>

                <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Recuperar senha
                </p>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.85rem',
                  marginBottom: '1.25rem', lineHeight: 1.6,
                }}>
                  Insira seu email e enviaremos um link para você redefinir sua senha.
                </p>

                <label className="input-label">Email</label>
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <EnvelopeSimple
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    id="forgot-email"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>

                {error && (
                  <p style={{
                    color: 'var(--red-alert)', fontSize: '0.85rem',
                    marginBottom: '0.75rem', textAlign: 'center',
                    background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '0.6rem',
                  }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                  id="forgot-submit"
                >
                  {loading ? 'Enviando...' : '📬 Enviar link de recuperação'}
                </button>
              </div>
            </motion.form>
          )}

          {/* ── EMAIL SENT VIEW ── */}
          {view === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="card"
              style={{ padding: '2rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h2 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '1.4rem',
                color: 'var(--amber-core)',
                marginBottom: '0.75rem',
              }}>
                Link enviado!
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Verifique sua caixa de entrada em <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> e clique no link para redefinir sua senha.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Não encontrou? Verifique o spam.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setView('login')}
                id="back-to-login"
              >
                Voltar ao login
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.72rem',
          marginTop: '1.5rem',
          lineHeight: 1.5,
        }}>
          Ao entrar, você aceita nossos{' '}
          <a href="#" style={{ color: 'var(--amber-core)' }}>Termos de Uso</a>{' '}
          e{' '}
          <a href="#" style={{ color: 'var(--amber-core)' }}>Política de Privacidade</a>
        </p>
      </motion.div>

      {/* FOOTER */}
      <div style={{ position: 'fixed', bottom: '1.5rem', left: 0, right: 0, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          © 2025 Farol App · A7 Creative
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function FarolIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="58" width="24" height="12" rx="4" fill="#D97706" opacity="0.8" />
      <rect x="30" y="30" width="20" height="28" rx="3" fill="#F59E0B" />
      <rect x="33" y="34" width="14" height="16" rx="2" fill="#FBBF24" />
      <rect x="35" y="36" width="10" height="12" rx="1" fill="white" opacity="0.9" />
      <polygon points="40,8 52,30 28,30" fill="#D97706" />
      <polygon points="40,12 50,30 30,30" fill="#F59E0B" />
      <circle cx="40" cy="14" r="6" fill="#FBBF24" />
      <circle cx="40" cy="14" r="4" fill="white" opacity="0.9" />
      <line x1="40" y1="2" x2="40" y2="8" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="6" x2="50" y2="10" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="6" x2="30" y2="10" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="14" x2="54" y2="14" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="14" x2="26" y2="14" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
