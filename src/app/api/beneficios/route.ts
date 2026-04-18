import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const ano = searchParams.get('ano') || new Date().getFullYear().toString();

  if (!id) {
    return NextResponse.json({ error: 'ID e obrigatorio' }, { status: 400 });
  }

  const deputadoId = parseInt(id);
  const yearInt = parseInt(ano);

  try {
    // 1. Tenta buscar no Banco de Dados Primeiro (Cache)
    let dbData = null;
    try {
        const { data, error } = await supabase
            .from('beneficios_parlamentares')
            .select('*')
            .eq('deputado_id', deputadoId)
            .eq('ano', yearInt)
            .maybeSingle(); 
        
        if (!error) {
            dbData = data;
        }
    } catch (e) {
        console.error('[Beneficios DB Exception]', e);
    }

    // Cache de 24 horas
    if (dbData) {
      const updatedAt = new Date(dbData.updated_at).getTime();
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - updatedAt < oneDay) {
        return NextResponse.json(dbData);
      }
    }

    // 2. Scraping do portal da Câmara
    const url = `https://www.camara.leg.br/deputados/${id}?ano=${ano}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        if (dbData) return NextResponse.json(dbData);
        return NextResponse.json({ error: 'Erro ao acessar perfil da Camara' }, { status: response.status });
    }
    const html = await response.text();

    // NOVA LÓGICA DE EXTRAÇÃO POR BLOCOS (Mais Robusta)
    const blocks = html.split(/<(?:div|li)[^>]*class="[^"]*beneficio[^"]*"/i);
    
    let auxilio_moradia_mensal: any[] | undefined = undefined;

    const extractBenefit = async (titleFilter: string) => {
        try {
            for (const block of blocks) {
                const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
                if (!h3Match) continue;
                
                // Limpa o título de tags para comparação textual pura
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
                                // Garante que o detalhamento respeite o ano
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
                                            const payments: any[] = [];
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
                                    console.error('[Monthly Housing Scrape Error]', err);
                                }
                            }
                        }

                        return rawValue.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                    }
                }
            }
            return "Não informado";
        } catch (e) {
            console.error(`Erro ao extrair beneficio ${titleFilter}:`, e);
            return "Erro na extração";
        }
    };

    const beneficios: any = {
        deputado_id: deputadoId,
        ano: yearInt,
        salario_bruto: await extractBenefit("Salário mensal bruto"),
        imovel_funcional: await extractBenefit("Imóvel funcional"),
        auxilio_moradia: await extractBenefit("Auxílio-moradia"),
        passaporte_diplomatico: await extractBenefit("Passaporte diplomático"),
        viagens_missao: await extractBenefit("Viagens em missão oficial"),
        pessoal_gabinete: await extractBenefit("Pessoal de gabinete"),
        updated_at: new Date().toISOString()
    };

    if (auxilio_moradia_mensal) {
        beneficios.auxilio_moradia_mensal = auxilio_moradia_mensal;
    }

    // 3. Persistir no Banco de Dados
    try {
        await supabase
            .from('beneficios_parlamentares')
            .upsert(beneficios, { onConflict: 'deputado_id,ano' });
    } catch (e) {
        console.error('[Beneficios Upsert Exception]', e);
    }

    return NextResponse.json(beneficios);
  } catch (err: any) {
    console.error('[Beneficios Route Error]', err);
    return NextResponse.json({ error: 'Erro interno no scraper' }, { status: 500 });
  }
}
