"use client";

import { Loader2, DollarSign, Home, HelpCircle, Globe, Plane, Users, Info } from 'lucide-react';
import { useBeneficios } from '@/hooks/use-camara';
import { CURRENT_YEAR } from '@/features/deputado/constants';

interface BenefitsCardProps {
  deputadoId: number;
  onOpenMoradiaModal: () => void;
}

/**
 * Card do Bento Grid — benefícios e recursos do mandato.
 */
export function BenefitsCard({ deputadoId, onOpenMoradiaModal }: BenefitsCardProps) {
  const { data: beneficiosCard, isLoading } = useBeneficios(deputadoId, CURRENT_YEAR);

  return (
    <div className="lg:col-span-1 bg-navy/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-8 flex flex-col group/beneficios shadow-2xl relative hover:z-50 transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      <div className="flex items-center gap-5 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Benefícios</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">Recursos do Mandato • 2026</p>
        </div>
      </div>
      <div className="flex-1 space-y-4 relative z-10">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Salário */}
            <div className="p-3.5 bg-white/[0.03] rounded-[1.5rem] border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group/item shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-transform"><DollarSign size={16} /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salário Bruto</span>
              </div>
              <span className="text-white font-black text-sm">{beneficiosCard?.salario_bruto || '—'}</span>
            </div>

            {/* Moradia */}
            <div className="p-3.5 bg-white/[0.03] rounded-[1.5rem] border border-white/5 hover:border-blue-500/30 transition-all space-y-4 group/item shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform"><Home size={16} /></div>
                  <div className="flex items-center gap-2 group/tip relative">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moradia</span>
                    <HelpCircle size={10} className="text-slate-600 hover:text-blue-400 transition-colors cursor-help" />
                    <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl text-[9px] leading-relaxed text-slate-300 invisible group-hover/tip:visible z-[100] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 translate-y-2 group-hover/tip:translate-y-0">
                      <p className="font-black text-white mb-2 uppercase text-[8px] tracking-[0.2em] border-b border-white/10 pb-1.5">Regras Oficiais</p>
                      <span className="block mb-2 text-blue-300 font-bold opacity-80">
                        <strong className="text-white">Imóvel Funcional:</strong> Uso de um dos 447 apartamentos funcionais em Brasília.
                      </span>
                      <span className="block text-slate-400 font-medium">
                        <strong className="text-white italic">Auxílio-moradia:</strong> Cota de R$ 4.253,00 para quem não ocupa imóvel oficial.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Imóvel funcional</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${beneficiosCard?.imovel_funcional?.includes('Faz uso') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10' : 'bg-white/5 text-slate-500 border border-white/5 opacity-60'}`}>
                    {beneficiosCard?.imovel_funcional || 'Não informado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auxílio-moradia</span>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => beneficiosCard?.auxilio_moradia_mensal && onOpenMoradiaModal()}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-2 transition-all relative overflow-hidden group/btn
                    ${beneficiosCard?.auxilio_moradia?.includes('Não recebe')
                          ? 'bg-white/5 text-slate-500 border border-white/5 opacity-60'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'}
                    ${beneficiosCard?.auxilio_moradia_mensal
                          ? 'cursor-pointer hover:bg-blue-500/20 active:scale-95'
                          : 'cursor-default'}`}>
                      {beneficiosCard?.auxilio_moradia || 'Não informado'}
                      {beneficiosCard?.auxilio_moradia_mensal && <Info size={12} className="opacity-60 group-hover/btn:scale-125 transition-transform" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Passaporte */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-400/30 transition-all flex items-center justify-between group/passport">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Globe size={14} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Passaporte</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg ${beneficiosCard?.passaporte_diplomatico?.includes('Possui') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm shadow-purple-500/10' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                {beneficiosCard?.passaporte_diplomatico || 'Não informado'}
              </span>
            </div>

            {/* Missões */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-400/30 transition-all flex items-center justify-between group/mission">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 transition-all"><Plane size={14} /></div>
                <div className="flex items-center gap-2 group/tip relative">
                  <span className="text-xs font-bold text-slate-400 uppercase">Missões</span>
                  <HelpCircle size={10} className="text-slate-600 hover:text-rose-400 transition-colors cursor-help" />
                  <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl text-[9px] leading-relaxed text-slate-300 invisible group-hover/tip:visible z-[100] transition-all duration-300 opacity-0 group-hover/tip:opacity-100 translate-y-2 group-hover/tip:translate-y-0">
                    <p className="font-black text-white mb-2 uppercase text-[8px] tracking-[0.2em] border-b border-white/10 pb-1.5">Custos de Viagem</p>
                    <p className="font-medium">
                      Diárias para missões oficiais: <strong className="text-rose-400">R$ 842,00</strong> (nacionais),
                      <strong className="text-rose-400"> US$ 391,00</strong> (América do Sul) e
                      <strong className="text-rose-400"> US$ 428,00</strong> (outros países).
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-white font-black text-sm">{beneficiosCard?.viagens_missao || '0'}</span>
            </div>

            {/* Gabinete */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-all flex items-center justify-between group/office">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Users size={14} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Gabinete</span>
              </div>
              <span className="text-white font-black text-[10px] text-right leading-tight max-w-[140px]">
                {beneficiosCard?.pessoal_gabinete || 'Não informado'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
