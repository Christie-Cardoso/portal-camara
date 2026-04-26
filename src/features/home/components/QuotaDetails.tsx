"use client";

export function QuotaDetails() {
  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          O que pode ser pago com a <span className="text-gold italic">Cota Parlamentar</span>?
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          A CEAP (Cota para Exercício da Atividade Parlamentar) cobre despesas operacionais do mandato.
        </p>
      </div>

      <div className="bg-slate-card/30 border border-gold/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
          <ul className="space-y-3">
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">✈️ Passagens aéreas</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">⛽ Combustíveis e lubrificantes</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">📱 Telefonia e internet</li>
          </ul>
          <ul className="space-y-3">
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">📰 Divulgação parlamentar</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">🏨 Hospedagem (fora de BSB)</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">🍽️ Alimentação</li>
          </ul>
          <ul className="space-y-3">
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">📮 Serviços postais</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">🔒 Segurança</li>
            <li className="p-3 bg-navy/30 rounded-xl border border-white/5">📋 Consultoria e assessoria</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
