"use client";

import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { ExpensesDonutChart } from '@/components/ExpensesDonutChart';
import { useDeputadoDespesasAggregation, useAnosEleito } from '@/hooks/use-camara';
import { CURRENT_YEAR, YEARS } from '@/features/deputado/constants';

interface ExpenseChartCardProps {
  deputadoId: number;
}

export function ExpenseChartCard({ deputadoId }: ExpenseChartCardProps) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);
  const { data: aggregatedExpenses, isLoading } = useDeputadoDespesasAggregation(deputadoId, selectedYear);

  return (
    <div className="w-full bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group/chart h-full min-h-[400px] md:min-h-[500px] flex flex-col shadow-2xl">
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover/chart:bg-indigo-500/20 transition-all duration-1000"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-8">
        <div className="flex items-center gap-5">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Distribuição de Gastos</h3>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Análise proporcional da cota parlamentar em {selectedYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-indigo-500/40 hover:bg-white/10 group/sel shadow-inner">
            <Calendar size={16} className="text-indigo-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer pr-2"
            >
              {availableYears.map(y => <option key={`exp-year-${y}`} value={y} className="bg-navy">{y}</option>)}
            </select>
            <ChevronDown size={14} className="text-slate-500 group-hover/sel:text-white transition-colors" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <ExpensesDonutChart data={aggregatedExpenses || []} loading={isLoading} />
      </div>
    </div>
  );
}
