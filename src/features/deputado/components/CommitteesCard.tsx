"use client";

import { Loader2 } from 'lucide-react';
import { useDeputadoOrgaos } from '@/hooks/use-camara';

interface CommitteesCardProps {
  deputadoId: number;
}

/**
 * Card do Bento Grid — comissões e órgãos onde o deputado atua.
 */
export function CommitteesCard({ deputadoId }: CommitteesCardProps) {
  const { data: orgaosData, isLoading } = useDeputadoOrgaos(deputadoId);
  const orgaos = orgaosData?.items?.filter(o => !o.dataFim) || [];

  return (
    <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-8 flex flex-col group/comis h-full shadow-2xl relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover/comis:opacity-100 transition-opacity"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">Comissões</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Atuação ativa</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-500/5">
          <span className="text-emerald-400 font-black text-sm">{orgaos.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
        ) : orgaos.length > 0 ? (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar h-[480px]">
            {orgaos.map((orgao) => (
              <div key={orgao.idOrgao} className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all space-y-3 group/item shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 group-hover/item:bg-emerald-500/30 transition-colors">{orgao.siglaOrgao}</span>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{orgao.titulo}</span>
                </div>
                <p className="text-slate-200 text-[13px] font-bold leading-relaxed group-hover:text-white transition-colors">{orgao.nomePublicacao || orgao.nomeOrgao}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10 opacity-50">
            <p className="text-slate-500 text-sm italic">Nenhuma participação identificada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
