import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

export const maxDuration = 300;

function cleanMoney(val: string) {
    if (!val) return 0;
    const cleaned = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    const YEAR = new Date().getFullYear();
    const MONTH = new Date().getMonth();
    const MONTH_NAMES: Record<number, string> = {
        1: 'janeiro', 2: 'fevereiro', 3: 'marco', 4: 'abril',
        5: 'maio', 6: 'junho', 7: 'julho', 8: 'agosto',
        9: 'setembro', 10: 'outubro', 11: 'novembro', 12: 'dezembro'
    };

    const monthToSync = MONTH === 0 ? 12 : MONTH;
    const yearToSync = MONTH === 0 ? YEAR - 1 : YEAR;
    const monthName = MONTH_NAMES[monthToSync];

    const CSV_URL = `https://www2.camara.leg.br/transparencia/recursos-humanos/remuneracao/relatorios-consolidados-por-ano-e-mes/${yearToSync}/${monthName}-de-${yearToSync}-csv`;

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error(`Falha ao baixar CSV: ${response.statusText}`);

        const csvText = await response.text();
        const results = Papa.parse(csvText, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
        });

        const rows = results.data as any[];
        let totalMatched = 0;
        let chunk: any[] = [];
        const CHUNK_SIZE = 100;

        for (const row of rows) {
            const ponto = row['Ponto'];
            const bruto = cleanMoney(row['Remuneração Básica (R$)']);
            const liquido = cleanMoney(row['Remuneração Após Descontos Obrigatórios (R$)']);

            if (ponto && (bruto > 0 || liquido > 0)) {
                chunk.push({
                    ponto: ponto.startsWith('P_') ? ponto : `P_${ponto}`,
                    remuneracao_bruta: bruto,
                    remuneracao_liquida: liquido,
                    mes_referencia: `${monthToSync}/${yearToSync}`
                });

                if (chunk.length >= CHUNK_SIZE) {
                    await supabase.from('secretarios').upsert(chunk, { onConflict: 'ponto' });
                    totalMatched += chunk.length;
                    chunk = [];
                }
            }
        }

        if (chunk.length > 0) {
            await supabase.from('secretarios').upsert(chunk, { onConflict: 'ponto' });
            totalMatched += chunk.length;
        }

        return NextResponse.json({ success: true, message: `Remunerações: ${totalMatched} atualizadas.` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
