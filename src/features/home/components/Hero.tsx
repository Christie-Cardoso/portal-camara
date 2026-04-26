"use client";

import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/deputados?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[420px] md:h-[55vh] md:min-h-[480px] flex flex-col items-center justify-center text-center space-y-6 overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-navy to-slate-card/20 border border-white/5 py-12 md:py-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-gold/10 pointer-events-none" />

      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight px-4">
        Fiscalize seus <span className="text-gold italic">Deputados</span>
      </h1>

      <p className="text-slate-400 text-lg md:text-xl max-w-2xl px-4">
        Acompanhe cada centavo da cota parlamentar. Veja quem gasta mais,
        como vota e o que propõe. Dados 100% oficiais e atualizados diariamente.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-xl px-4">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-gold transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            value={heroSearch} 
            onChange={(e) => setHeroSearch(e.target.value)}
            placeholder="Pesquisar deputado por nome..."
            className="pl-12 pr-6 py-4 bg-navy/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all w-full backdrop-blur-md" 
          />
        </div>
        <button 
          type="submit"
          className="px-8 py-4 bg-gold text-navy font-bold rounded-2xl hover:bg-gold-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20 cursor-pointer shrink-0"
        >
          Pesquisar <ArrowRight size={20} />
        </button>
      </form>
    </section>
  );
}
