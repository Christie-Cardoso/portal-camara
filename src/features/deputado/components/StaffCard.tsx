"use client";

import { useMemo } from 'react';
import { Loader2, Users, DollarSign, MapPin } from 'lucide-react';
import { useSecretarios, useBeneficios } from '@/hooks/use-camara';
import { formatCurrency } from '@/lib/formatters';
import { CURRENT_YEAR } from '@/features/deputado/constants';

interface StaffCardProps {
  deputadoId: number;
  deputadoNome: string;
  siglaUf: string;
}

/**
 * Card do Bento Grid — equipe de gabinete (assessores).
 */
export function StaffCard({ deputadoId, deputadoNome, siglaUf }: StaffCardProps) {
  const { data: secretarios, isLoading } = useSecretarios(deputadoNome);
  const { data: beneficiosCard } = useBeneficios(deputadoId, CURRENT_YEAR);

  const filteredSecretarios = useMemo(() => {
    if (!secretarios) return [];
    if (!beneficiosCard?.pessoal_gabinete_nomes || beneficiosCard.pessoal_gabinete_nomes.length === 0) {
      return secretarios;
    }
    const activeNames = beneficiosCard.pessoal_gabinete_nomes.map(n =>
      n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    );
    return secretarios.filter(s => {
      const normalizedS = s.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return activeNames.some(active => {
        if (normalizedS === active) return true;
        const partsS = normalizedS.split(/\s+/);
        const partsA = active.split(/\s+/);
        if (partsS[0] === partsA[0] && partsS[partsS.length - 1] === partsA[partsA.length - 1]) return true;
        return false;
      });
    });
  }, [secretarios, beneficiosCard?.pessoal_gabinete_nomes]);

  return (
    <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-6 flex flex-col group/equipe shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover/equipe:opacity-100 transition-opacity"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">Equipe</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Assessores ativos</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full shadow-lg shadow-purple-500/5">
          <span className="text-purple-400 font-black text-sm">{filteredSecretarios?.length || 0}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
        ) : filteredSecretarios && filteredSecretarios.length > 0 ? (
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-[540px]">
            {filteredSecretarios.map((sec, i) => (
              <div key={`${sec.nome}-${i}`} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all group/item relative overflow-hidden shadow-sm">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="text-white text-sm font-black uppercase truncate flex-1 group-hover/item:text-purple-400 transition-colors">{sec.nome}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tighter shadow-sm ${sec.cargo.startsWith('CNE')
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                    }`}>
                    {sec.cargo.startsWith('CNE') ? 'CNE' : 'SP'}
                  </span>
                </div>
                <p className="text-slate-500 text-[10px] font-bold truncate mb-3">{sec.cargo}</p>
                <div className="flex items-center gap-3">
                  {sec.remuneracao_bruta && sec.remuneracao_bruta > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 rounded-xl border border-emerald-500/20 shadow-sm" title={`Líquido Aproximado: ${formatCurrency(sec.remuneracao_liquida || 0)}`}>
                      <DollarSign size={10} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400">{formatCurrency(sec.remuneracao_bruta || 0)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                    <MapPin size={10} /> {siglaUf}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
            <Users size={40} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 text-sm italic">Nenhum assessor identificado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
