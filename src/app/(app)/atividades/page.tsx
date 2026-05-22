'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useChild } from '@/hooks/useChild'

const ACTIVITIES = [
  { id: 'jogo-pedido', category: 'communication', title: 'Jogo do Pedido', duration: 10, emoji: '🗣️', materials: ['objetos da casa'], steps: ['Coloque 3 objetos favoritos à distância', 'Espere ele pedir (gestos, sons ou palavras)', 'Aguarde 5 segundos antes de ajudar', 'Celebre qualquer forma de comunicação'], observe: 'Como ele se comunica sem palavras? Que gestos usa?', celebrate: 'Dance, aplauda, sorria muito — a comunicação é uma conquista!', source: 'Fala e Comunicação' },
  { id: 'hora-musica', category: 'communication', title: 'Hora da Música', duration: 15, emoji: '🎵', materials: ['instrumento simples ou voz'], steps: ['Escolha uma música favorita', 'Cante e deixe pausas para ele preencher', 'Imite os sons que ele faz', 'Faça a atividade toda vez no mesmo horário'], observe: 'Ele imita? Tenta preencher as pausas?', celebrate: 'Mostre que ficou feliz com qualquer participação!', source: 'Fala e Comunicação' },
  { id: 'turno', category: 'communication', title: 'Jogo do Turno', duration: 10, emoji: '🔄', materials: ['bola ou carrinho'], steps: ['Empurre o objeto para ele', 'Espere ele empurrar de volta', 'Faça isso 10 vezes sem forçar', 'Varie os objetos'], observe: 'Mantém o turno? Olha para você?', celebrate: 'Aplauda cada turno completado!', source: 'Fala e Comunicação' },
  { id: 'caixa-sensorial', category: 'sensory', title: 'Caixa Sensorial', duration: 20, emoji: '📦', materials: ['caixa grande', 'arroz ou feijão', 'objetos pequenos'], steps: ['Encha a caixa com arroz ou feijão', 'Esconda objetos favoritos dentro', 'Deixe ele explorar no próprio ritmo', 'Não force — observe'], observe: 'Mergulha as mãos? Evita?', celebrate: 'Elogie cada exploração!', source: 'Terapia em Casa' },
  { id: 'massinha', category: 'sensory', title: 'Jogo da Massinha', duration: 20, emoji: '🟡', materials: ['massinha caseira ou comprada'], steps: ['Modele formas sem pressionar', 'Use ferramentas: garfo, rolinho', 'Limpe juntos ao fim'], observe: 'Reage ao toque?', celebrate: 'Exponha as obras!', source: 'Terapia em Casa' },
  { id: 'terapia-agua', category: 'sensory', title: 'Terapia da Água', duration: 15, emoji: '💧', materials: ['bacia com água', 'copos', 'objetos'], steps: ['Prepare bacia com água morna', 'Coloque objetos variados', 'Nomeie o que acontece'], observe: 'Gosta da temperatura?', celebrate: 'Inclua na rotina do banho!', source: 'Terapia em Casa' },
  { id: 'pressao-profunda', category: 'sensory', title: 'Massagem de Pressão', duration: 10, emoji: '💆', materials: ['mãos'], steps: ['Peça permissão com gestos', 'Aplique pressão firme nos braços', 'Suba dos pulsos aos ombros'], observe: 'Relaxa? Pede mais?', celebrate: 'Ritual antes de dormir!', source: 'Terapia em Casa' },
  { id: 'tartaruga', category: 'motor', title: 'Jogo da Tartaruga', duration: 20, emoji: '🐢', materials: ['tatame ou tapete', 'almofadas'], steps: ['Empilhe almofadas', 'Encoraje rastejar por cima', 'Crie um túnel'], observe: 'Força nos braços? Equilíbrio?', celebrate: 'Grite "TARTARUGA CAMPEÃ!"', source: 'Terapia em Casa' },
  { id: 'circuito', category: 'motor', title: 'Circuito de Almofadas', duration: 25, emoji: '🏃', materials: ['almofadas', 'fita adesiva'], steps: ['Monte circuito no chão', 'Inclua pular e rastejar', 'Demonstre primeiro'], observe: 'Planeja os movimentos?', celebrate: 'Cronometre e celebre!', source: 'Terapia em Casa' },
  { id: 'sequencia', category: 'cognitive', title: 'Sequências de Imagem', duration: 15, emoji: '🃏', materials: ['cartões com imagens'], steps: ['Imprima sequências simples', 'Peça para ordenar', 'Comece com 3 cartões'], observe: 'Entende sequência temporal?', celebrate: 'Monte na parede!', source: 'Diagnóstico' },
  { id: 'puzzle', category: 'cognitive', title: 'Puzzle por Fases', duration: 20, emoji: '🧩', materials: ['quebra-cabeça'], steps: ['Comece com 4 peças', 'Deixe tentar 2 minutos', 'Ofereça uma dica'], observe: 'Usa estratégia visual?', celebrate: 'Fotografe o resultado!', source: 'Diagnóstico' },
  { id: 'roda-sentimentos', category: 'social', title: 'Roda de Sentimentos', duration: 15, emoji: '🎡', materials: ['papel', 'canetas'], steps: ['Desenhe roda com 6 emoções', 'Use na hora da refeição', 'Você também mostra como está'], observe: 'Identifica emoções?', celebrate: 'Cole na geladeira!', source: 'Como Não Surtar' },
  { id: 'mochila-emocional', category: 'emotional', title: 'Descarregando a Mochila', duration: 15, emoji: '🎒', materials: ['papel e caneta'], steps: ['No fim do dia, sentem juntos', 'Pergunte: o que foi pesado hoje?', 'Escute sem resolver'], observe: 'Consegue nomear dificuldades?', celebrate: 'Você também faz — modele!', source: 'Como Não Surtar' },
  { id: 'termometro', category: 'emotional', title: 'Termômetro Emocional', duration: 10, emoji: '🌡️', materials: ['cartolina', 'caneta'], steps: ['Faça termômetro de 1 a 5', 'Cole em lugar visível', 'Consulte 3x ao dia'], observe: 'Usa espontaneamente?', celebrate: 'Use estrelinhas como recompensa!', source: 'Como Não Surtar' },
]

const CATEGORIES = [
  { id: 'all', label: 'Todas', emoji: '⭐' },
  { id: 'communication', label: 'Comunicação', emoji: '🗣️' },
  { id: 'sensory', label: 'Sensorial', emoji: '🤲' },
  { id: 'motor', label: 'Motor', emoji: '🏃' },
  { id: 'cognitive', label: 'Cognitivo', emoji: '🧩' },
  { id: 'social', label: 'Social', emoji: '🤝' },
  { id: 'emotional', label: 'Emocional', emoji: '💛' },
]

export default function AtividadesPage() {
  const { activeChild } = useChild()
  const supabase = createClient()
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<typeof ACTIVITIES[0] | null>(null)
  const [logged, setLogged] = useState<string[]>([])

  const filtered = ACTIVITIES.filter(a => category === 'all' || a.category === category)

  const handleLog = async (activity: typeof ACTIVITIES[0]) => {
    if (!activeChild) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('activity_logs').insert({
      child_id: (activeChild as Record<string, string>).id,
      parent_id: user.id,
      notes: `Atividade: ${activity.title}`,
      child_enjoyed: true,
    })
    setLogged(p => [...p, activity.id])
    setSelected(null)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          💪 Atividades
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{ACTIVITIES.length} atividades dos e-books</p>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '0.4rem 0.875rem', borderRadius: '100px', border: `2px solid ${category === c.id ? 'var(--amber-core)' : 'var(--navy-light)'}`, background: category === c.id ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)', color: category === c.id ? 'var(--amber-core)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', transition: 'all 0.2s' }} id={`cat-${c.id}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '5rem' }}>
        {filtered.map(activity => (
          <motion.div key={activity.id} whileTap={{ scale: 0.97 }} onClick={() => setSelected(activity)} className="card card-hover" style={{ cursor: 'pointer', border: logged.includes(activity.id) ? '1.5px solid rgba(20,184,166,0.4)' : undefined }} id={`activity-${activity.id}`}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{activity.emoji}</div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>{activity.title}</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⏱ {activity.duration} min</p>
            {logged.includes(activity.id) && <span className="badge badge-success" style={{ fontSize: '0.65rem', marginTop: '0.4rem' }}>✓ Feita</span>}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="modal-sheet" style={{ maxHeight: '90vh' }}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '2rem' }}>{selected.emoji}</span>
                  <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', marginTop: '0.25rem' }}>{selected.title}</h2>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.3rem' }}>⏱ {selected.duration} min</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 130px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ padding: '0.875rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>🛒 MATERIAIS</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selected.materials.join(', ')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--amber-core)', fontWeight: 700, marginBottom: '0.75rem' }}>📋 PASSO A PASSO</p>
                  {selected.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ minWidth: '24px', height: '24px', background: 'rgba(245,158,11,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-core)', flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{step}</p>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding: '0.875rem', borderColor: 'rgba(20,184,166,0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--teal-vivid)', fontWeight: 700, marginBottom: '0.4rem' }}>👀 O QUE OBSERVAR</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{selected.observe}</p>
                </div>
                <div className="card" style={{ padding: '0.875rem', borderColor: 'rgba(167,139,250,0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--lilac-calm)', fontWeight: 700, marginBottom: '0.4rem' }}>🎉 COMO CELEBRAR</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{selected.celebrate}</p>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic', textAlign: 'center' }}>📚 Baseado em: {selected.source}</p>
                <button className="btn btn-primary btn-block btn-lg" onClick={() => handleLog(selected)} disabled={logged.includes(selected.id)} id="log-activity-btn">
                  {logged.includes(selected.id) ? <><Check size={18} /> Registrada!</> : '✅ Marcar como feita'}
                </button>
                <div style={{ height: '1rem' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
