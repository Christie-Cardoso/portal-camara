"use client";

import {
  User, DollarSign, Activity, CalendarCheck, Users, FileText,
  PenTool, Gavel, Building2, Home, Minus, XCircle, Info, Share2
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { COMPARISON_YEARS } from '../constants';
import { toPng } from 'html-to-image';

interface ComparisonTableProps {
  stats: any[];
  allReady: boolean;
  winnerIds: number[];
  metrics: any;
  onClear: () => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function ComparisonTable({
  stats,
  allReady,
  winnerIds,
  metrics,
  onClear,
  selectedYear,
  onYearChange
}: ComparisonTableProps) {
  const {
    minGasto, maxOrgaos, maxEmendas, maxAutoria, maxRelatorias,
    maxPresencaLiquida, maxComPresencaLiquida, minStaff,
    maxGasto, minOrgaos, minEmendas, minAutoria, minRelatorias,
    minPresencaLiquida, minComPresencaLiquida, maxFaltas, maxStaff
  } = metrics;

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[stats.length + 1] || 'grid-cols-6';

  const handleShareTwitter = async () => {
    if (!allReady) return;

    const names = stats.map(s => s.profile?.ultimoStatus?.nome || s.profile?.nomeCivil);
    const namesText = names.length === 2
      ? `${names[0]} e ${names[1]}`
      : names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1];

    const winnerNames = stats
      .filter(s => winnerIds.includes(s.id))
      .map(s => s.profile?.ultimoStatus?.nome || s.profile?.nomeCivil);

    let text = `Confira o comparativo parlamentar entre ${namesText} no Portal Câmara! 🏛️📊\n\n`;

    if (winnerNames.length > 0) {
      if (winnerNames.length === 1) {
        text += `👑 ${winnerNames[0]} venceu essa disputa!\n\n`;
      } else {
        text += `🤝 Deu empate entre os campeões: ${winnerNames.join(' e ')}!\n\n`;
      }
    }

    text += `Faça sua própria comparação:\n`;

    try {
      const element = document.getElementById('comparativo-capture');
      if (element) {
        try {
          const buttonsContainer = element.querySelector('.share-buttons-container') as HTMLElement;

          try {
            if (buttonsContainer) buttonsContainer.style.visibility = 'hidden';

            const imageDataUrl = await toPng(element, {
              backgroundColor: '#0F172A',
              pixelRatio: 2,
              skipFonts: true,
              width: element.scrollWidth,
              height: element.scrollHeight,
              style: {
                transform: 'scale(1)',
                margin: '0',
              }
            });

            const url = 'https://portal-camara.vercel.app/comparativo';
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

            try {
              const blob = await (await fetch(imageDataUrl)).blob();

              let copiadoParaAreaDeTransferencia = false;
              try {
                if (navigator.clipboard && window.ClipboardItem) {
                  const item = new ClipboardItem({ "image/png": blob });
                  await navigator.clipboard.write([item]);
                  copiadoParaAreaDeTransferencia = true;
                }
              } catch (e) {
                console.log("Não foi possível copiar para o clipboard nativamente", e);
              }

              if (copiadoParaAreaDeTransferencia) {
                alert("✅ IMAGEM COPIADA COM SUCESSO!\n\nO Twitter não aceita imagens por link, mas já copiamos a imagem para você!\n\nNa tela do Twitter que vai abrir, basta clicar na caixa de texto e apertar Ctrl+V (ou botão direito -> Colar) para colar a imagem!");
                window.open(twitterUrl, '_blank', 'noopener,noreferrer');
                return;
              }

              const file = new File([blob], 'comparativo-batalha.png', { type: 'image/png' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'Comparativo Parlamentar',
                  text: text,
                  url: url,
                  files: [file]
                });
                return;
              } else {
                throw new Error('Web Share API não suportada');
              }
            } catch (shareError) {
              const link = document.createElement('a');
              link.href = imageDataUrl;
              link.download = `comparativo-batalha.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              alert("📸 IMAGEM BAIXADA!\n\nO Twitter bloqueia imagens automáticas por segurança. Baixamos a imagem no seu computador.\n\nPor favor, clique no ícone de Imagem no Twitter e anexe o arquivo 'comparativo-batalha.png' que acabou de ser baixado.");
              window.open(twitterUrl, '_blank', 'noopener,noreferrer');
            }
          } finally {
            if (buttonsContainer) buttonsContainer.style.visibility = 'visible';
          }
        } catch (e: any) {
          console.error('Erro ao gerar printscreen', e);
          alert('Erro ao tentar gerar a imagem: ' + (e?.message || 'Erro desconhecido. Verifique o console.'));
          const url = 'https://portal-camara.vercel.app/comparativo';
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (e) {
      console.error('Erro geral ao processar compartilhamento', e);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-center">
        <div className="inline-flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Detalhes da Comparação</h2>
          <div className="h-1 w-24 bg-gold rounded-full"></div>
        </div>
      </div>

      <div className="bg-slate-card/60 rounded-[2rem] border border-white/5 shadow-2xl overflow-x-auto backdrop-blur-xl">
        {/* Tópico: Identificação */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <User className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Perfil Básico</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Nome Civil</h3>
            </div>
          </div>
          {stats.map(s => (
            <div key={s.id} className="p-5 flex flex-col items-center justify-center text-center border-l border-white/5">
              <span className="text-[11px] font-bold text-slate-300">{s.isReady ? s.profile?.nomeCivil : '—'}</span>
            </div>
          ))}
        </div>

        {/* Tópico: Gastos */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <DollarSign className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Financeiro</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Cota Acumulada</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.totalGasto === minGasto && stats.length > 1 && s.totalGasto > 0;
            const isLoser = allReady && s.totalGasto === maxGasto && stats.length > 1 && maxGasto > 0;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col">
                  <span className={`text-base font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                    {s.isReady ? formatCurrency(s.totalGasto) : (
                      <div className="w-24 h-4 bg-white/5 rounded animate-pulse"></div>
                    )}
                  </span>
                  {s.isReady && (
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total 2023-2026</span>
                  )}
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Econômico
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Gastador
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Atuação (Comissões) */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <Activity className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Atuação</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Comissões</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.numOrgaos === maxOrgaos && s.numOrgaos > 0 && stats.length > 1;
            const isLoser = allReady && s.numOrgaos === minOrgaos && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <span className={`text-2xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                  {s.isReady ? s.numOrgaos : '—'}
                </span>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Ativo
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Menos Ativo
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Frequência Parlamentar */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4 group">
            <CalendarCheck className="text-gold" size={24} />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Presença</span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Plenário</h3>
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gold uppercase px-2 py-0.5 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {COMPARISON_YEARS.map(year => (
                    <option key={year} value={year} className="bg-navy">{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {stats.map(s => {
            const presencaLiquida = s.presencasPlenario - s.faltasPlenario;
            const isWinner = allReady && presencaLiquida === maxPresencaLiquida && stats.length > 1 && presencaLiquida > 0;
            const isLoser = allReady && presencaLiquida === minPresencaLiquida && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                        {s.isReady ? s.presencasPlenario : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Presenças</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black text-white/80">
                        {s.isReady ? s.faltasJustificadas : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Justificadas</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className={`text-base font-black ${s.faltasPlenario > 0 ? (isLoser ? 'text-red-500' : 'text-red-400/80') : 'text-white'}`}>
                        {s.isReady ? s.faltasPlenario : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Faltas</span>
                    </div>
                  </div>
                  <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Plenário • {selectedYear}</span>
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Presente
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Ausente
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Frequência Comissões */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <Users className="text-gold" size={24} />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Presença</span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Comissões</h3>
                <div className="bg-gold/10 px-2 py-0.5 rounded-lg text-[10px] font-black text-gold uppercase">
                  {selectedYear}
                </div>
              </div>
            </div>
          </div>
          {stats.map(s => {
            const comPresencaLiquida = s.comPresenca - s.comFaltasNaoJust;
            const isWinner = allReady && comPresencaLiquida === maxComPresencaLiquida && stats.length > 1 && comPresencaLiquida > 0;
            const isLoser = allReady && comPresencaLiquida === minComPresencaLiquida && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                        {s.isReady ? s.comPresenca : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Presenças</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black text-white/80">
                        {s.isReady ? s.comFaltasJust : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Justificadas</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className={`text-base font-black ${s.comFaltasNaoJust > 0 ? (isLoser ? 'text-red-500' : 'text-red-400/80') : 'text-white'}`}>
                        {s.isReady ? s.comFaltasNaoJust : '—'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Faltas</span>
                    </div>
                  </div>
                  <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Comissões • {selectedYear}</span>
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Presente
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Ausente
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Emendas */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <FileText className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Produção</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Emendas</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.totalEmendas === maxEmendas && stats.length > 1 && s.totalEmendas > 0;
            const isLoser = allReady && s.totalEmendas === minEmendas && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col">
                  <span className={`text-base font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                    {s.isReady ? `${s.totalEmendas} emendas` : '—'}
                  </span>
                  {s.isReady && (
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 text-center">Acumulado 2023-2026</span>
                  )}
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Recordista
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Menos Emendas
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Autoria */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <PenTool className="text-gold" size={24} />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legislativo</span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Autoria</h3>
                <div className="group/info relative cursor-help">
                  <Info size={14} className="text-slate-600 hover:text-gold transition-colors" />
                  <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-navy border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Inclui PEC, Projeto de Lei, e não inclui Atos Processuais nessa soma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.totalAutoria === maxAutoria && stats.length > 1 && s.totalAutoria > 0;
            const isLoser = allReady && s.totalAutoria === minAutoria && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col">
                  <span className={`text-2xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                    {s.isReady ? s.totalAutoria : '—'}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Projetos de Lei • 2023-2026</span>
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Projetos
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Menos Projetos
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Relatorias */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <Gavel className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legislativo</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Relatorias</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.totalRelatorias === maxRelatorias && stats.length > 1 && s.totalRelatorias > 0;
            const isLoser = allReady && s.totalRelatorias === minRelatorias && stats.length > 1;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col">
                  <span className={`text-2xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                    {s.isReady ? s.totalRelatorias : '—'}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Relatados • 2023-2026</span>
                </div>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Mais Relatorias
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Menos Relatorias
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Equipe */}
        <div className={`grid ${gridColsClass} min-w-[800px] border-b border-white/5`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <Users className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gabinete</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Equipe</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = allReady && s.staffCount === minStaff && stats.length > 1 && s.staffCount > 0;
            const isLoser = allReady && s.staffCount === maxStaff && stats.length > 1 && maxStaff > 0;
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : isLoser ? 'bg-red-500/5' : ''}`}>
                <span className={`text-base font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-white'}`}>
                  {s.isReady ? `${s.staffCount} pessoas` : '—'}
                </span>
                {isWinner && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/20">
                    Equipe Enxuta
                  </div>
                )}
                {isLoser && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-500/20">
                    Maior Gabinete
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tópico: Moradia */}
        <div className={`grid ${gridColsClass} min-w-[800px]`}>
          <div className="p-5 bg-white/[0.02] flex items-center gap-4">
            <Building2 className="text-gold" size={24} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Benefício</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Moradia em Brasília</h3>
            </div>
          </div>
          {stats.map(s => {
            const isWinner = s.isReady && s.housingType === 'nenhum';
            return (
              <div key={s.id} className={`px-4 py-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : ''}`}>
                {s.isReady ? (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${s.housingType === 'imovel'
                      ? 'bg-white/5 text-slate-400 border border-white/10'
                      : s.housingType === 'auxilio'
                        ? 'bg-white/5 text-slate-400 border border-white/10'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                      }`}>
                      {s.housingType === 'imovel' ? <Home size={20} /> :
                        s.housingType === 'auxilio' ? <DollarSign size={20} /> :
                          <Minus size={20} />}
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider leading-tight ${isWinner ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                        {s.housingStatus}
                      </span>
                      {s.housingType === 'auxilio' && s.auxilioValor ? (
                        <span className="text-[9px] text-slate-500 font-black tracking-wide">
                          {s.auxilioValor}
                        </span>
                      ) : (
                        <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
                          {s.housingType === 'imovel' ? 'Usa imóvel do governo'
                            : s.housingType === 'auxilio' ? 'Valor não informado'
                              : 'Custo zero para o Estado'}
                        </span>
                      )}
                    </div>
                    {isWinner && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[7px] font-black uppercase rounded-md border border-emerald-500/20">
                        Econômico
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-12 pb-20 gap-4 flex-wrap share-buttons-container">
        <button
          onClick={handleShareTwitter}
          className="flex items-center gap-3 px-8 py-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/20 hover:border-[#1DA1F2]/40 rounded-3xl transition-all active:scale-95 shadow-[0_0_20px_rgba(29,161,242,0.1)] hover:shadow-[0_0_30px_rgba(29,161,242,0.2)]"
        >
          <Share2 size={20} />
          <span className="text-[11px] font-black uppercase tracking-widest cursor-pointer">Compartilhar no Twitter</span>
        </button>

        <button
          onClick={onClear}
          className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-3xl transition-all active:scale-95"
        >
          <XCircle size={20} />
          <span className="text-[11px] font-black uppercase tracking-widest cursor-pointer">Limpar Comparação</span>
        </button>
      </div>
    </div>
  );
}
