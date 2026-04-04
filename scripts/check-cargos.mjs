import Papa from 'papaparse';
import { Readable } from 'stream';

const CSV_URL = 'https://dadosabertos.camara.leg.br/arquivos/funcionarios/csv/funcionarios.csv';

async function check() {
  const response = await fetch(CSV_URL);
  const nodeReadableStream = Readable.fromWeb(response.body);
  const cargoCounts = {};
  let count = 0;

  await new Promise((resolve) => {
    Papa.parse(nodeReadableStream, {
      header: true,
      delimiter: ';',
      step: (results) => {
        count++;
        const rawRow = results.data;
        const row = {};
        for (const key of Object.keys(rawRow)) {
          const cleanKey = key.replace(/^"|"$/g, '');
          row[cleanKey] = rawRow[key];
        }
        const cargo = String(row['cargo'] || '').replace(/^"|"$/g, '');
        cargoCounts[cargo] = (cargoCounts[cargo] || 0) + 1;
      },
      complete: () => resolve(),
      error: () => resolve(),
    });
  });

  console.log('Total processed:', count);
  const sortedCargos = Object.entries(cargoCounts).sort((a, b) => b[1] - a[1]);
  console.log('Top 20 Cargos:', sortedCargos.slice(0, 20));
  
  const spCargos = Object.entries(cargoCounts).filter(([k]) => k.startsWith('SP'));
  const totalSP = spCargos.reduce((sum, [_, v]) => sum + v, 0);
  console.log('Total SP Cargos:', totalSP);
  console.log('SP Cargos found:', spCargos);
}

check();
