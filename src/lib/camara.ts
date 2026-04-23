// ---------------------------------------------------------------------------
// Câmara dos Deputados API Client – Pure fetch functions
// Proxy URL via next.config.ts rewrites: /api-camara
// ---------------------------------------------------------------------------

const IS_BROWSER = typeof window !== 'undefined';
const BASE_URL = IS_BROWSER ? '/api-camara' : 'https://dadosabertos.camara.leg.br/api/v2';

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

export interface AggregateExpense {
  name: string;
  value: number;
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
  dataApresentacao: string;
  statusProposicao?: {
    dataHora: string;
    sequencia: number;
    siglaOrgao: string;
    uriOrgao: string;
    regime: string;
    descricaoTramitacao: string;
    idTipoTramitacao: string;
    descricaoSituacao: string | null;
    idSituacao: number | null;
    despacho: string;
    url: string;
    ambito?: string;
    uriUltimoRelator?: string;
  };
  urlInteiroTeor?: string;
  uriAutores?: string;
}

export interface ProposicaoAutor {
  nome: string;
  uri: string;
  codTipo: number;
  tipo: string;
}

export interface ProposicaoTotals {
  counts: Record<string, number>;
  total: number;
}

export interface HistoricoDeputado {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string | null;
  data: string;
  idCondicaoEleitoral: number;
  condicaoEleitoral: string;
  descricaoStatus: string | null;
}

export interface Discurso {
  dataHoraInicio: string;
  dataHoraFim: string | null;
  uriEvento: string;
  faseEvento: {
    titulo: string;
    dataHoraInicio: string | null;
    dataHoraFim: string | null;
  };
  tipoDiscurso: string;
  urlTexto: string | null;
  urlAudio: string | null;
  urlVideo: string | null;
  keywords: string;
  sumario: string;
  transcricao: string;
}

export interface Ocupacao {
  titulo: string;
  entidade: string;
  entidadeUF: string;
  entidadePais: string;
  anoInicio: number;
  anoFim: number | null;
}

export interface Profissao {
  id: number;
  dataHora: string;
  codTipoProfissao: number;
  titulo: string;
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
  totalPaginas?: number;
  totalItems?: number;
}

export interface EmendaOrcamentaria {
  numero: string;
  tipo: string;
  ano: number;
  orgaoConcedente: string;
  valorAutorizado: number;
  valorEmpenhado: number;
  valorPago: number;
  objetivo?: string;
  localidade?: string;
}

// ---------------------------------------------------------------------------
// Generic fetcher
// ---------------------------------------------------------------------------

async function camaraFetchWithHeaders<T>(url: string): Promise<{ data: T; totalItems?: number }> {
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

    const data = await response.json();
    
    // Extração robusta de headers (ignora case)
    let totalCount: string | null = null;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'x-total-count') {
        totalCount = value;
      }
    });
    
    if (totalCount) {
      console.log(`[Câmara API] ${url} -> totalItems: ${totalCount}`);
    }

    return { 
      data, 
      totalItems: totalCount ? parseInt(totalCount) : undefined 
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(path: string, params: Record<string, any> = {}): string {
  // Use window.location.origin if in browser to handle relative BASE_URL
  const base = IS_BROWSER ? window.location.origin + BASE_URL : BASE_URL;
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
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

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Deputado[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  const lastLink = data.links?.find(l => l.rel === 'last');
  let totalPaginas = undefined;
  if (lastLink) {
    const match = lastLink.href.match(/[?&]pagina=(\d+)/);
    if (match) totalPaginas = match ? parseInt(match[1]) : undefined;
  }

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalPaginas,
  };
}

export async function fetchDeputadoById(id: number): Promise<DeputadoDetalhado | null> {
  const url = buildUrl(`/deputados/${id}`);

  try {
    const { data } = await camaraFetchWithHeaders<{ dados: DeputadoDetalhado }>(url);
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

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Despesa[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  const lastLink = data.links?.find(l => l.rel === 'last');
  let totalPaginas = undefined;
  if (lastLink) {
    const match = lastLink.href.match(/[?&]pagina=(\d+)/);
    if (match) totalPaginas = parseInt(match[1]);
  }

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalPaginas,
  };
}

// ---------------------------------------------------------------------------
// PARTIDOS
// ---------------------------------------------------------------------------

export async function fetchPartidos(params: { pagina?: number; itens?: number } = {}): Promise<PaginatedResponse<Partido>> {
  const { pagina = 1, itens = 50 } = params;
  const url = buildUrl('/partidos', { pagina, itens, ordem: 'ASC', ordenarPor: 'sigla' });

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Partido[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalItems,
  };
}

// ---------------------------------------------------------------------------
// PROPOSIÇÕES
// ---------------------------------------------------------------------------

export async function fetchProposicoes(params: {
  siglaTipo?: string;
  idDeputadoAutor?: number;
  ano?: number;
  dataInicio?: string;
  dataFim?: string;
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

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Proposicao[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  const lastLink = data.links?.find(l => l.rel === 'last');
  let totalPaginas = undefined;
  if (lastLink) {
    const match = lastLink.href.match(/[?&]pagina=(\d+)/);
    if (match) totalPaginas = parseInt(match[1]);
  }

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalPaginas,
    totalItems,
  };
}

export async function fetchDeputadoDespesasAggregation(id: number, year: number): Promise<AggregateExpense[]> {
  const firstPage = await fetchDeputadoDespesas(id, { ano: year, itens: 100, pagina: 1 });
  
  if (firstPage.items.length === 0) return [];
  
  const allDespesas = [...firstPage.items];
  const totalPaginas = firstPage.totalPaginas || 1;
  
  if (totalPaginas > 1) {
    const pages = Array.from({ length: totalPaginas - 1 }, (_, i) => i + 2);
    const results = await Promise.all(
      pages.map(p => fetchDeputadoDespesas(id, { ano: year, itens: 100, pagina: p }))
    );
    results.forEach(res => allDespesas.push(...res.items));
  }
  
  const map: Record<string, number> = {};
  allDespesas.forEach(d => {
    map[d.tipoDespesa] = (map[d.tipoDespesa] || 0) + d.valorLiquido;
  });
  
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchProposicaoById(id: number): Promise<Proposicao | null> {
  const url = buildUrl(`/proposicoes/${id}`);

  try {
    const { data } = await camaraFetchWithHeaders<{ dados: Proposicao }>(url);
    return data.dados || null;
  } catch {
    return null;
  }
}

export async function fetchProposicaoAutores(id: number): Promise<ProposicaoAutor[]> {
  const url = buildUrl(`/proposicoes/${id}/autores`);

  try {
    const { data } = await camaraFetchWithHeaders<{ dados: ProposicaoAutor[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

export async function fetchProposicaoTotals(
  idDeputadoAutor: number, 
  filters: { ano?: number; dataInicio?: string; dataFim?: string } = {}
): Promise<ProposicaoTotals & { relatadas: number; apiTotal: number }> {
  // 1. Fetch Totais Oficiais (Scraping para paridade total com o site da Câmara)
  let officialAutoria = 0;
  let officialRelatadas = 0;
  
  if (filters.ano) {
    try {
      const resp = await fetch(`/api/proposicoes/legislative-totals?id=${idDeputadoAutor}&ano=${filters.ano}`);
      if (resp.ok) {
        const data = await resp.json();
        officialAutoria = data.autoria || 0;
        officialRelatadas = data.relatadas || 0;
      }
    } catch (err) {
      console.error('Erro ao buscar totais oficiais:', err);
    }
  }

  // 2. Fetch Breakdown via API v2 (Para mostrar o gráfico/lista de tipos)
  const autoriaData = await fetchProposicoes({ idDeputadoAutor, itens: 100, ...filters, pagina: 1 });
  let allAutoria = [...autoriaData.items];
  const totalPaginasAut = autoriaData.totalPaginas || 1;

  if (totalPaginasAut > 1) {
    const remainingPages = Array.from({ length: totalPaginasAut - 1 }, (_, i) => i + 2);
    const otherPages = await Promise.all(
      remainingPages.map(p => fetchProposicoes({ idDeputadoAutor, itens: 100, ...filters, pagina: p }))
    );
    otherPages.forEach(p => allAutoria.push(...p.items));
  }

  const counts: Record<string, number> = {};
  allAutoria.forEach(p => {
    counts[p.siglaTipo] = (counts[p.siglaTipo] || 0) + 1;
  });

  return {
    counts,
    total: officialAutoria || allAutoria.length, // Usamos o oficial se tivermos, se não o da API
    relatadas: officialRelatadas,
    apiTotal: allAutoria.length // Guardamos o total da API para transparência/breakdown
  };
}

// ---------------------------------------------------------------------------
// FRENTES PARLAMENTARES
// ---------------------------------------------------------------------------

export async function fetchFrentes(params: { pagina?: number; itens?: number } = {}): Promise<PaginatedResponse<Frente>> {
  const { pagina = 1, itens = 20 } = params;
  const url = buildUrl('/frentes', { pagina, itens });

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Frente[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalItems,
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

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: OrgaoDeputado[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalItems,
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
    const { data } = await camaraFetchWithHeaders<{ dados: FrenteDeputado[] }>(url);
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

export interface VotacaoDetalhada extends Omit<Votacao, 'proposicaoObjeto'> {
  dataHoraUltimaAberturaVotacao: string;
  descUltimaAberturaVotacao: string;
  proposicaoObjeto: {
    id: number;
    uri: string;
    siglaTipo: string;
    codTipo: number;
    numero: number;
    ano: number;
    ementa: string;
  } | null;
  ultimaApresentacaoProposicao?: {
    dataHoraRegistro: string | null;
    descricao: string;
    uriProposicaoCitada: string | null;
  };
  objetosPossiveis?: Array<{
    id: number;
    uri: string;
    siglaTipo: string;
    codTipo: number;
    numero: number;
    ano: number;
    ementa: string;
    dataApresentacao: string;
  }>;
}

export interface Orientacao {
  siglaPartidoBloco: string;
  orientacaoVoto: string;
  codPartidoBloco: number;
  codTipoLideranca: string;
  uriPartidoBloco: string;
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

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Votacao[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  const lastLink = data.links?.find(l => l.rel === 'last');
  let totalPaginas = undefined;
  if (lastLink) {
    const match = lastLink.href.match(/[?&]pagina=(\d+)/);
    if (match) totalPaginas = parseInt(match[1]);
  }

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalPaginas,
    totalItems,
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
    const { data } = await camaraFetchWithHeaders<{ dados: VotoDeputado[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

export async function fetchVotacaoById(id: string): Promise<VotacaoDetalhada | null> {
  const url = buildUrl(`/votacoes/${id}`);

  try {
    const { data } = await camaraFetchWithHeaders<{ dados: VotacaoDetalhada }>(url);
    return data.dados || null;
  } catch {
    return null;
  }
}

export async function fetchVotacaoOrientacoes(id: string): Promise<Orientacao[]> {
  const url = buildUrl(`/votacoes/${id}/orientacoes`);

  try {
    const { data } = await camaraFetchWithHeaders<{ dados: Orientacao[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// HISTÓRICO / TRAJETÓRIA
// ---------------------------------------------------------------------------

export async function fetchDeputadoHistorico(id: number): Promise<HistoricoDeputado[]> {
  const url = buildUrl(`/deputados/${id}/historico`);
  try {
    const { data } = await camaraFetchWithHeaders<{ dados: HistoricoDeputado[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// DISCURSOS
// ---------------------------------------------------------------------------

export async function fetchDeputadoDiscursos(
  id: number,
  params: { dataInicio?: string; dataFim?: string; pagina?: number; itens?: number } = {}
): Promise<PaginatedResponse<Discurso>> {
  const { pagina = 1, itens = 10 } = params;
  const url = buildUrl(`/deputados/${id}/discursos`, { ...params, ordenarPor: 'dataHoraInicio', ordem: 'DESC' });

  const { data, totalItems } = await camaraFetchWithHeaders<{
    dados: Discurso[];
    links: Array<{ rel: string; href: string }>;
  }>(url);

  const lastLink = data.links?.find(l => l.rel === 'last');
  let totalPaginas = undefined;
  if (lastLink) {
    const match = lastLink.href.match(/[?&]pagina=(\d+)/);
    if (match) totalPaginas = parseInt(match[1]);
  }

  return {
    items: data.dados || [],
    hasNext: data.links?.some(l => l.rel === 'next') || false,
    totalPaginas,
    totalItems,
  };
}

// ---------------------------------------------------------------------------
// OCUPAÇÕES E PROFISSÕES
// ---------------------------------------------------------------------------

export async function fetchDeputadoOcupacoes(id: number): Promise<Ocupacao[]> {
  const url = buildUrl(`/deputados/${id}/ocupacoes`);
  try {
    const { data } = await camaraFetchWithHeaders<{ dados: Ocupacao[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

export async function fetchDeputadoProfissoes(id: number): Promise<Profissao[]> {
  const url = buildUrl(`/deputados/${id}/profissoes`);
  try {
    const { data } = await camaraFetchWithHeaders<{ dados: Profissao[] }>(url);
    return data.dados || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// EMENDAS ORÇAMENTÁRIAS
// ---------------------------------------------------------------------------

export async function fetchDeputadoEmendas(id: number, ano: number): Promise<EmendaOrcamentaria[]> {
  // Chamamos nossa API interna (Server Route) para contornar problemas de CORS e realizar o scraping no servidor.
  const url = `/api/emendas?id=${id}&ano=${ano}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar emendas:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// BENEFÍCIOS PARLAMENTARES
// ---------------------------------------------------------------------------

export interface AuxilioMoradiaMensal {
  mes: string;
  valor: string;
}

export interface Beneficio {
  deputado_id: number;
  ano: number;
  salario_bruto: string;
  imovel_funcional: string;
  auxilio_moradia: string;
  auxilio_moradia_mensal?: AuxilioMoradiaMensal[];
  passaporte_diplomatico: string;
  viagens_missao: string;
  pessoal_gabinete: string;
  pessoal_gabinete_nomes?: string[];
  updated_at: string;
}

export async function fetchBeneficios(id: number, ano?: number): Promise<Beneficio | null> {
  // Chamamos nossa API interna (Server Route)
  const query = new URLSearchParams({ id: id.toString() });
  if (ano) query.append('ano', ano.toString());
  
  const url = `/api/beneficios?${query.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar beneficios:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// FREQUÊNCIA PARLAMENTAR
// ---------------------------------------------------------------------------

export interface FrequenciaPlenario {
  sessoes_total?: string;
  sessoes_ausencias_nao_justificadas?: string;
  dias_total?: string;
  dias_presenca?: string;
  dias_ausencias_justificadas?: string;
  dias_ausencias_nao_justificadas?: string;
}

export interface FrequenciaComissoes {
  presenca?: string;
  ausencias_justificadas?: string;
  ausencias_nao_justificadas?: string;
}

export interface FrequenciaParlamentar {
  deputado_id: number;
  ano: number;
  plenario: FrequenciaPlenario;
  comissoes: FrequenciaComissoes;
  updated_at: string;
}

export async function fetchFrequencia(id: number, ano?: number): Promise<FrequenciaParlamentar | null> {
  const query = new URLSearchParams({ id: id.toString() });
  if (ano) query.append('ano', ano.toString());
  
  const url = `/api/frequencia?${query.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar frequencia:", err);
    return null;
  }
}
export async function fetchDeputadoAnosEleito(id: number): Promise<number[]> {
  const url = `${BASE_URL}/deputados/${id}/historico`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const historico = data.dados || [];

    // Pegar todas as legislaturas únicas do histórico
    const legislaturas = Array.from(new Set(historico.map((h: any) => h.idLegislatura))) as number[];
    
    // Mapear legislaturas para anos (Heurística: Legislatura N -> (N-1)*4 + 1...4)
    // Ex: 57 -> 2023, 2024, 2025, 2026
    // Ex: 56 -> 2019, 2020, 2021, 2022
    // Fórmula: AnoInicial = 2023 - (57 - ID) * 4
    
    const allYears = new Set<number>();
    const currentYear = new Date().getFullYear();

    legislaturas.forEach(idLeg => {
      const startYear = 2023 - (57 - idLeg) * 4;
      for (let i = 0; i < 4; i++) {
        const year = startYear + i;
        if (year <= currentYear + 1) { // Permite o ano atual e o próximo se a legislatura cobrir
            allYears.add(year);
        }
      }
    });

    return Array.from(allYears).sort((a, b) => b - a);
  } catch (err) {
    console.error("Erro ao buscar anos eleitos:", err);
    return [];
  }
}
