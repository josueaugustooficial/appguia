'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChild } from '@/hooks/useChild'
import { SpeakerHigh, Plus, X } from '@phosphor-icons/react'

const DEFAULT_BOARDS = [
  {
    id: 'emotions',
    name: 'Emoções',
    items: [
      { label: 'Feliz', emoji: '😊', color: '#22c55e' },
      { label: 'Triste', emoji: '😢', color: '#60a5fa' },
      { label: 'Bravo', emoji: '😠', color: '#ef4444' },
      { label: 'Com medo', emoji: '😨', color: '#a855f7' },
      { label: 'Ansioso', emoji: '😰', color: '#f97316' },
      { label: 'Surpreso', emoji: '😲', color: '#f59e0b' },
      { label: 'Cansado', emoji: '😴', color: '#64748b' },
      { label: 'Com dor', emoji: '🤕', color: '#ef4444' },
      { label: 'Calmo', emoji: '😌', color: '#14b8a6' },
    ],
  },
  {
    id: 'needs',
    name: 'Necessidades',
    items: [
      { label: 'Fome', emoji: '🍽️', color: '#f97316' },
      { label: 'Sede', emoji: '💧', color: '#60a5fa' },
      { label: 'Banheiro', emoji: '🚻', color: '#a855f7' },
      { label: 'Sono', emoji: '💤', color: '#64748b' },
      { label: 'Ajuda', emoji: '🙋', color: '#f59e0b' },
      { label: 'Parar', emoji: '✋', color: '#ef4444' },
      { label: 'Mais', emoji: '➕', color: '#22c55e' },
      { label: 'Não quero', emoji: '🚫', color: '#ef4444' },
      { label: 'Abraço', emoji: '🤗', color: '#ec4899' },
    ],
  },
  {
    id: 'places',
    name: 'Lugares',
    items: [
      { label: 'Casa', emoji: '🏠', color: '#f59e0b' },
      { label: 'Escola', emoji: '🏫', color: '#60a5fa' },
      { label: 'Carro', emoji: '🚗', color: '#64748b' },
      { label: 'Médico', emoji: '🏥', color: '#ef4444' },
      { label: 'Parque', emoji: '🌳', color: '#22c55e' },
      { label: 'Terapia', emoji: '🧩', color: '#a855f7' },
      { label: 'Avó/Avô', emoji: '👴', color: '#f97316' },
      { label: 'Supermercado', emoji: '🛒', color: '#14b8a6' },
    ],
  },
]

export default function ComunicacaoPage() {
  const { activeChild } = useChild()
  const [activeBoard, setActiveBoard] = useState(DEFAULT_BOARDS[0])
  const [speaking, setSpeaking] = useState<string | null>(null)

  const speak = (text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setSpeaking(text)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.85
    utterance.pitch = 1.1
    utterance.onend = () => setSpeaking(null)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          🗣️ Comunicação
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Pranchas de comunicação visual
        </p>
      </div>

      {/* BOARD TABS */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1rem',
        scrollbarWidth: 'none',
      }}>
        {DEFAULT_BOARDS.map(board => (
          <button
            key={board.id}
            onClick={() => setActiveBoard(board)}
            style={{
              flexShrink: 0,
              padding: '0.5rem 1.25rem',
              borderRadius: '100px',
              border: `2px solid ${activeBoard.id === board.id ? 'var(--amber-core)' : 'var(--navy-light)'}`,
              background: activeBoard.id === board.id ? 'rgba(245,158,11,0.15)' : 'var(--navy-light)',
              color: activeBoard.id === board.id ? 'var(--amber-core)' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
            id={`board-tab-${board.id}`}
          >
            {board.name}
          </button>
        ))}
      </div>

      {/* USAGE HINT */}
      <div style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <SpeakerHigh size={20} color="var(--amber-core)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
          Toque em qualquer card para ler em voz alta. Mostre ao seu filho para que ele possa apontar o que precisa.
        </p>
      </div>

      {/* BOARD GRID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBoard.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="board-grid"
        >
          {activeBoard.items.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => speak(item.label)}
              className="board-card"
              style={{
                background: speaking === item.label
                  ? `${item.color}25`
                  : 'var(--navy-mid)',
                border: `2px solid ${speaking === item.label ? item.color : 'var(--navy-light)'}`,
                boxShadow: speaking === item.label ? `0 0 20px ${item.color}40` : 'none',
                transition: 'all 0.2s ease',
              }}
              id={`board-item-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              aria-label={`${item.label} — toque para ouvir`}
            >
              <span style={{
                fontSize: '2.5rem',
                display: 'block',
                filter: speaking === item.label ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
              }}>
                {item.emoji}
              </span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: speaking === item.label ? item.color : 'var(--text-primary)',
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {item.label}
              </span>
              {speaking === item.label && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ position: 'absolute', top: '4px', right: '4px' }}
                >
                  <SpeakerHigh size={14} color={item.color} weight="fill" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* HOW TO USE */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
          📋 Como usar esta prancha
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Mostre a prancha ao seu filho em momentos de calma',
            'Deixe que ele aponte o card que representa o que sente',
            'Toque no card para que o app fale a palavra em voz alta',
            'Pratique regularmente para que ele aprenda os símbolos',
          ].map((tip, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--amber-core)', fontWeight: 700 }}>{i + 1}.</span>
              {tip}
            </p>
          ))}
        </div>
      </div>

      {/* PRINT TIP */}
      <div style={{
        textAlign: 'center',
        padding: '1rem',
        marginTop: '0.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
      }}>
        💡 Dica: Imprima e plastifique para usar sem celular
      </div>

      <div style={{ height: '2rem' }} />
    </div>
  )
}
