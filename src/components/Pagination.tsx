import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, hasNext, onPageChange }: PaginationProps) {
  if (page === 1 && !hasNext) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-8">
      {page > 1 && (
        <button onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-card text-white hover:bg-slate-800 border border-white/5 transition-all cursor-pointer">
          <ChevronLeft size={20} /> Anterior
        </button>
      )}
      <div className="px-6 py-3 rounded-2xl bg-navy border border-white/5 text-slate-400 font-mono">
        Página <span className="text-gold font-bold">{page}</span>
      </div>
      {hasNext && (
        <button onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-card text-white hover:bg-slate-800 border border-white/5 transition-all cursor-pointer">
          Próxima <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
