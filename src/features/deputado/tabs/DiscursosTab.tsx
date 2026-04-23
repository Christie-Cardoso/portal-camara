"use client";

import { useState, useMemo } from 'react';
import { Calendar, History, Info, ChevronDown, ExternalLink, FileText, Mic2, Play, Quote } from 'lucide-react';
import { useDeputadoDiscursos, useAnosEleito } from '@/hooks/use-camara';
import { CURRENT_YEAR, YEARS, MONTHS } from '@/features/deputado/constants';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/LoadingState';

interface DiscursosTabProps {
  deputadoId: number;
}

export function DiscursosTab({ deputadoId }: DiscursosTabProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState('all');
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState(10);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: dynamicYears } = useAnosEleito(deputadoId);
  const availableYears = useMemo(() => dynamicYears && dynamicYears.length > 0 ? dynamicYears : YEARS, [dynamicYears]);

  const params = useMemo(() => {
    const p: any = { pagina: page, itens };
    if (month === 'all') { p.dataInicio = `${year}-01-01`; p.dataFim = `${year}-12-31`; }
    else { const lastDay = new Date(year, parseInt(month), 0).getDate(); p.dataInicio = `${year}-${month}-01`; p.dataFim = `${year}-${month}-${lastDay}`; }
    return p;
  }, [year, month, page, itens]);

  const { data: discursosData, isLoading } = useDeputadoDiscursos(deputadoId, params);

  return (
    <section id="discursos-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400"><Info size={22} /></div>
        <div>
          <h2 className="text-2xl font-bold text-white">Pronunciamentos & Discursos</h2>
          <p className="text-slate-500 text-xs">Registros de falas do parlamentar em plenário e comissões</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-5 bg-navy/40 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ano:</span>
          <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:bg-white/10">
            {availableYears.map(y => <option key={`year-${y}`} value={y} className="bg-navy">{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <History size={14} className="text-gold" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mês:</span>
          <select value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer hover:bg-white/10">
            {MONTHS.map(m => <option key={`month-${m.value}`} value={m.value} className="bg-navy">{m.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={5} />}

      {!isLoading && discursosData?.items && discursosData.items.length > 0 && (
        <div className="space-y-4">
          {discursosData.items.map((disc, idx) => (
            <div key={`discurso-${disc.dataHoraInicio}-${idx}`} className="bg-slate-card border border-white/5 rounded-[2rem] hover:border-purple-500/20 transition-all group overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 uppercase tracking-wider">{disc.tipoDiscurso}</div>
                      <span className="text-slate-500 text-[10px] font-bold flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <Calendar size={12} className="text-purple-400/50" />
                        {new Date(disc.dataHoraInicio).toLocaleDateString('pt-BR')} às {new Date(disc.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-md border border-indigo-500/20">{disc.faseEvento.titulo}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <FileText size={12} className="text-purple-400" /> Sumário do Pronunciamento
                      </h4>
                      <p className="text-white text-sm md:text-base font-medium leading-relaxed">{disc.sumario || 'O parlamentar fez uso da palavra durante a sessão.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(disc.keywords?.split(',') || []).slice(0, 8).map((kw, kidx) => (
                        <span key={`disc-${idx}-kw-${kidx}`} className="px-2 py-0.5 bg-white/5 text-slate-400 text-[9px] font-medium rounded border border-white/5 hover:border-purple-500/20 hover:text-purple-400 transition-all cursor-default">{kw.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {disc.urlTexto && (
                      <a href={disc.urlTexto} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-500/10 text-purple-400 text-[11px] font-black rounded-2xl border border-purple-500/20 hover:bg-purple-500/20 transition-all shadow-lg active:scale-95">
                        VER DIÁRIO OFICIAL <ExternalLink size={14} />
                      </a>
                    )}
                    <div className="flex items-center gap-2 justify-center">
                      {disc.urlAudio && <a href={disc.urlAudio} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Ouvir Áudio"><Mic2 size={18} /></a>}
                      {disc.urlVideo && <a href={disc.urlVideo} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Ver Vídeo"><Play size={18} /></a>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full py-4 bg-navy/40 border border-white/5 rounded-[1.5rem] text-slate-400 hover:text-purple-400 hover:border-purple-500/20 flex items-center justify-center gap-2 transition-all font-bold group/btn active:scale-[0.99]">
                  {expanded === idx ? 'Recolher Transcrição' : 'Ler Transcrição Completa'}
                  <ChevronDown size={18} className={`transition-transform duration-300 ${expanded === idx ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expanded === idx && (
                <div className="px-6 pb-8 md:px-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-navy/60 p-6 md:p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
                    <h5 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-4 flex items-center gap-2"><Quote size={12} /> Transcrição na Íntegra</h5>
                    <div className="text-slate-300 text-sm md:text-base leading-loose font-serif whitespace-pre-line italic">{disc.transcricao}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Pagination page={page} totalPaginas={discursosData?.totalPaginas} hasNext={discursosData?.hasNext || false}
            itensPerPage={itens} onItensPerPageChange={(n) => { setItens(n); setPage(1); }}
            onPageChange={(p) => {
              setPage(p);
              const el = document.getElementById('discursos-section');
              if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: 'smooth' }); }
            }} />
        </div>
      )}

      {!isLoading && discursosData?.items.length === 0 && (
        <div className="py-12 text-center bg-slate-card/10 rounded-3xl border border-dashed border-white/10">
          <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold">Nenhum discurso encontrado para este período.</p>
        </div>
      )}
    </section>
  );
}
