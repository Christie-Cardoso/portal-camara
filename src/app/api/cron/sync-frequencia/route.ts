import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;

async function scrapeFrequencia(id: number, ano: number) {
    const url = `https://www.camara.leg.br/deputados/${id}?ano=${ano}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const html = await res.text();

        let plenarioData: any = {};
        let comissoesData: any = {};

        const sections = html.split('class="presencas__section"');

        sections.forEach(section => {
            const isPlenario = section.includes('em Plenário');
            const isComissoes = section.includes('em Comissões');

            if (isPlenario || isComissoes) {
                const temp: any = {};
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
        return null;
    }
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    const ano = new Date().getFullYear();
    console.log(`[Cron] Iniciando sync de frequência para o ano ${ano}`);

    try {
        const resp = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
        const { dados: deputados } = await resp.json();

        let successCount = 0;

        const batchSize = 5;
        for (let i = 0; i < deputados.length; i += batchSize) {
            const batch = deputados.slice(i, i + batchSize);

            await Promise.all(batch.map(async (dep: any) => {
                const data = await scrapeFrequencia(dep.id, ano);
                if (data) {
                    await supabase
                        .from('frequencia_parlamentar')
                        .upsert({
                            deputado_id: dep.id,
                            ano: ano,
                            plenario: data.plenario,
                            comissoes: data.comissoes,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'deputado_id,ano' });
                    successCount++;
                }
            }));

            await new Promise(r => setTimeout(r, 100));
        }

        return NextResponse.json({
            success: true,
            message: `Sincronizados ${successCount}/${deputados.length} deputados.`
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
