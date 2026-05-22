-- ═══════════════════════════════════════════════════════════════════
-- FAROL APP — Schema Completo do Banco de Dados Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════
-- 1. PERFIS DE USUÁRIOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  ticto_customer_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ════════════════════════════════════════
-- 2. DISPOSITIVOS (máx 2 por usuário)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  user_agent TEXT,
  ip_address TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- ════════════════════════════════════════
-- 3. FILHOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  photo_url TEXT,
  sensory_profile JSONB DEFAULT '{}',
  hyperfocos TEXT[] DEFAULT '{}',
  triggers TEXT[] DEFAULT '{}',
  calming_strategies TEXT[] DEFAULT '{}',
  alert_signs TEXT[] DEFAULT '{}',
  best_communication TEXT[] DEFAULT '{}',
  activity_level TEXT DEFAULT 'medium' CHECK (activity_level IN ('low', 'medium', 'high')),
  passport_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  passport_is_public BOOLEAN DEFAULT FALSE,
  passport_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 4. ROTINAS VISUAIS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  days_of_week INT[] DEFAULT '{1,2,3,4,5}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  icon_key TEXT NOT NULL DEFAULT 'water',
  icon_color TEXT DEFAULT '#F59E0B',
  duration_minutes INT,
  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 5. DIÁRIO DE COMPORTAMENTOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('crisis', 'victory', 'observation', 'activity')),
  title TEXT,
  description TEXT,
  intensity INT CHECK (intensity BETWEEN 1 AND 5),
  traffic_light TEXT CHECK (traffic_light IN ('green', 'yellow', 'red')),
  duration_minutes INT,
  possible_trigger TEXT,
  what_helped TEXT,
  mood_before INT CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INT CHECK (mood_after BETWEEN 1 AND 5),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 6. SESSÕES SOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  crisis_type TEXT CHECK (crisis_type IN ('meltdown', 'shutdown', 'tantrum', 'unknown')),
  intensity INT CHECK (intensity BETWEEN 1 AND 5),
  trigger_identified TEXT,
  steps_completed TEXT[],
  what_worked TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 7. ATIVIDADES
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('communication', 'sensory', 'motor', 'cognitive', 'social', 'emotional')),
  duration_minutes INT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  materials TEXT[],
  steps TEXT[],
  what_to_observe TEXT,
  how_to_celebrate TEXT,
  age_min INT,
  age_max INT,
  source_ebook TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  child_enjoyed BOOLEAN
);

-- ════════════════════════════════════════
-- 8. DOCUMENTOS GERADOS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'friendly_neighbor_letter', 'legal_defense_notice',
    'whatsapp_building_message', 'school_presentation',
    'teacher_passport', 'therapist_report'
  )),
  content TEXT NOT NULL,
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 9. PRANCHAS DE COMUNICAÇÃO
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS communication_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES communication_boards(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  icon_key TEXT,
  color TEXT DEFAULT '#F59E0B',
  position INT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- 10. DICAS DIÁRIAS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('crisis', 'communication', 'routine', 'sensory', 'parent_care', 'legal', 'nutrition', 'sleep', 'school')),
  source TEXT,
  is_personalized BOOLEAN DEFAULT FALSE,
  sensory_profile_match JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tip_id UUID REFERENCES daily_tips(id),
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  was_saved BOOLEAN DEFAULT FALSE,
  was_helpful BOOLEAN
);

-- ════════════════════════════════════════
-- 11. CHECK-IN DOS PAIS
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS parent_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_date DATE DEFAULT CURRENT_DATE,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
  energy_score INT CHECK (energy_score BETWEEN 1 AND 5),
  stress_score INT CHECK (stress_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- ════════════════════════════════════════
-- 12. TAREFAS / CALENDÁRIO
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('therapy', 'appointment', 'activity', 'document', 'reminder', 'custom')),
  due_date DATE,
  due_time TIME,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color TEXT DEFAULT '#F59E0B',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- ═══════════
-- POLICIES
-- ═══════════
-- Profiles
CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Devices
CREATE POLICY "users_own_devices" ON user_devices FOR ALL USING (auth.uid() = user_id);

-- Children
CREATE POLICY "users_own_children" ON children FOR ALL USING (auth.uid() = parent_id);
-- Public passport
CREATE POLICY "public_passport_read" ON children FOR SELECT USING (passport_is_public = TRUE);

-- Routines
CREATE POLICY "users_own_routines" ON routines FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "users_own_routine_steps" ON routine_steps FOR ALL
  USING (routine_id IN (SELECT id FROM routines WHERE parent_id = auth.uid()));

-- Diary
CREATE POLICY "users_own_diary" ON diary_entries FOR ALL USING (auth.uid() = parent_id);

-- SOS
CREATE POLICY "users_own_sos" ON sos_sessions FOR ALL USING (auth.uid() = parent_id);

-- Activity logs
CREATE POLICY "users_own_activity_logs" ON activity_logs FOR ALL USING (auth.uid() = parent_id);

-- Documents
CREATE POLICY "users_own_documents" ON generated_documents FOR ALL USING (auth.uid() = parent_id);

-- Communication boards
CREATE POLICY "users_own_boards" ON communication_boards FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "users_own_board_items" ON board_items FOR ALL
  USING (board_id IN (SELECT id FROM communication_boards WHERE parent_id = auth.uid()));

-- Tips (everyone can read)
CREATE POLICY "anyone_read_tips" ON daily_tips FOR SELECT USING (TRUE);
CREATE POLICY "users_own_tip_history" ON user_tip_history FOR ALL USING (auth.uid() = user_id);

-- Check-in
CREATE POLICY "users_own_checkins" ON parent_checkins FOR ALL USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "users_own_tasks" ON tasks FOR ALL USING (auth.uid() = parent_id);

-- Activities (everyone can read)
CREATE POLICY "anyone_read_activities" ON activities FOR SELECT USING (TRUE);

-- ════════════════════════════════════════
-- DICAS INICIAIS (60+ dicas)
-- ════════════════════════════════════════
INSERT INTO daily_tips (title, content, category, source) VALUES

-- CRISES
('O limiar sensorial é mais baixo de manhã', 'O sistema nervoso ainda está "esquentando" nas 2h após acordar. Evite transições complexas, barulhos altos ou novidades neste período.', 'crisis', 'Sensory Processing Disorder Foundation'),
('Meltdown não é birra — é neurologia', 'Uma crise de meltdown libera tanto cortisol quanto uma situação de perigo real. O tempo de recuperação necessário é de 20-30 minutos, não 2 minutos.', 'crisis', 'Ross Greene, PhD'),
('A crise começa antes da crise', 'Crianças autistas frequentemente entram em colapso mais tarde do que o esperado. O supermercado não foi a causa — foi o estresse acumulado desde o café da manhã.', 'crisis', 'Temple Grandin'),
('Sua calma é contágio positivo', 'O sistema nervoso do seu filho detecta sua frequência cardíaca. Quando você respira fundo, o corpo dele começa a sincronizar. É fisiologia, não fraqueza.', 'crisis', 'Porges, Teoria Polivagal'),
('Frases de 3 palavras durante crises', 'Durante um meltdown, o processamento de linguagem cai drasticamente. Use frases de 3 palavras: "Estou aqui." "Você está seguro." Silêncio também é comunicação.', 'crisis', 'Barry Prizant, PhD'),
('Shutdown vs. Meltdown: são opostos', 'No meltdown há explosão. No shutdown há implosão — silêncio, retirada, "desligar". Ambos são sobrecargas sensoriais, mas exigem respostas diferentes. No shutdown, presença silenciosa é o protocolo.', 'crisis', 'Olga Bogdashina'),
('O ciclo da crise tem 3 fases', 'Antes (agitação crescente), durante (pico), depois (recuperação). Na fase de recuperação o filho pode parecer "normal" mas ainda está vulnerável. Evite repreensões e conversas pesadas por 30 minutos.', 'crisis', 'Autism Speaks'),
('Pressão profunda acalma o sistema nervoso', 'Abraço apertado, cobertor pesado ou pressão nos ombros ativa o sistema parassimpático. Ofereça — mas nunca force. A criança que rejeita hoje pode pedir amanhã.', 'crisis', 'Jean Ayres, PhD - Terapia de Integração Sensorial'),

-- COMUNICAÇÃO
('Espere 5 segundos antes de ajudar', 'Quando você antecipa todas as necessidades do filho antes que ele comunique, você reduz as oportunidades naturais de comunicação. Espere 5 segundos antes de oferecer o que ele quer.', 'communication', 'Análise do Comportamento Aplicada - ABA'),
('Fala surge da segurança, não da pressão', 'A fala não surge da pressão, mas da segurança. Crianças que sabem que serão compreendidas mesmo sem palavras tendem a desenvolver mais fala do que crianças pressionadas.', 'communication', 'Amy Wetherby, PhD'),
('Modelagem sem exigência funciona mais', 'Ao invés de pedir que repita, simplesmente modele a linguagem durante brincadeiras: "carro indo, carro parou." Sem cobrar resposta. O cérebro absorve mais quando não há pressão.', 'communication', 'Hanen Programme'),
('Imitação é o primeiro passo da comunicação', 'Antes das palavras vem a imitação de sons, gestos e movimentos. Se seu filho ainda não fala, ajude-o a imitar — bater palmas, soprar, apontar. São precursores fundamentais.', 'communication', 'Lovaas Institute'),
('Comunicação alternativa complementa a fala', 'Usar figuras, gestos ou aplicativos de comunicação NÃO substitui a fala — complementa. Crianças com suporte de CAA frequentemente desenvolvem mais fala do que sem.', 'communication', 'ISAAC Brasil - Comunicação Alternativa'),
('Pausas deliberadas criam oportunidades', 'Interrompa uma rotina conhecida e espere. Ex: encha só metade do copo de suco. A expectativa frustrada cria uma necessidade natural de comunicação. É uma das estratégias mais poderosas.', 'communication', 'Milieu Teaching'),

-- ROTINAS
('Antecipação reduz 70% das crises em transições', 'Avise sempre com 5 e depois 2 minutos de antecedência antes de transições. "5 minutos para desligar o tablet." A surpresa é o maior gatilho de crises em mudanças de atividade.', 'routine', 'TEACCH - University of North Carolina'),
('Rotinas visuais liberam a cabeça da criança', 'Quando a criança sabe o que vem depois, ela para de usar energia neurológica para prever o futuro. Isso libera recursos cognitivos para aprender e interagir.', 'routine', 'TEACCH Method'),
('Objeto de transição facilita mudanças', 'Um objeto favorito carregado de uma atividade para outra ajuda a "trazer" a segurança do ambiente anterior para o novo. Simples e muito eficaz.', 'routine', 'D.W. Winnicott'),
('Rituais de fim de dia regulam o sono', 'A mesma sequência todas as noites (banho → pijama → leitura → dormir) regula o relógio biológico e reduz a resistência ao sono. Constância é mais eficaz que qualquer remédio para dormir.', 'routine', 'AAP - American Academy of Pediatrics'),

-- SENSORIAL
('Processamento sensorial é diferente, não errado', 'Um sistema nervoso que processa estímulos de forma intensa não é "quebrado" — é calibrado de forma diferente. Calçados desconfortáveis, etiquetas de roupas e barulhos que parecem normais podem ser fisicamente dolorosos.', 'sensory', 'Jean Ayres - Teoria da Integração Sensorial'),
('Dieta sensorial é preventiva', 'Atividades sensoriais regulares ao longo do dia (pular, apertar, rolar) "alimentam" o sistema nervoso e reduzem a hipersensibilidade reativa. É como manter o nível de açúcar no sangue estável.', 'sensory', 'Patricia Wilbarger, OTR'),
('A busca por pressão profunda é autorregulação', 'Quando seu filho se joga nos sofás, abraça forte ou rasteja sob cobertores, ele está autorregulando seu sistema nervoso. É saudável e deve ser facilitado, não reprimido.', 'sensory', 'Terapia de Integração Sensorial'),
('Fones de ouvido são tecnologia de acessibilidade', 'Usar fones em ambientes barulhentos não é "drama" ou "fraqueza". É uma ferramenta de acessibilidade tão legítima quanto óculos para quem tem miopia.', 'sensory', 'Judy Singer - Neurodiversidade'),
('Sensibilidade a alimentos é sensorial, não teimosia', 'A recusa alimentar intensa muitas vezes é sensorial — a textura, temperatura ou cheiro provocam repulsa genuína. Pressionar piora a aversão. Exposição gradual e sem pressão funciona melhor.', 'sensory', 'SOS Feeding Approach'),

-- AUTOCUIDADO DOS PAIS
('Burnout parental tem sintomas específicos', 'Pais de crianças com necessidades especiais têm 3x mais risco de burnout. Sinais: sensação de estar em modo automático, ressentimento, dificuldade de lembrar momentos positivos, choro sem motivo claro.', 'parent_care', 'Moïra Mikolajczak, UCLouvain'),
('Regulação dos pais regula a criança', 'Você não consegue co-regular alguém se você mesmo está desregulado. Cuidar de você não é egoísmo — é o gesto mais importante que você pode fazer pelo seu filho.', 'parent_care', 'Psicologia do Desenvolvimento'),
('Luto dos pais é real e necessário', 'Receber um diagnóstico ativa um processo de luto pela criança que você imaginou. Isso não significa que você não ama seu filho real — significa que você é humano. Busque apoio.', 'parent_care', 'Kübler-Ross aplicado a famílias atípicas'),
('Momentos de alegria não são deslealdade', 'Rir, ter momentos leves, sair com amigos — isso não significa que você não está levando a sério a condição do filho. Alegria é combustível para o longo prazo.', 'parent_care', 'Psicologia Positiva - Seligman'),
('Pedir ajuda é habilidade, não fraqueza', 'Cuidadores que aceitam ajuda são mais efetivos a longo prazo. Identifique 3 pessoas que podem passar 2 horas com seu filho para você descansar. Use essa lista.', 'parent_care', 'Cuidadores e Saúde Mental - OPAS'),

-- JURÍDICO
('Meltdown não é infração condominial', 'A Lei 12.764/2012 reconhece o autismo como deficiência. A Lei 13.146/2015 (LBI), Art. 88, proíbe discriminação a pessoas com deficiência em condomínios. Ruído relacionado a condição neurológica é protegido.', 'legal', 'Lei Berenice Piana + Lei Brasileira de Inclusão'),
('Escola é obrigada a receber seu filho', 'A recusa de matrícula a criança com qualquer deficiência é crime, punível com detenção (Art. 8º, Lei 7.853/1989). Toda escola pública e privada deve incluir. Documente recusas.', 'legal', 'Lei de Proteção às Pessoas com Deficiência'),
('Plano de saúde é obrigado a cobrir terapias', 'A Resolução CONSU 2/1998 e a ANS garantem cobertura de ABA, fonoaudiologia, TO e psicologia para TEA. Negativas devem ser contestadas por escrito com prazo de resposta.', 'legal', 'ANS - Agência Nacional de Saúde Suplementar'),
('Laudo não é requisito para suporte escolar', 'Muitas escolas exigem laudo para oferecer suporte. Isso é ilegal. O suporte deve ser baseado nas necessidades observadas, não no diagnóstico formal. A lei é clara.', 'legal', 'LBI Art. 28 - Educação Inclusiva'),

-- SONO
('Melatonina é produzida 2h antes do sono', 'A produção de melatonina começa cerca de 2h antes do horário de dormir — mas telas LED bloqueiam essa produção. Reduza telas 1-2h antes de dormir e use luz âmbar no quarto.', 'sleep', 'Sleep Foundation'),
('Ritual do sono ativa o relógio biológico', 'O cérebro aprende a "prever" o sono quando a mesma sequência ocorre todo dia. Após 2-3 semanas de consistência, o adormecer fica significativamente mais fácil.', 'sleep', 'Matthew Walker - Por que Dormimos'),

-- ESCOLA
('Comunicação escola-família deve ser diária', 'Um caderno de comunicação ou grupo específico (nunca no grupo geral da turma) garante que informações importantes não se percam. Informe: como foi a manhã em casa, medicações, eventos familiares recentes.', 'school', 'TEACCH - School Collaboration'),
('Professor precisa saber sobre hiperfocos', 'Conectar o conteúdo curricular ao hiperfoco da criança aumenta engajamento em até 300%. Se ele ama dinossauros, matemática pode ser aprendida com contagem de espécies.', 'school', 'Educação Baseada em Pontos Fortes - Strengths-Based');
