"use client";

import { useState } from 'react';
import { useComparisonData } from '@/features/comparativo/hooks/useComparisonData';
import { ComparisonSlot } from '@/features/comparativo/components/ComparisonSlot';
import { Top15Ranking } from '@/features/comparativo/components/Top15Ranking';
import { ComparisonTable } from '@/features/comparativo/components/ComparisonTable';
import { Swords, ArrowRight, RotateCcw } from 'lucide-react';
import { CURRENT_YEAR } from '@/features/deputado/constants';

export default function ComparativoPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const { stats, allReady, winnerIds, metrics } = useComparisonData(selectedIds, selectedYear);

  const handleSelect = (id: number) => {
    if (!selectedIds.includes(id) && selectedIds.length < 5) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(prev => prev.filter(item => item !== id));
    // Se sobrar menos de 2, sai do modo comparação
    if (selectedIds.length <= 2) {
      setIsComparing(false);
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
    setIsComparing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
          Comparativo <span className="text-gold">Parlamentar</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Selecione até 5 deputados para comparar métricas de atuação, gastos e presença.
        </p>
      </div>

      {/* Comparison Slots Section - Dinâmico */}
      <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
        {selectedIds.map((id, idx) => (
          <div key={id} className="w-[calc(50%-0.5rem)] md:w-[calc(20%-1rem)] min-w-[160px]">
            <ComparisonSlot
              rank={idx + 1}
              id={id}
              profile={stats[idx]?.profile}
              onSelect={handleSelect}
              onRemove={handleRemove}
              isWinner={isComparing && winnerIds.includes(id)}
            />
          </div>
        ))}
        
        {selectedIds.length < 5 && (
          <div className="w-[calc(50%-0.5rem)] md:w-[calc(20%-1rem)] min-w-[160px] animate-in zoom-in-95 duration-500">
            <ComparisonSlot
              rank={selectedIds.length + 1}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          </div>
        )}
      </div>

      {/* Botão de Ação "Comparar" - Aparece apenas quando 2+ selecionados e não comparando */}
      {!isComparing && selectedIds.length >= 2 && (
        <div className="flex justify-center animate-in zoom-in-95 fade-in duration-500">
          <button
            onClick={() => setIsComparing(true)}
            className="group relative flex items-center gap-4 px-10 py-5 bg-gold text-navy rounded-full font-black uppercase tracking-widest overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-[0_0_60px_rgba(255,215,0,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-[-20deg]"></div>
            <Swords size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="text-lg">Comparar Agora</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Conditional Content: TOP 15 or TABLE */}
      <div className="relative">
        {!isComparing ? (
          <Top15Ranking selectedIds={selectedIds} onSelect={handleSelect} />
        ) : (
          <ComparisonTable
            stats={stats}
            allReady={allReady}
            winnerIds={winnerIds}
            metrics={metrics}
            onClear={handleClear}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        )}
      </div>
    </div>
  );
}
