'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const HIPERFOCOS_OPTIONS = [
  'Dinossauros', 'Trens', 'Minecraft', 'Carros', 'Astronomia',
  'Animais', 'Super-heróis', 'Música', 'Matemática', 'Robótica',
  'Videogame', 'Desenho', 'Lego', 'Pokémon', 'Aviões',
  'Eletrônicos', 'Culinária', 'Esportes', 'Dança', 'Outro'
]

const GATILHOS_OPTIONS = [
  'Barulho alto', 'Mudança de rotina', 'Fome', 'Cansaço',
  'Toque inesperado', 'Luz intensa', 'Cheiro forte', 'Multidão',
  'Frustração', 'Transições', 'Tempo de tela', 'Comida nova',
  'Roupas desconfortáveis', 'Calor', 'Ambientes novos'
]

const CALMING_OPTIONS = [
  'Pressão profunda', 'Música calma', 'Objeto favorito',
  'Espaço quieto', 'Balançar', 'Abraço apertado',
  'Desenho / colorir', 'Vídeo favorito', 'Passeio', 'Água fria',
  'Cobertor pesado', 'Fone de ouvido', 'Brinquedo sensorial'
]

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1 — Parent
  const [parentName, setParentName] = useState('')

  // Step 2 — Child
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [nickname, setNickname] = useState('')

  // Step 3 — Sensory profile
  const [hiperfocos, setHiperfocos] = useState<string[]>([])
  const [gatilhos, setGatilhos] = useState<string[]>([])
  const [calming, setCalming] = useState<string[]>([])

  const toggleItem = (
    item: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    if (list.includes(item)) setList(list.filter(i => i !== item))
    else setList([...list, item])
  }

  const handleFinish = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Create/update profile
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: parentName,
      onboarding_completed: true,
    })

    // Create child
    await supabase.from('children').insert({
      parent_id: user.id,
      name: childName,
      nickname: nickname || null,
      birth_date: birthDate || null,
      hyperfocos: hiperfocos,
      triggers: gatilhos,
      calming_strategies: calming,
    })

    router.push('/home')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--grad-hero)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Progress */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: '30%',
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? 'var(--amber-core)' : 'var(--navy-light)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textAlign: 'right',
        }}>
          Passo {step} de 3
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '2rem',
                color: 'var(--amber-core)',
                marginBottom: '0.5rem',
              }}>
                Olá! 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Como podemos te chamar?
              </p>
              <div className="card">
                <label className="input-label">Seu nome</label>
                <input
                  className="input"
                  placeholder="Ex: Ana, João, Maria..."
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  style={{ marginBottom: '1.5rem' }}
                />
                <button
                  className="btn btn-primary btn-block"
                  disabled={!parentName.trim()}
                  onClick={() => setStep(2)}
                >
                  Próximo →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '2rem',
                color: 'var(--amber-core)',
                marginBottom: '0.5rem',
              }}>
                Seu filho 💛
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Vamos criar o perfil do seu filho para personalizar o Farol.
              </p>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">Nome completo *</label>
                  <input
                    className="input"
                    placeholder="Nome do seu filho"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Apelido (opcional)</label>
                  <input
                    className="input"
                    placeholder="Como ele prefere ser chamado"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Data de nascimento (opcional)</label>
                  <input
                    className="input"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    ← Voltar
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!childName.trim()}
                    onClick={() => setStep(3)}
                    style={{ flex: 2 }}
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '2rem',
                color: 'var(--amber-core)',
                marginBottom: '0.5rem',
              }}>
                Conhecendo {childName} 🧩
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Isso vai personalizar as dicas e o protocolo SOS. Você pode editar depois.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Hiperfocos */}
                <div className="card">
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--amber-core)' }}>
                    ⭐ O que ele ama?
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {HIPERFOCOS_OPTIONS.map(item => (
                      <button
                        key={item}
                        className={`chip ${hiperfocos.includes(item) ? 'selected' : ''}`}
                        onClick={() => toggleItem(item, hiperfocos, setHiperfocos)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gatilhos */}
                <div className="card">
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--red-alert)' }}>
                    ⚡ O que pode desencadear crises?
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {GATILHOS_OPTIONS.map(item => (
                      <button
                        key={item}
                        className={`chip ${gatilhos.includes(item) ? 'selected' : ''}`}
                        onClick={() => toggleItem(item, gatilhos, setGatilhos)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calming */}
                <div className="card">
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--teal-vivid)' }}>
                    🕊️ O que ajuda a acalmar?
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {CALMING_OPTIONS.map(item => (
                      <button
                        key={item}
                        className={`chip ${calming.includes(item) ? 'selected' : ''}`}
                        onClick={() => toggleItem(item, calming, setCalming)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>
                    ← Voltar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleFinish}
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {loading ? 'Criando...' : '🚀 Entrar no Farol'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
