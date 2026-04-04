import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing Supabase connection...');
  
  // Limpar nulos se existirem
  const { error: deleteError } = await supabase
    .from('secretarios')
    .delete()
    .is('ponto', null);
    
  if (deleteError) console.error('Delete error:', deleteError);

  const { data, count, error } = await supabase
    .from('secretarios')
    .select('*', { count: 'exact' })
    .not('ponto', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Total valid count (ponto not null): ${count}`);
  console.log('Sample data:', data);
}

test();
