'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { LockSimple, ArrowRight, Eye, EyeSlash } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Verificar se o usuário tem uma sessão válida (o Supabase cria uma temporária ao clicar no link de reset)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Link de recuperação inválido ou expirado. Por favor, solicite um novo.')
      }
    }
    checkSession()
  }, [supabase.auth])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Digite sua nova senha.'); return }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError('Erro ao atualizar a senha. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
      >
        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: '2rem',
          fontWeight: 900,
          color: 'var(--amber-core)',
          marginBottom: '1rem',
          lineHeight: 1.1,
        }}>
          Nova Senha
        </h1>
        
        {!success ? (
          <form onSubmit={handleReset} className="card" style={{ textAlign: 'left', padding: '1.75rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.6 }}>
              Digite sua nova senha de acesso ao Farol.
            </p>

            <label className="input-label">Nova Senha</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
                disabled={loading || !!error.includes('expirado')}
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
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  color: 'var(--red-alert)', fontSize: '0.85rem',
                  marginBottom: '1rem', textAlign: 'center',
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
              disabled={loading || !!error.includes('expirado')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Salvando...' : <>Salvar Senha <ArrowRight size={18} weight="bold" /></>}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ padding: '2rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.4rem',
              color: 'var(--amber-core)',
              marginBottom: '0.75rem',
            }}>
              Senha atualizada!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Você será redirecionado para o login em instantes...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
