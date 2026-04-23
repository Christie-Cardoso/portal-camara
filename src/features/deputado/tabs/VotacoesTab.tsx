"use client";

import { useState, useMemo } from 'react';
import { Calendar, History, Vote } from 'lucide-react';
import { useVotacoes } from '@/hooks/use-camara';
import { getVotacaoColumns } from '@/features/deputado/columns/votacao-columns';
import { VotacaoDetailExpansion } from '@/features/deputado/expansions/VotacaoDetailExpansion';
import { CURRENT_YEAR, YEARS, MONTHS } from '@/features/deputado/constants';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/LoadingState';

interface VotacoesTabProps {
  deputadoId: number;
  siglaPartido?: string;
}

export function VotacoesTab({ deputadoId, siglaPartido }: VotacoesTabProps) {
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [month, setMonth] = useState('all');
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState(10);

  const { dataInicio, dataFim } = useMemo(() => {
    if (month === 'all') return { dataInicio: `${year}-01-01`, dataFim: undefined };
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return { dataInicio: `${year}-${month}-01`, dataFim: `${year}-${month}-${lastDay}` };
  }, [year, month]);

  const { data: votacoesData, isLoading } = useVotacoes({ dataInicio, dataFim, itens });
  const votacoes = votacoesData?.items || [];
  const columns = useMemo(() => getVotacaoColumns(), []);

  return (
    <section id="votacoes-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400"><Vote size={22} /></div>
        <div>
          <h2 className="text-2xl font-bold text-white">Votações Recentes</h2>
          <p className="text-slate-500 text-xs">Últimas votações do Plenário e Comissões — clique para ver o voto do deputado</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
          <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-white/10">
            {YEARS.map(y => <option key={y} value={y} className="bg-navy">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <History size={14} className="text-gold" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
          <select value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-white/10">
            {MONTHS.map(m => <option key={m.value} value={m.value} className="bg-navy">{m.label}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">
            Período: {year} {month !== 'all' ? `/ ${MONTHS.find(m => m.value === month)?.label}` : ''}
          </span>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={10} />}

      {!isLoading && votacoes.length > 0 && (
        <DataTable columns={columns} data={votacoes} getRowId={(row) => String(row.id)}
          getRowCanExpand={() => true}
          renderSubComponent={({ row }) => (
            <VotacaoDetailExpansion row={row} deputadoId={deputadoId} siglaPartido={siglaPartido} />
          )} />
      )}

      {!isLoading && votacoes.length === 0 && (
        <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
          <Vote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold">Nenhuma votação encontrada</p>
          <p className="text-slate-500 text-sm mt-1">Não foram encontradas votações para este período.</p>
        </div>
      )}

      <Pagination page={page} totalPaginas={votacoesData?.totalPaginas} hasNext={votacoesData?.hasNext || false}
        itensPerPage={itens} onItensPerPageChange={(n) => { setItens(n); setPage(1); }}
        onPageChange={(p) => {
          setPage(p);
          const el = document.getElementById('votacoes-section');
          if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: 'smooth' }); }
        }} />
    </section>
  );
}
