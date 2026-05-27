// ═══════════════════════════════════════════════════════════
// FAROL APP — Service Worker
// Cache strategy: Network-first para navegação, cache-first para assets.
// Modo SOS é cacheado para funcionar offline — é emergência.
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'farol-v2'
const CACHE_STATIC_NAME = 'farol-static-v2'

// URLs que DEVEM funcionar offline (cacheadas no install)
const OFFLINE_PRECACHE = [
  '/offline',
]

// ─── INSTALL — precache das páginas críticas ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_PRECACHE)
    }).then(() => {
      // Ativa imediatamente, sem esperar fechar tabs antigas
      return self.skipWaiting()
    })
  )
})

// ─── ACTIVATE — limpa caches antigos ────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== CACHE_STATIC_NAME)
            .map((name) => caches.delete(name))
        )
      ),
      // Assume controle de todos os clientes imediatamente
      self.clients.claim(),
    ])
  )
})

// ─── FETCH — estratégia Network-first para navegação ────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests que não são do mesmo origin (CDNs, APIs externas)
  if (url.origin !== self.location.origin) return

  // Ignorar API calls — não cacheamos dados do Supabase
  if (url.pathname.startsWith('/api/')) return

  // Para navegação (clique em links, abertura de tabs):
  // Network-first → se falhar (offline) → serve /offline da cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar e guardar na cache a página visitada (atualiza sempre)
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // Offline: tentar servir da cache primeiro
          return caches.match(request).then((cached) => {
            if (cached) return cached
            // Fallback para a página offline
            return caches.match('/offline')
          })
        })
    )
    return
  }

  // Para assets estáticos (CSS, JS, fontes): Cache-first
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_STATIC_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
    )
  }
})
