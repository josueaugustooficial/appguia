'use client'

import { useAuth } from '@/hooks/useAuth'
import { useChild } from '@/hooks/useChild'
import { motion } from 'framer-motion'
import { SignOut, Devices, CreditCard, User } from '@phosphor-icons/react'
import Link from 'next/link'

export default function PerfilPage() {
  const { user, profile, signOut } = useAuth()
  const { activeChild } = useChild()

  const p = profile as Record<string, string> | null
  const child = activeChild as Record<string, string | boolean | string[]> | null
  const isSubscribed = p?.subscription_status === 'active'

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem' }}>👤 Perfil</h1>

      {/* User card */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '2px solid var(--amber-core)', flexShrink: 0 }}>
          <User size={28} color="var(--amber-core)" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>{p?.full_name || 'Pai/Mãe'}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
          <span className={`badge ${isSubscribed ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', marginTop: '0.3rem' }}>
            {isSubscribed ? '✓ Assinante Farol' : 'Plano Gratuito'}
          </span>
        </div>
      </div>

      {/* Child profile */}
      {child && (
        <div>
          <p className="section-title">Filho cadastrado</p>
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '2px solid var(--navy-light)', flexShrink: 0 }}>
              {child.photo_url ? <img src={child.photo_url as string} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👦'}
            </div>
            <div>
              <p style={{ fontWeight: 700 }}>{child.name as string}</p>
              {child.nickname && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>&ldquo;{child.nickname as string}&rdquo;</p>}
            </div>
          </div>
        </div>
      )}

      {/* Subscription */}
      {!isSubscribed && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, var(--navy-mid) 100%)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <CreditCard size={24} color="var(--amber-core)" />
            <div>
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Assine o Farol Premium</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Documentos legais com IA, relatórios PDF e acesso completo a todas as features.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 700, color: 'var(--amber-core)' }}>R$27</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>/mês</span>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_TICTO_CHECKOUT_URL || '#'}
            className="btn btn-primary btn-block"
            id="subscribe-btn"
          >
            🚀 Assinar agora
          </a>
        </div>
      )}

      {/* Menu items */}
      <div>
        <p className="section-title">Configurações</p>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { href: '/passaporte', icon: '🪪', label: 'Passaporte do filho' },
            { href: '/rotinas', icon: '🗓️', label: 'Rotinas visuais' },
            { href: '/documentos', icon: '📄', label: 'Documentos legais' },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--navy-light)', textDecoration: 'none', transition: 'background 0.2s' }} id={`profile-menu-${i}`}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Device info */}
      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Devices size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dispositivos autorizados</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Máximo de 2 dispositivos por conta</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        className="btn btn-ghost btn-block"
        onClick={signOut}
        id="signout-btn"
        style={{ color: 'var(--red-alert)', borderColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        <SignOut size={18} /> Sair da conta
      </button>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
        Farol App v1.0 · A7 Creative
      </p>

      <div style={{ height: '2rem' }} />
    </div>
  )
}
