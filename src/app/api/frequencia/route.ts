import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ano = searchParams.get('ano') || new Date().getFullYear().toString();

    if (!id) {
        return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const deputadoId = parseInt(id);
    const yearInt = parseInt(ano);

    try {
        try {
            const { data, error } = await supabase
                .from('frequencia_parlamentar')
                .select('*')
                .eq('deputado_id', deputadoId)
                .eq('ano', yearInt)
                .maybeSingle();

            if (!error && data) {
                const updatedAt = new Date(data.updated_at).getTime();
                const now = new Date().getTime();
                const currentYear = new Date().getFullYear();
                const cacheDuration = yearInt < currentYear ? 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;

                if (now - updatedAt < cacheDuration) {
                    console.log(`[Frequencia] Cache Hit (DB): ${deputadoId} - ${ano}`);
                    return NextResponse.json({ ...data, source: 'database' });
                }
            }
        } catch (e) {
            console.error('[Frequencia DB Cache Check Error]', e);
        }

        console.log(`[Frequencia] Cache Miss / Scraping: ${deputadoId} - ${ano}`);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        };

        let plenarioData: any = {};
        let comissoesData: any = {};

        const mainUrl = `https://www.camara.leg.br/deputados/${id}?ano=${ano}`;
        const mainRes = await fetch(mainUrl, { headers });

        if (mainRes.ok) {
            const html = await mainRes.text();

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
                        plenarioData.dias_presenca = temp.presenca || '0';
                        plenarioData.dias_ausencias_justificadas = temp.ausencias_justificadas || '0';
                        plenarioData.dias_ausencias_nao_justificadas = temp.ausencias_nao_justificadas || '0';

                        const pres = parseInt(plenarioData.dias_presenca);
                        const just = parseInt(plenarioData.dias_ausencias_justificadas);
                        const njust = parseInt(plenarioData.dias_ausencias_nao_justificadas);
                        plenarioData.dias_total = (pres + just + njust).toString();
                        plenarioData.sessoes_total = plenarioData.dias_total;
                        plenarioData.sessoes_ausencias_nao_justificadas = plenarioData.dias_ausencias_nao_justificadas;
                    } else if (isComissoes) {
                        comissoesData.presenca = temp.presenca || '0';
                        comissoesData.ausencias_justificadas = temp.ausencias_justificadas || '0';
                        comissoesData.ausencias_nao_justificadas = temp.ausencias_nao_justificadas || '0';
                    }
                }
            });
        }

        const result = {
            deputado_id: deputadoId,
            ano: yearInt,
            plenario: plenarioData,
            comissoes: comissoesData,
            updated_at: new Date().toISOString()
        };

        try {
            await supabase
                .from('frequencia_parlamentar')
                .upsert(result, { onConflict: 'deputado_id,ano' });
        } catch (e) {
            console.error('[Frequencia Upsert Exception]', e);
        }

        return NextResponse.json({ ...result, source: 'scrap' });

    } catch (err: any) {
        console.error('[Frequencia Route Error]', err);
        return NextResponse.json({ error: 'Erro interno no scraper de frequencia' }, { status: 500 });
    }
}

