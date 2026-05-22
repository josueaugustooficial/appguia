const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://egodpwvdoivmnryozhzs.supabase.co'; // Fixed URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhYmFzZSIsInJlZiI6ImVnb2Rwd3Zkb2l2bW5yeW96aHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTA3NzQsImV4cCI6MjA2MTYyNjc3NH0.E1Fj0C6qU5YF30N45zFm-6j5I_5S7R9O9W1C1H1I1M';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Tentando criar usuário via SignUp comum...");
  const { data, error } = await supabase.auth.signUp({
    email: 'josueaugustorn@gmail.com',
    password: '123456',
  });

  if (error) {
    console.error("Erro no signUp:", error.message);
  } else {
    console.log("Usuário criado/logado com sucesso! Confirme no e-mail (se houver confirmação) ou tente logar.");
    console.log(data);
  }
}

run();
