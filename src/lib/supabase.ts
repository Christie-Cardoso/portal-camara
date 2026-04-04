import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing in browser. Check your .env.local file.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

export function hasSupabaseConfig() {
  return supabaseUrl !== '' && supabaseKey !== '';
}
