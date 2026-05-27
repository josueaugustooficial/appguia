-- ═══════════════════════════════════════════════════════════════════
-- FAROL APP — Fase 3: Performance · Conteúdo · Segurança
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════
-- 1A — ÍNDICES DE PERFORMANCE
-- (correção: usa parent_id onde o schema usa parent_id, user_id onde aplicável)
-- ════════════════════════════════════════

-- children usa parent_id (não user_id)
CREATE INDEX IF NOT EXISTS idx_children_parent_id
  ON children(parent_id);

-- diary_entries usa parent_id
CREATE INDEX IF NOT EXISTS idx_diary_entries_parent_id
  ON diary_entries(parent_id);

CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at
  ON diary_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_diary_entries_parent_date
  ON diary_entries(parent_id, created_at DESC);

-- routines usa parent_id
CREATE INDEX IF NOT EXISTS idx_routines_parent_id
  ON routines(parent_id);

CREATE INDEX IF NOT EXISTS idx_routine_steps_routine_id
  ON routine_steps(routine_id);

-- sos_sessions usa parent_id
CREATE INDEX IF NOT EXISTS idx_sos_sessions_parent_id
  ON sos_sessions(parent_id);

CREATE INDEX IF NOT EXISTS idx_sos_sessions_created_at
  ON sos_sessions(created_at DESC);

-- activity_logs usa parent_id
CREATE INDEX IF NOT EXISTS idx_activity_logs_parent_id
  ON activity_logs(parent_id);

-- daily_tips — índice parcial nas ativas
CREATE INDEX IF NOT EXISTS idx_daily_tips_active
  ON daily_tips(is_active) WHERE is_active = true;

-- user_tip_history usa user_id
CREATE INDEX IF NOT EXISTS idx_user_tip_history_user_date
  ON user_tip_history(user_id, shown_at DESC);

-- parent_checkins usa user_id
CREATE INDEX IF NOT EXISTS idx_parent_checkins_user_id
  ON parent_checkins(user_id);

-- tasks usa parent_id
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id
  ON tasks(parent_id);

-- Confirmar criação dos índices
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ════════════════════════════════════════
-- 1B-PREP — ADAPTAR SCHEMA daily_tips
-- (adiciona is_active e expande categorias antes do INSERT)
-- ════════════════════════════════════════

-- Adicionar coluna is_active se não existir
ALTER TABLE daily_tips
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Remover constraint de category (para aceitar categorias expandidas)
-- Primeiro, encontrar o nome da constraint
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'daily_tips'::regclass
    AND contype = 'c'
    AND conname LIKE '%category%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE daily_tips DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
  END IF;
END $$;

-- Adicionar constraint expandida com todas as categorias (antigas + novas)
ALTER TABLE daily_tips
  ADD CONSTRAINT daily_tips_category_check CHECK (
    category IN (
      -- Categorias originais do schema
      'crisis', 'communication', 'routine', 'sensory', 'parent_care',
      'legal', 'nutrition', 'sleep', 'school',
      -- Novas categorias das 30 dicas Fase 3
      'sensorial', 'comportamento', 'rotina', 'comunicacao',
      'autocuidado', 'aprendizado', 'ferramentas', 'saude',
      'ansiedade', 'advocacia', 'social', 'familia', 'vinculo'
    )
  );


-- ════════════════════════════════════════
-- 1B — 30 DICAS DIÁRIAS DE QUALIDADE (TEA)
-- ════════════════════════════════════════

-- Limpar dicas de placeholder se existirem
DELETE FROM daily_tips
WHERE content LIKE '%placeholder%'
   OR content LIKE '%exemplo%'
   OR title LIKE '%placeholder%';

-- Inserir 30 dicas reais sobre TEA
INSERT INTO daily_tips (title, content, category, is_active) VALUES
('Regulação sensorial',
 'Antes de reagir a um comportamento, observe o ambiente: luz, som, textura. Qualquer estímulo pode ser o gatilho invisível da crise. Reduzir o estímulo frequentemente resolve mais rápido do que qualquer estratégia comportamental.',
 'sensorial', true),

('Meltdown não é birra',
 'Meltdown não é teimosia — é sobrecarga neurológica real. Birra tem objetivo e para quando atingido. Meltdown é perda de controle involuntária. Punição piora; acolhimento silencioso e redução de estímulos ajudam.',
 'comportamento', true),

('Rotina como segurança',
 'Para crianças com TEA, rotina não é rigidez — é segurança. Avisar com antecedência ("em 10 minutos vamos sair") reduz ansiedade. O aviso prévio é mais poderoso do que qualquer recompensa após a crise.',
 'rotina', true),

('Comunicação alternativa',
 'Quando as palavras não chegam, o corpo fala. Aprenda a ler a linguagem corporal do seu filho: tensão nos ombros, mãos nos ouvidos, evitar contato visual — cada gesto é comunicação legítima.',
 'comunicacao', true),

('Autocuidado parental',
 'Você não consegue regular seu filho estando desregulado. Respirar fundo antes de responder a uma crise não é fraqueza — é estratégia. Seu sistema nervoso regula o dele.',
 'autocuidado', true),

('Elogios específicos',
 'Troque "muito bem!" por elogios específicos: "Você ficou sentado por 5 minutos inteiros — isso foi incrível!" Especificidade comunica que você realmente viu o esforço do seu filho.',
 'comportamento', true),

('Transições difíceis',
 'Transições são dos momentos mais difíceis — trocar de atividade, sair de casa, terminar algo prazeroso. Use timers visuais ou contagens regressivas para preparar. A previsibilidade é o antídoto da ansiedade.',
 'rotina', true),

('Hiperfoco como porta',
 'O hiperfoco do seu filho é uma porta, não um obstáculo. Use o interesse especial como motivação para aprender novas habilidades. O que ele ama pode ser o caminho para o que precisa aprender.',
 'aprendizado', true),

('Passaporte sensorial',
 'O passaporte sensorial do seu filho poupa explicações em consultas, escolas e emergências. Garanta que professores, médicos e familiares próximos tenham acesso — pode fazer diferença em momentos críticos.',
 'ferramentas', true),

('Sono e comportamento',
 'Privação de sono amplifica todos os desafios comportamentais. Uma rotina de sono consistente — mesmo nos fins de semana — pode transformar a semana inteira. É a intervenção mais subestimada no TEA.',
 'saude', true),

('Validação emocional',
 '"Eu vejo que você está com raiva" — validar a emoção antes de resolver o problema reduz a escalada. A criança que se sente compreendida desescala mais rápido do que a que se sente corrigida.',
 'comunicacao', true),

('Zona de regulação',
 'Crie em casa um cantinho de regulação — espaço seguro com itens sensoriais. Luminária fraca, almofada de pressão, fone com música calma. Deixe seu filho ajudar a montar: ele sabe o que regula.',
 'sensorial', true),

('Visita antecipada',
 'Antes de ir a lugar novo (hospital, escola, festa), visite antes ou mostre fotos e vídeos. Familiaridade visual reduz dramaticamente a ansiedade de antecipação.',
 'ansiedade', true),

('Celebre pequeno',
 'Comemorações grandes podem ser sensorialmente avassaladoras. Um joinha sincero ou "conseguiu!" dito com emoção real frequentemente funciona melhor do que festa e palmas.',
 'comportamento', true),

('Alimentação seletiva',
 'Alimentação seletiva não é teimosia — é sensibilidade real a texturas, cheiros e aparência. Introduzir alimentos novos ao lado dos aceitos, sem pressão e com exposição gradual, funciona melhor do que insistência.',
 'saude', true),

('Advocacia escolar',
 'Você é o maior especialista no seu filho. Em reuniões escolares, leve seus registros do diário — dados concretos têm mais peso do que impressões. Você não está pedindo favor; está exercendo direito.',
 'advocacia', true),

('Scripts sociais',
 'Ensinar scripts para situações recorrentes ("Oi, posso brincar?") dá ao seu filho ferramentas concretas. Praticar em casa, com role-play, reduz a ansiedade da situação real.',
 'social', true),

('Horário visual',
 'Um quadro de rotina visual beneficia qualquer criança com TEA, verbal ou não. Ver o dia estruturado reduz a pergunta constante "o que vem depois?" — que é ansiedade, não curiosidade.',
 'rotina', true),

('Mastigação e regulação',
 'Mastigar é autorregulação sensorial natural. Snacks duros, chicletes sem açúcar, canudos para morder — podem ajudar em momentos de sobrecarga antes que a crise escale.',
 'sensorial', true),

('Progresso não linear',
 'Desenvolvimento com TEA não é linear. Uma semana ótima seguida de dias difíceis não é regressão — é parte do processo. Olhe a tendência do mês, não do dia. Os bons dias eram reais.',
 'autocuidado', true),

('Irmãos e família',
 'Irmãos de crianças com TEA também precisam de atenção e espaço para processar sentimentos — inclusive raiva e ciúme. Validar as emoções deles também é cuidar da família inteira.',
 'familia', true),

('Descanso ativo',
 'Após sobrecarga sensorial, crianças com TEA precisam de tempo de reboot. Não confunda retirada com rejeição — às vezes silêncio e isolamento são recuperação necessária, não punição.',
 'sensorial', true),

('Tempo de qualidade',
 '15 minutos de atenção total — sem celular, sem distrações — valem mais do que horas de presença dispersa. Escolha uma atividade que seu filho ama e entre de cabeça por esse tempo.',
 'vinculo', true),

('Puberdade e TEA',
 'A puberdade amplifica os desafios do TEA. Comece a conversa cedo, com linguagem concreta e visual. Inclua a equipe terapêutica nessa preparação — não é cedo demais começar aos 8 anos.',
 'saude', true),

('Medicação com dados',
 'Se medicação faz parte do tratamento, documente comportamentos antes e depois no diário. Seus registros são dados valiosos para a equipe médica — mais precisos do que a memória.',
 'saude', true),

('Rede de apoio',
 'Você não precisa saber tudo sozinho. Conectar-se com outros pais de crianças com TEA — online ou presencialmente — oferece suporte que nenhum profissional consegue dar: experiência vivida.',
 'autocuidado', true),

('Forças invisíveis',
 'Seu filho tem habilidades extraordinárias que passam despercebidas: memória, atenção a detalhes, honestidade, foco. Nomeá-las para ele constrói autoestima que nenhuma terapia compra.',
 'vinculo', true),

('Ambiente preparado',
 'Antes de situação desafiadora (supermercado, viagem, festa), pense: o que posso fazer antes, durante e depois para reduzir carga sensorial? Preparação silenciosa é a intervenção mais eficaz.',
 'sensorial', true),

('Você está fazendo o suficiente',
 'Em um dia muito difícil, lembre: o fato de você estar aqui, buscando ferramentas e aprendendo — isso já é imenso. Nenhum pai perfeito existe. Você está fazendo o suficiente.',
 'autocuidado', true),

('Emergência com protocolo',
 'Tenha um plano escrito para crises intensas: quem chamar, o que não fazer, o que funciona para o seu filho. Escrever em momento calmo salva em momento de caos — e pode ser compartilhado com qualquer cuidador.',
 'comportamento', true)

ON CONFLICT DO NOTHING;

-- Confirmar inserção
SELECT
  COUNT(*) AS total_dicas,
  COUNT(*) FILTER (WHERE is_active = true) AS dicas_ativas,
  COUNT(*) FILTER (WHERE is_active = false) AS dicas_inativas
FROM daily_tips;

-- Distribuição por categoria
SELECT category, COUNT(*) AS total
FROM daily_tips
WHERE is_active = true
GROUP BY category
ORDER BY total DESC;


-- ════════════════════════════════════════
-- 1C — VERIFICAÇÃO DE SEGURANÇA RLS
-- ════════════════════════════════════════

-- Confirmar RLS ativo em todas as tabelas públicas
SELECT
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF — executar: ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;' END AS status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Se alguma tabela estiver sem RLS, execute a linha indicada no status acima.
-- Exemplo: ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

-- Confirmar policies existentes
SELECT
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Resumo: quantas policies por tabela
SELECT tablename, COUNT(*) AS num_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
