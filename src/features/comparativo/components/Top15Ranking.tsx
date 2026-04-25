"use client";

import { TrendingUp, Info, ChevronRight, Plus, Check } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { TOP_15_DEPUTADOS } from '../constants';

interface Top15RankingProps {
  selectedIds: number[];
  onSelect: (id: number) => void;
}

export function Top15Ranking({ selectedIds, onSelect }: Top15RankingProps) {
  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 mb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold text-navy rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ranking de Votação</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Os 15 parlamentares mais votados nas eleições gerais de 2022</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-400">
          <Info size={14} className="text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Clique para comparar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOP_15_DEPUTADOS.map((dep, index) => {
          const isSelected = selectedIds.includes(dep.id);
          return (
            <button
              key={dep.id}
              onClick={() => !isSelected && onSelect(dep.id)}
              disabled={isSelected}
              className={`group relative flex items-center gap-5 p-5 bg-slate-card/40 border rounded-3xl transition-all text-left overflow-hidden active:scale-95 ${isSelected
                ? 'opacity-40 border-white/5 cursor-default'
                : 'border-white/5 hover:bg-white/5 hover:border-gold/30'
                }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full bg-gold transition-opacity ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

              <div className="relative shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy border border-white/10 text-slate-500 font-black text-xs group-hover:text-gold transition-colors shrink-0">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-gold transition-colors">{dep.nome}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{dep.partido} • {dep.uf}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest">{formatNumber(dep.votos)} votos</span>
                  {!isSelected && <ChevronRight size={10} className="text-slate-700 group-hover:translate-x-1 transition-transform" />}
                </div>
              </div>
              {!isSelected ? (
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-gold group-hover:text-navy transition-all shadow-inner">
                  <Plus size={16} strokeWidth={3} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
