"use client";

import { Crown, Users, TrendingUp, Trophy, Medal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/formatters';

const TOP_10_VOTADOS = [
  { id: 209787, nome: "Nikolas Ferreira", partido: "PL", uf: "MG", votos: 1492047, foto: "https://www.camara.leg.br/internet/deputado/bandep/209787.jpg" },
  { id: 220639, nome: "Guilherme Boulos", partido: "PSOL", uf: "SP", votos: 1001472, foto: "https://www.camara.leg.br/internet/deputado/bandep/220639.jpg" },
  { id: 204507, nome: "Carla Zambelli", partido: "PL", uf: "SP", votos: 946244, foto: "https://www.camara.leg.br/internet/deputado/bandep/204507.jpg" },
  { id: 92346, nome: "Eduardo Bolsonaro", partido: "PL", uf: "SP", votos: 741070, foto: "https://www.camara.leg.br/internet/deputado/bandep/92346.jpg" },
  { id: 220663, nome: "Ricardo Salles", partido: "PL", uf: "SP", votos: 640918, foto: "https://www.camara.leg.br/internet/deputado/bandep/220663.jpg" },
  { id: 220642, nome: "Delegado Bruno Lima", partido: "PP", uf: "SP", votos: 461217, foto: "https://www.camara.leg.br/internet/deputado/bandep/220642.jpg" },
  { id: 220653, nome: "Fábio Teruel", partido: "MDB", uf: "SP", votos: 448573, foto: "https://www.camara.leg.br/internet/deputado/bandep/220653.jpg" },
  { id: 204536, nome: "Kim Kataguiri", partido: "UNIÃO", uf: "SP", votos: 295460, foto: "https://www.camara.leg.br/internet/deputado/bandep/204536.jpg" },
  { id: 73431, nome: "Rui Falcão", partido: "PT", uf: "SP", votos: 271992, foto: "https://www.camara.leg.br/internet/deputado/bandep/73431.jpg" },
  { id: 220645, nome: "Erika Hilton", partido: "PSOL", uf: "SP", votos: 256903, foto: "https://www.camara.leg.br/internet/deputado/bandep/220645.jpg" },
].sort((a, b) => b.votos - a.votos);

const TOP_10_PARTIDOS = [
  { sigla: "PL", nome: "Partido Liberal", total: 99, cor: "#004a8d" },
  { sigla: "PT", nome: "Partido dos Trabalhadores", total: 68, cor: "#cc0000" },
  { sigla: "UNIÃO", nome: "União Brasil", total: 59, cor: "#003399" },
  { sigla: "PP", nome: "Progressistas", total: 47, cor: "#0080c0" },
  { sigla: "MDB", nome: "Movimento Democrático Brasileiro", total: 42, cor: "#00914c" },
  { sigla: "PSD", nome: "Partido Social Democrático", total: 42, cor: "#005da9" },
  { sigla: "Repub", nome: "Republicanos", total: 40, cor: "#005599" },
  { sigla: "PDT", nome: "Partido Democrático Trabalhista", total: 17, cor: "#ed1c24" },
  { sigla: "PSB", nome: "Partido Socialista Brasileiro", total: 14, cor: "#ffcc00" },
  { sigla: "PSOL", nome: "Partido Socialismo e Liberdade", total: 12, cor: "#ffcd00" },
];

export function RankingsSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Coluna: Top 10 Votados */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-gold pl-4">
          <Trophy className="text-gold" size={24} />
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Top 10 Votação</h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">57ª Legislatura (2022)</span>
          </div>
        </div>

        <div className="bg-slate-card/30 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
          <div className="divide-y divide-white/5">
            {TOP_10_VOTADOS.map((dep, idx) => (
              <Link 
                key={dep.id} 
                href={`/deputados/${dep.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gold/5 transition-all group"
              >
                <div className="relative shrink-0">
                  <div className={`w-6 h-6 absolute -top-2 -left-2 z-10 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${
                    idx === 0 ? 'bg-gold text-navy' : 
                    idx === 1 ? 'bg-slate-300 text-navy' : 
                    idx === 2 ? 'bg-amber-700 text-white' : 
                    'bg-navy text-slate-400 border border-white/10'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-gold/50 transition-colors">
                    <Image src={dep.foto} alt={dep.nome} width={48} height={48} className="object-cover" unoptimized />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase truncate group-hover:text-gold transition-colors">
                    {dep.nome}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{dep.partido}-{dep.uf}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-black text-gold/80">{formatNumber(dep.votos)} votos</span>
                  </div>
                </div>

                {idx < 3 && <Medal className={idx === 0 ? 'text-gold' : idx === 1 ? 'text-slate-300' : 'text-amber-700'} size={20} />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna: Top 10 Partidos */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
          <TrendingUp className="text-blue-500" size={24} />
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Maiores Bancadas</h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total de Deputados na Câmara</span>
          </div>
        </div>

        <div className="bg-slate-card/30 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md p-6 space-y-6">
          {TOP_10_PARTIDOS.map((partido, idx) => {
            const percentage = (partido.total / 513) * 100;
            return (
              <div key={partido.sigla} className="space-y-2 group">
                <div className="flex items-center justify-between text-xs font-black">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 text-[10px] w-4">{idx + 1}</span>
                    <span className="text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{partido.sigla}</span>
                    <span className="text-[9px] text-slate-500 font-medium truncate max-w-[150px] md:max-w-none">{partido.nome}</span>
                  </div>
                  <span className="text-white">{partido.total} <span className="text-slate-600 font-bold text-[9px]">DEPS</span></span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 group-hover:brightness-125"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: partido.cor,
                      boxShadow: `0 0 15px ${partido.cor}33`
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total da Casa</p>
            <p className="text-xs font-black text-white">513 Cadeiras</p>
          </div>
        </div>
      </div>
    </section>
  );
}
