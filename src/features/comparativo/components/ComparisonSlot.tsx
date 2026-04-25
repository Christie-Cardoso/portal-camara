"use client";

import { useState } from 'react';
import { X, Plus, Crown } from 'lucide-react';
import Image from 'next/image';
import { SlotSearchOverlay } from './SlotSearchOverlay';

interface ComparisonSlotProps {
  id?: number;
  profile?: any;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  rank: number;
  isWinner?: boolean;
}

export function ComparisonSlot({
  id,
  profile,
  onSelect,
  onRemove,
  rank,
  isWinner
}: ComparisonSlotProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className={`relative flex flex-col items-center justify-center aspect-auto md:aspect-[3/4] min-h-[240px] md:min-h-0 rounded-[2rem] border-2 border-dashed transition-all duration-500 group ${profile
      ? 'bg-slate-card/80 border-gold/20 shadow-2xl shadow-black/40'
      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5'
      }`}>
      {/* Botão de remover — FORA do overflow para nunca ficar atrás da imagem */}
      {profile && (
        <button
          onClick={() => onRemove(id!)}
          className="absolute -top-2 -right-2 z-30 p-2 bg-navy hover:bg-red-500 text-slate-400 hover:text-white rounded-full border-2 border-white/10 hover:border-red-500 transition-all hover:scale-110 active:scale-90 shadow-xl shadow-black/50 cursor-pointer"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}

      {profile ? (
        <>
          {/* Coroa do campeão — flutuando acima do card */}
          {isWinner && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 animate-[float_2s_ease-in-out_infinite]">
              <div className="bg-gold text-navy p-2.5 rounded-2xl shadow-xl shadow-gold/40 border-2 border-yellow-200">
                <Crown size={22} strokeWidth={3} />
              </div>
            </div>
          )}
          <div className="w-full h-full relative p-4 flex flex-col items-center overflow-hidden rounded-[1.8rem]">
            <div className={`relative w-full aspect-square max-w-[180px] rounded-[1.5rem] overflow-hidden border shadow-2xl mb-3 group-hover:scale-105 transition-transform duration-500 ${isWinner ? 'border-gold shadow-[0_0_30px_rgba(255,215,0,0.3)] ring-2 ring-gold/20' : 'border-white/10'
              }`}>
              <Image
                src={profile.ultimoStatus.urlFoto}
                alt={profile.ultimoStatus.nome}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="text-center space-y-1 w-full translate-y-0 group-hover:-translate-y-2 transition-transform">
              {isWinner && (
                <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em] mb-1 block animate-pulse">
                  Campeão
                </span>
              )}
              <h3 className={`text-xs font-black uppercase tracking-tighter line-clamp-2 leading-tight px-1 ${isWinner ? 'text-gold' : 'text-white'}`}>
                {profile.ultimoStatus.nome}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {profile.ultimoStatus.siglaPartido}
                </span>
                <span className="px-2 py-0.5 bg-white/5 text-slate-400 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {profile.ultimoStatus.siglaUf}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="flex flex-col items-center justify-center p-6 text-center space-y-4 w-full h-full cursor-pointer"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gold/5 border-2 border-dashed border-gold/30 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-all duration-500 shadow-[0_0_20px_rgba(255,215,0,0.05)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]">
              <Plus size={32} strokeWidth={2.5} className="text-gold/40 group-hover:text-gold group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-gold/20 animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="text-[10px] font-black text-gold/60 uppercase tracking-[0.2em] group-hover:text-gold transition-colors duration-300">
            Adicionar Parlamentar
          </span>
        </button>
      )}

      {showSearch && (
        <div className="absolute inset-0 z-40 rounded-[2.3rem] overflow-hidden">
          <SlotSearchOverlay
            onSelect={(selectedId) => {
              onSelect(selectedId);
              setShowSearch(false);
            }}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}
    </div>
  );
}
