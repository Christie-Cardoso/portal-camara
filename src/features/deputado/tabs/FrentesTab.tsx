"use client";

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, Flag } from 'lucide-react';
import { useDeputadoFrentes } from '@/hooks/use-camara';

interface FrentesTabProps {
  deputadoId: number;
}

export function FrentesTab({ deputadoId }: FrentesTabProps) {
  const { data: frentesData, isLoading } = useDeputadoFrentes(deputadoId);
  const frentes = frentesData || [];
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return frentes;
    const q = search.toLowerCase();
    return frentes.filter(f => f.titulo.toLowerCase().includes(q));
  }, [frentes, search]);

  const displayed = showAll ? filtered : filtered.slice(0, 12);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400"><Flag size={22} /></div>
          <div>
            <h2 className="text-2xl font-bold text-white">Frentes Parlamentares</h2>
            <p className="text-slate-500 text-xs">Bancadas e frentes das quais faz parte</p>
          </div>
        </div>
        <span className="px-4 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-black rounded-full">
          {isLoading ? '...' : frentes.length} frentes
        </span>
      </div>

      {frentes.length > 8 && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center text-slate-500"><Search size={16} /></div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar frente parlamentar..."
            className="w-full bg-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayed.map((frente) => (
              <div key={frente.id} className="p-4 bg-slate-card border border-white/5 rounded-2xl space-y-2 hover:border-amber-500/20 transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform"><Flag size={14} /></div>
                  <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[10px] font-bold rounded">Leg. {frente.idLegislatura}</span>
                </div>
                <p className="text-slate-300 text-xs font-medium leading-tight">{frente.titulo}</p>
              </div>
            ))}
          </div>
          {filtered.length > 12 && (
            <button onClick={() => setShowAll(!showAll)}
              className="mx-auto flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 text-amber-400 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer">
              {showAll ? (<><ChevronUp size={16} /> Mostrar menos</>) : (<><ChevronDown size={16} /> Ver todas as {filtered.length} frentes</>)}
            </button>
          )}
        </>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
          <Flag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold">{search ? 'Nenhuma frente encontrada' : 'Nenhuma frente parlamentar'}</p>
          <p className="text-slate-500 text-sm mt-1">{search ? 'Tente outro termo de busca.' : 'Este deputado não integra frentes parlamentares registradas.'}</p>
        </div>
      )}
    </section>
  );
}
