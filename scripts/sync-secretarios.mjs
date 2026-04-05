import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import dotenv from 'dotenv';
import { Readable } from 'stream'; // Re-import Readable from 'stream'

dotenv.config({ path: '.env.local' });

// --- Config ---
const CSV_URL = 'https://dadosabertos.camara.leg.br/arquivos/funcionarios/csv/funcionarios.csv';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CHUNK_SIZE = 50; // Upsert in batches of 50

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Main ETL Function ---
async function syncSecretarios() {
  console.log('🚀 Starting synchronization of parliamentary secretaries...');

  let totalProcessed = 0;
  let totalUpserted = 0;
  let chunk = [];

  try {
    const response = await fetch(CSV_URL);

    if (!response.ok || !response.body) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }

    console.log('⏳ Downloading and processing CSV stream...');

    const nodeReadableStream = Readable.fromWeb(response.body);

    await new Promise((resolve, reject) => {
      const parser = Papa.parse(nodeReadableStream, {
        header: true,
        delimiter: ';', // Correct delimiter for Brazilian CSVs
        encoding: 'utf8',
        skipEmptyLines: true,
        step: async (results, parserInstance) => {
          totalProcessed++;
          try {
            const rawRow = results.data;
            if (totalProcessed === 1) {
              console.log('First row keys:', Object.keys(rawRow));
            }
            // Normalize keys by removing potential quotes and BOM/special characters
            const row = {};
            for (const key of Object.keys(rawRow)) {
              // Remove BOM, quotes and non-ascii characters
              const cleanKey = key.replace(/[^\x20-\x7E]/g, '').replace(/^"|"$/g, '');
              row[cleanKey] = rawRow[key];
            }
            if (totalProcessed === 1) {
              console.log('Normalized row:', row);
            }
            
            // Cargo mapping: "Secretário Parlamentar" starts with "SP" in the data
            const cargoValue = String(row['cargo'] || '').replace(/^"|"$/g, '');
            
            if (cargoValue.trim().startsWith('SP')) {
              const pontoValue = String(row['ponto'] || '').replace(/^"|"$/g, '');
              const nomeValue = String(row['nome'] || '').replace(/^"|"$/g, '');
              const lotacaoValue = String(row['lotacao'] || '').replace(/^"|"$/g, '');
              const dataInicioHistoricoValue = String(row['dataInicioHistorico'] || '').replace(/^"|"$/g, '');
              const grupoValue = String(row['grupo'] || '').replace(/^"|"$/g, '');

              chunk.push({
                ponto: pontoValue || null,
                nome: nomeValue,
                cargo: cargoValue,
                lotacao: lotacaoValue,
                data_inicio_historico: dataInicioHistoricoValue || null,
                grupo: grupoValue || null,
              });

              if (chunk.length >= CHUNK_SIZE) {
                parserInstance.pause();
                // Deduplicate chunk by 'ponto' to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time"
                const uniqueChunk = Array.from(new Map(chunk.map(item => [item.ponto, item])).values());
                await upsertChunk(uniqueChunk);
                totalUpserted += uniqueChunk.length;
                chunk = [];
                parserInstance.resume();
              }
            }
          } catch (rowError) {
            console.error(`\nError processing row ${totalProcessed}:`, rowError.message);
          }
        },
        complete: async () => {
          if (chunk.length > 0) {
            const uniqueChunk = Array.from(new Map(chunk.map(item => [item.ponto, item])).values());
            await upsertChunk(uniqueChunk);
            totalUpserted += uniqueChunk.length;
          }
          console.log('\n---\n');
          console.log('✅ Synchronization complete!');
          console.log(`Total rows processed from CSV: ${totalProcessed}`);
          console.log(`Total secretaries upserted: ${totalUpserted}`);
          resolve();
        },
        error: (err) => {
          console.error('\nError during CSV parsing:', err.message);
          reject(err);
        },
      });
    });
  } catch (error) {
    console.error('Error in syncSecretarios:', error.message);
  }

  async function upsertChunk(data) {
    process.stdout.write('.');
    const { error } = await supabase.from('secretarios').upsert(data, {
      onConflict: 'ponto',
      ignoreDuplicates: false, // Update if exists
    });

    if (error) {
      console.error('\nError upserting chunk:', error.message);
    }
  }
}

syncSecretarios().catch(console.error);
