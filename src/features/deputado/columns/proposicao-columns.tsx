"use client";

import { ColumnDef } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ExternalLink, Info } from 'lucide-react';
import { PROPOSICOES_MAP } from '@/lib/constants';
import type { Proposicao } from '@/lib/camara';

export function getProposicaoColumns(): ColumnDef<Proposicao>[] {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getIsExpanded() ? (
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg"><ChevronUp size={14} /></div>
          ) : (
            <div className="p-1.5 bg-white/5 text-slate-500 rounded-lg group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'dataApresentacao',
      header: 'Data',
      cell: ({ row }) => {
        const dataStr = row.original.dataApresentacao;
        if (!dataStr) return <span className="text-slate-500">—</span>;
        return (
          <div className="flex flex-col">
            <span className="text-white font-bold">{new Date(dataStr).toLocaleDateString('pt-BR')}</span>
            <span className="text-xs text-slate-500">{new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'siglaTipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const sigla = row.original.siglaTipo;
        const nomeCompleto = PROPOSICOES_MAP[sigla] || 'Tipo de Matéria Legislativa';
        return (
          <div className="flex items-center gap-2 group/tip relative">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-black rounded border border-blue-500/20 uppercase">
              {sigla}
            </span>
            <div className="p-1 bg-blue-500/10 text-blue-400 rounded-full cursor-help hover:bg-blue-500/20 transition-all shadow-sm" title={nomeCompleto}>
              <Info size={12} />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'numero',
      header: 'Número/Ano',
      cell: ({ row }) => (
        <span className="text-white font-black text-sm">
          {row.original.numero}/{row.original.ano}
        </span>
      )
    },
    {
      accessorKey: 'ementa',
      header: 'Ementa / Assunto',
      cell: ({ getValue }) => (
        <p className="text-xs text-slate-400 line-clamp-2 italic max-w-md leading-relaxed group-hover:text-slate-300 transition-colors">
          {getValue() as string}
        </p>
      )
    },
    {
      accessorKey: 'statusProposicao.descricaoSituacao',
      header: 'Situação',
      cell: ({ row }) => {
        const situacao = row.original.statusProposicao?.descricaoSituacao;
        return (
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 border rounded-full text-xs font-bold transition-all ${situacao
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-white/5 border-white/5 text-slate-500 italic'
              }`}>
              {situacao || 'Clique p/ ver detalhes'}
            </div>
            <a href={`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${row.original.id}`}
              target="_blank" rel="noopener noreferrer"
              className="p-1.5 bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 text-slate-500 hover:text-gold rounded-xl transition-all group/api"
              title="Ver Dados Completos (API)">
              <ExternalLink size={10} className="opacity-50 group-hover/api:opacity-100 transition-opacity" />
            </a>
          </div>
        );
      }
    }
  ];
}
