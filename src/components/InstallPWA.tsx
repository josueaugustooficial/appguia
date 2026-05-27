'use client'

import { useState, useEffect, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════
// InstallPWA — Banner de instalação do app.
//
// Comportamento:
// - Não aparece se já estiver instalado (display-mode: standalone)
// - Não aparece se o usuário recusou há menos de 7 dias
// - Aparece 5 segundos após a página carregar (UX: não interrompe imediatamente)
// - "Instalar" → dispara o prompt nativo do browser
// - "Agora não" → fecha e define cooldown de 7 dias no localStorage
//
// Adicionar em: src/app/(app)/home/page.tsx ou no layout do app
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'farol_pwa_dismiss_ts'
const COOLDOWN_DAYS = 7

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installing, setInstalling] = useState(false)

  const shouldShow = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    // Já está instalado como PWA — não mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) return false

    // Verificar cooldown
    const dismissedTs = localStorage.getItem(STORAGE_KEY)
    if (dismissedTs) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedTs, 10)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismiss < COOLDOWN_DAYS) return false
    }

    return true
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Captura o evento beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      if (shouldShow()) {
        // Aguarda 5s para não interromper a chegada do usuário
        setTimeout(() => setShowBanner(true), 5000)
      }
    }

    // Detecta quando o app é instalado — esconde o banner
    const handleAppInstalled = () => {
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [shouldShow])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        setDeferredPrompt(null)
      }
    } catch (err) {
      console.error('[PWA] Erro ao instalar:', err)
    } finally {
      setInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-label="Instalar o Farol no seu celular"
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom) + 0.75rem)',
        left: '1rem',
        right: '1rem',
        zIndex: 150,
        maxWidth: '440px',
        margin: '0 auto',
        animation: 'slideUpBanner 0.35s ease forwards',
      }}
    >
      <div style={{
        background: 'rgba(22, 32, 56, 0.97)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '16px',
        padding: '1rem 1.125rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
      }}>
        {/* Ícone */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
        }}>
          🏮
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#F1EDE4',
            marginBottom: '0.2rem',
            lineHeight: 1.3,
          }}>
            Instale o Farol no celular
          </p>
          <p style={{
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            fontSize: '0.78rem',
            color: '#9BA8BC',
            lineHeight: 1.4,
          }}>
            Acesso rápido, funciona offline, sem instalar da loja
          </p>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              padding: '0.45rem 0.875rem',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: '#0F1729',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: 'none',
              cursor: installing ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              opacity: installing ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {installing ? '...' : 'Instalar'}
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '100px',
              background: 'transparent',
              border: 'none',
              color: '#4A5568',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              textAlign: 'center',
            }}
          >
            Agora não
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
