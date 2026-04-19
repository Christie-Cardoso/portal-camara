import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const ano = searchParams.get('ano') || new Date().getFullYear().toString();

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    const url = `https://www.camara.leg.br/deputados/${id}?ano=${ano}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      return NextResponse.json({ autoria: 0, relatadas: 0, error: 'Erro ao acessar portal da Câmara' });
    }

    const html = await response.text();
    
    let autoria = 0;
    let relatadas = 0;

    // Lógica de extração baseada na estrutura:
    // <a class="atuacao__quantidade" href="...autores.ideCadastro: ID...">COUNT</a>
    // <a class="atuacao__quantidade" href="...relatores.ideCadastro: ID...">COUNT</a>

    // Regex para Autoria
    const autoriaRegex = /href="[^"]*autores\.ideCadastro:\s*(\d+)[^"]*"[^>]*class="atuacao__quantidade"[^>]*>([\d.]+)</i;
    // Regex alternativa se a ordem das classes for diferente
    const autoriaRegexAlt = /class="atuacao__quantidade"[^>]*href="[^"]*autores\.ideCadastro:\s*(\d+)[^"]*"[^>]*>([\d.]+)</i;

    // Regex para Relatadas
    const relatoriaRegex = /href="[^"]*relatores\.ideCadastro:\s*(\d+)[^"]*"[^>]*class="atuacao__quantidade"[^>]*>([\d.]+)</i;
    const relatoriaRegexAlt = /class="atuacao__quantidade"[^>]*href="[^"]*relatores\.ideCadastro:\s*(\d+)[^"]*"[^>]*>([\d.]+)</i;

    const matchAut = html.match(autoriaRegex) || html.match(autoriaRegexAlt);
    if (matchAut && matchAut[2]) {
      autoria = parseInt(matchAut[2].replace(/\./g, ''));
    }

    const matchRel = html.match(relatoriaRegex) || html.match(relatoriaRegexAlt);
    if (matchRel && matchRel[2]) {
      relatadas = parseInt(matchRel[2].replace(/\./g, ''));
    }

    return NextResponse.json({ autoria, relatadas });
  } catch (err: any) {
    console.error('[Legislative Totals Scrape Error]', err);
    return NextResponse.json({ autoria: 0, relatadas: 0, error: err.message });
  }
}
