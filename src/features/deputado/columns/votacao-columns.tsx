"use client";

import { ColumnDef } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ExternalLink, CheckCircle2, XCircle, Info } from 'lucide-react';
import { ORGAOS_MAP } from '@/features/deputado/constants';
import type { Votacao } from '@/lib/camara';

export function getVotacaoColumns(): ColumnDef<Votacao>[] {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-gold/20 text-gold rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'dataHoraRegistro',
      header: 'Data / Hora',
      cell: ({ getValue }) => (
        <div className="flex flex-col">
          <span className="text-white font-bold">{new Date(getValue() as string).toLocaleDateString('pt-BR')}</span>
          <span className="text-xs text-slate-500">{new Date(getValue() as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'objeto',
      header: 'Objeto da Votação',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-white font-black tracking-tight text-sm uppercase">
            {row.original.proposicaoObjeto && typeof row.original.proposicaoObjeto === 'object'
              ? `${(row.original.proposicaoObjeto as any).siglaTipo} ${(row.original.proposicaoObjeto as any).numero}/${(row.original.proposicaoObjeto as any).ano}`
              : row.original.descricao || 'Votação de Expediente'}
          </span>
          <p className="text-xs text-slate-500 line-clamp-1 italic">{row.original.descricao}</p>
        </div>
      )
    },
    {
      accessorKey: 'siglaOrgao',
      header: 'Órgão',
      cell: ({ getValue }) => {
        const sigla = getValue() as string;
        const nomeCompleto = ORGAOS_MAP[sigla] || 'Órgão Legislativo / Comissão';
        return (
          <div className="flex items-center gap-2 group/tip relative">
            <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-xs font-black rounded border border-white/5 whitespace-nowrap">
              {sigla}
            </span>
            <div className="p-1 bg-blue-500/10 text-blue-400 rounded-full cursor-help hover:bg-blue-500/20 transition-all shadow-sm" title={nomeCompleto}>
              <Info size={10} />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'aprovacao',
      header: 'Resultado',
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${(getValue() as number) === 1
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
            {(getValue() as number) === 1 ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {(getValue() as number) === 1 ? 'APROVADA' : 'REJEITADA'}
          </div>
          <a href={`https://dadosabertos.camara.leg.br/api/v2/votacoes/${row.original.id}`}
            target="_blank" rel="noopener noreferrer"
            className="p-1.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-500 hover:text-gold rounded-xl transition-all group/api"
            title="Dados Brutos (API)">
            <ExternalLink size={10} className="opacity-50 group-hover/api:opacity-100 transition-opacity" />
          </a>
        </div>
      )
    }
  ];
}
