"use client";

import { useState, useMemo, use } from 'react';
import {
  useDeputado,
  useDeputadoDespesas,
  useDeputadoOrgaos,
  useDeputadoFrentes,
  useVotacoes,
  useVotacaoVotos,
  useVotacaoOrientacoes,
  useSecretarios,
  useVotacao,
  useDeputadoDiscursos,
  useProposicoesByAutor,
  useProposicao,
  useProposicaoAutores,
  useProposicaoTotals,
  useDeputadoDespesasAggregation,
  useDeputadoEmendas,
  useBeneficios,
  useFrequencia,
  useAnosEleito
} from '@/hooks/use-camara';
import { PROPOSICOES_MAP } from '@/lib/constants';
import { ExpensesDonutChart } from '@/components/ExpensesDonutChart';
import { hasSupabaseConfig } from '@/lib/supabase';
import { ErrorState } from '@/components/ErrorState';
import { Pagination } from '@/components/Pagination';
import { SpinnerFullPage, TableSkeleton } from '@/components/LoadingState';
import {
  ArrowLeft, Calendar, MapPin, GraduationCap, Phone, Mail, PiggyBank,
  Building2, ExternalLink, Receipt, FileText, DollarSign, Loader2,
  Users, Gavel, Info, Briefcase, ChevronDown, Home, Globe,
  ChevronUp,
  History,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileCheck,
  RotateCcw,
  Mic2,
  Play,
  Quote,
  ThumbsUp, ThumbsDown, Minus, Search, CheckCircle2, XCircle, LayoutDashboard,
  FlagOff, AlertTriangle,
  Flag,
  Vote,
  Plane,
  ShieldCheck
} from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import type { Votacao, VotoDeputado, Proposicao, Despesa, EmendaOrcamentaria } from '@/lib/camara';

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getSocialIcon(url: string) {
  const domain = url.toLowerCase();

  // Custom SVGs for better compatibility and branding
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (domain.includes('facebook.com')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (domain.includes('instagram.com')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  if (domain.includes('youtube.com')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (domain.includes('linkedin.com')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  return <ExternalLink size={18} />;
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
            <p className="text-xs font-black uppercase text-gold tracking-widest">Objeto da Votação / Ementa</p>
          </div>
          {votacaoFull?.proposicaoObjeto && (
            <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${votacaoFull.proposicaoObjeto.id}`}
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-blue-400 font-bold hover:bg-blue-400/10 transition-all">
              Acessar Dados na Íntegra (API) <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                    <span className="text-xs text-slate-400 uppercase font-black tracking-widest">Autor(a):</span>
                    <span className="text-white text-sm font-bold">{info.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Flag size={12} className="text-blue-400" />
                    <span className="text-white text-sm font-bold">{info.partido}</span>
                    <span className="w-px h-3 bg-white/10 mx-1"></span>
                    <span className="text-slate-400 text-xs font-black">{info.uf}</span>
                  </div>
                </div>
              );
            })()}

            {votacaoFull?.ultimaApresentacaoProposicao?.descricao && (
              <p className="text-white text-base font-bold leading-relaxed border-l-2 border-gold/40 pl-4 py-1">
                {votacaoFull.ultimaApresentacaoProposicao.descricao}
              </p>
            )}
            <p className="text-slate-400 text-base leading-relaxed italic">
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
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
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
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
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
              <p className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <History size={14} /> Cronologia de Objetos ({votacaoFull.objetosPossiveis.length})
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {[...votacaoFull.objetosPossiveis].reverse().map((obj) => (
                  <div key={obj.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex items-start gap-4 group/obj">
                    <div className="flex flex-col items-center justify-center text-xs font-mono text-slate-500 px-2 py-1 bg-white/5 rounded-lg border border-white/5 min-w-[60px]">
                      <span>{new Date(obj.dataApresentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      <span className="text-gold font-bold">{new Date(obj.dataApresentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase border border-blue-500/20">
                          {obj.siglaTipo} {obj.numero}/{obj.ano > 0 ? obj.ano : ''}
                        </span>
                        <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${obj.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1 px-2.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-400 hover:text-gold rounded-xl transition-all text-sm flex items-center gap-2 group/link">
                          <span className="text-xs font-black uppercase tracking-tight transition-colors">Ver API</span>
                          <ExternalLink size={10} className="opacity-50 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed group-hover/obj:text-slate-300 transition-colors">
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
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <Flag size={12} /> Orientação da Bancada ({siglaPartido})
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${votoColor(orientacaoDeputado.orientacaoVoto)} bg-white/5`}>
                  <Flag size={16} />
                </div>
                <div>
                  <p className={`font-black text-base uppercase ${votoColor(orientacaoDeputado.orientacaoVoto)}`}>
                    {orientacaoDeputado.orientacaoVoto}
                  </p>
                  <p className="text-slate-600 text-xs font-medium">Recomendação oficial da liderança</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Placar Geral */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <LayoutDashboard size={12} /> Consenso da Casa
            </p>
            <div className="p-6 bg-navy/60 rounded-[2rem] border border-white/5 flex items-center justify-around gap-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              {placar && placar.total > 0 ? (
                <>
                  <div className="text-center group/v">
                    <p className="text-3xl font-black text-emerald-400 group-hover/v:scale-110 transition-transform">{placar.sim}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Sim</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center group/v">
                    <p className="text-3xl font-black text-red-400 group-hover/v:scale-110 transition-transform">{placar.nao}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Não</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center group/v text-slate-500">
                    <p className="text-xl font-black text-yellow-400 group-hover/v:scale-110 transition-transform">{placar.abstencao}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Abs.</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center group/v">
                    <p className="text-xl font-black text-orange-400 group-hover/v:scale-110 transition-transform">{placar.obstrucao}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Obs.</p>
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
              <p className="text-xs font-black uppercase text-slate-600 tracking-widest text-center">Panorama das Bancadas</p>
              <div className="flex flex-wrap justify-center gap-1.5 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                {orientacoes.map((o, oidx) => (
                  <div key={`orientacao-${row.original.id}-${o.siglaPartidoBloco}-${oidx}`} className="group/party px-2.5 py-1.5 bg-navy/80 border border-white/5 rounded-lg flex items-center gap-2 hover:border-white/20 transition-all">
                    <span className="text-xs font-black text-slate-400 group-hover/party:text-white">{o.siglaPartidoBloco}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${votoColor(o.orientacaoVoto).replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`} />
                    <span className={`text-xs font-bold ${votoColor(o.orientacaoVoto)}`}>{o.orientacaoVoto}</span>
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
function ReporterInfo({ uri }: { uri: string }) {
  const reporterId = parseInt(uri.split('/').pop() || '0');
  const { data: dep, isLoading } = useDeputado(reporterId);

  if (isLoading) return <div className="animate-pulse p-4 bg-white/5 rounded-2xl h-16" />;
  if (!dep) return null;

  return (
    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between group/rel">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 overflow-hidden bg-navy group-hover/rel:border-blue-400 transition-all">
          <img src={dep.ultimoStatus.urlFoto} alt={dep.ultimoStatus.nome} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Relator(a) Atual</span>
          <p className="text-white text-base font-bold truncate max-w-[150px] md:max-w-[200px]">
            {dep.ultimoStatus.nome}
          </p>
        </div>
      </div>
      <Link
        href={`/deputados/${dep.id}`}
        target="_blank"
        className="px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-black rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
      >
        VER PERFIL
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expansion for Propositions: Shows real status and tramitação
// ---------------------------------------------------------------------------
function ProposicaoDetailExpansion({ row }: { row: any }) {
  const propResumo = row.original;
  const { data: propFull, isLoading: loadingFull } = useProposicao(propResumo.id);
  const { data: autores, isLoading: loadingAutores } = useProposicaoAutores(propResumo.id);

  if (loadingFull || loadingAutores) {
    return (
      <div className="flex items-center justify-center py-10 gap-3 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        Buscando detalhes e autores na Câmara...
      </div>
    );
  }

  if (!propFull) {
    return (
      <div className="p-6 text-slate-500 text-sm italic">
        Não foi possível carregar os detalhes desta proposição no momento.
      </div>
    );
  }

  const status = propFull.statusProposicao;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Situação e Localização */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-400" /> Situação Atual
            </h4>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Última Movimentação</span>
                  <p className="text-white text-base font-bold leading-tight">
                    {status?.descricaoTramitacao || 'Processamento inicial'}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-500/10 space-y-1">
                  <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Situação Legislativa</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white text-sm font-medium">
                      {status?.descricaoSituacao || 'Em tramitação'}
                    </p>
                    {status?.ambito && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded">
                        {status.ambito}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 uppercase font-black pt-1">
                  Atualizado em: {status?.dataHora ? new Date(status.dataHora).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Building2 size={12} className="text-indigo-400" /> Localização / Órgão
            </h4>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-white text-base font-bold">{status?.siglaOrgao || 'Plenário / Setor Competente'}</p>
              <p className="text-xs text-slate-500 mt-1 italic leading-tight">
                {status?.despacho || 'Aguardando próxima etapa do rito legislativo.'}
              </p>
            </div>
          </div>

          {status?.uriUltimoRelator && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Users size={12} className="text-blue-400" /> Relatoria
              </h4>
              <ReporterInfo uri={status.uriUltimoRelator} />
            </div>
          )}
        </div>

        {/* Links e Ações */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <ExternalLink size={12} className="text-gold" /> Documentação Oficial
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <a href={propFull.urlInteiroTeor || `https://www.camara.leg.br/proposicoesWeb/fichadetetalhe?idProposicao=${propFull.id}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-gold/30 transition-all group/link">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">Inteiro Teor / Ficha</span>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover/link:text-gold transition-colors" />
              </a>

              <a href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${propFull.id}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-indigo-400/30 transition-all group/link">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <LayoutDashboard size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">Página do Projeto (Câmara)</span>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover/link:text-indigo-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Autores */}
        {autores && autores.length > 0 && (
          <div className="md:col-span-2 space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Users size={12} className="text-blue-400" /> Autores / Parlamentares ({autores.length})
            </h4>
            <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {autores.map((autor, aidx) => (
                  <div key={`autor-${propResumo.id}-${aidx}`}
                    className="px-3 py-2 bg-navy/60 border border-white/5 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-all group/auth">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                      {autor.nome.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-300 group-hover/auth:text-white truncate transition-colors leading-none">
                        {autor.nome}
                      </span>
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter mt-1">{autor.tipo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

  const [activeTab, setActiveTab] = useState('despesas');
  const [despesaYear, setDespesaYear] = useState(CURRENT_YEAR);
  const [despesaMonth, setDespesaMonth] = useState('all');

  // Modal de Auxílio-moradia
  const [showMoradiaModal, setShowMoradiaModal] = useState(false);
  const [beneficiosYear, setBeneficiosYear] = useState(new Date().getFullYear());

  const [frequenciaYear, setFrequenciaYear] = useState(CURRENT_YEAR);

  // Novos benefícios (Scraping + Supabase)
  const { data: beneficiosCard, isLoading: isLoadingBeneficiosCard } = useBeneficios(deputadoId, CURRENT_YEAR);
  const { data: beneficiosModal, isLoading: isLoadingBeneficiosModal } = useBeneficios(deputadoId, beneficiosYear);
  const { data: frequenciaCard, isLoading: isLoadingFrequenciaCard } = useFrequencia(deputadoId, frequenciaYear);
  const { data: dynamicYears } = useAnosEleito(deputadoId);

  const availableYears = useMemo(() => {
    return dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS;
  }, [dynamicYears]);

  const [despesaItens, setDespesaItens] = useState(15);
  const [despesaPage, setDespesaPage] = useState(1);
  const [votacaoPage, setVotacaoPage] = useState(1);
  const [votacaoItens, setVotacaoItens] = useState(10);
  const [votacaoYear, setVotacaoYear] = useState('2026');
  const [votacaoMonth, setVotacaoMonth] = useState('all');
  const [frentesSearch, setFrentesSearch] = useState('');
  const [showAllFrentes, setShowAllFrentes] = useState(false);

  // New States
  const [proposicaoPage, setProposicaoPage] = useState(1);
  const [proposicaoItens, setProposicaoItens] = useState(10);
  const [proposicaoYear, setProposicaoYear] = useState(CURRENT_YEAR);
  const [proposicaoMonth, setProposicaoMonth] = useState('all');
  const [discursoYear, setDiscursoYear] = useState(CURRENT_YEAR);
  const [discursoMonth, setDiscursoMonth] = useState('all');
  const [discursoPage, setDiscursoPage] = useState(1);
  const [discursoItens, setDiscursoItens] = useState(10);
  const [expandedDiscurso, setExpandedDiscurso] = useState<number | null>(null);

  const [emendaYear, setEmendaYear] = useState(CURRENT_YEAR);
  const [emendaPage, setEmendaPage] = useState(1);
  const [emendaItens, setEmendaItens] = useState(10);



  // Estado para o ano no gráfico de despesas (Resumo)
  const [expenseSelectedYear, setExpenseSelectedYear] = useState(new Date().getFullYear());

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

  const { discursoDataInicio, discursoDataFim } = useMemo(() => {
    if (discursoMonth === 'all') {
      return { discursoDataInicio: `${discursoYear}-01-01`, discursoDataFim: `${discursoYear}-12-31` };
    } else {
      const lastDay = new Date(discursoYear, parseInt(discursoMonth), 0).getDate();
      return {
        discursoDataInicio: `${discursoYear}-${discursoMonth}-01`,
        discursoDataFim: `${discursoYear}-${discursoMonth}-${lastDay}`
      };
    }
  }, [discursoYear, discursoMonth]);

  // Fix Discursos range if 'all' is selected (avoiding potential API limits)
  const discourseParams = useMemo(() => {
    const params: any = { pagina: discursoPage, itens: discursoItens };
    if (discursoMonth === 'all') {
      // For speeches, if all months are selected, we might want to avoid a massive range if the API complains.
      // However, /deputados/{id}/discursos usually works by year indirectly or doesn't have the 3-month limit like /proposicoes.
      // We'll pass a 12-month range but if it fails, the user might need to select a month.
      params.dataInicio = `${discursoYear}-01-01`;
      params.dataFim = `${discursoYear}-12-31`;
    } else {
      params.dataInicio = discursoDataInicio;
      params.dataFim = discursoDataFim;
    }
    return params;
  }, [discursoYear, discursoMonth, discursoDataInicio, discursoDataFim, discursoPage, discursoItens]);

  const { proposicaoSelectedYear } = useMemo(() => {
    return {
      proposicaoSelectedYear: proposicaoYear
    };
  }, [proposicaoYear]);

  const { data: dep, isLoading, isError, refetch } = useDeputado(deputadoId);
  const { data: despesasData, isLoading: loadingDesp, isFetching: fetchingDesp } = useDeputadoDespesas(deputadoId, {
    ano: despesaYear,
    mes: despesaMonth === 'all' ? undefined : parseInt(despesaMonth),
    pagina: despesaPage,
    itens: despesaItens,
  });
  const { data: orgaosData, isLoading: loadingOrgaos } = useDeputadoOrgaos(deputadoId);
  const { data: frentesData, isLoading: loadingFrentes } = useDeputadoFrentes(deputadoId);

  const { data: votacoesData, isLoading: loadingVotacoes } = useVotacoes({
    dataInicio: votacaoDataInicio,
    dataFim: votacaoDataFim,
    itens: votacaoItens,
  });

  // New Data Hooks
  const { data: discursosData, isLoading: loadingDiscursos } = useDeputadoDiscursos(deputadoId, discourseParams);
  const { data: proposicaoTotalsFiltered, isLoading: loadingTotalsFiltered } = useProposicaoTotals(deputadoId, {
    ano: proposicaoYear
  });

  const { data: emendasData, isLoading: loadingEmendas } = useDeputadoEmendas(deputadoId, emendaYear);
  const emendas = emendasData || [];

  const { data: proposicoesData, isLoading: loadingProposicoes } = useProposicoesByAutor(deputadoId, {
    pagina: proposicaoPage,
    itens: proposicaoMonth === 'all' ? proposicaoItens : 100, // Fetch more to allow FE filtering
    ano: proposicaoSelectedYear,
  });

  const displayProposicoes = useMemo(() => {
    const raw = proposicoesData?.items || [];
    if (proposicaoMonth === 'all') return raw;
    return raw.filter(p => {
      const pMonth = new Date(p.dataApresentacao).getMonth() + 1;
      return pMonth === parseInt(proposicaoMonth);
    });
  }, [proposicoesData?.items, proposicaoMonth]);

  const displayCount = useMemo(() => {
    if (proposicaoMonth === 'all') return proposicoesData?.totalItems || 0;
    return displayProposicoes.length;
  }, [proposicoesData?.totalItems, displayProposicoes.length, proposicaoMonth]);

  const proposicoes = proposicoesData?.items || [];
  const totalPaginasProposicoes = proposicoesData?.totalPaginas;
  const hasNextProposicoes = proposicoesData?.hasNext || false;

  const despesas = despesasData?.items || [];
  const totalPaginasDespesas = despesasData?.totalPaginas;
  const hasNextDesp = despesasData?.hasNext || false;
  const orgaos = orgaosData?.items?.filter(o => !o.dataFim) || []; // only active
  const frentes = frentesData || [];
  const votacoes = votacoesData?.items || [];
  const hasNextVotacoes = votacoesData?.hasNext || false;
  const totalPaginasVotacoes = votacoesData?.totalPaginas;

  const discursos = discursosData?.items || [];
  const totalPaginasDiscursos = discursosData?.totalPaginas;
  const hasNextDiscursos = discursosData?.hasNext || false;

  // Emendas Pagination (Client Side)
  const totalEmendas = emendas.length;
  const totalPaginasEmendas = Math.ceil(totalEmendas / emendaItens);
  const currentEmendas = useMemo(() => {
    const start = (emendaPage - 1) * emendaItens;
    return emendas.slice(start, start + emendaItens);
  }, [emendas, emendaPage, emendaItens]);
  const hasNextEmendas = emendaPage < totalPaginasEmendas;

  const searchName = dep?.ultimoStatus.nome;
  const {
    data: secretarios,
    isLoading: loadingSecretarios,
    isError: errorSecretarios,
    error: secretarioError
  } = useSecretarios(searchName);

  const filteredSecretarios = useMemo(() => {
    if (!secretarios) return [];
    if (!beneficiosCard?.pessoal_gabinete_nomes || beneficiosCard.pessoal_gabinete_nomes.length === 0) {
      return secretarios;
    }

    // Normalize names for comparison (remove accents and to lowercase)
    const activeNames = beneficiosCard.pessoal_gabinete_nomes.map(n =>
      n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    );

    return secretarios.filter(s => {
      const normalizedS = s.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      // Look for the name in the active list - using fuzzy match to account for abbreviations
      return activeNames.some(active => {
        // Simple heuristic: if the names are very similar or one contains the other
        if (normalizedS === active) return true;

        // Split names to check components (handles abbreviations like "JOAO S. SILVA")
        const partsS = normalizedS.split(/\s+/);
        const partsA = active.split(/\s+/);

        // If first and last name match, consider it a match
        if (partsS[0] === partsA[0] && partsS[partsS.length - 1] === partsA[partsA.length - 1]) return true;

        return false;
      });
    });
  }, [secretarios, beneficiosCard?.pessoal_gabinete_nomes]);

  const { data: aggregatedExpenses, isLoading: loadingAggregatedExpenses } = useDeputadoDespesasAggregation(deputadoId, expenseSelectedYear);
  const { data: tabAggregatedExpenses, isLoading: loadingTabAggregatedExpenses } = useDeputadoDespesasAggregation(deputadoId, despesaYear);

  const totalAnualCota = useMemo(() => {
    return tabAggregatedExpenses?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  }, [tabAggregatedExpenses]);

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
          <span className="text-xs text-slate-500">{new Date(getValue() as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'objeto',
      header: 'Objeto da Votação',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-white font-black tracking-tight text-sm uppercase">
            {row.original.proposicaoObjeto && typeof row.original.proposicaoObjeto === 'object'
              ? `${(row.original.proposicaoObjeto as any).siglaTipo} ${(row.original.proposicaoObjeto as any).numero}/${(row.original.proposicaoObjeto as any).ano}`
              : row.original.descricao || 'Votação de Expediente'}
          </span>
          <p className="text-xs text-slate-500 line-clamp-1 italic">{row.original.descricao}</p>
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
            <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-xs font-black rounded border border-white/5 whitespace-nowrap">
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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${(getValue() as number) === 1
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

  const proposicaoColumns = useMemo<ColumnDef<Proposicao>[]>(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'dataApresentacao',
      header: 'Data',
      cell: ({ row }) => {
        const dataStr = row.original.dataApresentacao;
        if (!dataStr) return <span className="text-slate-500">—</span>;
        return (
          <div className="flex flex-col">
            <span className="text-white font-bold">{new Date(dataStr).toLocaleDateString('pt-BR')}</span>
            <span className="text-xs text-slate-500">{new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'siglaTipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const sigla = row.original.siglaTipo;
        const nomeCompleto = PROPOSICOES_MAP[sigla] || 'Tipo de Matéria Legislativa';
        return (
          <div className="flex items-center gap-2 group/tip relative">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-black rounded border border-blue-500/20 uppercase">
              {sigla}
            </span>
            <div className="p-1 bg-blue-500/10 text-blue-400 rounded-full cursor-help hover:bg-blue-500/20 transition-all shadow-sm" title={nomeCompleto}>
              <Info size={12} />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'numero',
      header: 'Número/Ano',
      cell: ({ row }) => (
        <span className="text-white font-black text-sm">
          {row.original.numero}/{row.original.ano}
        </span>
      )
    },
    {
      accessorKey: 'ementa',
      header: 'Ementa / Assunto',
      cell: ({ getValue }) => (
        <p className="text-xs text-slate-400 line-clamp-2 italic max-w-md leading-relaxed group-hover:text-slate-300 transition-colors">
          {getValue() as string}
        </p>
      )
    },
    {
      accessorKey: 'statusProposicao.descricaoSituacao',
      header: 'Situação',
      cell: ({ row }) => {
        const situacao = row.original.statusProposicao?.descricaoSituacao;
        return (
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 border rounded-full text-xs font-bold transition-all ${situacao
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-white/5 border-white/5 text-slate-500 italic'
              }`}>
              {situacao || 'Clique p/ ver detalhes'}
            </div>
            <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${row.original.id}`}
              target="_blank" rel="noopener noreferrer"
              className="p-1.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-500 hover:text-gold rounded-xl transition-all group/api"
              title="Ver Dados Completos (API)">
              <ExternalLink size={10} className="opacity-50 group-hover/api:opacity-100 transition-opacity" />
            </a>
          </div>
        );
      }
    }
  ], []);

  const despesaColumns = useMemo<ColumnDef<Despesa>[]>(() => [
    {
      accessorKey: 'dataDocumento',
      header: 'Data',
      cell: ({ getValue }) => {
        const date = getValue() as string;
        if (!date) return '-';
        return <span className="text-white font-medium">{new Date(date).toLocaleDateString('pt-BR')}</span>;
      }
    },
    {
      accessorKey: 'tipoDespesa',
      header: 'Categoria',
      cell: ({ getValue }) => (
        <div className="max-w-[280px] truncate font-bold text-white uppercase text-[11px] tracking-tight" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'nomeFornecedor',
      header: 'Fornecedor',
      cell: ({ getValue }) => (
        <div className="max-w-[200px] truncate text-slate-500 text-xs font-medium" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'valorLiquido',
      header: 'Valor',
      cell: ({ getValue }) => (
        <span className="font-mono font-black text-emerald-400">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      id: 'documento',
      header: 'Doc',
      cell: ({ row }) => {
        const url = row.original.urlDocumento;
        if (!url) return null;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all inline-flex items-center group/doc"
            title="Ver nota fiscal (XML/PDF)">
            <ExternalLink size={14} className="opacity-50 group-hover/doc:opacity-100 transition-opacity" />
          </a>
        );
      }
    }
  ], []);

  function EmendaDetailExpansion({ row }: { row: any }) {
    const emenda = row.original;
    return (
      <div className="p-6 bg-navy/40 animate-in fade-in duration-500">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">Objeto / Descrição da Emenda</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
            <p className="text-white text-base leading-relaxed italic">
              {emenda.objetivo || "Descrição não disponível para este registro."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase block">Ano Orçamentário</span>
              <span className="text-white text-sm font-bold">{emenda.ano}</span>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase block">Beneficiário / Localidade</span>
              <span className="text-white text-sm font-bold">{emenda.localidade || "Nacional / Diversas"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const emendaColumns = useMemo<ColumnDef<EmendaOrcamentaria>[]>(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'orgaoConcedente',
      header: 'Órgão Concedente',
      cell: ({ getValue }) => (
        <div className="max-w-[180px] font-black text-white text-[10px] uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'objetivo',
      header: 'Objeto (Resumo)',
      cell: ({ getValue }) => (
        <div className="max-w-[150px] truncate text-slate-500 text-[9px] italic font-medium" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'valorAutorizado',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Autorizado</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-emerald-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            A emenda foi aprovada pelo Congresso Nacional e passou a integrar a Lei Orçamentária Anual.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-slate-400">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      accessorKey: 'valorEmpenhado',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Empenhado</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-blue-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            A verba foi reservada pelo Poder Executivo para o gasto destinado pela emenda.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-blue-400/80">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      accessorKey: 'valorPago',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Pago</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-emerald-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            O valor da emenda foi transferido para o estado ou município de destino.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-black text-emerald-400">
          {formatCurrency(getValue() as number)}
        </span>
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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Nav */}
      <Link href="/deputados" className="group inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-all text-sm font-medium mb-10">
        <div className="p-2 bg-slate-card rounded-xl border border-white/5 group-hover:border-gold/30 transition-all">
          <ArrowLeft size={16} />
        </div>
        Voltar para lista de deputados
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar: Informações do Deputado */}
        <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
          <div className="bg-navy/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 space-y-8 overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            {/* Efeito de iluminação premium */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] -mr-16 -mt-16 rounded-full"></div>

            {/* Foto de Perfil Premium */}
            <div className="relative group/avatar flex flex-col items-center">
              <div className="relative">
                {/* Glow dinâmico */}
                <div className="absolute inset-0 bg-gold/30 rounded-[3rem] blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-all duration-700 scale-90 group-hover/avatar:scale-100"></div>

                {/* Moldura multi-camada */}
                <div className="relative w-52 h-52 rounded-[3.5rem] p-1.5 bg-gradient-to-br from-gold/50 via-white/5 to-navy border border-white/10 shadow-2xl z-10 overflow-hidden group-hover/avatar:translate-y-[-4px] transition-transform duration-500">
                  <div className="w-full h-full rounded-[3rem] overflow-hidden relative">
                    <Image
                      src={status.urlFoto}
                      alt={status.nome}
                      width={208}
                      height={208}
                      className="object-cover w-full h-full scale-105 group-hover/avatar:scale-115 transition-transform duration-1000 ease-out"
                      unoptimized
                      priority
                    />
                    {/* Overlay de vinheta suave na foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                </div>

                {/* Badge de Status Flutuante */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] z-20 border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-[0.15em] whitespace-nowrap">
                    {status.situacao}
                  </span>
                </div>
              </div>
            </div>

            {/* Identificação Principal Modernizada */}
            <div className="text-center space-y-4 pt-4 relative z-10">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-[0.9] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text">
                  {status.nome}
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{dep.nomeCivil}</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="group/badge relative">
                  <div className="absolute inset-0 bg-gold/20 blur-lg opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
                  <span className="relative px-4 py-1.5 bg-gold/10 text-gold text-[10px] font-black rounded-xl border border-gold/20 tracking-widest block transition-all group-hover/badge:bg-gold/20">
                    {status.siglaPartido}
                  </span>
                </div>

                <div className="group/badge relative">
                  <div className="absolute inset-0 bg-white/10 blur-lg opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
                  <span className="relative px-4 py-1.5 bg-white/5 text-slate-300 text-[10px] font-black rounded-xl border border-white/10 flex items-center gap-2 uppercase tracking-widest transition-all group-hover/badge:bg-white/10">
                    <MapPin size={12} className="text-gold" />
                    {status.siglaUf}
                  </span>
                </div>
              </div>

              <a
                href={`https://www.camara.leg.br/deputados/${dep.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gold/10 text-[9px] font-black text-slate-400 hover:text-gold uppercase tracking-[0.2em] rounded-xl border border-white/5 hover:border-gold/30 transition-all group/official shadow-sm mt-3"
              >
                <ExternalLink size={12} className="group-hover/official:translate-x-0.5 group-hover/official:-translate-y-0.5 transition-transform" />
                Perfil Oficial Câmara
              </a>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

            {/* Informações Biográficas */}
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4 group/bio">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover/bio:text-gold group-hover/bio:bg-gold/10 transition-all duration-300">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Escolaridade</span>
                  <span className="text-white text-xs font-bold leading-tight block truncate">{dep.escolaridade}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 group/bio">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover/bio:text-gold group-hover/bio:bg-gold/10 transition-all duration-300">
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Nascimento</span>
                  <span className="text-white text-xs font-bold block">{new Date(dep.dataNascimento).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

            {/* Contato Gabinete */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gabinete</p>
              </div>

              <div className="p-4 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 group/gab transition-all hover:bg-white/10 hover:border-white/10 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Building2 size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">Endereço</span>
                    <p className="text-white text-xs font-bold truncate">Prédio {gabinete.predio}, Sala {gabinete.sala}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Phone size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">Telefone</span>
                    <p className="text-white text-xs font-bold">{gabinete.telefone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Mail size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">E-mail</span>
                    <p className="text-white text-[10px] font-bold truncate hover:text-gold transition-colors cursor-pointer">{gabinete.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            {/* Redes Sociais Modernizadas */}
            {dep.redeSocial?.length > 0 && (
              <div className="pt-2 px-2">
                <div className="flex flex-wrap gap-3">
                  {dep.redeSocial.map((url, i) => (
                    <a
                      key={`${url}-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-white/5 text-slate-400 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy hover:translate-y-[-4px] hover:shadow-[0_8px_20px_-6px_rgba(212,175,55,0.4)] transition-all duration-300 group/social"
                      title={new URL(url).hostname.replace('www.', '')}
                    >
                      <div className="group-hover/social:scale-110 transition-transform duration-300">
                        {getSocialIcon(url)}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-12" id="deputado-content-tabs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. DISTRIBUIÇÃO DE GASTOS (DESTAQUE TOTAL) */}
            <div className="md:col-span-2 lg:col-span-3 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group/chart h-full min-h-[500px] flex flex-col shadow-2xl">
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover/chart:bg-indigo-500/20 transition-all duration-1000"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-8">
                <div className="flex items-center gap-5">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Distribuição de Gastos</h3>
                    <p className="text-slate-500 text-sm font-medium">Análise proporcional da cota parlamentar em {expenseSelectedYear}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-indigo-500/40 hover:bg-white/10 group/sel shadow-inner">
                    <Calendar size={16} className="text-indigo-400" />
                    <select
                      value={expenseSelectedYear}
                      onChange={(e) => setExpenseSelectedYear(parseInt(e.target.value))}
                      className="bg-transparent border-none text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer pr-2"
                    >
                      {availableYears.map(y => <option key={`exp-year-${y}`} value={y} className="bg-navy">{y}</option>)}
                    </select>
                    <ChevronDown size={14} className="text-slate-500 group-hover/sel:text-white transition-colors" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <ExpensesDonutChart
                  data={aggregatedExpenses || []}
                  loading={loadingAggregatedExpenses}
                />
              </div>
            </div>

            {/* 2. EQUIPE DE GABINETE (LATERAL) */}
            <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-6 flex flex-col group/equipe shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover/equipe:opacity-100 transition-opacity"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">

                  <div>
                    <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">Equipe</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Assessores ativos</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full shadow-lg shadow-purple-500/5">
                  <span className="text-purple-400 font-black text-sm">{filteredSecretarios?.length || 0}</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 relative z-10">
                {loadingSecretarios ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
                ) : filteredSecretarios && filteredSecretarios.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-[540px]">
                    {filteredSecretarios.map((sec, i) => (
                      <div key={`${sec.nome}-${i}`} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all group/item relative overflow-hidden shadow-sm">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-white text-sm font-black uppercase truncate flex-1 group-hover/item:text-purple-400 transition-colors">{sec.nome}</p>
                          <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tighter shadow-sm ${sec.cargo.startsWith('CNE')
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                            }`}>
                            {sec.cargo.startsWith('CNE') ? 'CNE' : 'SP'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold truncate mb-3">{sec.cargo}</p>

                        <div className="flex items-center gap-3">
                          {sec.remuneracao_bruta && sec.remuneracao_bruta > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 rounded-xl border border-emerald-500/20 shadow-sm" title={`Líquido Aproximado: ${formatCurrency(sec.remuneracao_liquida || 0)}`}>
                              <DollarSign size={10} className="text-emerald-400" />
                              <span className="text-[10px] font-black text-emerald-400">{formatCurrency(sec.remuneracao_bruta || 0)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                            <MapPin size={10} /> {dep?.ultimoStatus.siglaUf}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
                    <Users size={40} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-slate-500 text-sm italic">Nenhum assessor identificado.</p>
                  </div>
                )}
              </div>

            </div>

            {/* 2b. RECURSOS E BENEFÍCIOS (Cota de 2026) */}
            <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-8 flex flex-col group/beneficios shadow-2xl relative hover:z-50 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

              <div className="flex items-center gap-5 relative z-10">

                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Benefícios</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">Recursos do Mandato • 2026</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 relative z-10">
                {isLoadingBeneficiosCard ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-white/[0.03] rounded-[1.5rem] border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group/item shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-transform"><DollarSign size={16} /></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salário Bruto</span>
                      </div>
                      <span className="text-white font-black text-sm">{beneficiosCard?.salario_bruto || '—'}</span>
                    </div>

                    <div className="p-3.5 bg-white/[0.03] rounded-[1.5rem] border border-white/5 hover:border-blue-500/30 transition-all space-y-4 group/item shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform"><Home size={16} /></div>
                          <div className="flex items-center gap-2 group/tip relative">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moradia</span>
                            <HelpCircle size={10} className="text-slate-600 hover:text-blue-400 transition-colors cursor-help" />
                            <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl text-[9px] leading-relaxed text-slate-300 invisible group-hover/tip:visible z-[100] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 translate-y-2 group-hover/tip:translate-y-0">
                              <p className="font-black text-white mb-2 uppercase text-[8px] tracking-[0.2em] border-b border-white/10 pb-1.5">Regras Oficiais</p>
                              <span className="block mb-2 text-blue-300 font-bold opacity-80">
                                <strong className="text-white">Imóvel Funcional:</strong> Uso de um dos 447 apartamentos funcionais em Brasília.
                              </span>
                              <span className="block text-slate-400 font-medium">
                                <strong className="text-white italic">Auxílio-moradia:</strong> Cota de R$ 4.253,00 para quem não ocupa imóvel oficial.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Imóvel funcional</span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${beneficiosCard?.imovel_funcional?.includes('Faz uso') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10' : 'bg-white/5 text-slate-500 border border-white/5 opacity-60'}`}>
                            {beneficiosCard?.imovel_funcional || 'Não informado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auxílio-moradia</span>
                          <div className="flex flex-col items-end">
                            <button
                              onClick={() => beneficiosCard?.auxilio_moradia_mensal && setShowMoradiaModal(true)}
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-2 transition-all relative overflow-hidden group/btn
                            ${beneficiosCard?.auxilio_moradia?.includes('Não recebe')
                                  ? 'bg-white/5 text-slate-500 border border-white/5 opacity-60'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'}
                            ${beneficiosCard?.auxilio_moradia_mensal
                                  ? 'cursor-pointer hover:bg-blue-500/20 active:scale-95'
                                  : 'cursor-default'}`}>
                              {beneficiosCard?.auxilio_moradia || 'Não informado'}
                              {beneficiosCard?.auxilio_moradia_mensal && <Info size={12} className="opacity-60 group-hover/btn:scale-125 transition-transform" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-400/30 transition-all flex items-center justify-between group/passport">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Globe size={14} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Passaporte</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg ${beneficiosCard?.passaporte_diplomatico?.includes('Possui') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm shadow-purple-500/10' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                        {beneficiosCard?.passaporte_diplomatico || 'Não informado'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-400/30 transition-all flex items-center justify-between group/mission">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 transition-all"><Plane size={14} /></div>
                        <div className="flex items-center gap-2 group/tip relative">
                          <span className="text-xs font-bold text-slate-400 uppercase">Missões</span>
                          <HelpCircle size={10} className="text-slate-600 hover:text-rose-400 transition-colors cursor-help" />
                          <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl text-[9px] leading-relaxed text-slate-300 invisible group-hover/tip:visible z-[100] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 translate-y-2 group-hover/tip:translate-y-0">
                            <p className="font-black text-white mb-2 uppercase text-[8px] tracking-[0.2em] border-b border-white/10 pb-1.5">Custos de Viagem</p>
                            <p className="font-medium">
                              Diárias para missões oficiais: <strong className="text-rose-400">R$ 842,00</strong> (nacionais),
                              <strong className="text-rose-400"> US$ 391,00</strong> (América do Sul) e
                              <strong className="text-rose-400"> US$ 428,00</strong> (outros países).
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="text-white font-black text-sm">
                        {beneficiosCard?.viagens_missao || '0'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-all flex items-center justify-between group/office">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Users size={14} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Gabinete</span>
                      </div>
                      <span className="text-white font-black text-[10px] text-right leading-tight max-w-[140px]">
                        {beneficiosCard?.pessoal_gabinete || 'Não informado'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. COMISSÕES E ÓRGÃOS (LATERAL) */}
            <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-8 flex flex-col group/comis h-full shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover/comis:opacity-100 transition-opacity"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">Comissões</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Atuação ativa</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-500/5">
                  <span className="text-emerald-400 font-black text-sm">{orgaos.length}</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 relative z-10">
                {loadingOrgaos ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
                ) : orgaos.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar h-[480px]">
                    {orgaos.map((orgao) => (
                      <div key={orgao.idOrgao} className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all space-y-3 group/item shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 group-hover/item:bg-emerald-500/30 transition-colors">{orgao.siglaOrgao}</span>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{orgao.titulo}</span>
                        </div>
                        <p className="text-slate-200 text-[13px] font-bold leading-relaxed group-hover:text-white transition-colors">{orgao.nomePublicacao || orgao.nomeOrgao}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10 opacity-50">
                    <p className="text-slate-500 text-sm italic">Nenhuma participação identificada.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3b. FREQUÊNCIA E PRESENÇA (COMPACTO E REFINADO) */}
            <style dangerouslySetInnerHTML={{
              __html: `
              .vertical-text {
                writing-mode: vertical-rl;
                transform: rotate(180deg);
                display: flex;
                align-items: center;
                justify-content: center;
              }
            `}} />

            <div className="lg:col-span-3 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 lg:p-7 space-y-6 flex flex-col group/freq shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-amber-500/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-0.5">Frequência Parlamentar</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Sessões e Reuniões • {frequenciaYear}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-amber-500/40 hover:bg-white/10 group/sel shadow-inner">
                    <Calendar size={14} className="text-amber-400" />
                    <select
                      value={frequenciaYear}
                      onChange={(e) => setFrequenciaYear(parseInt(e.target.value))}
                      className="bg-transparent border-none text-[10px] font-black text-white focus:outline-none appearance-none cursor-pointer pr-1 uppercase"
                    >
                      {availableYears.map(y => <option key={`freq-y-${y}`} value={y} className="bg-navy">{y}</option>)}
                    </select>
                    <ChevronDown size={12} className="text-slate-500 group-hover/sel:text-white transition-colors" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1">
                {isLoadingFrequenciaCard ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                    <div className="h-24 bg-white/5 rounded-2xl" />
                    <div className="h-24 bg-white/5 rounded-2xl" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                    {/* Plenário Section */}
                    <div className="flex items-stretch gap-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/plen">
                      <div className="flex flex-col gap-1 items-center justify-center px-3 border-r border-white/10 shrink-0">
                        <div className="w-1 h-8 bg-amber-500 rounded-full mb-1"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter vertical-text opacity-30">PLENÁRIO</span>
                      </div>

                      <div className="flex-1 flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Presenças</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.plenario?.dias_presenca ||
                              frequenciaCard.plenario.dias_presenca.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className="text-xl font-black text-white tracking-tighter">{frequenciaCard.plenario.dias_presenca}</span>
                            )}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Justific.</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.plenario?.dias_ausencias_justificadas ||
                              frequenciaCard.plenario.dias_ausencias_justificadas.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className="text-xl font-black text-white tracking-tighter">{frequenciaCard.plenario.dias_ausencias_justificadas}</span>
                            )}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Faltas</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.plenario?.dias_ausencias_nao_justificadas ||
                              frequenciaCard.plenario.dias_ausencias_nao_justificadas.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className={`text-xl font-black tracking-tighter ${parseInt(frequenciaCard?.plenario?.dias_ausencias_nao_justificadas || '0') > 0 ? 'text-red-400' : 'text-white'}`}>
                                {frequenciaCard.plenario.dias_ausencias_nao_justificadas}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>


                    {/* Comissões Section */}
                    <div className="flex items-stretch gap-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/com">
                      <div className="flex flex-col gap-1 items-center justify-center px-3 border-r border-white/10 shrink-0">
                        <div className="w-1 h-8 bg-emerald-500 rounded-full mb-1"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter vertical-text opacity-30">COMISSÕES</span>
                      </div>

                      <div className="flex-1 flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Presenças</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.comissoes?.presenca ||
                              frequenciaCard.comissoes.presenca.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className="text-xl font-black text-white tracking-tighter">{frequenciaCard.comissoes.presenca}</span>
                            )}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Justific.</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.comissoes?.ausencias_justificadas ||
                              frequenciaCard.comissoes.ausencias_justificadas.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className="text-xl font-black text-white tracking-tighter">{frequenciaCard.comissoes.ausencias_justificadas}</span>
                            )}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Faltas</span>
                          <span className="flex items-center">
                            {(!frequenciaCard?.comissoes?.ausencias_nao_justificadas ||
                              frequenciaCard.comissoes.ausencias_nao_justificadas.toLowerCase().includes('indispon')) ? (
                              <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>
                            ) : (
                              <span className={`text-xl font-black tracking-tighter ${parseInt(frequenciaCard?.comissoes?.ausencias_nao_justificadas || '0') > 0 ? 'text-red-400' : 'text-white'}`}>
                                {frequenciaCard.comissoes.ausencias_nao_justificadas}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>




            {/* 4. PRODUÇÃO LEGISLATIVA (DESTAQUE) */}
            <div className="md:col-span-2 lg:col-span-3 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 lg:p-10 relative overflow-hidden group/prod flex flex-col h-full shadow-2xl">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] group-hover/prod:bg-blue-500/10 transition-all duration-700"></div>
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent opacity-30"></div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10 mb-8">
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Produção Legislativa</h3>
                  <p className="text-slate-500 text-sm font-medium">Histórico acumulado de proposições e atos</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-blue-500/40 hover:bg-white/10 group/sel shadow-inner">
                    <Calendar size={16} className="text-blue-400" />
                    <select
                      value={proposicaoYear}
                      onChange={(e) => setProposicaoYear(parseInt(e.target.value))}
                      className="bg-transparent border-none text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer pr-2"
                    >
                      {availableYears.map(y => <option key={`prop-year-${y}`} value={y} className="bg-navy">{y}</option>)}
                    </select>
                    <ChevronDown size={14} className="text-slate-500 group-hover/sel:text-white transition-colors" />
                  </div>
                  <a
                    href={`https://www.camara.leg.br/deputados/${deputadoId}?ano=${proposicaoYear}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/20 group/link shadow-sm"
                    title={`Ver todas as propostas no Portal da Câmara`}
                  >
                    <ExternalLink size={18} className="group-hover/link:scale-110 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-nowrap overflow-x-auto no-scrollbar pb-4 relative z-10">
                {/* Totais */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-gold/20">
                  <FileCheck size={18} className="text-gold" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest leading-none mb-1">Autoria</span>
                    <span className="text-xl font-black text-white leading-none tracking-tighter">{proposicaoTotalsFiltered?.total || 0}</span>
                  </div>
                </div>

                {/* Relatorias */}
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-blue-500/20">
                  <Gavel size={18} className="text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest leading-none mb-1">Relatorias</span>
                    <span className="text-xl font-black text-white leading-none tracking-tighter">{proposicaoTotalsFiltered?.relatadas || 0}</span>
                  </div>
                </div>

                {/* Atos Processuais */}
                <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-indigo-500/20">
                  <History size={18} className="text-indigo-400" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest leading-none">Atos Proc.</span>
                      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter opacity-40">Burocracia</span>
                    </div>
                    <span className="text-xl font-black text-white leading-none tracking-tighter">
                      {(proposicaoTotalsFiltered?.total || 0) - (proposicaoTotalsFiltered?.apiTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
                {loadingTotalsFiltered ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(proposicaoTotalsFiltered?.counts || {})
                      .sort(([, a], [, b]) => b - a)
                      .map(([tipo, count]) => {
                        const nomeCompleto = PROPOSICOES_MAP[tipo] || `Sigla: ${tipo}`;
                        return (
                          <div key={tipo} className="group flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-white font-black text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">{tipo}</span>
                              <span className="text-slate-600 text-[9px] font-bold uppercase truncate max-w-[120px]" title={nomeCompleto}>{nomeCompleto}</span>
                            </div>
                            <span className="text-white font-black text-2xl tracking-tighter">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-5 bg-white/[0.03] p-6 rounded-[2rem] relative z-10">
                <div className="w-12 h-12 bg-indigo-500/15 rounded-[1rem] flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                  <Info size={24} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    Por que os totais divergem?
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md text-[9px]">Exclusivo Portal Câmara</span>
                  </h4>
                  <p className="text-slate-400 text-[10px] font-medium leading-relaxed italic">
                    A diferença de <span className="text-white font-bold">{(proposicaoTotalsFiltered?.total || 0) - (proposicaoTotalsFiltered?.apiTotal || 0)} atos</span> refere-se a formalidades processuais e administrativas (como retirada de pauta, requerimentos formais ou correções de texto).
                    A lista de <span className="text-white font-bold">Projetos</span> exibe apenas proposições de mérito reais (Leis, PECs, etc), enquanto o total da Câmara engloba toda a movimentação burocrática parlamentar.
                  </p>
                </div>
              </div>
            </div>


          </div>




          <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide border-b border-white/5 no-scrollbar">
            {[
              { id: 'despesas', label: 'Despesas', icon: Receipt, color: 'emerald' },
              { id: 'frentes', label: 'Frentes', icon: Flag, color: 'amber' },
              { id: 'votacoes', label: 'Votações', icon: Vote, color: 'blue' },
              { id: 'trabalho', label: 'Trabalho', icon: FileText, color: 'indigo' },
              { id: 'discursos', label: 'Discursos', icon: Info, color: 'purple' },
              { id: 'emendas', label: 'Emendas', icon: PiggyBank, color: 'emerald' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap shadow-sm active:scale-95 border
                ${isActive
                      ? `bg-${tab.color}-500/10 text-${tab.color}-400 border-${tab.color}-500/30 shadow-${tab.color}-500/5`
                      : 'text-slate-500 hover:bg-white/5 border-transparent'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ================================================================ */}
          {/* TABS CONTENT */}
          {/* ================================================================ */}
          <div className="pt-2 min-h-[400px]">

            {/* Conteúdo das Abas Remanejado */}
            {/* TAB: DESPESAS */}
            {activeTab === 'despesas' && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Despesas da Cota</h2>
                      <p className="text-slate-500 text-xs italic">Cota para Exercício da Atividade Parlamentar (CEAP)</p>
                    </div>
                  </div>

                  {(totalAnualCota > 0 || loadingTabAggregatedExpenses) && (
                    <div className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/5 transition-all hover:bg-emerald-500/15 min-w-[200px]">
                      <div className="flex-1">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Total Anual ({despesaYear})</span>
                        {loadingTabAggregatedExpenses ? (
                          <div className="h-7 w-32 bg-emerald-500/10 animate-pulse rounded-lg"></div>
                        ) : (
                          <span className="text-2xl font-black text-emerald-400 leading-none">{formatCurrency(totalAnualCota)}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* FILTROS DE DESPESAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group/filters">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/filters:bg-gold/10 transition-all"></div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gold shadow-inner">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        Ano Fiscal
                      </label>
                      <select
                        value={despesaYear}
                        onChange={(e) => { setDespesaYear(parseInt(e.target.value)); setDespesaPage(1); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all hover:bg-white/10 cursor-pointer appearance-none"
                      >
                        {YEARS.map(y => <option key={`exp-y-${y}`} value={y} className="bg-navy">{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-blue-400 shadow-inner">
                      <History size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        Mês de Referência
                      </label>
                      <select
                        value={despesaMonth}
                        onChange={(e) => { setDespesaMonth(e.target.value); setDespesaPage(1); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-white/10 cursor-pointer appearance-none"
                      >
                        {MONTHS.map(m => <option key={`exp-m-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    {fetchingDesp && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold text-xs font-bold rounded-xl border border-gold/20 animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        SINCROZINANDO DADOS...
                      </div>
                    )}
                  </div>
                </div>

                {loadingDesp ? (
                  <TableSkeleton rows={10} />
                ) : despesas.length > 0 ? (
                  <div className="bg-slate-card/60 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <DataTable
                      columns={despesaColumns}
                      data={despesas}
                      getRowId={(row) => String(row.codDocumento)}
                    />

                    <div className="p-6 border-t border-white/5">
                      <Pagination
                        page={despesaPage}
                        totalPaginas={totalPaginasDespesas}
                        hasNext={hasNextDesp}
                        itensPerPage={despesaItens}
                        onItensPerPageChange={(n) => { setDespesaItens(n); setDespesaPage(1); }}
                        onPageChange={(p) => {
                          setDespesaPage(p);
                          const element = document.getElementById('deputado-content-tabs');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 500, behavior: 'smooth' });
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-card/20 rounded-[3rem] border border-dashed border-white/10 group hover:border-gold/20 transition-all">
                    <Receipt className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 group-hover:text-gold/20 transition-all duration-500" />
                    <p className="text-white font-black text-xl uppercase tracking-tighter">Sem registros para este período</p>
                    <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">
                      A Câmara ainda não processou despesas para o mês de {MONTHS.find(m => m.value === despesaMonth)?.label} de {despesaYear}.
                    </p>
                    <button
                      onClick={() => { setDespesaMonth('all'); setDespesaPage(1); }}
                      className="mt-6 px-6 py-2.5 bg-white/5 text-slate-400 text-xs font-bold rounded-xl border border-white/10 hover:border-gold/30 hover:text-gold transition-all"
                    >
                      VER TODO O ANO DE {despesaYear}
                    </button>
                  </div>
                )}
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
                    getRowId={(row) => String(row.id)}
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

            {/* TAB: TRABALHO LEGISLATIVO */}
            {activeTab === 'trabalho' && (
              <section id="trabalho-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                      Trabalho Legislativo
                    </h3>
                    <p className="text-slate-500 text-xs">Projetos de lei, emendas e outras proposições de autoria do parlamentar</p>
                  </div>
                </div>

                {/* FILTROS DE TRABALHO LEGISLATIVO */}
                <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
                    <select
                      value={proposicaoYear}
                      onChange={(e) => { setProposicaoYear(parseInt(e.target.value)); setProposicaoPage(1); }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-white/10"
                    >
                      {availableYears.map(y => <option key={`prop-year-${y}`} value={y} className="bg-navy">{y}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <History size={14} className="text-gold" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
                    <select
                      value={proposicaoMonth}
                      onChange={(e) => { setProposicaoMonth(e.target.value); setProposicaoPage(1); }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-white/10"
                    >
                      {MONTHS.map(m => <option key={`prop-month-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
                    </select>
                  </div>

                  <div className="ml-auto">
                    <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-tighter shadow-sm shadow-indigo-500/5">
                      {loadingProposicoes ? '...' : `${displayCount} resultados`}
                    </span>
                  </div>
                </div>

                {loadingProposicoes && <TableSkeleton rows={10} />}

                {!loadingProposicoes && proposicoesData?.items && proposicoesData.items.length > 0 && (
                  <div className="bg-slate-card border border-white/5 rounded-[2rem] overflow-hidden">
                    <DataTable
                      columns={proposicaoColumns}
                      data={displayProposicoes}
                      getRowCanExpand={() => true}
                      renderSubComponent={({ row }) => <ProposicaoDetailExpansion row={row} />}
                      getRowId={(row) => String(row.id)}
                    />
                    <div className="p-6 border-t border-white/5">
                      <Pagination
                        page={proposicaoPage}
                        totalPaginas={totalPaginasProposicoes}
                        hasNext={hasNextProposicoes}
                        itensPerPage={proposicaoItens}
                        onItensPerPageChange={(n) => { setProposicaoItens(n); setProposicaoPage(1); }}
                        onPageChange={(p) => {
                          setProposicaoPage(p);
                          const element = document.getElementById('trabalho-section');
                          if (element) {
                            const yOffset = -100;
                            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {!loadingProposicoes && proposicoesData?.items.length === 0 && (
                  <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-white font-bold">Nenhuma proposição encontrada</p>
                  </div>
                )}
              </section>
            )}

            {/* TAB: DISCURSOS */}
            {activeTab === 'discursos' && (
              <section id="discursos-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <Info size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Pronunciamentos & Discursos</h2>
                    <p className="text-slate-500 text-xs">Registros de falas do parlamentar em plenário e comissões</p>
                  </div>
                </div>

                {/* FILTROS DE DISCURSOS */}
                <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
                    <select
                      value={discursoYear}
                      onChange={(e) => { setDiscursoYear(parseInt(e.target.value)); setDiscursoPage(1); }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:bg-white/10"
                    >
                      {availableYears.map(y => <option key={`year-${y}`} value={y} className="bg-navy">{y}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <History size={14} className="text-gold" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
                    <select
                      value={discursoMonth}
                      onChange={(e) => { setDiscursoMonth(e.target.value); setDiscursoPage(1); }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:bg-white/10"
                    >
                      {MONTHS.map(m => <option key={`month-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
                    </select>
                  </div>
                </div>

                {loadingDiscursos && <TableSkeleton rows={5} />}

                {!loadingDiscursos && discursosData?.items && discursosData.items.length > 0 && (
                  <div className="space-y-4">
                    {discursosData.items.map((disc, idx) => (
                      <div key={`discurso-${disc.dataHoraInicio}-${idx}`} className="bg-slate-card border border-white/5 rounded-[2rem] hover:border-purple-500/20 transition-all group overflow-hidden flex flex-col">
                        <div className="p-6 md:p-8 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-3 flex-1 min-w-[280px]">
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 uppercase tracking-wider">
                                  {disc.tipoDiscurso}
                                </div>
                                <span className="text-slate-500 text-[10px] font-bold flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                  <Calendar size={12} className="text-purple-400/50" />
                                  {new Date(disc.dataHoraInicio).toLocaleDateString('pt-BR')} às {new Date(disc.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-md border border-indigo-500/20">
                                  {disc.faseEvento.titulo}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                  <FileText size={12} className="text-purple-400" /> Sumário do Pronunciamento
                                </h4>
                                <p className="text-white text-sm md:text-base font-medium leading-relaxed">
                                  {disc.sumario || 'O parlamentar fez uso da palavra durante a sessão.'}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2">
                                {(disc.keywords?.split(',') || []).slice(0, 8).map((kw, kidx) => (
                                  <span key={`disc-${idx}-kw-${kidx}`} className="px-2 py-0.5 bg-white/5 text-slate-400 text-[9px] font-medium rounded border border-white/5 hover:border-purple-500/20 hover:text-purple-400 transition-all cursor-default">
                                    {kw.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              {disc.urlTexto && (
                                <a href={disc.urlTexto} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-500/10 text-purple-400 text-[11px] font-black rounded-2xl border border-purple-500/20 hover:bg-purple-500/20 transition-all shadow-lg active:scale-95">
                                  VER DIÁRIO OFICIAL <ExternalLink size={14} />
                                </a>
                              )}
                              <div className="flex items-center gap-2 justify-center">
                                {disc.urlAudio && <a href={disc.urlAudio} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Ouvir Áudio"><Mic2 size={18} /></a>}
                                {disc.urlVideo && <a href={disc.urlVideo} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Ver Vídeo"><Play size={18} /></a>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedDiscurso(expandedDiscurso === idx ? null : idx)}
                            className="w-full py-4 bg-navy/40 border border-white/5 rounded-[1.5rem] text-slate-400 hover:text-purple-400 hover:border-purple-500/20 flex items-center justify-center gap-2 transition-all font-bold group/btn active:scale-[0.99]"
                          >
                            {expandedDiscurso === idx ? 'Recolher Transcrição' : 'Ler Transcrição Completa'}
                            <ChevronDown size={18} className={`transition-transform duration-300 ${expandedDiscurso === idx ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {expandedDiscurso === idx && (
                          <div className="px-6 pb-8 md:px-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-navy/60 p-6 md:p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
                              <h5 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Quote size={12} /> Transcrição na Íntegra
                              </h5>
                              <div className="text-slate-300 text-sm md:text-base leading-loose font-serif whitespace-pre-line italic">
                                {disc.transcricao}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Pagination
                      page={discursoPage}
                      totalPaginas={totalPaginasDiscursos}
                      hasNext={hasNextDiscursos}
                      itensPerPage={discursoItens}
                      onItensPerPageChange={(n) => { setDiscursoItens(n); setDiscursoPage(1); }}
                      onPageChange={(p) => {
                        setDiscursoPage(p);
                        const element = document.getElementById('discursos-section');
                        if (element) {
                          const yOffset = -100;
                          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                    />
                  </div>
                )}

                {!loadingDiscursos && discursosData?.items.length === 0 && (
                  <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
                    <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-white font-bold">Nenhum discurso encontrado para este período.</p>
                  </div>
                )}
              </section>
            )}


            {/* TAB: EMENDAS */}
            {activeTab === 'emendas' && (
              <section id="emendas-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                      <PiggyBank size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Emendas Orçamentárias</h2>
                      <p className="text-slate-500 text-sm font-medium">Recursos destinados e execução financeira (Dados: Portal da Transparência)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`https://www.camara.leg.br/deputados/${params.id}/todas-emendas?texto=&ano=${emendaYear}&situacao=`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition-all shadow-lg active:scale-95 group/link uppercase tracking-tighter"
                      title="Ver dados oficiais no Portal da Câmara"
                    >
                      <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      Link Oficial
                    </a>
                  </div>
                </div>

                {/* FILTROS DE EMENDAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group/em_filters">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/em_filters:bg-emerald-500/10 transition-all"></div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 shadow-inner">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        Ano Fiscal
                      </label>
                      <select
                        value={emendaYear}
                        onChange={(e) => { setEmendaYear(parseInt(e.target.value)); setEmendaPage(1); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:bg-white/10 cursor-pointer appearance-none"
                      >
                        {YEARS.map(y => <option key={`emenda-y-${y}`} value={y} className="bg-navy">{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end">
                    {loadingEmendas && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        SINCROZINANDO DADOS...
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo da Execução */}
                {!loadingEmendas && emendas.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-navy/40 rounded-3xl border border-white/5 space-y-2 group/total hover:border-white/10 transition-all">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Autorizado</span>
                      <p className="text-2xl font-black text-white group-hover:scale-105 transition-transform origin-left">{formatCurrency(emendas.reduce((acc, curr) => acc + curr.valorAutorizado, 0))}</p>
                    </div>
                    <div className="p-6 bg-navy/40 rounded-3xl border border-white/5 space-y-2 group/total hover:border-blue-500/10 transition-all">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Empenhado</span>
                      <p className="text-2xl font-black text-blue-400 group-hover:scale-105 transition-transform origin-left">{formatCurrency(emendas.reduce((acc, curr) => acc + curr.valorEmpenhado, 0))}</p>
                    </div>
                    <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 space-y-2 group/total hover:bg-emerald-500/15 transition-all">
                      <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Total Pago</span>
                      <p className="text-2xl font-black text-emerald-400 group-hover:scale-105 transition-transform origin-left">{formatCurrency(emendas.reduce((acc, curr) => acc + curr.valorPago, 0))}</p>
                    </div>
                  </div>
                )}

                {loadingEmendas ? (
                  <TableSkeleton rows={8} />
                ) : emendas.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-slate-card/60 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
                      <DataTable
                        columns={emendaColumns}
                        data={currentEmendas}
                        getRowId={(row) => `${row.orgaoConcedente}-${row.objetivo}-${row.valorPago}`}
                        getRowCanExpand={() => true}
                        renderSubComponent={({ row }) => <EmendaDetailExpansion row={row} />}
                      />

                      <div className="p-6 border-t border-white/5">
                        <Pagination
                          page={emendaPage}
                          totalPaginas={totalPaginasEmendas}
                          hasNext={hasNextEmendas}
                          itensPerPage={emendaItens}
                          onItensPerPageChange={(n) => { setEmendaItens(n); setEmendaPage(1); }}
                          onPageChange={(p) => {
                            setEmendaPage(p);
                            const element = document.getElementById('emendas-section');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center bg-navy/20 rounded-[3rem] border border-dashed border-white/10 group">
                    <PiggyBank className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-500" />
                    <p className="text-white font-black text-xl uppercase tracking-tighter">Nenhuma emenda encontrada para {emendaYear}</p>
                    <p className="text-slate-600 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                      Os dados podem demorar a ser processados pelo Portal da Transparência da Câmara para o ano atual.
                    </p>
                  </div>
                )}

                <div className="p-8 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 flex items-start gap-4">
                  <Info size={18} className="text-blue-400 shrink-0 mt-1" />
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm">Sobre as Emendas Orçamentárias</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      As emendas parlamentares são recursos do Orçamento Geral da União cuja aplicação é indicada por deputados e senadores.
                      Os valores exibidos nesta aba refletem a execução financeira oficial (autorização, reserva e pagamento efetivo) de acordo com o Portal da Transparência da Câmara dos Deputados.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {showMoradiaModal && beneficiosCard?.auxilio_moradia_mensal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-card border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">

            {/* Lado Esquerdo: Info Regulamentada */}
            <div className="md:w-5/12 p-10 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Home size={200} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                  <Home size={28} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Regras do Benefício</h3>
                  <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-400 text-xs font-bold leading-relaxed text-justify">
                    Os deputados federais têm direito a receber auxílio-moradia de <span className="text-white">R$ 4.253,00</span> quando não ocupam um dos 447 apartamentos funcionais que a Câmara tem em Brasília.
                  </p>

                  <p className="text-slate-400 text-xs font-bold leading-relaxed text-justify">
                    O auxílio pode ser pago diretamente no contracheque ou por reembolso, mediante recibo de aluguel ou hotel.
                  </p>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Limite de Complementação</p>
                    <p className="text-xs text-blue-400 font-black">R$ 4.148,80 (via Cota)</p>
                  </div>

                  <p className="text-[10px] text-indigo-400/80 font-black uppercase italic leading-tight">
                    * Aqui estão listados apenas os valores brutos do auxílio-moradia.
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito: Tabela de Valores */}
            <div className="md:w-7/12 p-10 flex flex-col bg-slate-card/50 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Detalhamento</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={beneficiosYear}
                        onChange={(e) => setBeneficiosYear(Number(e.target.value))}
                        className="appearance-none bg-white/10 border border-white/10 rounded-xl px-4 py-1.5 pr-10 text-[10px] font-black uppercase text-blue-400 tracking-widest cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y} className="bg-navy text-white font-bold">{y}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400/60">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                    <Link
                      href={`https://www.camara.leg.br/deputados/${deputadoId}/auxilio-moradia?ano=${beneficiosYear}`}
                      target="_blank"
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400 transition-all group/link"
                      title="Ver Fonte Oficial (Câmara)"
                    >
                      <ExternalLink size={14} className="group-hover/link:rotate-12 transition-transform" />
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => setShowMoradiaModal(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all group shadow-inner"
                >
                  <XCircle size={24} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[380px] min-h-[350px]">
                {isLoadingBeneficiosModal ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sincronizando Histórico...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th className="text-[10px] text-slate-500 font-black uppercase tracking-widest pb-2 px-4">Período</th>
                        <th className="text-[10px] text-slate-500 font-black uppercase tracking-widest pb-2 px-4 text-right">Valor Bruto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beneficiosModal?.auxilio_moradia_mensal ? (
                        beneficiosModal.auxilio_moradia_mensal.map((item, idx) => (
                          <tr key={idx} className="bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                            <td className="py-4 px-4 rounded-l-2xl text-[11px] font-black text-slate-300 uppercase group-hover:text-blue-400 transition-colors border-l border-t border-b border-white/5">
                              {item.mes}
                            </td>
                            <td className="py-4 px-4 rounded-r-2xl text-[11px] font-black text-white text-right font-mono border-r border-t border-b border-white/5">
                              {item.valor}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-30">
                              <AlertTriangle size={32} />
                              <p className="text-[10px] font-black uppercase">Sem lançamentos oficiais para {beneficiosYear}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowMoradiaModal(false)}
                  className="w-full py-4 bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div >
  );
}
