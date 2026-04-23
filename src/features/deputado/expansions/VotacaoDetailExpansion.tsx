"use client";

import { useMemo } from 'react';
import {
  useVotacao,
  useVotacaoVotos,
  useVotacaoOrientacoes,
} from '@/hooks/use-camara';
import { parseAuthorFromDescription } from '@/lib/formatters';
import {
  Loader2, Users, ExternalLink, Info, History, Flag,
  ThumbsUp, ThumbsDown, Minus, XCircle, LayoutDashboard, FlagOff,
} from 'lucide-react';
import type { VotoDeputado } from '@/lib/camara';

function votoColor(tipo: string | undefined): string {
  if (!tipo) return 'text-slate-500';
  const t = tipo.toLowerCase();
  if (t === 'sim') return 'text-emerald-400';
  if (t === 'não') return 'text-red-400';
  if (t === 'abstenção' || t === 'abstencao') return 'text-yellow-400';
  if (t === 'obstrução' || t === 'obstrucao') return 'text-orange-400';
  return 'text-slate-400';
}

function votoBg(tipo: string | undefined): string {
  if (!tipo) return 'bg-slate-500/10';
  const t = tipo.toLowerCase();
  if (t === 'sim') return 'bg-emerald-500/10';
  if (t === 'não') return 'bg-red-500/10';
  if (t === 'abstenção' || t === 'abstencao') return 'bg-yellow-500/10';
  return 'bg-slate-500/10';
}

function VotoIcon({ tipo }: { tipo: string | undefined }) {
  if (!tipo) return <Minus size={14} />;
  const t = tipo.toLowerCase();
  if (t === 'sim') return <ThumbsUp size={14} />;
  if (t === 'não') return <ThumbsDown size={14} />;
  if (t === 'obstrução' || t === 'obstrucao') return <XCircle size={14} />;
  return <Minus size={14} />;
}

interface VotacaoDetailExpansionProps {
  row: any;
  deputadoId: number;
  siglaPartido?: string;
}

export function VotacaoDetailExpansion({ row, deputadoId, siglaPartido }: VotacaoDetailExpansionProps) {
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
    return {
      sim: votos.filter(v => v.tipoVoto.toLowerCase() === 'sim').length,
      nao: votos.filter(v => ['não', 'nao'].includes(v.tipoVoto.toLowerCase())).length,
      abstencao: votos.filter(v => ['abstenção', 'abstencao'].includes(v.tipoVoto.toLowerCase())).length,
      obstrucao: votos.filter(v => ['obstrução', 'obstrucao'].includes(v.tipoVoto.toLowerCase())).length,
      total: votos.length
    };
  }, [votos]);

  const orientacaoDeputado = useMemo(() => {
    if (!orientacoes || !siglaPartido) return null;
    return orientacoes.find(o => o.siglaPartidoBloco.includes(siglaPartido));
  }, [orientacoes, siglaPartido]);

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
              Acessar Dados na Íntegra (API) <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className="bg-navy/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/20"></div>
          <div className="space-y-4 relative z-10">
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
        {/* Esquerdo: Posicionamento */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Users size={12} /> Voto Individual</p>
            {deputadoVoto ? (
              <div className={`flex items-center gap-4 p-5 rounded-2xl ${votoBg(deputadoVoto.tipoVoto)} border border-white/5 shadow-lg`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${votoColor(deputadoVoto.tipoVoto)} bg-white/10 shadow-inner`}>
                  <VotoIcon tipo={deputadoVoto.tipoVoto} />
                </div>
                <div>
                  <p className={`font-black text-xl uppercase tracking-tighter ${votoColor(deputadoVoto.tipoVoto)}`}>{deputadoVoto.tipoVoto}</p>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Consolidado em {new Date(deputadoVoto.dataRegistroVoto).toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 bg-white/5 rounded-2xl border border-white/5 text-slate-500 text-sm italic">
                <Info size={18} />
                {votos && votos.length === 0 ? 'Votação simbólica — sem registro individual.' : 'Ausente ou sem registro nesta sessão.'}
              </div>
            )}
          </div>

          {votacaoFull?.objetosPossiveis && votacaoFull.objetosPossiveis.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <History size={14} /> Cronologia ({votacaoFull.objetosPossiveis.length})
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                {[...votacaoFull.objetosPossiveis].reverse().map((obj) => (
                  <div key={obj.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex items-start gap-4">
                    <div className="flex flex-col items-center text-xs font-mono text-slate-500 px-2 py-1 bg-white/5 rounded-lg border border-white/5 min-w-[60px]">
                      <span>{new Date(obj.dataApresentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      <span className="text-gold font-bold">{new Date(obj.dataApresentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase border border-blue-500/20">
                          {obj.siglaTipo} {obj.numero}/{obj.ano > 0 ? obj.ano : ''}
                        </span>
                        <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${obj.id}`} target="_blank" rel="noopener noreferrer"
                          className="p-1 px-2.5 bg-white/5 border border-white/5 hover:border-gold/30 text-slate-400 hover:text-gold rounded-xl transition-all text-sm flex items-center gap-2">
                          <span className="text-xs font-black uppercase">Ver API</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">{obj.ementa}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orientacaoDeputado && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Flag size={12} /> Orientação ({siglaPartido})</p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${votoColor(orientacaoDeputado.orientacaoVoto)} bg-white/5`}><Flag size={16} /></div>
                <div>
                  <p className={`font-black text-base uppercase ${votoColor(orientacaoDeputado.orientacaoVoto)}`}>{orientacaoDeputado.orientacaoVoto}</p>
                  <p className="text-slate-600 text-xs font-medium">Recomendação oficial da liderança</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Direito: Placar */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><LayoutDashboard size={12} /> Consenso da Casa</p>
            <div className="p-6 bg-navy/60 rounded-[2rem] border border-white/5 flex items-center justify-around gap-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              {placar && placar.total > 0 ? (
                <>
                  <div className="text-center"><p className="text-3xl font-black text-emerald-400">{placar.sim}</p><p className="text-[10px] text-slate-500 uppercase font-black mt-1">Sim</p></div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center"><p className="text-3xl font-black text-red-400">{placar.nao}</p><p className="text-[10px] text-slate-500 uppercase font-black mt-1">Não</p></div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center"><p className="text-xl font-black text-yellow-400">{placar.abstencao}</p><p className="text-[10px] text-slate-500 uppercase font-black mt-1">Abs.</p></div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center"><p className="text-xl font-black text-orange-400">{placar.obstrucao}</p><p className="text-[10px] text-slate-500 uppercase font-black mt-1">Obs.</p></div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-slate-600 text-[10px] italic"><FlagOff size={24} className="opacity-20" />Placar indisponível.</div>
              )}
            </div>
          </div>

          {orientacoes && orientacoes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-600 tracking-widest text-center">Panorama das Bancadas</p>
              <div className="flex flex-wrap justify-center gap-1.5 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                {orientacoes.map((o, oidx) => (
                  <div key={`orient-${row.original.id}-${o.siglaPartidoBloco}-${oidx}`} className="px-2.5 py-1.5 bg-navy/80 border border-white/5 rounded-lg flex items-center gap-2 hover:border-white/20 transition-all">
                    <span className="text-xs font-black text-slate-400">{o.siglaPartidoBloco}</span>
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
