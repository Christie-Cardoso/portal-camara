"use client";

import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useFrequencia, useAnosEleito } from '@/hooks/use-camara';
import { CURRENT_YEAR, YEARS } from '@/features/deputado/constants';

interface AttendanceCardProps {
  deputadoId: number;
}

/**
 * Card do Bento Grid — frequência parlamentar em plenário e comissões.
 */
export function AttendanceCard({ deputadoId }: AttendanceCardProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);
  const { data: frequenciaCard, isLoading } = useFrequencia(deputadoId, year);

  const renderMetric = (value: string | undefined) => {
    if (!value || value.toLowerCase().includes('indispon')) {
      return <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>;
    }
    return <span className="text-xl font-black text-white tracking-tighter">{value}</span>;
  };

  const renderFaltasMetric = (value: string | undefined) => {
    if (!value || value.toLowerCase().includes('indispon')) {
      return <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold lowercase rounded-md border border-white/5">indisponível</span>;
    }
    return (
      <span className={`text-xl font-black tracking-tighter ${parseInt(value || '0') > 0 ? 'text-red-400' : 'text-white'}`}>
        {value}
      </span>
    );
  };

  return (
    <>
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
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Sessões e Reuniões • {year}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-amber-500/40 hover:bg-white/10 group/sel shadow-inner">
              <Calendar size={14} className="text-amber-400" />
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-[10px] font-black text-white focus:outline-none appearance-none cursor-pointer pr-1 uppercase"
              >
                {availableYears.map(y => <option key={`freq-y-${y}`} value={y} className="bg-navy">{y}</option>)}
              </select>
              <ChevronDown size={12} className="text-slate-500 group-hover/sel:text-white transition-colors" />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
              {/* Plenário */}
              <div className="flex items-stretch gap-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/plen">
                <div className="flex flex-col gap-1 items-center justify-center px-3 border-r border-white/10 shrink-0">
                  <div className="w-1 h-8 bg-amber-500 rounded-full mb-1"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter vertical-text opacity-30">PLENÁRIO</span>
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Presenças</span>
                    <span className="flex items-center">{renderMetric(frequenciaCard?.plenario?.dias_presenca)}</span>
                  </div>
                  <div className="w-px h-8 bg-white/5"></div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Justificadas</span>
                    <span className="flex items-center">{renderMetric(frequenciaCard?.plenario?.dias_ausencias_justificadas)}</span>
                  </div>
                  <div className="w-px h-8 bg-white/5"></div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Faltas</span>
                    <span className="flex items-center">{renderFaltasMetric(frequenciaCard?.plenario?.dias_ausencias_nao_justificadas)}</span>
                  </div>
                </div>
              </div>

              {/* Comissões */}
              <div className="flex items-stretch gap-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group/com">
                <div className="flex flex-col gap-1 items-center justify-center px-3 border-r border-white/10 shrink-0">
                  <div className="w-1 h-8 bg-emerald-500 rounded-full mb-1"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter vertical-text opacity-30">COMISSÕES</span>
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Presenças</span>
                    <span className="flex items-center">{renderMetric(frequenciaCard?.comissoes?.presenca)}</span>
                  </div>
                  <div className="w-px h-8 bg-white/5"></div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Justificadas</span>
                    <span className="flex items-center">{renderMetric(frequenciaCard?.comissoes?.ausencias_justificadas)}</span>
                  </div>
                  <div className="w-px h-8 bg-white/5"></div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Faltas</span>
                    <span className="flex items-center">{renderFaltasMetric(frequenciaCard?.comissoes?.ausencias_nao_justificadas)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
