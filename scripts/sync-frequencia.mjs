import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrados no .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchDeputados() {
    console.log('⏳ Buscando lista de deputados ativos...');
    try {
        const res = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000&ordem=ASC&ordenarPor=nome');
        const json = await res.json();
        return json.dados || [];
    } catch (e) {
        console.error('Erro ao buscar deputados:', e.message);
        return [];
    }
}

async function scrapeFrequencia(id, ano) {
    const url = `https://www.camara.leg.br/deputados/${id}?ano=${ano}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const html = await res.text();

        let plenarioData = {};
        let comissoesData = {};

        const sections = html.split('class="presencas__section"');
        
        sections.forEach(section => {
            const isPlenario = section.includes('em Plenário');
            const isComissoes = section.includes('em Comissões');
            
            if (isPlenario || isComissoes) {
                const temp = {};
                const items = section.match(/<li[^>]*class="presencas__data[^>]*>([\s\S]*?)<\/li>/gi);
                
                if (items) {
                    items.forEach(item => {
                        const labelMatch = item.match(/class="presencas__label">([\s\S]*?)<\/span>/i);
                        const qtdMatch = item.match(/class="presencas__qtd">([\s\S]*?)<\/span>/i);
                        
                        if (labelMatch && qtdMatch) {
                            const label = labelMatch[1].replace(/<[^>]*>/g, '').trim();
                            const qtdRaw = qtdMatch[1].replace(/<[^>]*>/g, '').trim();
                            const valor = qtdRaw.split(' ')[0] || '0';

                            if (label.includes("Presenças")) temp.presenca = valor;
                            else if (label.includes("Ausências justificadas")) temp.ausencias_justificadas = valor;
                            else if (label.includes("Ausências não justificadas")) temp.ausencias_nao_justificadas = valor;
                        }
                    });
                }

                if (isPlenario) {
                    plenarioData = {
                        dias_presenca: temp.presenca || '0',
                        dias_ausencias_justificadas: temp.ausencias_justificadas || '0',
                        dias_ausencias_nao_justificadas: temp.ausencias_nao_justificadas || '0',
                    };
                    const pres = parseInt(plenarioData.dias_presenca) || 0;
                    const just = parseInt(plenarioData.dias_ausencias_justificadas) || 0;
                    const njust = parseInt(plenarioData.dias_ausencias_nao_justificadas) || 0;
                    const total = pres + just + njust;
                    
                    plenarioData.dias_total = total.toString();
                    plenarioData.sessoes_total = total.toString();
                    plenarioData.sessoes_ausencias_nao_justificadas = plenarioData.dias_ausencias_nao_justificadas;
                } else if (isComissoes) {
                    comissoesData = {
                        presenca: temp.presenca || '0',
                        ausencias_justificadas: temp.ausencias_justificadas || '0',
                        ausencias_nao_justificadas: temp.ausencias_nao_justificadas || '0',
                    };
                }
            }
        });

        return { plenario: plenarioData, comissoes: comissoesData };
    } catch (e) {
        console.error(`Error scraping ${id}:`, e.message);
        return null;
    }
}

async function fetchAnosAtivo(id) {
    try {
        const res = await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${id}/historico`);
        const json = await res.json();
        const historico = json.dados || [];
        
        const anos = new Set();
        const legislaturaAnos = {
            57: [2023, 2024, 2025, 2026],
            56: [2019, 2020, 2021, 2022],
            55: [2015, 2016, 2017, 2018]
        };

        historico.forEach(h => {
            const anosDaLeg = legislaturaAnos[h.idLegislatura];
            if (anosDaLeg) {
                anosDaLeg.forEach(a => {
                    if (a >= 2019 && a <= new Date().getFullYear()) {
                        anos.add(a);
                    }
                });
            }
        });
        
        // Sempre incluir o ano atual por segurança
        anos.add(new Date().getFullYear());
        
        return Array.from(anos).sort((a, b) => b - a);
    } catch (e) {
        return [new Date().getFullYear()];
    }
}


async function run() {
    const deputados = await fetchDeputados();
    
    if (deputados.length === 0) {
        console.log('⚠️ Nenhum deputado encontrado.');
        return;
    }
    
    console.log(`✅ ${deputados.length} deputados encontrados.`);

    for (let i = 0; i < deputados.length; i++) {
        const dep = deputados[i];
        console.log(`\n--- [${i + 1}/${deputados.length}] ${dep.nome} ---`);
        
        const anos = await fetchAnosAtivo(dep.id);
        console.log(`📅 Anos ativos identificados: ${anos.join(', ')}`);

        for (const ano of anos) {
            process.stdout.write(`  -> Sincronizando ano ${ano}... `);

            const data = await scrapeFrequencia(dep.id, ano);
            
            if (data && (Object.keys(data.plenario).length > 0 || Object.keys(data.comissoes).length > 0)) {
                const { error } = await supabase
                    .from('frequencia_parlamentar')
                    .upsert({
                        deputado_id: dep.id,
                        ano: ano,
                        plenario: data.plenario,
                        comissoes: data.comissoes,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'deputado_id,ano' });

                if (error) {
                    console.log('❌ Erro: ' + error.message);
                } else {
                    console.log('✅ OK');
                }
            } else {
                console.log('⚠️ Sem dados');
            }

            // Delay entre anos (300ms)
            await new Promise(r => setTimeout(r, 300));
        }

        // Delay entre deputados (500ms)
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n🚀 Sincronização HISTÓRICA finalizada!');
}


run();

