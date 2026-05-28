'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChild } from '@/hooks/useChild'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Copy, Share, ToggleRight, ToggleLeft } from '@phosphor-icons/react'

const QRCode = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://guia.a7creative.com.br'

export default function PassaportePage() {
  // ✅ FIX: useMemo evita nova instância a cada render
  const supabase = useMemo(() => createClient(), [])
  const { activeChild, refreshChildren } = useChild()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  const child = activeChild as Record<string, string | boolean | string[]> | null

  useEffect(() => {
    if (child) {
      setMessage((child.passport_message as string) || '')
      setIsPublic((child.passport_is_public as boolean) || false)
    }
  }, [child])

  const passportUrl = child?.passport_token
    ? `${APP_URL}/passaporte/${child.passport_token}`
    : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(passportUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sharePassport = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Passaporte de ${child?.name}`,
        text: `Conheça o perfil sensorial de ${child?.name}`,
        url: passportUrl,
      })
    } else {
      copyLink()
    }
  }

  const togglePublic = async () => {
    if (!child?.id || isToggling) return
    setIsToggling(true)
    setSaveError(null)
    const newPublic = !isPublic
    setIsPublic(newPublic)
    try {
      const { error } = await supabase
        .from('children')
        .update({ passport_is_public: newPublic })
        .eq('id', child.id)
      if (error) {
        console.error('[TOGGLE PUBLIC ERROR]', error)
        setSaveError('Erro ao alterar visibilidade.')
        setIsPublic(!newPublic) // reverte em caso de erro
        return
      }
      refreshChildren()
    } catch (err) {
      console.error('[Passaporte] Exceção:', err)
      setSaveError('Erro inesperado.')
      setIsPublic(!newPublic)
    } finally {
      setIsToggling(false)
    }
  }

  const saveMessage = async () => {
    if (!child?.id) return
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase
        .from('children')
        .update({ passport_message: message })
        .eq('id', child.id)
      if (error) {
        console.error('[Passaporte] Erro ao salvar mensagem:', error.message)
        setSaveError('Erro ao salvar. Tente novamente.')
      } else {
        setEditing(false)
        refreshChildren()
      }
    } catch (err) {
      console.error('[Passaporte] Exceção:', err)
      setSaveError('Erro inesperado.')
    } finally {
      setSaving(false)
    }
  }

  if (!child) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Nenhum filho cadastrado</p>
      </div>
    )
  }

  const hiperfocos = (child.hyperfocos as string[]) || []
  const triggers = (child.triggers as string[]) || []
  const calming = (child.calming_strategies as string[]) || []
  const alertSigns = (child.alert_signs as string[]) || []
  const comms = (child.best_communication as string[]) || []

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER */}
      <div>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          🪪 Passaporte
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Compartilhe com professores, babás e médicos
        </p>
      </div>

      {/* CHILD CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, var(--navy-mid) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--navy-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', border: '3px solid var(--amber-core)',
          }}>
            {child.photo_url ? (
              <img src={child.photo_url as string} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : '👦'}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.4rem', color: 'var(--amber-core)' }}>
              {child.name as string}
            </h2>
            {child.nickname && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                &ldquo;{child.nickname as string}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Seções do passaporte */}
        <PassportSection title="⭐ Hiperfocos e interesses" items={hiperfocos} color="var(--amber-core)" />
        <PassportSection title="⚡ Gatilhos conhecidos" items={triggers} color="var(--red-alert)" />
        <PassportSection title="🕊️ O que ajuda a acalmar" items={calming} color="var(--teal-vivid)" />
        {alertSigns.length > 0 && <PassportSection title="🔔 Sinais de alerta" items={alertSigns} color="var(--coral-soft)" />}
        {comms.length > 0 && <PassportSection title="🗣️ Melhor forma de se comunicar" items={comms} color="var(--lilac-calm)" />}

        {/* Mensagem dos pais */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--navy-light)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            📝 Mensagem dos pais
          </p>
          {editing ? (
            <div>
              <textarea
                className="input"
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ex: Ele adora ser chamado de Guerreiro. Em caso de crise, ligue para..."
                style={{ resize: 'none', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={saveMessage} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
              <p style={{
                color: message ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                fontStyle: message ? 'normal' : 'italic',
              }}>
                {message || 'Toque para adicionar uma mensagem personalizada...'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* TOGGLE PÚBLICO */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Passaporte público</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {isPublic ? 'Qualquer pessoa com o link pode ver' : 'Apenas você pode ver'}
            </p>
          </div>
          <button
            onClick={togglePublic}
            disabled={isToggling}
            style={{ background: 'none', border: 'none', cursor: isToggling ? 'not-allowed' : 'pointer', opacity: isToggling ? 0.5 : 1 }}
            id="passport-toggle-public"
          >
            {isPublic
              ? <ToggleRight size={36} color="var(--teal-vivid)" weight="fill" />
              : <ToggleLeft size={36} color="var(--text-muted)" weight="fill" />
            }
          </button>
        </div>
        {saveError && (
          <p style={{ color: 'var(--red-alert)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            ⚠️ {saveError}
          </p>
        )}
      </div>

      {/* QR CODE */}
      {isPublic && passportUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontWeight: 700, marginBottom: '1rem' }}>QR Code do Passaporte</p>
          <div style={{
            display: 'inline-block',
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}>
            <QRCode
              value={passportUrl}
              size={160}
              level="M"
              id="passport-qrcode"
            />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem', wordBreak: 'break-all' }}>
            {passportUrl}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-ghost btn-block"
              onClick={copyLink}
              id="passport-copy-link"
            >
              <Copy size={16} />
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button
              className="btn btn-primary btn-block"
              onClick={sharePassport}
              id="passport-share"
            >
              <Share size={16} />
              Compartilhar
            </button>
          </div>
        </motion.div>
      )}

      <div style={{ height: '2rem' }} />
    </div>
  )
}

function PassportSection({ title, items, color }: {
  title: string
  items: string[]
  color: string
}) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color, marginBottom: '0.4rem' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {items.map((item, i) => (
          <span key={i} className="chip" style={{
            borderColor: `${color}40`,
            background: `${color}10`,
            color,
            fontSize: '0.75rem',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
