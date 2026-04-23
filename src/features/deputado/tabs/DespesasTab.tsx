"use client";

import { useState, useMemo } from 'react';
import { Calendar, History, Loader2, Receipt } from 'lucide-react';
import { useDeputadoDespesas, useDeputadoDespesasAggregation } from '@/hooks/use-camara';
import { formatCurrency } from '@/lib/formatters';
import { getDespesaColumns } from '@/features/deputado/columns/despesa-columns';
import { CURRENT_YEAR, YEARS, MONTHS } from '@/features/deputado/constants';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/LoadingState';

interface DespesasTabProps {
  deputadoId: number;
}

export function DespesasTab({ deputadoId }: DespesasTabProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState('all');
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState(15);

  const { data: despesasData, isLoading, isFetching } = useDeputadoDespesas(deputadoId, {
    ano: year,
    mes: month === 'all' ? undefined : parseInt(month),
    pagina: page,
    itens,
  });

  const { data: tabAggregated, isLoading: loadingAgg } = useDeputadoDespesasAggregation(deputadoId, year);
  const totalAnual = useMemo(() => tabAggregated?.reduce((acc, curr) => acc + curr.value, 0) || 0, [tabAggregated]);
  const despesas = despesasData?.items || [];
  const columns = useMemo(() => getDespesaColumns(), []);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Despesas da Cota</h2>
            <p className="text-slate-500 text-xs italic">Cota para Exercício da Atividade Parlamentar (CEAP)</p>
          </div>
        </div>
        {(totalAnual > 0 || loadingAgg) && (
          <div className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/5 transition-all hover:bg-emerald-500/15 min-w-[200px]">
            <div className="flex-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Total Anual ({year})</span>
              {loadingAgg ? (
                <div className="h-7 w-32 bg-emerald-500/10 animate-pulse rounded-lg"></div>
              ) : (
                <span className="text-2xl font-black text-emerald-400 leading-none">{formatCurrency(totalAnual)}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group/filters">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/filters:bg-gold/10 transition-all"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gold shadow-inner"><Calendar size={18} /></div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Ano Fiscal</label>
            <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all hover:bg-white/10 cursor-pointer appearance-none">
              {YEARS.map(y => <option key={`exp-y-${y}`} value={y} className="bg-navy">{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-blue-400 shadow-inner"><History size={18} /></div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Mês de Referência</label>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-white/10 cursor-pointer appearance-none">
              {MONTHS.map(m => <option key={`exp-m-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end">
          {isFetching && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold text-xs font-bold rounded-xl border border-gold/20 animate-pulse">
              <Loader2 size={14} className="animate-spin" />
              SINCROZINANDO DADOS...
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : despesas.length > 0 ? (
        <div className="bg-slate-card/60 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <DataTable columns={columns} data={despesas} getRowId={(row) => String(row.codDocumento)} />
          <div className="p-6 border-t border-white/5">
            <Pagination page={page} totalPaginas={despesasData?.totalPaginas} hasNext={despesasData?.hasNext || false}
              itensPerPage={itens} onItensPerPageChange={(n) => { setItens(n); setPage(1); }}
              onPageChange={(p) => { setPage(p); document.getElementById('deputado-content-tabs')?.scrollIntoView({ behavior: 'smooth' }); }} />
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-card/20 rounded-[3rem] border border-dashed border-white/10 group hover:border-gold/20 transition-all">
          <Receipt className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 group-hover:text-gold/20 transition-all duration-500" />
          <p className="text-white font-black text-xl uppercase tracking-tighter">Sem registros para este período</p>
          <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">
            A Câmara ainda não processou despesas para o mês de {MONTHS.find(m => m.value === month)?.label} de {year}.
          </p>
          <button onClick={() => { setMonth('all'); setPage(1); }}
            className="mt-6 px-6 py-2.5 bg-white/5 text-slate-400 text-xs font-bold rounded-xl border border-white/10 hover:border-gold/30 hover:text-gold transition-all">
            VER TODO O ANO DE {year}
          </button>
        </div>
      )}
    </section>
  );
}
