"use client";

import { useProposicao, useProposicaoAutores } from '@/hooks/use-camara';
import { ReporterInfo } from './ReporterInfo';
import {
  Loader2, CheckCircle2, Building2, Users, ExternalLink, FileText,
  LayoutDashboard, ArrowRight,
} from 'lucide-react';

export function ProposicaoDetailExpansion({ row }: { row: any }) {
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
