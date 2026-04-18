import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configurações do Supabase ausentes no .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function scrapeBeneficios(deputadoId, ano) {
  const url = `https://www.camara.leg.br/deputados/${deputadoId}?ano=${ano}`;
  
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
    
    let auxilio_moradia_mensal = undefined;

    const extractBenefitValue = async (titleFilter) => {
        try {
            for (const block of blocks) {
                const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
                if (!h3Match) continue;
                
                const titleText = h3Match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                
                if (titleText.toLowerCase().includes(titleFilter.toLowerCase())) {
                    const infoMatch = block.match(/class="[^"]*beneficio__info[^"]*"[^>]*>([\s\S]*?)<\//i);
                    if (infoMatch) {
                        const rawValue = infoMatch[1];

                        // Detalhamento do Auxílio-moradia se houver link
                        if (titleFilter.toLowerCase().includes("auxílio-moradia")) {
                            const linkMatch = rawValue.match(/href="([^"]+)"/i);
                            if (linkMatch) {
                                let detailUrl = linkMatch[1];
                                if (!detailUrl.includes('ano=')) {
                                    detailUrl += (detailUrl.includes('?') ? '&' : '?') + `ano=${ano}`;
                                }
                                try {
                                    const detailRes = await fetch(detailUrl, {
                                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                                    });
                                    if (detailRes.ok) {
                                        const detailHtml = await detailRes.text();
                                        const rows = detailHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
                                        if (rows) {
                                            const payments = [];
                                            rows.forEach(row => {
                                                const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
                                                if (cells && cells.length >= 2) {
                                                    const mes = cells[0].replace(/<[^>]*>/g, '').trim();
                                                    const valor = cells[1].replace(/<[^>]*>/g, '').trim();
                                                    if (mes && valor && !mes.toLowerCase().includes("mês")) {
                                                        payments.push({ mes, valor });
                                                    }
                                                }
                                            });
                                            if (payments.length > 0) {
                                                auxilio_moradia_mensal = payments;
                                            }
                                        }
                                    }
                                } catch (err) {
                                    console.error(`\n[Moradia Detalhe Erro] Dep: ${deputadoId} Ano: ${ano}`, err.message);
                                }
                            }
                        }

                        return rawValue.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                    }
                }
            }
            return "Não informado";
        } catch (e) {
            return "Não informado";
        }
    };

    const benefits = {
        deputado_id: deputadoId,
        ano: parseInt(ano),
        salario_bruto: await extractBenefitValue("Salário mensal bruto"),
        imovel_funcional: await extractBenefitValue("Imóvel funcional"),
        auxilio_moradia: await extractBenefitValue("Auxílio-moradia"),
        passaporte_diplomatico: await extractBenefitValue("Passaporte diplomático"),
        viagens_missao: await extractBenefitValue("Viagens em missão oficial"),
        pessoal_gabinete: await extractBenefitValue("Pessoal de gabinete"),
        updated_at: new Date().toISOString()
    };

    if (auxilio_moradia_mensal) {
        benefits.auxilio_moradia_mensal = auxilio_moradia_mensal;
    }

    return benefits;
  } catch (err) {
    console.error(`\nErro ao processar deputado ${deputadoId} ano ${ano}:`, err.message);
    return null;
  }
}

async function syncAllBeneficios() {
  const years = [2023, 2024, 2025, 2026];
  console.log('🚀 Iniciando sincronização global de benefícios (Anos: ' + years.join(', ') + ')...');
  
  const resp = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
  const { dados: deputados } = await resp.json();
  
  console.log(`📊 Encontrados ${deputados.length} deputados.`);

  let totalSalvo = 0;

  for (const year of years) {
    console.log(`\n📅 Sincronizando ano: ${year}`);
    let yearSaved = 0;
    
    for (const dep of deputados) {
      process.stdout.write(`\rProcessando ${year}: ${dep.nome} [${yearSaved}/${deputados.length}]`);
      
      const beneficios = await scrapeBeneficios(dep.id, year);
      
      if (beneficios) {
        const { error } = await supabase.from('beneficios_parlamentares').upsert(beneficios, {
          onConflict: 'deputado_id,ano'
        });
        
        if (error) {
          console.error(`\nErro no upsert do deputado ${dep.nome} (${year}):`, error.message);
        } else {
          yearSaved++;
          totalSalvo++;
        }
      }

      // Pequeno delay para evitar bloqueio por IP ou sobrecarga
      await new Promise(r => setTimeout(r, 100));
    }
    console.log(`\n✅ Ano ${year} concluído! (${yearSaved} registros)`);
  }

  console.log('\n✨ Sincronização TOTAL concluída!');
  console.log(`Total de benefícios persistidos (todas as safras): ${totalSalvo}`);
}

syncAllBeneficios().catch(console.error);
