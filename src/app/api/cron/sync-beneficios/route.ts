import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;

async function scrapeBeneficios(deputadoId: number, ano: number) {
    const url = `https://www.camara.leg.br/deputados/${deputadoId}?ano=${ano}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) return null;
        const html = await response.text();
        const blocks = html.split(/<(?:div|li)[^>]*class="[^"]*beneficio[^"]*"/i);

        let auxilio_moradia_mensal: any = undefined;

        const extractBenefitValue = async (titleFilter: string) => {
            for (const block of blocks) {
                const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
                if (!h3Match) continue;
                const titleText = h3Match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

                if (titleText.toLowerCase().includes(titleFilter.toLowerCase())) {
                    const infoMatch = block.match(/class="[^"]*beneficio__info[^"]*"[^>]*>([\s\S]*?)<\//i);
                    if (infoMatch) {
                        const rawValue = infoMatch[1];
                        if (titleFilter.toLowerCase().includes("auxílio-moradia")) {
                            const linkMatch = rawValue.match(/href="([^"]+)"/i);
                            if (linkMatch) {
                                let detailUrl = linkMatch[1];
                                if (!detailUrl.includes('ano=')) detailUrl += (detailUrl.includes('?') ? '&' : '?') + `ano=${ano}`;
                                try {
                                    const detailRes = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                                    if (detailRes.ok) {
                                        const detailHtml = await detailRes.text();
                                        const rows = detailHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
                                        if (rows) {
                                            const payments: any[] = [];
                                            rows.forEach(row => {
                                                const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
                                                if (cells && cells.length >= 2) {
                                                    const mes = cells[0].replace(/<[^>]*>/g, '').trim();
                                                    const valor = cells[1].replace(/<[^>]*>/g, '').trim();
                                                    if (mes && valor && !mes.toLowerCase().includes("mês")) payments.push({ mes, valor });
                                                }
                                            });
                                            if (payments.length > 0) auxilio_moradia_mensal = payments;
                                        }
                                    }
                                } catch (err) { }
                            }
                        }
                        return rawValue.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                    }
                }
            }
            return "Não informado";
        };

        const benefits: any = {
            deputado_id: deputadoId,
            ano: ano,
            salario_bruto: await extractBenefitValue("Salário mensal bruto"),
            imovel_funcional: await extractBenefitValue("Imóvel funcional"),
            auxilio_moradia: await extractBenefitValue("Auxílio-moradia"),
            passaporte_diplomatico: await extractBenefitValue("Passaporte diplomático"),
            viagens_missao: await extractBenefitValue("Viagens em missão oficial"),
            pessoal_gabinete: await extractBenefitValue("Pessoal de gabinete"),
            updated_at: new Date().toISOString()
        };

        if (auxilio_moradia_mensal) benefits.auxilio_moradia_mensal = auxilio_moradia_mensal;
        return benefits;
    } catch (err) {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    const ano = new Date().getFullYear();
    try {
        const resp = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000');
        const { dados: deputados } = await resp.json();

        let successCount = 0;
        const batchSize = 3;

        for (let i = 0; i < deputados.length; i += batchSize) {
            const batch = deputados.slice(i, i + batchSize);
            await Promise.all(batch.map(async (dep: any) => {
                const data = await scrapeBeneficios(dep.id, ano);
                if (data) {
                    await supabase.from('beneficios_parlamentares').upsert(data, { onConflict: 'deputado_id,ano' });
                    successCount++;
                }
            }));
            await new Promise(r => setTimeout(r, 200));
        }

        return NextResponse.json({ success: true, message: `Benefícios: ${successCount}/${deputados.length}` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
