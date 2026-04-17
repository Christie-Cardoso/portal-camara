import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configurações do Supabase ausentes no .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function scrapeEmendas(deputadoId, ano) {
  const url = `https://www.camara.leg.br/deputados/${deputadoId}/todas-emendas?ano=${ano}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return [];

    const html = await response.text();
    const emendas = [];
    const parts = html.split('<ul class="emendas emendas--ver-todas">');
    if (parts.length < 2) return [];

    const contentAfterList = parts[1];
    const itemParts = contentAfterList.split('<li class="emendas__item">');
    itemParts.shift();

    for (const item of itemParts) {
      if (!item.includes('emendas__descricao')) continue;

      const emenda = { 
        deputado_id: deputadoId,
        ano: parseInt(ano),
        valor_autorizado: 0,
        valor_empenhado: 0,
        valor_pago: 0
      };
      
      const tituloMatch = item.split('<p class="emendas__destino">')[1]?.split('</p>')[0] || '';
      emenda.orgao_concedente = tituloMatch.replace(/<\/?[^>]+(>|$)/g, "").trim();

      const descricaoMatch = item.split('<p class="emendas__descricao">')[1]?.split('</p>')[0] || '';
      emenda.objetivo = descricaoMatch.replace(/<\/?[^>]+(>|$)/g, "").trim();

      const valoresPart = item.split('<ul class="emendas-valores">')[1]?.split('</ul>')[0] || '';
      const valorItems = valoresPart.split('<li class="emendas-valores__item">').filter(v => v.includes('emendas-valores__titulo'));

      for (const vItem of valorItems) {
        const label = vItem.split('<span class="emendas-valores__titulo">')[1]?.split('</span>')[0] || '';
        const valueRaw = vItem.split('<span class="emendas-valores__valor">')[1]?.split('</span>')[0] || '';
        const numValue = parseFloat(valueRaw.replace(/[^\d,]/g, '').replace(',', '.'));

        if (label.includes("Autorizado")) emenda.valor_autorizado = numValue || 0;
        if (label.includes("Empenhado")) emenda.valor_empenhado = numValue || 0;
        if (label.includes("Pago")) emenda.valor_pago = numValue || 0;
      }

      emenda.numero = emenda.orgao_concedente.split(' ').slice(0, 2).join(' ') + '...';
      emenda.tipo = "Emenda Orcamentaria";

      if (emenda.orgao_concedente && emenda.objetivo) {
        emendas.push(emenda);
      }
    }
    return emendas;
  } catch (err) {
    console.error(`Erro ao processar deputado ${deputadoId}:`, err.message);
    return [];
  }
}

async function syncAllEmendas() {
  console.log('🚀 Iniciando sincronização global de emendas...');
  
  // 1. Buscar todos os deputados
  const resp = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
  const { dados: deputados } = await resp.json();
  
  console.log(`📊 Encontrados ${deputados.length} deputados.`);

  const ANOS = [2023, 2024, 2025, 2026];
  let totalSalvo = 0;

  for (const dep of deputados) {
    process.stdout.write(`\rProcessando: ${dep.nome} [${totalSalvo} emendas salvas]`);
    
    for (const ano of ANOS) {
      const emendas = await scrapeEmendas(dep.id, ano);
      
      if (emendas.length > 0) {
        // Deduplicar para evitar erro "ON CONFLICT DO UPDATE command cannot affect row a second time"
        const uniqueEmendas = Array.from(new Map(
          emendas.map(e => [`${e.deputado_id}-${e.ano}-${e.orgao_concedente}-${e.objetivo}`, e])
        ).values());

        const { error } = await supabase.from('emendas_parlamentares').upsert(uniqueEmendas, {
          onConflict: 'deputado_id,ano,orgao_concedente,objetivo'
        });
        
        if (error) {
          console.error(`\nErro no upsert do deputado ${dep.nome}:`, error.message);
        } else {
          totalSalvo += uniqueEmendas.length;
        }
      }
    }

    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n✅ Sincronização concluída com sucesso!');
  console.log(`Total de emendas persistidas: ${totalSalvo}`);
}

syncAllEmendas().catch(console.error);
