"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2, Home, ChevronDown, ExternalLink, XCircle, AlertTriangle } from 'lucide-react';
import { useBeneficios, useAnosEleito } from '@/hooks/use-camara';
import { YEARS } from '@/features/deputado/constants';

interface HousingAllowanceModalProps {
  deputadoId: number;
  onClose: () => void;
}

export function HousingAllowanceModal({ deputadoId, onClose }: HousingAllowanceModalProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);
  const { data: beneficiosModal, isLoading } = useBeneficios(deputadoId, year);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-card border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        <div className="md:w-5/12 p-10 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><Home size={200} /></div>
          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30"><Home size={28} /></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Regras do Benefício</h3>
              <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <p className="text-slate-400 text-xs font-bold leading-relaxed text-justify">
                Os deputados federais têm direito a receber auxílio-moradia de <span className="text-white">R$ 4.253,00</span> quando não ocupam um dos 447 apartamentos funcionais que a Câmara tem em Brasília.
              </p>
              <p className="text-slate-400 text-xs font-bold leading-relaxed text-justify">
                O auxílio pode ser pago diretamente no contracheque ou por reembolso, mediante recibo de aluguel ou hotel.
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Limite de Complementação</p>
                <p className="text-xs text-blue-400 font-black">R$ 4.148,80 (via Cota)</p>
              </div>
              <p className="text-[10px] text-indigo-400/80 font-black uppercase italic leading-tight">
                * Aqui estão listados apenas os valores brutos do auxílio-moradia.
              </p>
            </div>
          </div>
        </div>

        <div className="md:w-7/12 p-10 flex flex-col bg-slate-card/50 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Detalhamento</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                    className="appearance-none bg-white/10 border border-white/10 rounded-xl px-4 py-1.5 pr-10 text-[10px] font-black uppercase text-blue-400 tracking-widest cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95">
                    {availableYears.map((y) => (<option key={y} value={y} className="bg-navy text-white font-bold">{y}</option>))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400/60"><ChevronDown size={14} /></div>
                </div>
                <Link href={`https://www.camara.leg.br/deputados/${deputadoId}/auxilio-moradia?ano=${year}`} target="_blank"
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400 transition-all group/link" title="Ver Fonte Oficial (Câmara)">
                  <ExternalLink size={14} className="group-hover/link:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all group shadow-inner">
              <XCircle size={24} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[380px] min-h-[350px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sincronizando Histórico...</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="text-[10px] text-slate-500 font-black uppercase tracking-widest pb-2 px-4">Período</th>
                    <th className="text-[10px] text-slate-500 font-black uppercase tracking-widest pb-2 px-4 text-right">Valor Bruto</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiosModal?.auxilio_moradia_mensal ? (
                    beneficiosModal.auxilio_moradia_mensal.map((item, idx) => (
                      <tr key={idx} className="bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                        <td className="py-4 px-4 rounded-l-2xl text-[11px] font-black text-slate-300 uppercase group-hover:text-blue-400 transition-colors border-l border-t border-b border-white/5">
                          {item.mes}
                        </td>
                        <td className="py-4 px-4 rounded-r-2xl text-[11px] font-black text-white text-right font-mono border-r border-t border-b border-white/5">
                          {item.valor}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <AlertTriangle size={32} />
                          <p className="text-[10px] font-black uppercase">Sem lançamentos oficiais para {year}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8">
            <button onClick={onClose}
              className="w-full py-4 bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
