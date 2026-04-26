import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300; 

async function scrapeEmendas(deputadoId: number, ano: number) {
  const url = `https://www.camara.leg.br/deputados/${deputadoId}/todas-emendas?ano=${ano}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return [];
    const html = await response.text();
    const emendas: any[] = [];
    const parts = html.split('<ul class="emendas emendas--ver-todas">');
    if (parts.length < 2) return [];

    const contentAfterList = parts[1];
    const itemParts = contentAfterList.split('<li class="emendas__item">');
    itemParts.shift();

    for (const item of itemParts) {
      if (!item.includes('emendas__descricao')) continue;

      const emenda: any = { 
        deputado_id: deputadoId,
        ano: ano,
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
        emendas.push(emenda);
      }
    }
    return emendas;
  } catch (err) {
    return [];
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
        
        let totalSalvo = 0;
        const batchSize = 5;

        for (let i = 0; i < deputados.length; i += batchSize) {
            const batch = deputados.slice(i, i + batchSize);
            await Promise.all(batch.map(async (dep: any) => {
                const emendas = await scrapeEmendas(dep.id, ano);
                if (emendas.length > 0) {
                    const uniqueEmendas = Array.from(new Map(
                        emendas.map(e => [`${e.deputado_id}-${e.ano}-${e.orgao_concedente}-${e.objetivo}`, e])
                    ).values());

                    await supabase.from('emendas_parlamentares').upsert(uniqueEmendas, {
                        onConflict: 'deputado_id,ano,orgao_concedente,objetivo'
                    });
                    totalSalvo += uniqueEmendas.length;
                }
            }));
            await new Promise(r => setTimeout(r, 100));
        }

        return NextResponse.json({ success: true, message: `Emendas: ${totalSalvo} salvas.` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
