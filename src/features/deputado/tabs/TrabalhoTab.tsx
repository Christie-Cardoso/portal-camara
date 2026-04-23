"use client";

import { useState, useMemo } from 'react';
import { Calendar, History, FileText } from 'lucide-react';
import { useProposicoesByAutor, useAnosEleito } from '@/hooks/use-camara';
import { getProposicaoColumns } from '@/features/deputado/columns/proposicao-columns';
import { ProposicaoDetailExpansion } from '@/features/deputado/expansions/ProposicaoDetailExpansion';
import { CURRENT_YEAR, YEARS, MONTHS } from '@/features/deputado/constants';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/LoadingState';

interface TrabalhoTabProps {
  deputadoId: number;
}

export function TrabalhoTab({ deputadoId }: TrabalhoTabProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState('all');
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState(10);

  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);

  const { data: proposicoesData, isLoading } = useProposicoesByAutor(deputadoId, {
    pagina: page, itens: month === 'all' ? itens : 100, ano: year,
  });

  const displayProposicoes = useMemo(() => {
    const raw = proposicoesData?.items || [];
    if (month === 'all') return raw;
    return raw.filter(p => { const pMonth = new Date(p.dataApresentacao).getMonth() + 1; return pMonth === parseInt(month); });
  }, [proposicoesData?.items, month]);

  const displayCount = useMemo(() => {
    if (month === 'all') return proposicoesData?.totalItems || 0;
    return displayProposicoes.length;
  }, [proposicoesData?.totalItems, displayProposicoes.length, month]);

  const columns = useMemo(() => getProposicaoColumns(), []);

  return (
    <section id="trabalho-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400"><FileText size={22} /></div>
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">Trabalho Legislativo</h3>
          <p className="text-slate-500 text-xs">Projetos de lei, emendas e outras proposições de autoria do parlamentar</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
          <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-white/10">
            {availableYears.map(y => <option key={`prop-year-${y}`} value={y} className="bg-navy">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <History size={14} className="text-gold" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
          <select value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-white/10">
            {MONTHS.map(m => <option key={`prop-month-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-tighter shadow-sm shadow-indigo-500/5">
            {isLoading ? '...' : `${displayCount} resultados`}
          </span>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={10} />}

      {!isLoading && proposicoesData?.items && proposicoesData.items.length > 0 && (
        <div className="bg-slate-card border border-white/5 rounded-[2rem] overflow-hidden">
          <DataTable columns={columns} data={displayProposicoes} getRowCanExpand={() => true}
            renderSubComponent={({ row }) => <ProposicaoDetailExpansion row={row} />} getRowId={(row) => String(row.id)} />
          <div className="p-6 border-t border-white/5">
            <Pagination page={page} totalPaginas={proposicoesData?.totalPaginas} hasNext={proposicoesData?.hasNext || false}
              itensPerPage={itens} onItensPerPageChange={(n) => { setItens(n); setPage(1); }}
              onPageChange={(p) => {
                setPage(p);
                const el = document.getElementById('trabalho-section');
                if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: 'smooth' }); }
              }} />
          </div>
        </div>
      )}

      {!isLoading && proposicoesData?.items.length === 0 && (
        <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold">Nenhuma proposição encontrada</p>
        </div>
      )}
    </section>
  );
}
