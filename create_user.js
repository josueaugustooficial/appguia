const { loadEnvConfig } = require('@next/env');
loadEnvConfig('./');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing env vars", { supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Creating user josueaugustorn@gmail.com...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'josueaugustorn@gmail.com',
    password: '123456',
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log("User already exists. Updating password...");
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Error listing users:", listError);
        return;
      }
      
      const user = users.users.find(u => u.email === 'josueaugustorn@gmail.com');
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: '123456' });
        if (updateError) {
          console.error("Error updating user password:", updateError);
        } else {
          console.log("User password updated successfully.");
        }
      }
    } else {
      console.error("Error creating user:", error);
    }
  } else {
    console.log("User created successfully:", data.user?.id);
  }
}

run();
