'use client';

import { useState } from 'react';
import { useDeputados } from '@/hooks/use-camara';
import { DeputadoGridSkeleton } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import {
  ArrowRight, Search, Zap, Crown, Users, Landmark,
  Receipt, FileText, Vote, Scale, Shield, Banknote,
  MapPin, Building2, AlertTriangle, ExternalLink, Info
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState('');

  const { data: deputadosData, isLoading: loadingDep, isError: errorDep, refetch: refetchDep } = useDeputados({ itens: 10 });
  const topDeputados = deputadosData?.items || [];
  const totalDeputados = topDeputados.length > 0 ? 513 : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/deputados?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      {/* ─── Hero ─── */}
      <section className="relative h-[55vh] min-h-[480px] flex flex-col items-center justify-center text-center space-y-6 overflow-hidden rounded-[3rem] bg-gradient-to-b from-navy to-slate-card/20 border border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-gold/10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold animate-pulse">
          <Zap size={16} />
          <span>Dados em tempo real da Câmara dos Deputados</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
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
            <input type="text" value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Pesquisar deputado por nome..."
              className="pl-12 pr-6 py-4 bg-navy/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all w-full backdrop-blur-md" />
          </div>
          <button type="submit"
            className="px-8 py-4 bg-gold text-navy font-bold rounded-2xl hover:bg-gold-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20 cursor-pointer shrink-0">
            Pesquisar <ArrowRight size={20} />
          </button>
        </form>
      </section>

      {/* ─── Quanto custa um deputado ─── */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Quanto custa um <span className="text-gold italic">Deputado Federal</span>?
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

      {/* ─── Sistema Eleitoral: Votação Proporcional ─── */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-l-4 border-gold pl-4">
          <Vote size={24} className="text-gold" />
          <h2 className="text-2xl font-bold text-white">Como os Deputados são Eleitos?</h2>
        </div>

        <div className="bg-slate-card/30 border border-white/5 rounded-[2rem] p-8 space-y-6 text-slate-300 leading-relaxed">
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
        <div className="bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 shrink-0">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pl-18">
            <div className="flex items-center gap-6 px-6 py-4 bg-navy/50 rounded-2xl border border-white/5">
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

      {/* ─── Deputados em Destaque ─── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crown className="text-gold" size={24} />
            Deputados em Exercício
          </h2>
          <Link href="/deputados" className="text-gold text-sm font-semibold hover:underline flex items-center gap-1">
            Ver todos os 513 <ArrowRight size={14} />
          </Link>
        </div>

        {loadingDep && <DeputadoGridSkeleton count={10} />}
        {errorDep && <ErrorState compact onRetry={() => refetchDep()} />}

        {!loadingDep && !errorDep && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topDeputados.map((dep) => (
              <Link key={dep.id} href={`/deputados/${dep.id}`}
                className="bg-slate-card border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all group">
                <div className="relative h-48 bg-gradient-to-b from-gold/5 to-transparent flex items-center justify-center overflow-hidden">
                  <Image src={dep.urlFoto} alt={dep.nome} width={120} height={160}
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform" unoptimized />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-white font-bold text-sm truncate group-hover:text-gold transition-colors">{dep.nome}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-black rounded-full">{dep.siglaPartido}</span>
                    <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[10px] font-bold rounded-full">{dep.siglaUf}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Como Funciona ─── */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            O que pode ser pago com a <span className="text-gold italic">Cota Parlamentar</span>?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A CEAP (Cota para Exercício da Atividade Parlamentar) cobre despesas operacionais do mandato.
          </p>
        </div>

        <div className="bg-slate-card/30 border border-gold/20 rounded-[2rem] p-8 backdrop-blur-md">
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
    </div>
  );
}
