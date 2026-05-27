'use client'

import { useEffect } from 'react'

// ═══════════════════════════════════════════════════════════
// PWARegister — registra o Service Worker no browser.
// Deve ser importado no layout.tsx (root) como componente client.
// Renderiza null — sem UI.
// ═══════════════════════════════════════════════════════════

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('[PWA] Service Worker registrado:', registration.scope)

        // Verifica atualização disponível e avisa no console
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão disponível — atualize a página.')
              }
            })
          }
        })
      } catch (err) {
        // Erros de registro do SW não devem crashar o app
        console.error('[PWA] Falha ao registrar Service Worker:', err)
      }
    }

    // Aguarda o load completo da página para não competir com recursos críticos
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  return null
}
