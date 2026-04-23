"use client";

import { ColumnDef } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { EmendaOrcamentaria } from '@/lib/camara';

export function getEmendaColumns(): ColumnDef<EmendaOrcamentaria>[] {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'orgaoConcedente',
      header: 'Órgão Concedente',
      cell: ({ getValue }) => (
        <div className="max-w-[180px] font-black text-white text-[10px] uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'objetivo',
      header: 'Objeto (Resumo)',
      cell: ({ getValue }) => (
        <div className="max-w-[150px] truncate text-slate-500 text-[9px] italic font-medium" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'valorAutorizado',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Autorizado</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-emerald-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            A emenda foi aprovada pelo Congresso Nacional e passou a integrar a Lei Orçamentária Anual.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-slate-400">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      accessorKey: 'valorEmpenhado',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Empenhado</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-blue-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            A verba foi reservada pelo Poder Executivo para o gasto destinado pela emenda.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-blue-400/80">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      accessorKey: 'valorPago',
      header: () => (
        <div className="flex items-center gap-1.5 group/tip relative cursor-help">
          <span>Pago</span>
          <HelpCircle size={10} className="text-slate-500 group-hover/tip:text-emerald-400 transition-colors" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-[10px] leading-relaxed text-slate-300 font-medium invisible group-hover/tip:visible z-[110] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 -translate-y-2 group-hover/tip:translate-y-0 text-center">
            O valor da emenda foi transferido para o estado ou município de destino.
          </div>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-black text-emerald-400">
          {formatCurrency(getValue() as number)}
        </span>
      )
    }
  ];
}
