import {
  Banknote, Scale, Users,
  BookOpen, ExternalLink, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  {
    question: 'O que é a Cota para Exercício da Atividade Parlamentar (CEAP)?',
    answer: 'É um valor mensal disponível a cada deputado federal para custear despesas no exercício do mandato. O valor varia de R$ 30.788,66 (DF) a R$ 45.612,53 (RR, AC, AM, AP, RO), pois inclui passagens aéreas cujo preço depende da distância do estado até Brasília.',
  },
  {
    question: 'Os deputados podem gastar com qualquer coisa?',
    answer: 'Não. A cota só cobre despesas específicas: passagens aéreas, combustíveis, telefonia, serviços postais, alimentação, hospedagem (fora de Brasília), consultoria, divulgação da atividade parlamentar, segurança e taxas de locação de veículos. Qualquer gasto fora dessas categorias não é ressarcido.',
  },
  {
    question: 'E se o deputado não gastar toda a cota?',
    answer: 'O valor não utilizado não é acumulado. Cada mês tem seu limite e o saldo mensal não utilizado não se soma ao mês seguinte. Os deputados só recebem reembolso por despesas efetivamente comprovadas com notas fiscais.',
  },
  {
    question: 'Como posso ver as notas fiscais de um deputado?',
    answer: 'Neste portal, ao acessar o perfil de qualquer deputado, você verá a lista de despesas com link direto para o PDF da nota fiscal original. Também é possível acessar diretamente pelo site da Câmara ou via API de dados abertos.',
  },
  {
    question: 'Além da cota, os deputados recebem salário?',
    answer: 'Sim. Os deputados federais recebem um subsídio mensal de R$ 44.625,13 (bruto). Além disso, têm direito à verba de gabinete (para contratar até 25 assessores), auxílio-moradia e outras verbas institucionais.',
  },
];

export default function SobrePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-24">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold">
          <BookOpen size={16} /> Guia Completo
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Como Funciona a<br /><span className="text-gold italic">Câmara dos Deputados</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          A Câmara dos Deputados é a casa do povo no Congresso Nacional.
          São 513 deputados federais representando todos os 26 estados e o Distrito Federal.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-gold pl-4">
          <Scale size={24} className="text-gold" />
          <h2 className="text-2xl font-bold text-white">O Papel do Deputado Federal</h2>
        </div>
        <div className="bg-slate-card/30 border border-white/5 rounded-[2rem] p-8 space-y-4 text-slate-300 leading-relaxed">
          <p>Os deputados federais são responsáveis por <strong className="text-white">legislar</strong> (criar e votar leis), <strong className="text-white">fiscalizar</strong> o Poder Executivo e <strong className="text-white">representar</strong> a população brasileira nos debates nacionais.</p>
          <p>Cada deputado é eleito pelo sistema proporcional — o número de cadeiras de cada estado é proporcional à sua população. O mandato dura <strong className="text-gold">4 anos</strong>, com possibilidade de reeleição ilimitada.</p>
          <p>A Câmara funciona em <strong className="text-white">legislaturas</strong> de 4 anos. A legislatura atual é a <strong className="text-gold">57ª</strong> (2023–2027).</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-extrabold text-white text-center">A Cota Parlamentar em Detalhes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-xl font-bold text-gold flex items-center gap-2"><Banknote size={22} /> Valores por Estado</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between p-2 bg-navy/30 rounded-lg"><span className="text-white">DF (menor)</span><span className="text-gold font-bold">R$ 30.788,66</span></div>
              <div className="flex justify-between p-2 bg-navy/30 rounded-lg"><span className="text-white">SP</span><span className="text-gold font-bold">R$ 37.043,53</span></div>
              <div className="flex justify-between p-2 bg-navy/30 rounded-lg"><span className="text-white">RJ</span><span className="text-gold font-bold">R$ 35.759,97</span></div>
              <div className="flex justify-between p-2 bg-navy/30 rounded-lg"><span className="text-white">RR/AC/AM/AP/RO (maior)</span><span className="text-gold font-bold">R$ 45.612,53</span></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><Users size={22} /> Outros Benefícios</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="p-3 bg-navy/30 rounded-lg"><strong className="text-white">Subsídio mensal:</strong> R$ 44.625,13 (bruto)</div>
              <div className="p-3 bg-navy/30 rounded-lg"><strong className="text-white">Verba de Gabinete:</strong> R$ 111.675,59/mês (para até 25 assessores)</div>
              <div className="p-3 bg-navy/30 rounded-lg"><strong className="text-white">Auxílio-moradia:</strong> R$ 4.253,00/mês (se não usar imóvel funcional)</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-extrabold text-white text-center flex items-center justify-center gap-3">
          <HelpCircle className="text-gold" size={28} /> Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <details key={idx}
              className="group bg-slate-card/30 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/20 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="text-white font-bold text-sm pr-4">{faq.question}</span>
                <span className="text-gold shrink-0 group-open:rotate-45 transition-transform text-xl font-light">+</span>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="text-center space-y-6 pb-12">
        <h2 className="text-2xl font-bold text-white">Explore os Dados</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/deputados" className="px-8 py-4 bg-gold text-navy font-bold rounded-2xl hover:bg-gold-hover transition-all shadow-lg shadow-gold/20">
            Ver Deputados
          </Link>
          <a href="https://dadosabertos.camara.leg.br" target="_blank" rel="noopener noreferrer"
            className="px-8 py-4 text-slate-400 font-bold rounded-2xl hover:text-gold transition-all flex items-center gap-2">
            API Dados Abertos <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
