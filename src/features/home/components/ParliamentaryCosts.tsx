"use client";

import { Banknote, Receipt, Users, Landmark } from 'lucide-react';

export function ParliamentaryCosts() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Quanto custa um <span className="text-gold italic">Deputado Federal ?</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">Cada deputado recebe salário, cota parlamentar e verba de gabinete — tudo pago com dinheiro público.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-card border border-white/5 rounded-2xl p-6 group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Banknote size={24} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salário Bruto Mensal</span>
          </div>
          <span className="text-3xl font-black text-gold">R$ 44.625</span>
          <p className="text-slate-600 text-[10px] mt-1">Subsídio parlamentar fixo</p>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-slate-card border border-white/5 rounded-2xl p-6 group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Receipt size={24} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cota Parlamentar</span>
          </div>
          <span className="text-3xl font-black text-white">R$ 30K–45K</span>
          <p className="text-slate-600 text-[10px] mt-1">CEAP mensal (varia por UF)</p>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-slate-card border border-white/5 rounded-2xl p-6 group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verba de Gabinete</span>
          </div>
          <span className="text-3xl font-black text-white">R$ 111.675</span>
          <p className="text-slate-600 text-[10px] mt-1">Até 25 assessores/mês</p>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-slate-card border border-gold/30 rounded-2xl p-6 group relative overflow-hidden bg-gradient-to-br from-gold/5 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Landmark size={24} />
            </div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Custo total estimado</span>
          </div>
          <span className="text-3xl font-black text-gold">~R$ 200K</span>
          <p className="text-slate-600 text-[10px] mt-1">Por mês, por deputado</p>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
