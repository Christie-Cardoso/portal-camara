import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID e obrigatorio' }, { status: 400 });
  }

  const deputadoId = parseInt(id);

  try {
    // 1. Tenta buscar no Banco de Dados Primeiro (Cache)
    let dbData = null;
    try {
        const { data, error } = await supabase
            .from('beneficios_parlamentares')
            .select('*')
            .eq('deputado_id', deputadoId)
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
    const url = `https://www.camara.leg.br/deputados/${id}`;
    
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
    
    const extractBenefit = (titleFilter: string) => {
        try {
            for (const block of blocks) {
                const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
                if (!h3Match) continue;
                
                // Limpa o título de tags para comparação textual pura
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
            console.error(`Erro ao extrair beneficio ${titleFilter}:`, e);
            return "Erro na extração";
        }
    };

    const beneficios = {
        deputado_id: deputadoId,
        salario_bruto: extractBenefit("Salário mensal bruto"),
        imovel_funcional: extractBenefit("Imóvel funcional"),
        auxilio_moradia: extractBenefit("Auxílio-moradia"),
        passaporte_diplomatico: extractBenefit("Passaporte diplomático"),
        viagens_missao: extractBenefit("Viagens em missão oficial"),
        pessoal_gabinete: extractBenefit("Pessoal de gabinete"),
        updated_at: new Date().toISOString()
    };

    // 3. Persistir no Banco de Dados
    try {
        await supabase
            .from('beneficios_parlamentares')
            .upsert(beneficios, { onConflict: 'deputado_id' });
    } catch (e) {
        console.error('[Beneficios Upsert Exception]', e);
    }

    return NextResponse.json(beneficios);
  } catch (err: any) {
    console.error('[Beneficios Route Error]', err);
    return NextResponse.json({ error: 'Erro interno no scraper' }, { status: 500 });
  }
}
