import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config({ path: '.env.local' });

// --- Config ---
// Using 2024-12 as a stable month for initial sync. 
// Can be changed to latest available in the future.
const YEAR = 2024;
const MONTH = 12;

const MONTH_NAMES = {
  1: 'janeiro', 2: 'fevereiro', 3: 'marco', 4: 'abril',
  5: 'maio', 6: 'junho', 7: 'julho', 8: 'agosto',
  9: 'setembro', 10: 'outubro', 11: 'novembro', 12: 'dezembro'
};

const monthName = MONTH_NAMES[MONTH];
const CSV_URL = `https://www2.camara.leg.br/transparencia/recursos-humanos/remuneracao/relatorios-consolidados-por-ano-e-mes/${YEAR}/${monthName}-de-${YEAR}-csv`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CHUNK_SIZE = 100;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function cleanMoney(val) {
  if (!val) return 0;
  // Format is: "12.345,67" or similar
  const cleaned = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}

async function syncRemuneracao() {
  console.log(`🚀 Sincronizando remuneração do mês ${MONTH}/${YEAR}...`);
  console.log(`📥 Baixando CSV de: ${CSV_URL}`);

  let totalProcessed = 0;
  let totalMatched = 0;
  let chunk = [];

  try {
    const response = await fetch(CSV_URL);

    if (!response.ok || !response.body) {
      throw new Error(`Falha ao baixar CSV: ${response.statusText}`);
    }

    const nodeReadableStream = Readable.fromWeb(response.body);

    await new Promise((resolve, reject) => {
      Papa.parse(nodeReadableStream, {
        header: true,
        delimiter: ';',
        encoding: 'utf8',
        skipEmptyLines: true,
        step: async (results, parserInstance) => {
          totalProcessed++;
          try {
            const row = results.data;
            
            // Colunas no CSV (Baseado em análise):
            // "Ponto", "Nome", "Cargo", "Lotação", "Remuneração Básica (R$)", etc.
            const ponto = row['Ponto'];
            const bruto = cleanMoney(row['Remuneração Básica (R$)']);
            const liquido = cleanMoney(row['Remuneração Após Descontos Obrigatórios (R$)']);

            if (ponto && (bruto > 0 || liquido > 0)) {
              // Store updates in chunk
              chunk.push({
                ponto: ponto.startsWith('P_') ? ponto : `P_${ponto}`,
                remuneracao_bruta: bruto,
                remuneracao_liquida: liquido,
                mes_referencia: `${MONTH}/${YEAR}`
              });

              if (chunk.length >= CHUNK_SIZE) {
                parserInstance.pause();
                await updateBatch(chunk);
                totalMatched += chunk.length;
                chunk = [];
                parserInstance.resume();
              }
            }
          } catch (err) {
            // Silently skip rows with errors
          }
        },
        complete: async () => {
          if (chunk.length > 0) {
            await updateBatch(chunk);
            totalMatched += chunk.length;
          }
          console.log('\n✅ Sincronização de remuneração concluída!');
          console.log(`📊 Processados: ${totalProcessed} | Atualizados no Banco: ${totalMatched}`);
          resolve();
        },
        error: (err) => {
          console.error('❌ Erro no parse do CSV:', err.message);
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
  }
}

async function updateBatch(data) {
  process.stdout.write('.');
  // Use upsert to update existing rows by 'ponto'
  // This requires the columns to exist in Supabase
  const { error } = await supabase.from('secretarios').upsert(data, {
    onConflict: 'ponto',
    ignoreDuplicates: false,
  });

  if (error) {
    console.error('\n❌ Erro ao atualizar lote no Supabase:', error.message);
  }
}

syncRemuneracao();
