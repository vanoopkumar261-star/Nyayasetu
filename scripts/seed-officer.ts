/**
 * Seed script: Sets password_hash for test officer and supervisor users.
 *
 * Usage: npx tsx scripts/seed-officer.ts
 *
 * Requires .env.local to be loaded. Uses dotenv to load it.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const SALT_ROUNDS = 12;

const SEED_USERS = [
  { email: 'officer@nyayasetu.in', password: 'Officer@123', label: 'Officer' },
  { email: 'supervisor@nyayasetu.in', password: 'Super@123', label: 'Supervisor' },
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const { email, password, label } of SEED_USERS) {
    console.log(`\n🔐 Hashing password for ${label} (${email})...`);
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('email', email)
      .select('id, email, full_name, role');

    if (error) {
      console.error(`❌ Failed to update ${label}:`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`⚠️  No user found with email ${email}. Please insert them manually in Supabase first.`);
    } else {
      console.log(`✅ ${label} password set successfully:`, data[0]);
    }
  }

  console.log('\n🎉 Seeding complete!\n');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
