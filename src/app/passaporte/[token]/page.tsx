import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('passport_token', token)
    .eq('passport_is_public', true)
    .single()

  if (!child) notFound()

  const age = child.birth_date
    ? Math.floor((Date.now() - new Date(child.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Passaporte de {child.name} — Farol App</title>
        <meta name="description" content={`Perfil sensorial de ${child.name}. Criado com amor pelos pais.`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: #0F1729;
            color: #F1EDE4;
            min-height: 100vh;
          }
          .container {
            max-width: 480px;
            margin: 0 auto;
            padding: 1.5rem 1rem;
          }
          .card {
            background: #162038;
            border: 1px solid #1E2D4A;
            border-radius: 16px;
            padding: 1.25rem;
            margin-bottom: 1rem;
          }
          .chip {
            display: inline-flex;
            padding: 0.3rem 0.75rem;
            border-radius: 100px;
            font-size: 0.8rem;
            font-weight: 500;
            margin: 0.2rem;
          }
          .section-label {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 0.6rem;
          }
          .cta-banner {
            background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(22,32,56,1) 100%);
            border: 1px solid rgba(245,158,11,0.3);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            margin-top: 1.5rem;
          }
          .btn-amber {
            display: inline-block;
            background: linear-gradient(135deg, #F59E0B, #FBBF24);
            color: #0F1729;
            font-weight: 700;
            padding: 0.875rem 2rem;
            border-radius: 100px;
            text-decoration: none;
            margin-top: 1rem;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            font-size: 0.9rem;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* HEADER FAROL */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#9BA8BC', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
              ⚓ FAROL APP
            </p>
            <h1 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.5rem',
              color: '#F59E0B',
              marginBottom: '0.25rem',
            }}>
              Passaporte de {child.name}
            </h1>
            {age !== null && (
              <p style={{ color: '#9BA8BC', fontSize: '0.9rem' }}>{age} anos</p>
            )}
          </div>

          {/* PROFILE */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#1E2D4A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                border: '3px solid #F59E0B',
                flexShrink: 0,
              }}>
                {child.photo_url
                  ? <img src={child.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : '👦'}
              </div>
              <div>
                <p style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '1.5rem',
                  color: '#F59E0B',
                }}>
                  {child.name}
                </p>
                {child.nickname && (
                  <p style={{ color: '#9BA8BC', fontSize: '0.85rem' }}>&ldquo;{child.nickname}&rdquo;</p>
                )}
              </div>
            </div>

            {/* Mensagem dos pais */}
            {child.passport_message && (
              <div style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '12px',
                padding: '0.875rem',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: '#F1EDE4',
              }}>
                💌 {child.passport_message}
              </div>
            )}
          </div>

          {/* HIPERFOCOS */}
          {child.hyperfocos && child.hyperfocos.length > 0 && (
            <div className="card">
              <p className="section-label" style={{ color: '#F59E0B' }}>⭐ O que ele ama</p>
              <div>
                {child.hyperfocos.map((item: string, i: number) => (
                  <span key={i} className="chip" style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    color: '#F59E0B',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GATILHOS */}
          {child.triggers && child.triggers.length > 0 && (
            <div className="card">
              <p className="section-label" style={{ color: '#EF4444' }}>⚡ O que pode desencadear dificuldades</p>
              <div>
                {child.triggers.map((item: string, i: number) => (
                  <span key={i} className="chip" style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#EF4444',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CALMING */}
          {child.calming_strategies && child.calming_strategies.length > 0 && (
            <div className="card">
              <p className="section-label" style={{ color: '#14B8A6' }}>🕊️ O que ajuda a acalmar</p>
              <div>
                {child.calming_strategies.map((item: string, i: number) => (
                  <span key={i} className="chip" style={{
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid rgba(20,184,166,0.3)',
                    color: '#14B8A6',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ALERT SIGNS */}
          {child.alert_signs && child.alert_signs.length > 0 && (
            <div className="card">
              <p className="section-label" style={{ color: '#F97316' }}>🔔 Sinais de que precisa de apoio</p>
              <div>
                {child.alert_signs.map((item: string, i: number) => (
                  <span key={i} className="chip" style={{
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    color: '#F97316',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* INFO LEGAL */}
          <div className="card" style={{ borderColor: 'rgba(167,139,250,0.2)' }}>
            <p className="section-label" style={{ color: '#A78BFA' }}>ℹ️ Sobre crises</p>
            <p style={{ color: '#9BA8BC', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Um meltdown é um evento neurológico involuntário — não uma birra e não um problema de educação.
              Em caso de crise, mantenha o ambiente seguro e calmo, e aguarde o ciclo passar.
              <strong style={{ color: '#F1EDE4' }}> Não force contato físico ou tente racionalizar durante a crise.</strong>
            </p>
          </div>

          {/* CTA BANNER */}
          <div className="cta-banner">
            <p style={{ fontSize: '0.8rem', color: '#9BA8BC', marginBottom: '0.25rem' }}>
              Esta página foi criada com 💛 pelos pais de {child.name} usando o
            </p>
            <p style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.5rem',
              color: '#F59E0B',
              marginBottom: '0.25rem',
            }}>
              Farol App
            </p>
            <p style={{ color: '#9BA8BC', fontSize: '0.85rem' }}>
              O guia que sua família precisava
            </p>
            <a
              href="https://guia.a7creative.com.br/login"
              className="btn-amber"
            >
              Conheça o Farol App →
            </a>
          </div>

          <p style={{
            textAlign: 'center',
            color: '#4A5568',
            fontSize: '0.72rem',
            marginTop: '1.5rem',
            paddingBottom: '2rem',
          }}>
            © 2025 Farol App · A7 Creative · guia.a7creative.com.br
          </p>
        </div>
      </body>
    </html>
  )
}
