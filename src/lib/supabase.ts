import { createClient } from '@supabase/supabase-js';

// Verificamos se as configurações são válidas para evitar erro "Failed to execute 'set' on 'Headers'"
export function hasSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\s+/g, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/\s+/g, '');
  return !!url && !!key && url.startsWith('http') && key !== 'placeholder-key';
}

const supabaseUrl = hasSupabaseConfig() 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\s+/g, '') 
  : 'https://placeholder.supabase.co';

const supabaseKey = hasSupabaseConfig() 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s+/g, '') 
  : 'placeholder-key';

if (!hasSupabaseConfig() && typeof window !== 'undefined') {
  console.warn('Supabase: Configurações ausentes ou inválidas. Algumas funcionalidades (como Secretários) não funcionarão.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
