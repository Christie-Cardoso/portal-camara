import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPaginas?: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  itensPerPage: number;
  onItensPerPageChange?: (itens: number) => void;
}

export function Pagination({
  page,
  totalPaginas,
  hasNext,
  onPageChange,
  itensPerPage,
  onItensPerPageChange
}: PaginationProps) {
  if (page === 1 && !hasNext && !onItensPerPageChange) return null;

  const getPageRange = () => {
    if (!totalPaginas) return [page];

    const range: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= Math.min(totalPaginas, 3); i++) {
      range.push(i);
    }

    if (page > 5) {
      range.push('...');
    }

    const start = Math.max(4, page - delta);
    const end = Math.min(totalPaginas - 3, page + delta);

    for (let i = start; i <= end; i++) {
      if (!range.includes(i)) range.push(i);
    }

    if (page < totalPaginas - 4) {
      range.push('...');
    }

    for (let i = Math.max(totalPaginas - 2, 1); i <= totalPaginas; i++) {
      if (!range.includes(i)) range.push(i);
    }

    return range;
  };

  const pages = getPageRange();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 mt-8">
      {onItensPerPageChange && (
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Mostrar</span>
          <select
            value={itensPerPage}
            onChange={(e) => onItensPerPageChange(Number(e.target.value))}
            className="bg-navy border border-white/10 rounded-xl px-4 py-2 text-sm text-gold font-black focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer hover:border-gold/30 transition-all"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          title="Primeira página"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all mr-2"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border ${page === p
                    ? 'bg-gold text-navy border-gold shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="w-10 text-center text-slate-600 font-bold">...</span>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all ml-2"
        >
          <ChevronRight size={16} />
        </button>

        {totalPaginas && (
          <button
            onClick={() => onPageChange(totalPaginas)}
            disabled={page === totalPaginas}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            title="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>

      <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
        Página {page} {totalPaginas ? `de ${totalPaginas}` : ''}
      </div>
    </div>
  );
}
