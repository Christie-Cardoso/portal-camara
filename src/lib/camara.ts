// ---------------------------------------------------------------------------
// Câmara dos Deputados API Client – Pure fetch functions
// Base URL: https://dadosabertos.camara.leg.br/api/v2
// ---------------------------------------------------------------------------

const BASE_URL = 'https://dadosabertos.camara.leg.br/api/v2';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Deputado {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string;
}

export interface DeputadoDetalhado {
  id: number;
  uri: string;
  nomeCivil: string;
  cpf: string;
  sexo: string;
  urlWebsite: string | null;
  redeSocial: string[];
  dataNascimento: string;
  dataFalecimento: string | null;
  ufNascimento: string;
  municipioNascimento: string;
  escolaridade: string;
  ultimoStatus: {
    id: number;
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string | null;
    nomeEleitoral: string;
    gabinete: {
      nome: string;
      predio: string;
      sala: string;
      andar: string;
      telefone: string;
      email: string;
    };
    situacao: string;
    condicaoEleitoral: string;
  };
}

export interface Despesa {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: string;
  tipoDocumento: string;
  dataDocumento: string;
  numDocumento: string;
  valorDocumento: number;
  urlDocumento: string;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string;
  valorLiquido: number;
  valorGlosa: number;
}

export interface Partido {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
}

export interface Proposicao {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
}

export interface Frente {
  id: number;
  uri: string;
  titulo: string;
  idLegislatura: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasNext: boolean;
}

// ---------------------------------------------------------------------------
// Generic fetcher
// ---------------------------------------------------------------------------

async function camaraFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Câmara API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// DEPUTADOS
// ---------------------------------------------------------------------------

interface DeputadosParams {
  nome?: string;
  siglaPartido?: string;
  siglaUf?: string;
  idLegislatura?: number;
  pagina?: number;
  itens?: number;
  ordem?: string;
  ordenarPor?: string;
}

export async function fetchDeputados(params: DeputadosParams = {}): Promise<PaginatedResponse<Deputado>> {
  const { pagina = 1, itens = 20, ordem = 'ASC', ordenarPor = 'nome', ...rest } = params;
  const url = buildUrl('/deputados', { pagina, itens, ordem, ordenarPor, ...rest });

  const data = await camaraFetch<{
    dados: Deputado[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

export async function fetchDeputadoById(id: number): Promise<DeputadoDetalhado | null> {
  const url = buildUrl(`/deputados/${id}`);

  try {
    const data = await camaraFetch<{ dados: DeputadoDetalhado }>(url);
    return data.dados || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// DESPESAS
// ---------------------------------------------------------------------------

interface DespesasParams {
  ano?: number;
  mes?: number;
  pagina?: number;
  itens?: number;
  ordem?: string;
  ordenarPor?: string;
}

export async function fetchDeputadoDespesas(
  id: number,
  params: DespesasParams = {}
): Promise<PaginatedResponse<Despesa>> {
  const { pagina = 1, itens = 15, ordem = 'DESC', ordenarPor = 'dataDocumento', ...rest } = params;
  const url = buildUrl(`/deputados/${id}/despesas`, { pagina, itens, ordem, ordenarPor, ...rest });

  const data = await camaraFetch<{
    dados: Despesa[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// PARTIDOS
// ---------------------------------------------------------------------------

export async function fetchPartidos(params: { pagina?: number; itens?: number } = {}): Promise<PaginatedResponse<Partido>> {
  const { pagina = 1, itens = 50 } = params;
  const url = buildUrl('/partidos', { pagina, itens, ordem: 'ASC', ordenarPor: 'sigla' });

  const data = await camaraFetch<{
    dados: Partido[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// PROPOSIÇÕES
// ---------------------------------------------------------------------------

export async function fetchProposicoes(params: {
  siglaTipo?: string;
  ano?: number;
  pagina?: number;
  itens?: number;
} = {}): Promise<PaginatedResponse<Proposicao>> {
  const { pagina = 1, itens = 10, ...rest } = params;
  const url = buildUrl('/proposicoes', {
    pagina, itens,
    ordem: 'DESC',
    ordenarPor: 'id',
    ...rest,
  });

  const data = await camaraFetch<{
    dados: Proposicao[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// FRENTES PARLAMENTARES
// ---------------------------------------------------------------------------

export async function fetchFrentes(params: { pagina?: number; itens?: number } = {}): Promise<PaginatedResponse<Frente>> {
  const { pagina = 1, itens = 20 } = params;
  const url = buildUrl('/frentes', { pagina, itens });

  const data = await camaraFetch<{
    dados: Frente[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// ÓRGÃOS DO DEPUTADO (comissões, conselhos, etc.)
// ---------------------------------------------------------------------------

export interface OrgaoDeputado {
  idOrgao: number;
  uriOrgao: string;
  siglaOrgao: string;
  nomeOrgao: string;
  nomePublicacao: string;
  titulo: string;
  codTitulo: string;
  dataInicio: string;
  dataFim: string | null;
}

export async function fetchDeputadoOrgaos(
  id: number,
  params: { pagina?: number; itens?: number } = {}
): Promise<PaginatedResponse<OrgaoDeputado>> {
  const { pagina = 1, itens = 50 } = params;
  const url = buildUrl(`/deputados/${id}/orgaos`, { pagina, itens });

  const data = await camaraFetch<{
    dados: OrgaoDeputado[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// FRENTES DO DEPUTADO
// ---------------------------------------------------------------------------

export interface FrenteDeputado {
  id: number;
  uri: string;
  titulo: string;
  idLegislatura: number;
}

export async function fetchDeputadoFrentes(id: number): Promise<FrenteDeputado[]> {
  const url = buildUrl(`/deputados/${id}/frentes`);

  try {
    const data = await camaraFetch<{ dados: FrenteDeputado[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// VOTAÇÕES
// ---------------------------------------------------------------------------

export interface Votacao {
  id: string;
  uri: string;
  data: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  uriOrgao: string;
  uriEvento: string;
  proposicaoObjeto: string | null;
  uriProposicaoObjeto: string | null;
  descricao: string;
  aprovacao: number;
}

export async function fetchVotacoes(params: {
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
  ordem?: string;
  ordenarPor?: string;
} = {}): Promise<PaginatedResponse<Votacao>> {
  const { pagina = 1, itens = 10, ordem = 'DESC', ordenarPor = 'dataHoraRegistro', ...rest } = params;
  const url = buildUrl('/votacoes', { pagina, itens, ordem, ordenarPor, ...rest });

  const data = await camaraFetch<{
    dados: Votacao[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
  };
}

// ---------------------------------------------------------------------------
// VOTOS DE UMA VOTAÇÃO
// ---------------------------------------------------------------------------

export interface VotoDeputado {
  tipoVoto: string;
  dataRegistroVoto: string;
  deputado_: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string;
  };
}

export async function fetchVotacaoVotos(idVotacao: string): Promise<VotoDeputado[]> {
  const url = buildUrl(`/votacoes/${idVotacao}/votos`);

  try {
    const data = await camaraFetch<{ dados: VotoDeputado[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}
