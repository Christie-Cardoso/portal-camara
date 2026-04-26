import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

export const maxDuration = 300;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    const CSV_URL = 'https://dadosabertos.camara.leg.br/arquivos/funcionarios/csv/funcionarios.csv';

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Falha ao baixar CSV');

        const csvText = await response.text();
        let totalUpserted = 0;
        let chunk: any[] = [];
        const CHUNK_SIZE = 100;

        const results = Papa.parse(csvText, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
        });

        const rows = results.data as any[];

        for (const rawRow of rows) {
            const row: any = {};
            for (const key of Object.keys(rawRow)) {
                const cleanKey = key.replace(/[^\x20-\x7E]/g, '').replace(/^"|"$/g, '');
                row[cleanKey] = rawRow[key];
            }

            const cargoValue = String(row['cargo'] || '').replace(/^"|"$/g, '');

            if (cargoValue.trim().startsWith('SP') || cargoValue.trim().startsWith('CNE')) {
                const pontoValue = String(row['ponto'] || '').replace(/^"|"$/g, '');

                chunk.push({
                    ponto: pontoValue || null,
                    nome: String(row['nome'] || '').replace(/^"|"$/g, ''),
                    cargo: cargoValue,
                    lotacao: String(row['lotacao'] || '').replace(/^"|"$/g, ''),
                    data_inicio_historico: String(row['dataInicioHistorico'] || '').replace(/^"|"$/g, '') || null,
                    grupo: String(row['grupo'] || '').replace(/^"|"$/g, '') || null,
                });

                if (chunk.length >= CHUNK_SIZE) {
                    const uniqueChunk = Array.from(new Map(chunk.map(item => [item.ponto, item])).values());
                    const { error } = await supabase.from('secretarios').upsert(uniqueChunk, { onConflict: 'ponto' });
                    if (!error) totalUpserted += uniqueChunk.length;
                    chunk = [];
                }
            }
        }

        if (chunk.length > 0) {
            const uniqueChunk = Array.from(new Map(chunk.map(item => [item.ponto, item])).values());
            const { error } = await supabase.from('secretarios').upsert(uniqueChunk, { onConflict: 'ponto' });
            if (!error) totalUpserted += uniqueChunk.length;
        }

        return NextResponse.json({ success: true, message: `Secretários sincronizados: ${totalUpserted}` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
