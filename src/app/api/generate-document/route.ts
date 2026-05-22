import { NextResponse } from 'next/server'

// ============================================================
// Gerador de documentos 100% GRATUITO — templates em JavaScript
// Sem API externa, sem custo — qualidade profissional garantida
// ============================================================

interface FormData {
  parentName?: string
  apartment?: string
  buildingName?: string
  childName?: string
  schoolName?: string
  teacherName?: string
  grade?: string
  doctorName?: string
  specialty?: string
  consultDate?: string
  childProfile?: {
    name?: string
    diagnosis?: string
    hyperfocos?: string[]
    triggers?: string[]
    calming_strategies?: string[]
    alert_signs?: string[]
    best_communication?: string[]
    sensory_profile?: Record<string, string>
  }
}

// ────────────────────────────────────────────────
// TEMPLATE 1: Ofício Legal para Síndico
// ────────────────────────────────────────────────
function generateLegalNotice(form: FormData): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const protocolNum = `FAR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

  return `OFÍCIO Nº ${protocolNum}
${today.toUpperCase()}

AO SÍNDICO DO CONDOMÍNIO ${(form.buildingName || '[Nome do Condomínio]').toUpperCase()}

Assunto: Notificação formal sobre direitos de pessoa com deficiência
         Lei 12.764/2012 — Lei 13.146/2015 (LBI)

Senhor(a) Síndico(a),

Eu, ${form.parentName || '[Nome]'}, residente no apartamento ${form.apartment || '[Nº]'} deste condomínio, venho, por meio deste ofício, notificá-lo(a) formalmente sobre os direitos legais de meu(minha) filho(a), ${form.childName || '[Nome da criança]'}, em conformidade com a legislação brasileira vigente.

I — DA CONDIÇÃO NEUROLÓGICA

Meu(minha) filho(a) ${form.childName || '[Nome da criança]'} possui Transtorno do Espectro Autista (TEA), classificado pelo CID-11 como código 6A00 (anteriormente F84.0 no CID-10), reconhecido legalmente como deficiência pela Lei nº 12.764, de 27 de dezembro de 2012 — conhecida como Lei Berenice Piana.

É essencial esclarecer que os episódios denominados meltdown são eventos neurológicos INVOLUNTÁRIOS, não comportamentos intencionais ou resultado de falta de disciplina. Trata-se de uma resposta automática do sistema nervoso a sobrecarga sensorial ou emocional, comparável neurologicamente a uma crise de ansiedade aguda. O(a) responsável não possui controle sobre esses episódios, assim como não se controla um reflexo involuntário.

II — DO AMPARO LEGAL

Este ofício fundamenta-se nos seguintes diplomas legais:

• Lei nº 12.764/2012 (Lei Berenice Piana): Art. 1º — Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista; Art. 2º — Define autismo como deficiência para todos os efeitos legais.

• Lei nº 13.146/2015 — Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência): Art. 4º — Toda pessoa com deficiência tem direito à igualdade de oportunidades com as demais pessoas; Art. 88 — Praticar, induzir ou incitar discriminação de pessoa em razão de sua deficiência constitui crime.

• Decreto nº 3.298/1999, alterado pelo Decreto nº 5.296/2004: regulamenta a Política Nacional para a Integração da Pessoa Portadora de Deficiência.

III — DO PEDIDO

Diante do exposto, solicito formalmente:

1. Que o condomínio se abstenha de aplicar advertências, multas ou qualquer penalidade decorrente de manifestações neurológicas involuntárias de ${form.childName || '[Nome]'}, especialmente episódios de meltdown.

2. Que eventuais comunicados ou reclamações de outros condôminos sejam respondidos pelo condomínio com a devida orientação sobre a condição neurológica, garantindo um ambiente inclusivo e respeitoso.

3. Que quaisquer decisões que afetem diretamente os direitos de ${form.childName || '[Nome]'} sejam previamente comunicadas a mim, no prazo de 5 (cinco) dias úteis.

IV — DA CONSEQUÊNCIA DO NÃO ATENDIMENTO

O não atendimento a este ofício, ou qualquer ação discriminatória por parte do condomínio ou de seus representantes, poderá ensejar responsabilidade civil e criminal, nos termos do Art. 88 da Lei 13.146/2015, podendo resultar em reparação de danos morais e comunicação ao Ministério Público.

V — DO PRAZO

Aguardo posicionamento formal do condomínio no prazo de 15 (quinze) dias corridos a partir do recebimento deste ofício.

Coloco-me à disposição para conversar e esclarecer quaisquer dúvidas. É do meu interesse e do condomínio que mantenhamos uma relação de respeito mútuo e harmonia.

Atenciosamente,

${form.parentName || '[Nome completo]'}
Apartamento ${form.apartment || '[Nº]'}
Responsável legal por ${form.childName || '[Nome]'}

Data: ${today}

_____________________________
Assinatura

_____________________________
Recebido em: ___/___/______
Assinatura do síndico:`
}

// ────────────────────────────────────────────────
// TEMPLATE 2: Carta de Apresentação para a Escola
// ────────────────────────────────────────────────
function generateSchoolLetter(form: FormData): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const hyperfocos = form.childProfile?.hyperfocos?.join(', ') || 'a serem descobertos com você'
  const triggers = form.childProfile?.triggers?.join(', ') || 'barulho intenso, mudanças bruscas de rotina'
  const calming = form.childProfile?.calming_strategies?.join(', ') || 'espaço tranquilo, rotina previsível'
  const alertSigns = form.childProfile?.alert_signs?.join(', ') || 'agitação crescente, evitar contato visual'
  const comm = form.childProfile?.best_communication?.join(', ') || 'instruções simples e diretas, uma de cada vez'

  return `${today}

À ${form.schoolName || 'Escola'}
A/C Prof(a). ${form.teacherName || '[Nome do(a) Professor(a)]'}
${form.grade || '[Série/Turma]'}

Prezado(a) Professor(a),

Meu nome é ${form.parentName || '[Nome]'} e sou pai/mãe de ${form.childName || '[Nome da criança]'}. Escrevo esta carta não como um pedido de tratamento especial, mas como um convite à parceria — pois acredito que quanto mais você conhecer ${form.childName || 'meu filho'}, mais fácil será criar juntos um ambiente onde ele(a) possa aprender, crescer e se sentir seguro(a).

SOBRE ${(form.childName || '[NOME]').toUpperCase()}

${form.childName || 'Meu filho'} tem Transtorno do Espectro Autista (TEA). Isso não define quem ele(a) é — é apenas uma parte de como seu sistema nervoso processa o mundo. Na prática, significa que ele(a) recebe e processa estímulos de forma diferente da maioria das pessoas.

O QUE ELE(A) AMA ❤️
${hyperfocos} — use esses interesses como pontes! Introduzir conteúdos novos através do que ele(a) ama funciona muito melhor do que conteúdos genéricos.

O QUE PODE SER DIFÍCIL ⚡
Situações que costumam gerar sobrecarga: ${triggers}.

Sobre os meltdowns (crises): quando acontecem, NÃO são birras. São respostas neurológicas involuntárias a uma sobrecarga que o sistema nervoso não consegue mais processar. Nesse momento:
✓ Mantenha o ambiente calmo e seguro
✓ Reduza estímulos (barulho, luz, pessoas ao redor)
✓ Use frases curtas: "Estou aqui." "Você está seguro."
✗ Não force contato físico ou olho no olho
✗ Não tente racionalizar durante a crise

O QUE AJUDA A ACALMAR 🕊️
${calming}

SINAIS DE QUE ELE(A) PRECISA DE APOIO 🔔
Fique atento(a) a: ${alertSigns}. Esses são os sinais de que a sobrecarga está chegando — é o momento ideal para intervir gentilmente antes de uma crise.

COMO SE COMUNICAR MELHOR 🗣️
${comm}. Instruções múltiplas ao mesmo tempo podem ser confusas. Prefira uma instrução de cada vez, com linguagem direta e objetiva.

PEDIDOS PRÁTICOS

1. Avise-me com antecedência sobre mudanças na rotina (passeios, substituições de professor, mudança de sala) — podemos preparar ${form.childName || 'meu filho'} em casa.

2. Se houver uma crise, por favor me contate. Não como alerta, mas para que possamos entender o que aconteceu e ajustar estratégias juntos.

3. Pequenas adaptações fazem grande diferença: sentar longe de janelas barulhentas, aviso prévio do fim das atividades, um cantinho quieto quando necessário.

SOBRE AMIZADES

${form.childName || 'Meu filho'} pode parecer retraído(a) às vezes — isso não significa desinteresse nas outras crianças. Às vezes a interação social exige mais energia para ele(a). Um colega paciente e acolhedor pode fazer toda a diferença.

ESTOU AQUI

Estou disponível a qualquer momento para conversar, responder dúvidas e celebrar cada conquista junto com você. Cada progresso — por menor que pareça — é enorme para nós.

Obrigado(a) por estar disposto(a) a conhecer e acolher ${form.childName || 'meu filho'} da forma que ele(a) precisa. Isso já é um presente inestimável.

Com gratidão e esperança,

${form.parentName || '[Nome]'}
Responsável por ${form.childName || '[Nome]'}
Data: ${today}`
}

// ────────────────────────────────────────────────
// TEMPLATE 3: Resumo para Consulta Médica
// ────────────────────────────────────────────────
function generateTherapistReport(form: FormData): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const consultDate = form.consultDate
    ? new Date(form.consultDate).toLocaleDateString('pt-BR')
    : today

  const hyperfocos = form.childProfile?.hyperfocos?.join(', ') || 'Não informado'
  const triggers = form.childProfile?.triggers?.join(', ') || 'Não informado'
  const calming = form.childProfile?.calming_strategies?.join(', ') || 'Não informado'
  const alertSigns = form.childProfile?.alert_signs?.join(', ') || 'Não informado'
  const sensory = form.childProfile?.sensory_profile

  return `══════════════════════════════════════════════
RESUMO PARA CONSULTA MÉDICA — FAROL APP
══════════════════════════════════════════════

DATA DA CONSULTA: ${consultDate}
PACIENTE: ${form.childName || '[Nome]'}
MÉDICO(A): ${form.doctorName || '[Nome do médico]'}
ESPECIALIDADE: ${form.specialty || '[Especialidade]'}
RESPONSÁVEL: ${form.parentName || '[Nome do responsável]'}
GERADO EM: ${today}

──────────────────────────────────────────────
1. PERFIL GERAL
──────────────────────────────────────────────

Diagnóstico: Transtorno do Espectro Autista (TEA)
CID-11: 6A00 | CID-10: F84.0

Hiperfocos e interesses: ${hyperfocos}

──────────────────────────────────────────────
2. PERFIL SENSORIAL
──────────────────────────────────────────────

${sensory ? Object.entries(sensory).map(([k, v]) => `• ${k}: ${v}`).join('\n') : '• Perfil sensorial não detalhado no cadastro'}

──────────────────────────────────────────────
3. GATILHOS IDENTIFICADOS
──────────────────────────────────────────────

${triggers.split(',').map((t: string) => `• ${t.trim()}`).join('\n')}

──────────────────────────────────────────────
4. ESTRATÉGIAS DE REGULAÇÃO EM USO
──────────────────────────────────────────────

O que ajuda a acalmar:
${calming.split(',').map((s: string) => `• ${s.trim()}`).join('\n')}

──────────────────────────────────────────────
5. SINAIS DE ALERTA OBSERVADOS PELOS PAIS
──────────────────────────────────────────────

${alertSigns.split(',').map((s: string) => `• ${s.trim()}`).join('\n')}

──────────────────────────────────────────────
6. PERGUNTAS / PONTOS A ABORDAR NA CONSULTA
──────────────────────────────────────────────

[ ] _________________________________________________
[ ] _________________________________________________
[ ] _________________________________________________
[ ] _________________________________________________

──────────────────────────────────────────────
7. ANOTAÇÕES DO MÉDICO (preencher na consulta)
──────────────────────────────────────────────

Observações clínicas:
_____________________________________________________
_____________________________________________________
_____________________________________________________

Orientações / Encaminhamentos:
_____________________________________________________
_____________________________________________________

Retorno previsto: _____________________________________

──────────────────────────────────────────────
8. HISTÓRICO RECENTE (últimos 30 dias)
──────────────────────────────────────────────

Este resumo foi gerado pelo Farol App com base nos registros do diário.
Para acesso ao histórico completo, consulte os registros no app.

══════════════════════════════════════════════
Gerado pelo Farol App — guia.a7creative.com.br
"O guia que sua família precisava"
══════════════════════════════════════════════`
}

// ────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { documentType, formData } = await request.json() as {
      documentType: string
      formData: FormData
    }

    let content = ''

    switch (documentType) {
      case 'legal_defense_notice':
        content = generateLegalNotice(formData)
        break
      case 'school_presentation':
        content = generateSchoolLetter(formData)
        break
      case 'therapist_report':
        content = generateTherapistReport(formData)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de documento não suportado' },
          { status: 400 }
        )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar documento', content: 'Tente novamente.' },
      { status: 500 }
    )
  }
}
