'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChild } from '@/hooks/useChild'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ChatText, Scales } from '@phosphor-icons/react'

const DOCUMENT_TYPES = [
  {
    id: 'friendly_neighbor_letter',
    icon: '📄',
    title: 'Carta Amigável para o Vizinho',
    desc: 'Explica sobre o filho de forma calorosa e educativa',
    aiGenerated: false,
    color: 'var(--teal-vivid)',
  },
  {
    id: 'legal_defense_notice',
    icon: '⚖️',
    title: 'Ofício Legal para o Síndico',
    desc: 'Documento formal citando Lei 12.764/2012 e Lei 13.146/2015',
    aiGenerated: true,
    premium: true,
    color: 'var(--amber-core)',
  },
  {
    id: 'whatsapp_building_message',
    icon: '💬',
    title: 'Mensagem para o WhatsApp do Prédio',
    desc: 'Texto caloroso para copiar e compartilhar',
    aiGenerated: false,
    color: 'var(--teal-vivid)',
  },
  {
    id: 'school_presentation',
    icon: '🏫',
    title: 'Carta de Apresentação para a Escola',
    desc: 'Apresenta seu filho e seu perfil para professores',
    aiGenerated: true,
    premium: true,
    color: 'var(--lilac-calm)',
  },
  {
    id: 'therapist_report',
    icon: '🩺',
    title: 'Resumo para Consulta Médica',
    desc: 'Baseado nos dados do diário dos últimos 30 dias',
    aiGenerated: true,
    premium: true,
    color: 'var(--coral-soft)',
  },
]

type DocForm = {
  parentName: string
  apartment: string
  buildingName: string
  childName: string
  notificationDate: string
  schoolName: string
  teacherName: string
  grade: string
  doctorName: string
  specialty: string
  consultDate: string
}

const NEIGHBOR_TEMPLATE = (form: DocForm) => `Prezado vizinho,

Meu nome é ${form.parentName}, moro no apartamento ${form.apartment}.

Escrevo esta carta para apresentar meu filho, ${form.childName}, e compartilhar algo importante sobre ele.

${form.childName} é uma criança especial — ele tem uma forma diferente de processar o mundo ao redor. O que pode parecer uma "birra" ou "barulho sem motivo" é, na verdade, uma resposta neurológica involuntária chamada meltdown, que ocorre quando seu sistema sensorial é sobrecarregado.

Esses momentos são tão difíceis para ele quanto para nós. Fazemos o nosso máximo para apoiá-lo, mas às vezes o processo de se acalmar requer alguns minutos.

Agradeço muito pela sua compreensão. Estou sempre à disposição para conversar.

Com carinho,
${form.parentName} — Apto. ${form.apartment}`

const WHATSAPP_TEMPLATE = (form: DocForm) => `Olá, pessoal do grupo! 👋

Sou o(a) ${form.parentName}, do apto. ${form.apartment}.

Quero compartilhar algo com vocês, com todo carinho: meu filho(a) ${form.childName} tem processamento sensorial intenso. Em alguns momentos, pode haver barulho — não por falta de cuidado, mas porque ele/ela passa por algo que chamamos de meltdown, que é uma resposta neurológica involuntária.

Estamos sempre fazendo o possível para ajudá-lo(a). Agradeço muito a compreensão de todos! 💛

Qualquer dúvida, estou à disposição.
${form.parentName} — Apto. ${form.apartment}`

export default function DocumentosPage() {
  const { activeChild } = useChild()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [form, setForm] = useState<DocForm>({
    parentName: '',
    apartment: '',
    buildingName: '',
    childName: (activeChild as Record<string, string> | null)?.name || '',
    notificationDate: new Date().toLocaleDateString('pt-BR'),
    schoolName: '',
    teacherName: '',
    grade: '',
    doctorName: '',
    specialty: '',
    consultDate: '',
  })
  const [generatedContent, setGeneratedContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const docType = DOCUMENT_TYPES.find(d => d.id === activeDoc)

  const generateDocument = async () => {
    setGenerating(true)

    if (activeDoc === 'friendly_neighbor_letter') {
      setGeneratedContent(NEIGHBOR_TEMPLATE(form))
      setGenerating(false)
      return
    }

    if (activeDoc === 'whatsapp_building_message') {
      setGeneratedContent(WHATSAPP_TEMPLATE(form))
      setGenerating(false)
      return
    }

    // AI-generated documents
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: activeDoc,
          formData: { ...form, childProfile: activeChild },
        }),
      })
      const data = await res.json()
      setGeneratedContent(data.content || 'Erro ao gerar documento')
    } catch {
      setGeneratedContent('Erro ao gerar documento. Tente novamente.')
    }
    setGenerating(false)
  }

  const copyContent = async () => {
    await navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          📄 Documentos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Documentos gerados com IA, baseados na sua realidade
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {DOCUMENT_TYPES.map(doc => (
          <motion.div
            key={doc.id}
            whileTap={{ scale: 0.98 }}
            className="doc-card"
            onClick={() => {
              setActiveDoc(doc.id)
              setGeneratedContent('')
              setForm(f => ({ ...f, childName: (activeChild as Record<string, string> | null)?.name || '' }))
            }}
            id={`doc-${doc.id}`}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{doc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{doc.title}</p>
                  {doc.aiGenerated && (
                    <span className="badge badge-info" style={{ fontSize: '0.65rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                      IA
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{doc.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DOCUMENT MODAL */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={e => { if (e.target === e.currentTarget) setActiveDoc(null) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-sheet"
              style={{ maxHeight: '92vh' }}
            >
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', flex: 1, paddingRight: '0.5rem' }}>
                  {docType?.title}
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveDoc(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>
                {!generatedContent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="input-label">Seu nome</label>
                      <input className="input" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} placeholder="Ana Silva" />
                    </div>

                    {(activeDoc === 'friendly_neighbor_letter' || activeDoc === 'whatsapp_building_message' || activeDoc === 'legal_defense_notice') && (
                      <div>
                        <label className="input-label">Seu apartamento</label>
                        <input className="input" value={form.apartment} onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))} placeholder="Ex: 302" />
                      </div>
                    )}

                    {activeDoc === 'legal_defense_notice' && (
                      <div>
                        <label className="input-label">Nome do condomínio</label>
                        <input className="input" value={form.buildingName} onChange={e => setForm(f => ({ ...f, buildingName: e.target.value }))} placeholder="Residencial das Flores" />
                      </div>
                    )}

                    {activeDoc === 'school_presentation' && (
                      <>
                        <div>
                          <label className="input-label">Nome da escola</label>
                          <input className="input" value={form.schoolName} onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="Escola Municipal..." />
                        </div>
                        <div>
                          <label className="input-label">Nome do(a) professor(a)</label>
                          <input className="input" value={form.teacherName} onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="input-label">Série / Turma</label>
                          <input className="input" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="3º ano A" />
                        </div>
                      </>
                    )}

                    {activeDoc === 'therapist_report' && (
                      <>
                        <div>
                          <label className="input-label">Nome do médico</label>
                          <input className="input" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="input-label">Especialidade</label>
                          <input className="input" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Neuropediatra" />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="input-label">Nome do filho</label>
                      <input className="input" value={form.childName} onChange={e => setForm(f => ({ ...f, childName: e.target.value }))} />
                    </div>

                    <button
                      className="btn btn-primary btn-block btn-lg"
                      onClick={generateDocument}
                      disabled={generating || !form.parentName || !form.childName}
                      id="generate-document-btn"
                    >
                      {generating ? '⏳ Gerando com IA...' : `✨ Gerar ${docType?.aiGenerated ? 'com IA' : 'documento'}`}
                    </button>
                    <div style={{ height: '1rem' }} />
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: 'var(--navy-deep)',
                      border: '1px solid var(--navy-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      color: 'var(--text-primary)',
                    }}>
                      {generatedContent}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      <button className="btn btn-ghost btn-block" onClick={copyContent} id="copy-doc-btn">
                        {copied ? '✅ Copiado!' : '📋 Copiar texto'}
                      </button>
                      <button className="btn btn-primary btn-block" onClick={() => setGeneratedContent('')} id="regenerate-doc-btn">
                        🔄 Refazer
                      </button>
                    </div>
                    <div style={{ height: '1rem' }} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '2rem' }} />
    </div>
  )
}
