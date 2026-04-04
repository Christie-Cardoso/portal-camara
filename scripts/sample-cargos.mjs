import Papa from 'papaparse';
import { Readable } from 'stream';

const CSV_URL = 'https://dadosabertos.camara.leg.br/arquivos/funcionarios/csv/funcionarios.csv';

async function sample() {
  const response = await fetch(CSV_URL);
  const nodeReadableStream = Readable.fromWeb(response.body);
  const cargos = new Set();
  let count = 0;

  await new Promise((resolve) => {
    Papa.parse(nodeReadableStream, {
      header: true,
      delimiter: ';',
      step: (results, parserInstance) => {
        count++;
        const rawRow = results.data;
        const row = {};
        for (const key of Object.keys(rawRow)) {
          const cleanKey = key.replace(/^"|"$/g, '');
          row[cleanKey] = rawRow[key];
        }
        const cargo = String(row['cargo'] || '').replace(/^"|"$/g, '');
        if (cargo) cargos.add(cargo);
        
        if (count > 50000) parserInstance.abort(); // Limit to first 50k
      },
      complete: () => resolve(),
      error: () => resolve(),
    });
  });

  console.log('Sampled Cargos:', Array.from(cargos).slice(0, 50));
  console.log(`Total processed: ${count}`);
}

sample();
