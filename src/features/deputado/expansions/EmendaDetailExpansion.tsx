"use client";

import { formatCurrency } from '@/lib/formatters';
import { MapPin } from 'lucide-react';

/**
 * Detalhes expandidos de uma emenda orçamentária.
 */
export function EmendaDetailExpansion({ row }: { row: any }) {
  const emenda = row.original;
  return (
    <div className="p-6 bg-navy/40 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">Objeto / Descrição da Emenda</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
          <p className="text-white text-base leading-relaxed italic">
            {emenda.objetivo || "Descrição não disponível para este registro."}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-500 font-black uppercase block">Ano Orçamentário</span>
            <span className="text-white text-sm font-bold">{emenda.ano}</span>
          </div>
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-500 font-black uppercase block">Beneficiário / Localidade</span>
            <span className="text-white text-sm font-bold">{emenda.localidade || "Nacional / Diversas"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
