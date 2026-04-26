export function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatNumber(v: number): string {
  return v.toLocaleString('pt-BR');
}

export function parseAuthorFromDescription(desc: string) {
  if (!desc) return null;
  const regex = /(?:pelo?|pela?)\s(?:Deputada?|Deputado?)\s(.*?)\s\((.*?)\)/i;
  const match = desc.match(regex);
  if (match) {
    const nome = match[1];
    const partidoUf = match[2].split('/');
    return {
      nome,
      partido: partidoUf[0] || '',
      uf: partidoUf[1] || ''
    };
  }
  return null;
}
