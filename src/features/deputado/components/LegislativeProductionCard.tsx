"use client";

import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ExternalLink, FileCheck, Gavel, History, Info } from 'lucide-react';
import { useProposicaoTotals, useAnosEleito } from '@/hooks/use-camara';
import { PROPOSICOES_MAP } from '@/lib/constants';
import { CURRENT_YEAR, YEARS } from '@/features/deputado/constants';

interface LegislativeProductionCardProps {
  deputadoId: number;
}

/**
 * Card do Bento Grid — produção legislativa com contagem por tipo.
 */
export function LegislativeProductionCard({ deputadoId }: LegislativeProductionCardProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);
  const { data: totals, isLoading } = useProposicaoTotals(deputadoId, { ano: year });

  return (
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
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent border-none text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer pr-2">
              {availableYears.map(y => <option key={`prop-year-${y}`} value={y} className="bg-navy">{y}</option>)}
            </select>
            <ChevronDown size={14} className="text-slate-500 group-hover/sel:text-white transition-colors" />
          </div>
          <a href={`https://www.camara.leg.br/deputados/${deputadoId}?ano=${year}`} target="_blank" rel="noopener noreferrer"
            className="w-11 h-11 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/20 group/link shadow-sm"
            title="Ver todas as propostas no Portal da Câmara">
            <ExternalLink size={18} className="group-hover/link:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* Totais */}
      <div className="flex items-center gap-3 flex-nowrap overflow-x-auto no-scrollbar pb-4 relative z-10">
        <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-gold/20">
          <FileCheck size={18} className="text-gold" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest leading-none mb-1">Autoria</span>
            <span className="text-xl font-black text-white leading-none tracking-tighter">{totals?.total || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-blue-500/20">
          <Gavel size={18} className="text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest leading-none mb-1">Relatorias</span>
            <span className="text-xl font-black text-white leading-none tracking-tighter">{totals?.relatadas || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl whitespace-nowrap group/stat transition-all hover:bg-indigo-500/20">
          <History size={18} className="text-indigo-400" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest leading-none">Atos Proc.</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter opacity-40">Burocracia</span>
            </div>
            <span className="text-xl font-black text-white leading-none tracking-tighter">
              {(totals?.total || 0) - (totals?.apiTotal || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de tipos */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(totals?.counts || {})
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

      {/* Explicação */}
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
            A diferença de <span className="text-white font-bold">{(totals?.total || 0) - (totals?.apiTotal || 0)} atos</span> refere-se a formalidades processuais e administrativas (como retirada de pauta, requerimentos formais ou correções de texto).
            A lista de <span className="text-white font-bold">Projetos</span> exibe apenas proposições de mérito reais (Leis, PECs, etc), enquanto o total da Câmara engloba toda a movimentação burocrática parlamentar.
          </p>
        </div>
      </div>
    </div>
  );
}
