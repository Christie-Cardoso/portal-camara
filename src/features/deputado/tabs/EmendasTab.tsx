"use client";

import { useState, useMemo } from 'react';
import { Calendar, Loader2, ExternalLink, PiggyBank, Info } from 'lucide-react';
import { useDeputadoEmendas } from '@/hooks/use-camara';
import { formatCurrency } from '@/lib/formatters';
import { getEmendaColumns } from '@/features/deputado/columns/emenda-columns';
import { EmendaDetailExpansion } from '@/features/deputado/expansions/EmendaDetailExpansion';
import { CURRENT_YEAR, YEARS } from '@/features/deputado/constants';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/LoadingState';

interface EmendasTabProps {
  deputadoId: number;
}

export function EmendasTab({ deputadoId }: EmendasTabProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState(10);

  const { data: emendasData, isLoading } = useDeputadoEmendas(deputadoId, year);
  const emendas = emendasData || [];
  const totalPaginas = Math.ceil(emendas.length / itens);
  const currentEmendas = useMemo(() => { const start = (page - 1) * itens; return emendas.slice(start, start + itens); }, [emendas, page, itens]);
  const hasNext = page < totalPaginas;
  const columns = useMemo(() => getEmendaColumns(), []);

  return (
    <section id="emendas-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"><PiggyBank size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Emendas Orçamentárias</h2>
            <p className="text-slate-500 text-sm font-medium">Recursos destinados e execução financeira (Dados: Portal da Transparência)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={`https://www.camara.leg.br/deputados/${deputadoId}/todas-emendas?texto=&ano=${year}&situacao=`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition-all shadow-lg active:scale-95 group/link uppercase tracking-tighter" title="Ver dados oficiais no Portal da Câmara">
            <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            Link Oficial
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group/em_filters">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/em_filters:bg-emerald-500/10 transition-all"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 shadow-inner"><Calendar size={18} /></div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">Ano Fiscal</label>
            <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:bg-white/10 cursor-pointer appearance-none">
              {YEARS.map(y => <option key={`emenda-y-${y}`} value={y} className="bg-navy">{y}</option>)}
            </select>
          </div>
        </div>
        <div className="md:col-span-2 flex items-center justify-end">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 animate-pulse">
              <Loader2 size={14} className="animate-spin" /> SINCROZINANDO DADOS...
            </div>
          )}
        </div>
      </div>

      {/* Resumo */}
      {!isLoading && emendas.length > 0 && (
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

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : emendas.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-slate-card/60 backdrop-blur-sm border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
            <DataTable columns={columns} data={currentEmendas}
              getRowId={(row) => `${row.orgaoConcedente}-${row.objetivo}-${row.valorPago}`}
              getRowCanExpand={() => true} renderSubComponent={({ row }) => <EmendaDetailExpansion row={row} />} />
            <div className="p-6 border-t border-white/5">
              <Pagination page={page} totalPaginas={totalPaginas} hasNext={hasNext}
                itensPerPage={itens} onItensPerPageChange={(n) => { setItens(n); setPage(1); }}
                onPageChange={(p) => { setPage(p); document.getElementById('emendas-section')?.scrollIntoView({ behavior: 'smooth' }); }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center bg-navy/20 rounded-[3rem] border border-dashed border-white/10 group">
          <PiggyBank className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-500" />
          <p className="text-white font-black text-xl uppercase tracking-tighter">Nenhuma emenda encontrada para {year}</p>
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
  );
}
