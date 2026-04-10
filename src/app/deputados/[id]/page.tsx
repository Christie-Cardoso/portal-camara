"use client";

import { useState, useMemo, use } from 'react';
import { useDeputado, useDeputadoDespesas, useDeputadoOrgaos, useDeputadoFrentes, useVotacoes, useVotacaoVotos, useVotacaoOrientacoes, useSecretarios, useVotacao } from '@/hooks/use-camara';
import { hasSupabaseConfig } from '@/lib/supabase';
import { ErrorState } from '@/components/ErrorState';
import { Pagination } from '@/components/Pagination';
import { SpinnerFullPage, TableSkeleton } from '@/components/LoadingState';
import {
  ArrowLeft, Calendar, MapPin, GraduationCap, Phone, Mail,
  Building2, ExternalLink, Receipt, FileText, DollarSign, Loader2,
  Users, Gavel, Info, Briefcase, Vote, Flag, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Minus, Search, CheckCircle2, XCircle, LayoutDashboard,
  FlagOff, AlertTriangle, History
} from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import type { Votacao, VotoDeputado } from '@/lib/camara';

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i); // 2026, 2025, 2024, 2023

const MONTHS = [
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

const ORGAOS_MAP: Record<string, string> = {
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

function parseAuthorFromDescription(desc: string) {
  if (!desc) return null;
  // Captura padrões como "pelo Deputado Nome (PARTIDO/UF)" ou "pela Deputada Nome (PARTIDO/UF)"
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

// ---------------------------------------------------------------------------
// Sub-component: Single Votação Card with expandable voto
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Table Sub-component: Detailed info appearing when row is expanded
// ---------------------------------------------------------------------------

function VotacaoDetailExpansion({ row, deputadoId, siglaPartido }: { row: any, deputadoId: number, siglaPartido?: string }) {
  const votacaoBase = row.original;
  const { data: votacaoFull, isLoading: loadingDetail } = useVotacao(votacaoBase.id);
  const { data: votos, isLoading: loadingVotos } = useVotacaoVotos(votacaoBase.id);
  const { data: orientacoes, isLoading: loadingOrientacoes } = useVotacaoOrientacoes(votacaoBase.id);

  const votacao = votacaoFull || votacaoBase;

  const deputadoVoto = useMemo(() => {
    if (!votos) return null;
    return (votos as VotoDeputado[]).find(v => v.deputado_?.id === deputadoId);
  }, [votos, deputadoId]);

  const placar = useMemo(() => {
    if (!votos) return null;
    const items = votos;
    return {
      sim: items.filter(v => v.tipoVoto.toLowerCase() === 'sim').length,
      nao: items.filter(v => ['não', 'nao'].includes(v.tipoVoto.toLowerCase())).length,
      abstencao: items.filter(v => ['abstenção', 'abstencao'].includes(v.tipoVoto.toLowerCase())).length,
      obstrucao: items.filter(v => ['obstrução', 'obstrucao'].includes(v.tipoVoto.toLowerCase())).length,
      total: items.length
    };
  }, [votos]);

  const orientacaoDeputado = useMemo(() => {
    if (!orientacoes || !siglaPartido) return null;
    return orientacoes.find(o => o.siglaPartidoBloco.includes(siglaPartido));
  }, [orientacoes, siglaPartido]);

  const votoColor = (tipo: string | undefined) => {
    if (!tipo) return 'text-slate-500';
    const t = tipo.toLowerCase();
    if (t === 'sim') return 'text-emerald-400';
    if (t === 'não') return 'text-red-400';
    if (t === 'abstenção' || t === 'abstencao') return 'text-yellow-400';
    if (t === 'obstrução' || t === 'obstrucao') return 'text-orange-400';
    return 'text-slate-400';
  };

  const votoBg = (tipo: string | undefined) => {
    if (!tipo) return 'bg-slate-500/10';
    const t = tipo.toLowerCase();
    if (t === 'sim') return 'bg-emerald-500/10';
    if (t === 'não') return 'bg-red-500/10';
    if (t === 'abstenção' || t === 'abstencao') return 'bg-yellow-500/10';
    return 'bg-slate-500/10';
  };

  const VotoIcon = ({ tipo }: { tipo: string | undefined }) => {
    if (!tipo) return <Minus size={14} />;
    const t = tipo.toLowerCase();
    if (t === 'sim') return <ThumbsUp size={14} />;
    if (t === 'não') return <ThumbsDown size={14} />;
    if (t === 'obstrução' || t === 'obstrucao') return <XCircle size={14} />;
    return <Minus size={14} />;
  };

  if (loadingVotos || loadingOrientacoes || loadingDetail) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
        Sincronizando dados oficiais com a Câmara...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Resumo da Matéria */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <p className="text-[10px] font-black uppercase text-gold tracking-widest">Objeto da Votação / Ementa</p>
          </div>
          {votacaoFull?.proposicaoObjeto && (
            <a href={`https://www.camara.leg.br/proposicoesWeb/fichadetetalhe?idProposicao=${votacaoFull.proposicaoObjeto.id}`}
               target="_blank" rel="noopener noreferrer"
               className="group flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-blue-400 font-bold hover:bg-blue-400/10 transition-all">
              Acessar Ficha na Íntegra <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>
        <div className="bg-navy/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/20"></div>
          <div className="space-y-4 relative z-10">
            {/* Bloco de Autoria Extraído */}
            {(() => {
              const info = parseAuthorFromDescription(votacaoFull?.ultimaApresentacaoProposicao?.descricao || '');
              if (!info) return null;
              return (
                <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-xl">
                    <Users size={12} className="text-gold" />
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Autor(a):</span>
                    <span className="text-white text-xs font-bold">{info.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Flag size={12} className="text-blue-400" />
                    <span className="text-white text-xs font-bold">{info.partido}</span>
                    <span className="w-px h-3 bg-white/10 mx-1"></span>
                    <span className="text-slate-400 text-[10px] font-black">{info.uf}</span>
                  </div>
                </div>
              );
            })()}

            {votacaoFull?.ultimaApresentacaoProposicao?.descricao && (
              <p className="text-white text-sm font-bold leading-relaxed border-l-2 border-gold/40 pl-4 py-1">
                {votacaoFull.ultimaApresentacaoProposicao.descricao}
              </p>
            )}
            <p className="text-slate-400 text-sm leading-relaxed italic">
              {votacaoFull?.proposicaoObjeto?.ementa || votacao.descricao}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Posicionamento */}
        <div className="space-y-6">
          {/* Voto do Parlamentar */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Users size={12} /> Voto Individual
            </p>
            {deputadoVoto ? (
              <div className={`flex items-center gap-4 p-5 rounded-2xl ${votoBg(deputadoVoto.tipoVoto)} border border-white/5 shadow-lg`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${votoColor(deputadoVoto.tipoVoto)} bg-white/10 shadow-inner`}>
                  <VotoIcon tipo={deputadoVoto.tipoVoto} />
                </div>
                <div>
                  <p className={`font-black text-xl uppercase tracking-tighter ${votoColor(deputadoVoto.tipoVoto)}`}>
                    {deputadoVoto.tipoVoto}
                  </p>
                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">
                    Consolidado em {new Date(deputadoVoto.dataRegistroVoto).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 bg-white/5 rounded-2xl border border-white/5 text-slate-500 text-sm italic">
                <Info size={18} />
                {votos && votos.length === 0
                  ? 'Votação simbólica — sem registro individual.'
                  : 'Ausente ou sem registro nesta sessão.'}
              </div>
            )}
          </div>

          {/* Cronologia de Objetos Relacionados */}
          {votacaoFull?.objetosPossiveis && votacaoFull.objetosPossiveis.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <History size={12} /> Cronologia de Objetos ({votacaoFull.objetosPossiveis.length})
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {[...votacaoFull.objetosPossiveis].reverse().map((obj) => (
                  <div key={obj.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex items-start gap-4 group/obj">
                     <div className="flex flex-col items-center justify-center text-[9px] font-mono text-slate-500 px-2 py-1 bg-white/5 rounded-lg border border-white/5 min-w-[50px]">
                       <span>{new Date(obj.dataApresentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                       <span className="text-gold font-bold">{new Date(obj.dataApresentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <div className="flex-1 space-y-1">
                       <div className="flex items-center justify-between gap-2">
                         <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded uppercase border border-blue-500/20">
                           {obj.siglaTipo} {obj.numero}/{obj.ano > 0 ? obj.ano : ''}
                         </span>
                         <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${obj.id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-1 px-2.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-400 hover:text-gold rounded-xl transition-all text-xs flex items-center gap-2 group/link">
                           <span className="text-[9px] font-black uppercase tracking-tight transition-colors">Ver API</span>
                           <ExternalLink size={10} className="opacity-50 group-hover/link:opacity-100 transition-opacity" />
                         </a>
                       </div>
                       <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed group-hover/obj:text-slate-300 transition-colors">
                         {obj.ementa}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orientação */}
          {orientacaoDeputado && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Flag size={12} /> Orientação da Bancada ({siglaPartido})
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${votoColor(orientacaoDeputado.orientacaoVoto)} bg-white/5`}>
                  <Flag size={16} />
                </div>
                <div>
                  <p className={`font-black text-sm uppercase ${votoColor(orientacaoDeputado.orientacaoVoto)}`}>
                    {orientacaoDeputado.orientacaoVoto}
                  </p>
                  <p className="text-slate-600 text-[10px] font-medium">Recomendação oficial da liderança</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Placar Geral */}
        <div className="space-y-6">
          <div className="space-y-3">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
               <LayoutDashboard size={12} /> Consenso da Casa
             </p>
             <div className="p-6 bg-navy/60 rounded-[2rem] border border-white/5 flex items-center justify-around gap-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                {placar && placar.total > 0 ? (
                  <>
                    <div className="text-center group/v">
                      <p className="text-3xl font-black text-emerald-400 group-hover/v:scale-110 transition-transform">{placar.sim}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Sim</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center group/v">
                      <p className="text-3xl font-black text-red-400 group-hover/v:scale-110 transition-transform">{placar.nao}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Não</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center group/v text-slate-500">
                      <p className="text-xl font-black text-yellow-400 group-hover/v:scale-110 transition-transform">{placar.abstencao}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Abs.</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center group/v">
                      <p className="text-xl font-black text-orange-400 group-hover/v:scale-110 transition-transform">{placar.obstrucao}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Obs.</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-slate-600 text-[10px] italic">
                    <FlagOff size={24} className="opacity-20" />
                    Placar detalhado indisponível.
                  </div>
                )}
             </div>
          </div>

          {/* Orientações todas */}
          {orientacoes && orientacoes.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest text-center">Panorama das Bancadas</p>
              <div className="flex flex-wrap justify-center gap-1.5 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                {orientacoes.map((o, idx) => (
                  <div key={idx} className="group/party px-2.5 py-1.5 bg-navy/80 border border-white/5 rounded-lg flex items-center gap-2 hover:border-white/20 transition-all">
                    <span className="text-[10px] font-black text-slate-400 group-hover/party:text-white">{o.siglaPartidoBloco}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${votoColor(o.orientacaoVoto).replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`} />
                    <span className={`text-[10px] font-bold ${votoColor(o.orientacaoVoto)}`}>{o.orientacaoVoto}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DeputadoDetailPage() {
  const params = useParams<{ id: string }>();
  const deputadoId = parseInt(params.id);

  const [activeTab, setActiveTab] = useState('resumo');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [despesaPage, setDespesaPage] = useState(1);
  const [votacaoPage, setVotacaoPage] = useState(1);
  const [votacaoItens, setVotacaoItens] = useState(10);
  const [votacaoYear, setVotacaoYear] = useState('2026');
  const [votacaoMonth, setVotacaoMonth] = useState('all');
  const [frentesSearch, setFrentesSearch] = useState('');
  const [showAllFrentes, setShowAllFrentes] = useState(false);

  // Cálculo das datas baseado nos seletores de ano e mês
  const { votacaoDataInicio, votacaoDataFim } = useMemo(() => {
    if (votacaoMonth === 'all') {
      // Se 'todos os meses', apenas data de início para evitar o erro de 3 meses da API
      return { votacaoDataInicio: `${votacaoYear}-01-01`, votacaoDataFim: undefined };
    } else {
      // Se mês específico, define janelas seguras de 1 mês
      const lastDay = new Date(parseInt(votacaoYear), parseInt(votacaoMonth), 0).getDate();
      return {
        votacaoDataInicio: `${votacaoYear}-${votacaoMonth}-01`,
        votacaoDataFim: `${votacaoYear}-${votacaoMonth}-${lastDay}`
      };
    }
  }, [votacaoYear, votacaoMonth]);

  const { data: dep, isLoading, isError, refetch } = useDeputado(deputadoId);
  const { data: despesasData, isLoading: loadingDesp, isFetching: fetchingDesp } = useDeputadoDespesas(deputadoId, {
    ano: year,
    pagina: despesaPage,
    itens: 15,
  });
  const { data: orgaosData, isLoading: loadingOrgaos } = useDeputadoOrgaos(deputadoId);
  const { data: frentesData, isLoading: loadingFrentes } = useDeputadoFrentes(deputadoId);

  const { data: votacoesData, isLoading: loadingVotacoes } = useVotacoes({
    dataInicio: votacaoDataInicio,
    dataFim: votacaoDataFim,
    pagina: votacaoPage,
    itens: votacaoItens,
  });

  const despesas = despesasData?.items || [];
  const hasNextDesp = despesasData?.hasNext || false;
  const orgaos = orgaosData?.items?.filter(o => !o.dataFim) || []; // only active
  const frentes = frentesData || [];
  const votacoes = votacoesData?.items || [];
  const hasNextVotacoes = votacoesData?.hasNext || false;
  const totalPaginasVotacoes = votacoesData?.totalPaginas;

  const searchName = dep?.ultimoStatus.nome;
  const {
    data: secretarios,
    isLoading: loadingSecretarios,
    isError: errorSecretarios,
    error: secretarioError
  } = useSecretarios(searchName);

  // ---------------------------------------------------------------------------
  // VOTATIONS TABLE CONFIGURATION
  // ---------------------------------------------------------------------------
  
  const columns = useMemo<ColumnDef<Votacao>[]>(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-gold/20 text-gold rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'dataHoraRegistro',
      header: 'Data / Hora',
      cell: ({ getValue }) => (
        <div className="flex flex-col">
          <span className="text-white font-bold">{new Date(getValue() as string).toLocaleDateString('pt-BR')}</span>
          <span className="text-[10px] text-slate-500">{new Date(getValue() as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'objeto',
      header: 'Objeto da Votação',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-white font-black tracking-tight text-xs uppercase">
            {row.original.proposicaoObjeto && typeof row.original.proposicaoObjeto === 'object'
                 ? `${(row.original.proposicaoObjeto as any).siglaTipo} ${(row.original.proposicaoObjeto as any).numero}/${(row.original.proposicaoObjeto as any).ano}`
                 : row.original.descricao || 'Votação de Expediente'}
          </span>
          <p className="text-[10px] text-slate-500 line-clamp-1 italic">{row.original.descricao}</p>
        </div>
      )
    },
    {
      accessorKey: 'siglaOrgao',
      header: 'Órgão',
      cell: ({ getValue }) => {
        const sigla = getValue() as string;
        const nomeCompleto = ORGAOS_MAP[sigla] || 'Órgão Legislativo / Comissão';
        return (
          <div className="flex items-center gap-2 group/tip relative">
            <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[10px] font-black rounded border border-white/5 whitespace-nowrap">
              {sigla}
            </span>
            <div className="p-1 bg-blue-500/10 text-blue-400 rounded-full cursor-help hover:bg-blue-500/20 transition-all shadow-sm" title={nomeCompleto}>
              <Info size={10} />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'aprovacao',
      header: 'Resultado',
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
            (getValue() as number) === 1 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {(getValue() as number) === 1 ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {(getValue() as number) === 1 ? 'APROVADA' : 'REJEITADA'}
          </div>
          <a href={`https://dadosabertos.camara.leg.br/api/v2/votacoes/${row.original.id}`}
             target="_blank" rel="noopener noreferrer"
             className="p-1.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-500 hover:text-gold rounded-xl transition-all group/api"
             title="Dados Brutos (API)">
            <ExternalLink size={10} className="opacity-50 group-hover/api:opacity-100 transition-opacity" />
          </a>
        </div>
      )
    }
  ], []);

  if (errorSecretarios) {
    console.error('Supabase Error:', secretarioError);
  }

  const totalDespesas = despesas.reduce((sum, d) => sum + d.valorLiquido, 0);

  // Filter frentes by search
  const filteredFrentes = useMemo(() => {
    if (!frentesSearch.trim()) return frentes;
    const q = frentesSearch.toLowerCase();
    return frentes.filter(f => f.titulo.toLowerCase().includes(q));
  }, [frentes, frentesSearch]);

  const displayedFrentes = showAllFrentes ? filteredFrentes : filteredFrentes.slice(0, 12);

  if (isLoading) return <SpinnerFullPage />;

  if (isError || !dep) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message="Não foi possível carregar os dados do deputado." onRetry={() => refetch()} />
      </div>
    );
  }

  const status = dep.ultimoStatus;
  const gabinete = status.gabinete;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
      {/* Nav */}
      <Link href="/deputados" className="group inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-all text-sm font-medium">
        <div className="p-2 bg-slate-card rounded-xl border border-white/5 group-hover:border-gold/30 transition-all">
          <ArrowLeft size={16} />
        </div>
        Voltar para lista de deputados
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative shrink-0">
          <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-gold/20 bg-gradient-to-b from-gold/10 to-transparent">
            <Image src={status.urlFoto} alt={status.nome} width={192} height={192} className="object-cover w-full h-full" unoptimized />
          </div>
          <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-gold text-navy font-black text-xs rounded-full shadow-lg">
            {status.situacao}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{status.nome}</h1>
            <p className="text-slate-500 text-sm">{dep.nomeCivil}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 bg-gold/10 text-gold text-sm font-black rounded-full border border-gold/20">{status.siglaPartido}</span>
            <span className="px-4 py-1.5 bg-white/5 text-slate-300 text-sm font-bold rounded-full border border-white/10 flex items-center gap-1">
              <MapPin size={14} /> {status.siglaUf}
            </span>
            <span className="px-4 py-1.5 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 flex items-center gap-1">
              <GraduationCap size={14} /> {dep.escolaridade}
            </span>
            <span className="px-4 py-1.5 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 flex items-center gap-1">
              <Calendar size={14} /> Nascimento: {new Date(dep.dataNascimento).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-navy/50 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Gabinete</span>
              <p className="text-white text-sm font-bold">Prédio {gabinete.predio}, Sala {gabinete.sala}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Telefone</span>
              <p className="text-white text-sm font-bold flex items-center gap-1"><Phone size={12} /> {gabinete.telefone}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">E-mail</span>
              <p className="text-gold text-sm font-bold truncate flex items-center gap-1"><Mail size={12} /> {gabinete.email}</p>
            </div>
          </div>

          {dep.redeSocial?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dep.redeSocial.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full hover:bg-blue-500/20 transition-all">
                  <ExternalLink size={12} /> {new URL(url).hostname.replace('www.', '')}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TABS NAVIGATION */}
      {/* ================================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        <button
          onClick={() => setActiveTab('resumo')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'resumo' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <LayoutDashboard size={18} />
          Resumo
        </button>
        <button
          onClick={() => setActiveTab('despesas')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'despesas' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Receipt size={18} />
          Despesas da Cota
        </button>
        <button
          onClick={() => setActiveTab('frentes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'frentes' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Flag size={18} />
          Frentes Parlamentares
        </button>
        <button
          onClick={() => setActiveTab('votacoes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'votacoes' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Vote size={18} />
          Votações Recentes
        </button>
      </div>

      {/* ================================================================ */}
      {/* TABS CONTENT */}
      {/* ================================================================ */}
      <div className="pt-2 min-h-[400px]">

        {/* TAB: RESUMO */}
        {activeTab === 'resumo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Assessores (informativo) */}
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Secretários Parlamentares</h3>
                  <p className="text-slate-500 text-xs">Assessores do gabinete</p>
                </div>
              </div>

              {loadingSecretarios && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              )}

              {errorSecretarios && (
                <div className="py-4 text-center text-sm text-red-400">
                  <p>Erro ao carregar secretários. Tente novamente mais tarde.</p>
                </div>
              )}

              {!loadingSecretarios && !errorSecretarios && secretarios && secretarios.length > 0 && (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                  {secretarios.map((sec) => (
                    <div key={sec.ponto} className="p-3 bg-navy/30 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/20 transition-all">
                      <p className="text-slate-300 text-sm font-medium leading-tight">{sec.nome}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-bold text-slate-400">{sec.cargo}</span>
                        {sec.grupo && (
                          <>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="italic">{sec.grupo}</span>
                          </>
                        )}
                        {sec.data_inicio_historico && (
                          <>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span>Desde: {new Date(sec.data_inicio_historico).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingSecretarios && !errorSecretarios && secretarios?.length === 0 && (
                <div className="py-4 text-center text-sm text-slate-500">
                  <p>Nenhum secretário parlamentar encontrado para este gabinete.</p>
                </div>
              )}

              {!hasSupabaseConfig() && (
                <div className="py-4 text-center text-sm text-slate-500">
                  <p>Dados de secretários indisponíveis (Ambiente não configurado).</p>
                </div>
              )}

              <div className="p-4 bg-navy/30 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Assessores ativos</span>
                  <span className="text-white font-black text-lg">{secretarios?.length || 0} de 25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Gabinete vinculado</span>
                  <span className="text-slate-300 text-xs font-medium text-right max-w-[160px] truncate">
                    {secretarios?.[0]?.lotacao || 'Não identificado'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-500 text-xs">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  Os dados de assessores são sincronizados de uma base externa e podem levar alguns minutos para atualizar.
                </p>
              </div>
            </div>

            {/* Comissões e Órgãos */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <Gavel size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Comissões e Órgãos</h3>
                    <p className="text-slate-500 text-xs">Participação ativa</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-full">
                  {loadingOrgaos ? '...' : orgaos.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                {loadingOrgaos && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  </div>
                )}
                {orgaos.map((orgao) => (
                  <div key={orgao.idOrgao} className="p-3 bg-navy/30 rounded-xl border border-white/5 space-y-1 hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded">{orgao.siglaOrgao}</span>
                      <span className="text-[10px] text-slate-600 capitalize">{orgao.titulo}</span>
                    </div>
                    <p className="text-slate-300 text-xs font-medium leading-tight">{orgao.nomePublicacao || orgao.nomeOrgao}</p>
                  </div>
                ))}
                {!loadingOrgaos && orgaos.length === 0 && (
                  <p className="text-slate-600 text-sm text-center py-4">Nenhuma participação ativa no momento.</p>
                )}
              </div>
            </div>

            {/* Votações Recentes Summary Shortcut */}
            <div className="lg:col-span-2 bg-slate-card border border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gold/20 transition-all group">
              <div>
                <h3 className="text-xl font-black text-white">Atividades Recentes no Plenário</h3>
                <p className="text-slate-400 mt-1 max-w-xl text-sm">Verifique individualmente como este parlamentar votou nas decisões mais atuais abertas do plenário.</p>
              </div>
              <button onClick={() => setActiveTab('votacoes')} className="px-6 py-3 bg-white/5 hover:bg-gold/10 text-gold font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer">
                Ver Histórico de Votos
                <Vote size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: DESPESAS */}
        {activeTab === 'despesas' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Receipt className="text-gold" size={24} />
                Despesas da Cota Parlamentar
              </h2>
              <div className="flex items-center gap-3">
                <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setDespesaPage(1); }}
                  className="bg-navy border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer">
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {fetchingDesp && <Loader2 className="w-5 h-5 text-gold animate-spin" />}
              </div>
            </div>

            {totalDespesas > 0 && (
              <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Total nesta página ({year})</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalDespesas)}</span>
              </div>
            )}

            {loadingDesp && <TableSkeleton rows={10} />}

            {!loadingDesp && despesas.length > 0 && (
              <div className={`space-y-3 transition-opacity duration-300 ${fetchingDesp ? 'opacity-60' : ''}`}>
                {despesas.map((desp, idx) => (
                  <div key={`${desp.codDocumento}-${idx}`}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-slate-card border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                        <DollarSign size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm">{desp.tipoDespesa}</p>
                        <p className="text-slate-500 text-xs truncate">{desp.nomeFornecedor}</p>
                        <div className="flex items-center gap-3 text-slate-600 text-[10px] mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(desp.dataDocumento).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={10} />
                            {desp.tipoDocumento}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-emerald-400 font-black text-lg font-mono">{formatCurrency(desp.valorLiquido)}</span>
                      {desp.urlDocumento && (
                        <a href={desp.urlDocumento} target="_blank" rel="noopener noreferrer"
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all" title="Ver nota fiscal">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingDesp && despesas.length === 0 && (
              <div className="py-16 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
                <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-white font-bold">Nenhuma despesa registrada em {year}</p>
                <p className="text-slate-500 text-sm mt-1">Tente selecionar outro ano.</p>
              </div>
            )}

            <Pagination page={despesaPage} hasNext={hasNextDesp} itensPerPage={15} onPageChange={(p) => { setDespesaPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </section>
        )}

        {/* TAB: FRENTES */}
        {activeTab === 'frentes' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <Flag size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Frentes Parlamentares</h2>
                  <p className="text-slate-500 text-xs">Bancadas e frentes das quais faz parte</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-black rounded-full">
                {loadingFrentes ? '...' : frentes.length} frentes
              </span>
            </div>

            {/* Search frentes */}
            {frentes.length > 8 && (
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={frentesSearch}
                  onChange={(e) => setFrentesSearch(e.target.value)}
                  placeholder="Buscar frente parlamentar..."
                  className="w-full bg-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            )}

            {loadingFrentes && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            )}

            {!loadingFrentes && filteredFrentes.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedFrentes.map((frente) => (
                    <div
                      key={frente.id}
                      className="p-4 bg-slate-card border border-white/5 rounded-2xl space-y-2 hover:border-amber-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                          <Flag size={14} />
                        </div>
                        <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[10px] font-bold rounded">
                          Leg. {frente.idLegislatura}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-medium leading-tight">{frente.titulo}</p>
                    </div>
                  ))}
                </div>

                {filteredFrentes.length > 12 && (
                  <button
                    onClick={() => setShowAllFrentes(!showAllFrentes)}
                    className="mx-auto flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    {showAllFrentes ? (
                      <>
                        <ChevronUp size={16} /> Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} /> Ver todas as {filteredFrentes.length} frentes
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {!loadingFrentes && filteredFrentes.length === 0 && (
              <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
                <Flag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-bold">
                  {frentesSearch ? 'Nenhuma frente encontrada' : 'Nenhuma frente parlamentar'}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {frentesSearch ? 'Tente outro termo de busca.' : 'Este deputado não integra frentes parlamentares registradas.'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* TAB: VOTACOES */}
        {activeTab === 'votacoes' && (
          <section id="votacoes-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Vote size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Votações Recentes</h2>
                <p className="text-slate-500 text-xs">Últimas votações do Plenário e Comissões — clique para ver o voto do deputado</p>
              </div>
            </div>

            {/* FILTROS DE PERÍODO */}
            <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
                <select 
                  value={votacaoYear}
                  onChange={(e) => { setVotacaoYear(e.target.value); setVotacaoPage(1); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-white/10"
                >
                  {YEARS.map(y => <option key={y} value={y} className="bg-navy">{y}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <History size={14} className="text-gold" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
                <select 
                  value={votacaoMonth}
                  onChange={(e) => { setVotacaoMonth(e.target.value); setVotacaoPage(1); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-white/10"
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value} className="bg-navy">{m.label}</option>)}
                </select>
              </div>

              <div className="ml-auto">
                <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">
                  Período: {votacaoYear} {votacaoMonth !== 'all' ? `/ ${MONTHS.find(m => m.value === votacaoMonth)?.label}` : ''}
                </span>
              </div>
            </div>

            {loadingVotacoes && <TableSkeleton rows={10} />}

            {!loadingVotacoes && votacoes.length > 0 && (
              <DataTable
                columns={columns}
                data={votacoes}
                getRowCanExpand={() => true}
                renderSubComponent={({ row }) => (
                  <VotacaoDetailExpansion 
                    row={row} 
                    deputadoId={deputadoId} 
                    siglaPartido={dep?.ultimoStatus.siglaPartido} 
                  />
                )}
              />
            )}

            {!loadingVotacoes && votacoes.length === 0 && (
              <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
                <Vote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-bold">Nenhuma votação encontrada</p>
                <p className="text-slate-500 text-sm mt-1">Não foram encontradas votações para este período.</p>
              </div>
            )}

            <Pagination 
              page={votacaoPage} 
              totalPaginas={totalPaginasVotacoes}
              hasNext={hasNextVotacoes}
              itensPerPage={votacaoItens}
              onItensPerPageChange={(n) => { setVotacaoItens(n); setVotacaoPage(1); }}
              onPageChange={(p) => { 
                setVotacaoPage(p); 
                const element = document.getElementById('votacoes-section');
                if (element) {
                  const yOffset = -100; 
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }} 
            />
          </section>
        )}
      </div>

    </div>
  );
}
