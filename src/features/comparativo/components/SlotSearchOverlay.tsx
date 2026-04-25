"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Plus } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';
import { queryKeys } from '@/lib/query-keys';
import { fetchDeputados } from '@/lib/camara';

interface SlotSearchOverlayProps {
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function SlotSearchOverlay({ onSelect, onClose }: SlotSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.deputados.list({ nome: debouncedQuery, itens: 5 }),
    queryFn: () => fetchDeputados({ nome: debouncedQuery, itens: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="absolute inset-0 z-50 bg-navy/95 backdrop-blur-xl p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center mb-6 px-1">
        <div className="w-8" /> {/* Espaçador para equilibrar o centro */}
        <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-gold text-center">
          Buscar Parlamentar
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 transition-all active:scale-90"
        >
          <X size={18} className='cursor-pointer' />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all shadow-inner"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : data?.items?.map(dep => (
          <button
            key={dep.id}
            onClick={() => onSelect(dep.id)}
            className="w-full flex items-center gap-3 p-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl transition-all group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-navy border border-white/10 pointer-events-none">
              <Image src={dep.urlFoto} alt={dep.nome} width={32} height={32} className="object-cover" unoptimized />
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="text-[10px] font-black text-white uppercase truncate leading-tight">{dep.nome}</h4>
              <p className="text-[8px] text-slate-500 font-bold uppercase">{dep.siglaPartido} • {dep.siglaUf}</p>
            </div>
            <Plus size={12} className="ml-auto text-slate-700 group-hover:text-gold transition-colors" />
          </button>
        ))}
        {debouncedQuery.length >= 2 && !isLoading && (!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum resultado</p>
          </div>
        )}
      </div>
    </div>
  );
}
