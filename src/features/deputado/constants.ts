/**
 * Constantes específicas do módulo de detalhes do Deputado.
 */

export const CURRENT_YEAR = 2026;

export const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i); // 2026, 2025, 2024, 2023

export const MONTHS = [
  { value: 'all', label: 'Todos os meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export const ORGAOS_MAP: Record<string, string> = {
  'PLEN': 'Plenário da Câmara dos Deputados',
  'CCJC': 'Comissão de Constituição e Justiça e de Cidadania',
  'CFT': 'Comissão de Finanças e Tributação',
  'CMO': 'Comissão Mista de Planos, Orçamentos Públicos e Fiscalização',
  'CE': 'Comissão de Educação',
  'CSSF': 'Comissão de Seguridade Social e Família',
  'CAPADR': 'Comissão de Agricultura, Pecuária, Abastecimento e Desenvolvimento Rural',
  'CCTI': 'Comissão de Ciência, Tecnologia, Inovação, Comunicação e Informática',
  'CDHM': 'Comissão de Direitos Humanos e Minorias',
  'CURL': 'Comissão de Desenvolvimento Urbano',
  'CDC': 'Comissão de Defesa do Consumidor',
  'CVT': 'Comissão de Viação e Transportes',
  'CEDE': 'Comissão de Desenvolvimento Econômico, Indústria, Comércio e Serviços',
  'CTASP': 'Comissão de Trabalho, de Administração e Serviço Público',
  'CINDRE': 'Comissão de Integração Nacional, Desenvolvimento Regional e da Amazônia',
  'CULT': 'Comissão de Cultura',
  'CMDS': 'Comissão de Minas e Energia',
  'CPD': 'Comissão de Defesa dos Direitos das Pessoas com Deficiência',
  'CIDOSO': 'Comissão de Defesa dos Direitos da Pessoa Idosa',
  'CMULHER': 'Comissão de Defesa dos Direitos da Mulher',
  'CREDN': 'Comissão de Relações Exteriores e de Defesa Nacional',
  'CSPCCO': 'Comissão de Segurança Pública e Combate ao Crime Organizado',
  'CMADS': 'Comissão de Meio Ambiente e Desenvolvimento Sustentável',
  'CESP': 'Comissão Especial',
  'CPI': 'Comissão Parlamentar de Inquérito',
};
