import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const ano = searchParams.get('ano');

  if (!id || !ano) {
    return NextResponse.json({ error: 'ID e Ano sao obrigatorios' }, { status: 400 });
  }

  const deputadoId = parseInt(id);
  const anoInt = parseInt(ano);

  try {
    const { data: cachedData, error: dbError } = await supabase
      .from('emendas_parlamentares')
      .select('*')
      .eq('deputado_id', deputadoId)
      .eq('ano', anoInt);

    if (!dbError && cachedData && cachedData.length > 0) {
      console.log(`[Cache Hit] Retornando ${cachedData.length} emendas do banco para o deputado ${deputadoId}`);
      return NextResponse.json(cachedData.map(d => ({
        numero: d.numero,
        tipo: d.tipo,
        ano: d.ano,
        orgaoConcedente: d.orgao_concedente,
        valorAutorizado: d.valor_autorizado,
        valorEmpenhado: d.valor_empenhado,
        valorPago: d.valor_pago,
        objetivo: d.objetivo,
        localidade: d.localidade
      })));
    }

    console.log(`[Cache Miss] Iniciando scraping para o deputado ${deputadoId}, ano ${anoInt}`);
    const externalUrl = `https://www.camara.leg.br/deputados/${id}/todas-emendas?ano=${ano}`;

    const response = await fetch(externalUrl, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) return NextResponse.json([]);
      return NextResponse.json({ error: 'Erro ao buscar dados na Camara' }, { status: response.status });
    }

    const html = await response.text();
    const emendasScraped = [];
    const parts = html.split('<ul class="emendas emendas--ver-todas">');

    if (parts.length >= 2) {
      const contentAfterList = parts[1];
      const itemParts = contentAfterList.split('<li class="emendas__item">');
      itemParts.shift();

      for (const item of itemParts) {
        if (!item.includes('emendas__descricao')) continue;

        const emenda: any = {
          deputado_id: deputadoId,
          ano: anoInt,
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
          emendasScraped.push(emenda);
        }
      }
    }

    if (emendasScraped.length > 0) {
      const uniqueEmendas = Array.from(new Map(
        emendasScraped.map(e => [`${e.deputado_id}-${e.ano}-${e.orgao_concedente}-${e.objetivo}`, e])
      ).values());

      const { error: upsertError } = await supabase
        .from('emendas_parlamentares')
        .upsert(uniqueEmendas, {
          onConflict: 'deputado_id,ano,orgao_concedente,objetivo'
        });

      if (upsertError) {
        console.error('Erro ao salvar emendas no Supabase:', upsertError.message);
      }
    }

    const result = emendasScraped.map(e => ({
      numero: e.numero,
      tipo: e.tipo,
      ano: e.ano,
      orgaoConcedente: e.orgao_concedente,
      valorAutorizado: e.valor_autorizado,
      valorEmpenhado: e.valor_empenhado,
      valorPago: e.valor_pago,
      objetivo: e.objetivo,
      localidade: e.localidade
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('Erro no scraper de emendas:', err);
    return NextResponse.json({ error: 'Erro interno no scraper' }, { status: 500 });
  }
}
