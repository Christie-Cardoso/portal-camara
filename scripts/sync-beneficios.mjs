import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configurações do Supabase ausentes no .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function scrapeBeneficios(deputadoId) {
  const url = `https://www.camara.leg.br/deputados/${deputadoId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // NOVA LÓGICA DE EXTRAÇÃO POR BLOCOS (Mais Robusta)
    const blocks = html.split(/<(?:div|li)[^>]*class="[^"]*beneficio[^"]*"/i);
    
    const extractBenefitValue = (titleFilter) => {
        try {
            for (const block of blocks) {
                const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
                if (!h3Match) continue;
                
                const titleText = h3Match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                
                if (titleText.toLowerCase().includes(titleFilter.toLowerCase())) {
                    const infoMatch = block.match(/class="[^"]*beneficio__info[^"]*"[^>]*>([\s\S]*?)<\//i);
                    if (infoMatch) {
                        return infoMatch[1].replace(/\s+/g, ' ').trim();
                    }
                }
            }
            return "Não informado";
        } catch (e) {
            return "Não informado";
        }
    };

    return {
        deputado_id: deputadoId,
        salario_bruto: extractBenefitValue("Salário mensal bruto"),
        imovel_funcional: extractBenefitValue("Imóvel funcional"),
        auxilio_moradia: extractBenefitValue("Auxílio-moradia"),
        passaporte_diplomatico: extractBenefitValue("Passaporte diplomático"),
        viagens_missao: extractBenefitValue("Viagens em missão oficial"),
        pessoal_gabinete: extractBenefitValue("Pessoal de gabinete"),
        updated_at: new Date().toISOString()
    };
  } catch (err) {
    console.error(`Erro ao processar deputado ${deputadoId}:`, err.message);
    return null;
  }
}

async function syncAllBeneficios() {
  console.log('🚀 Iniciando sincronização global de benefícios (Lógica por Blocos)...');
  
  const resp = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
  const { dados: deputados } = await resp.json();
  
  console.log(`📊 Encontrados ${deputados.length} deputados.`);

  let totalSalvo = 0;

  for (const dep of deputados) {
    process.stdout.write(`\rProcessando: ${dep.nome} [${totalSalvo} benefícios salvos]`);
    
    const beneficios = await scrapeBeneficios(dep.id);
    
    if (beneficios) {
      const { error } = await supabase.from('beneficios_parlamentares').upsert(beneficios, {
        onConflict: 'deputado_id'
      });
      
      if (error) {
        console.error(`\nErro no upsert do deputado ${dep.nome}:`, error.message);
      } else {
        totalSalvo++;
      }
    }

    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\n✅ Sincronização concluída com sucesso!');
  console.log(`Total de benefícios persistidos: ${totalSalvo}`);
}

syncAllBeneficios().catch(console.error);
