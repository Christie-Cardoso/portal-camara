"use client";

import { Vote, AlertTriangle, ExternalLink } from 'lucide-react';

export function ElectionSystem() {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3 border-l-4 border-gold pl-4">
        <Vote size={24} className="text-gold" />
        <h2 className="text-2xl font-bold text-white">Como os Deputados são Eleitos?</h2>
      </div>

      <div className="bg-slate-card/30 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
        <p>
          No Brasil, os deputados federais são eleitos pelo <strong className="text-white">sistema proporcional</strong>. 
          Isso significa que o voto do eleitor vai primeiro para o <strong className="text-gold">partido ou coligação</strong>, 
          e depois é distribuído entre os candidatos mais votados da lista.
        </p>
        <p>
          Cada estado tem um número fixo de cadeiras (proporcional à população). O total de votos válidos do 
          estado é dividido pelo número de cadeiras, gerando o <strong className="text-white">quociente eleitoral</strong> — 
          o número mínimo de votos que um partido precisa para conquistar uma vaga. As vagas são distribuídas 
          aos partidos proporcionalmente aos votos totais que receberam.
        </p>
        <p>
          Na prática, isso cria um fenômeno polêmico: <strong className="text-white">um candidato com poucos votos pessoais 
          pode se eleger graças aos votos de outro candidato muito votado do mesmo partido</strong>. Os votos 
          do &ldquo;puxador de votos&rdquo; ajudam a conquistar mais cadeiras para o partido, e essas vagas 
          vão para os próximos candidatos mais votados da lista — mesmo que eles sozinhos não tenham 
          atingido o quociente.
        </p>
      </div>

      {/* Destaque: Só 28 se elegeram com próprios votos */}
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 md:w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">
              Apenas 28 dos 513 deputados se elegeram com os próprios votos
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Levantamento do <strong className="text-slate-300">Congresso em Foco</strong> mostrou que na 
              eleição de 2022, apenas <strong className="text-gold">28 deputados federais</strong> atingiram 
              individualmente o quociente eleitoral de seus estados — ou seja, tiveram votos suficientes 
              para se eleger sozinhos. Os outros <strong className="text-white">485 deputados</strong> só 
              conquistaram a vaga graças aos votos totais do partido/coligação, incluindo votos de legenda 
              e de outros candidatos mais votados.
            </p>
            <p className="text-slate-400 text-sm">
              Isso significa que <strong className="text-gold">94,5% da Câmara dos Deputados</strong> foi 
              eleita pelo sistema de &ldquo;puxamento&rdquo; de votos — um aspecto controverso do sistema 
              proporcional brasileiro que muitos eleitores desconhecem.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:pl-18">
          <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 bg-navy/50 rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto">
            <div className="text-center">
              <p className="text-4xl font-black text-gold">28</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Votos próprios</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl font-black text-red-400">485</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">&ldquo;Puxados&rdquo;</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl font-black text-white">513</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</p>
            </div>
          </div>

          <a
            href="https://www.congressoemfoco.com.br/noticia/10993/so-28-dos-513-deputados-se-elegeram-apenas-com-os-proprios-votos-veja-lista"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 font-bold rounded-2xl hover:bg-blue-500/20 transition-all border border-blue-500/20 text-sm"
          >
            <ExternalLink size={16} />
            Ver matéria completa — Congresso em Foco
          </a>
        </div>
      </div>

      {/* Progress bar visual */}
      <div className="space-y-3 px-4">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-gold">Eleitos com próprios votos (5.5%)</span>
          <span className="text-red-400">Eleitos por &ldquo;puxamento&rdquo; (94.5%)</span>
        </div>
        <div className="h-6 bg-red-500/20 rounded-full overflow-hidden border border-red-500/10">
          <div className="h-full bg-gradient-to-r from-gold to-gold-hover rounded-full transition-all" style={{ width: '5.5%' }} />
        </div>
      </div>
    </section>
  );
}
