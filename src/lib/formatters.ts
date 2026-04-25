/**
 * Funções utilitárias de formatação usadas em todo o projeto.
 */

/**
 * Formata um número como moeda brasileira (BRL).
 */
export function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata um número com separadores de milhar brasileiros.
 */
export function formatNumber(v: number): string {
  return v.toLocaleString('pt-BR');
}

/**
 * Extrai informações do autor a partir da descrição da proposição.
 * Captura padrões como "pelo Deputado Nome (PARTIDO/UF)".
 */
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
