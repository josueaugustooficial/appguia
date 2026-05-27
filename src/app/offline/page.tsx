'use client'

// ═════════════════════════════════════════════════════
// Página exibida quando o usuário está sem internet.
// É pré-cacheada pelo Service Worker — funciona offline.
// ═════════════════════════════════════════════════════

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F1729 0%, #162038 55%, #1a2a4a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>

      {/* Ícone animado */}
      <div style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        animation: 'float 4s ease-in-out infinite',
        filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.35))',
      }}>
        🏮
      </div>

      {/* Status de conexão */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.875rem',
        borderRadius: '100px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.3)',
        marginBottom: '1.5rem',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#EF4444',
          display: 'inline-block',
        }} />
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#EF4444',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          Sem conexão
        </span>
      </div>

      {/* Título */}
      <h1 style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: '2rem',
        color: '#F1EDE4',
        marginBottom: '0.875rem',
        lineHeight: 1.2,
      }}>
        Você está offline
      </h1>

      {/* Subtítulo */}
      <p style={{
        color: '#9BA8BC',
        fontSize: '1rem',
        lineHeight: 1.65,
        maxWidth: '320px',
        marginBottom: '0.5rem',
      }}>
        Sem internet no momento. Verifique sua conexão Wi-Fi ou dados móveis.
      </p>

      {/* Destaque SOS offline */}
      <div style={{
        maxWidth: '380px',
        margin: '1.75rem auto',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(239,68,68,0.07)',
        border: '1px solid rgba(239,68,68,0.2)',
      }}>
        <p style={{
          fontSize: '0.9rem',
          color: '#F1EDE4',
          lineHeight: 1.6,
          marginBottom: '0.25rem',
          fontWeight: 600,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          🆘 Modo SOS disponível
        </p>
        <p style={{
          fontSize: '0.85rem',
          color: '#9BA8BC',
          lineHeight: 1.6,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}>
          O protocolo de crise funciona mesmo sem internet, pois está salvo no seu dispositivo.
        </p>
      </div>

      {/* Botões de ação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '320px' }}>
        <a
          href="/sos"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            boxShadow: '0 8px 32px rgba(239,68,68,0.3)',
          }}
        >
          🆘 Ir para o Modo SOS
        </a>

        <button
          onClick={handleRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            borderRadius: '100px',
            background: 'transparent',
            border: '1.5px solid #1E2D4A',
            color: '#9BA8BC',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          ↻ Tentar novamente
        </button>
      </div>

      {/* Rodapé */}
      <p style={{
        marginTop: '2.5rem',
        fontSize: '0.75rem',
        color: '#4A5568',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}>
        Farol — A7 Creative
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
