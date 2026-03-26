import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------- Environment Validation ----------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local (see .env.local.example)'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY — add it to .env.local (see .env.local.example)'
  );
}

// ---------------------- Public Client (anon key) ----------------------
// Use this for client-side operations and public queries.

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------- Admin Client (service role key) ----------------------
// Use this for server-side operations that require elevated privileges.
// NEVER expose this client or its key to the browser.

function createAdminClient(): SupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local (see .env.local.example). ' +
      'This key is required for server-side operations.'
    );
  }
  return createClient(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin: SupabaseClient = createAdminClient();
