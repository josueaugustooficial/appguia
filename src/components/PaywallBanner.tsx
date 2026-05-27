'use client'

// ═══════════════════════════════════════════════════════════
// PaywallBanner — banner não-intrusivo para features premium.
//
// Aparece dentro do conteúdo quando o usuário free tenta
// acessar algo que requer assinatura. Não bloqueia o app.
//
// Uso:
//   import { PaywallBanner } from '@/components/PaywallBanner'
//   <PaywallBanner feature="Histórico completo do diário" />
//
// Props:
//   feature: string       — nome da feature (ex: "Relatórios para médicos")
//   description?: string  — benefício adicional a mostrar
//   compact?: boolean     — versão menor para usar dentro de cards
// ═══════════════════════════════════════════════════════════

interface PaywallBannerProps {
  feature: string
  description?: string
  compact?: boolean
}

// Link do produto no Ticto — substituir pela URL real
const TICTO_CHECKOUT_URL = process.env.NEXT_PUBLIC_TICTO_CHECKOUT_URL ?? 'https://ticto.app'

export function PaywallBanner({ feature, description, compact = false }: PaywallBannerProps) {
  if (compact) {
    return (
      <div style={{
        padding: '0.875rem 1rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(251,191,36,0.04) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⭐</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#F59E0B',
            marginBottom: '0.15rem',
          }}>
            {feature} — Premium
          </p>
          <p style={{
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            fontSize: '0.75rem',
            color: '#9BA8BC',
            lineHeight: 1.4,
          }}>
            {description ?? 'Disponível no plano Farol Premium.'}
          </p>
        </div>
        <a
          href={TICTO_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.4rem 0.875rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            color: '#0F1729',
            fontWeight: 700,
            fontSize: '0.78rem',
            textDecoration: 'none',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
          }}
        >
          Assinar
        </a>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(245,158,11,0.2)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Faixa superior dourada */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
      }} />

      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(22,32,56,0.98) 0%, rgba(26,40,74,0.98) 100%)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.1) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
          }}>
            ⭐
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '100px',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              marginBottom: '0.4rem',
            }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#F59E0B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              }}>
                Farol Premium
              </span>
            </div>
            <p style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.1rem',
              color: '#F1EDE4',
              lineHeight: 1.3,
            }}>
              {feature}
            </p>
          </div>
        </div>

        {/* Descrição */}
        <p style={{
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          fontSize: '0.875rem',
          color: '#9BA8BC',
          lineHeight: 1.65,
          marginBottom: '1.25rem',
        }}>
          {description ?? `${feature} faz parte do plano Farol Premium. Tenha acesso completo a todas as ferramentas para apoiar seu filho.`}
        </p>

        {/* Lista de benefícios premium */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Rotinas ilimitadas',
            'Histórico completo do diário',
            'Documentos legais por IA',
            'Relatórios para médicos e escola',
            'Múltiplos filhos',
          ].map((benefit) => (
            <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                fontSize: '0.82rem',
                color: '#9BA8BC',
              }}>
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={TICTO_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            color: '#0F1729',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.45)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.35)'
          }}
        >
          ⭐ Assinar por R$27/mês
        </a>

        {/* Nota de cancelamento */}
        <p style={{
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          fontSize: '0.72rem',
          color: '#4A5568',
          textAlign: 'center',
          marginTop: '0.75rem',
        }}>
          Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </div>
  )
}
