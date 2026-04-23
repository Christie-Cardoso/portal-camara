"use client";

import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { Despesa } from '@/lib/camara';

export function getDespesaColumns(): ColumnDef<Despesa>[] {
  return [
    {
      accessorKey: 'dataDocumento',
      header: 'Data',
      cell: ({ getValue }) => {
        const date = getValue() as string;
        if (!date) return '-';
        return <span className="text-white font-medium">{new Date(date).toLocaleDateString('pt-BR')}</span>;
      }
    },
    {
      accessorKey: 'tipoDespesa',
      header: 'Categoria',
      cell: ({ getValue }) => (
        <div className="max-w-[280px] truncate font-bold text-white uppercase text-[11px] tracking-tight" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'nomeFornecedor',
      header: 'Fornecedor',
      cell: ({ getValue }) => (
        <div className="max-w-[200px] truncate text-slate-500 text-xs font-medium" title={getValue() as string}>
          {getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'valorLiquido',
      header: 'Valor',
      cell: ({ getValue }) => (
        <span className="font-mono font-black text-emerald-400">
          {formatCurrency(getValue() as number)}
        </span>
      )
    },
    {
      id: 'documento',
      header: 'Doc',
      cell: ({ row }) => {
        const url = row.original.urlDocumento;
        if (!url) return null;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all inline-flex items-center group/doc"
            title="Ver nota fiscal (XML/PDF)">
            <ExternalLink size={14} className="opacity-50 group-hover/doc:opacity-100 transition-opacity" />
          </a>
        );
      }
    }
  ];
}
