'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDeputados,
  fetchDeputadoById,
  fetchDeputadoDespesas,
  fetchDeputadoOrgaos,
  fetchDeputadoFrentes,
} from '@/lib/camara';
import { Search, X, Check, ArrowRight, XCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';

const CURRENT_YEAR = 2026;

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ---------------------------------------------------------------------------
// Search Component
// ---------------------------------------------------------------------------

function DeputadoSearch({ onSelect, disabled }: { onSelect: (id: number) => void; disabled: boolean }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.deputados.list({ nome: debouncedQuery, itens: 5 }),
    queryFn: () => fetchDeputados({ nome: debouncedQuery, itens: 5 }),
    enabled: debouncedQuery.length > 2,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto z-20">
      <div className="relative">
        <label className="sr-only">Buscar parlamentar</label>
        <div className={`absolute inset-y-0 left-4 flex items-center ${disabled ? 'text-slate-600' : 'text-slate-400'}`}>
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "Limite de 4 parlamentares atingido" : "Digite o nome de um parlamentar para comparar..."}
          className="w-full bg-slate-card border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {data?.items && data.items.length > 0 && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-card border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {data.items.map(dep => (
            <button
              key={dep.id}
              onClick={() => {
                onSelect(dep.id);
                setQuery('');
              }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-navy">
                <Image src={dep.urlFoto} alt={dep.nome} width={40} height={40} className="object-cover" unoptimized />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{dep.nome}</p>
                <p className="text-slate-500 text-xs">{dep.siglaPartido} - {dep.siglaUf}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Comparativo Page
// ---------------------------------------------------------------------------

export default function ComparativoPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch profiles based on selected ids
  const profilesQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: queryKeys.deputados.detail(id),
      queryFn: () => fetchDeputadoById(id),
      staleTime: 60 * 60 * 1000,
    }))
  });

  // Fetch expenses based on selected ids
  const expensesQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: queryKeys.deputados.despesas(id, { ano: CURRENT_YEAR, itens: 100 }),
      queryFn: () => fetchDeputadoDespesas(id, { ano: CURRENT_YEAR, itens: 100 }),
      staleTime: 60 * 60 * 1000,
    }))
  });

  // Fetch orgaos based on selected ids
  const paramsOrgaos = { itens: 100 };
  const orgaosQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: [...queryKeys.deputados.all, 'orgaos', id, paramsOrgaos],
      queryFn: () => fetchDeputadoOrgaos(id, paramsOrgaos),
      staleTime: 60 * 60 * 1000,
    }))
  });

  // Fetch frentes based on selected ids
  const frentesQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: queryKeys.deputados.frentes(id),
      queryFn: () => fetchDeputadoFrentes(id),
      staleTime: 60 * 60 * 1000,
    }))
  });

  const handleSelect = (id: number) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(prev => prev.filter(item => item !== id));
  };

  // Pre-calculate the metrics for comparison
  const stats = useMemo(() => {
    return selectedIds.map((id, index) => {
      const profile = profilesQueries[index]?.data;
      const despesas = expensesQueries[index]?.data?.items || [];
      const orgaos = orgaosQueries[index]?.data?.items?.filter(o => !o.dataFim) || []; // active only
      const frentes = frentesQueries[index]?.data || [];

      return {
        id,
        profile,
        totalGasto: despesas.reduce((acc, d) => acc + d.valorLiquido, 0),
        numOrgaos: orgaos.length,
        numFrentes: frentes.length,
        isReady: !!profile && !expensesQueries[index].isLoading && !orgaosQueries[index].isLoading && !frentesQueries[index].isLoading
      };
    });
  }, [selectedIds, profilesQueries, expensesQueries, orgaosQueries, frentesQueries]);

  // Calculate Idade
  const getIdade = (dataNascimento: string | undefined) => {
    if (!dataNascimento) return 0;
    const today = new Date();
    const birthDate = new Date(dataNascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  // Determine winners/losers
  const allReady = stats.length > 0 && stats.every(s => s.isReady);
  const minGasto = allReady ? Math.min(...stats.map(s => s.totalGasto)) : 0;
  const maxGasto = allReady ? Math.max(...stats.map(s => s.totalGasto)) : 0;
  
  const maxOrgaos = allReady ? Math.max(...stats.map(s => s.numOrgaos)) : 0;
  const maxFrentes = allReady ? Math.max(...stats.map(s => s.numFrentes)) : 0;
  const maxIdade = allReady ? Math.max(...stats.map(s => getIdade(s.profile?.dataNascimento))) : 0;
  const minIdade = allReady ? Math.min(...stats.map(s => getIdade(s.profile?.dataNascimento))) : 0;

  const gridColsClasses = ['grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'];
  const colsClass = gridColsClasses[selectedIds.length]; // selectedIds.length will be 1 to 4. +1 for the label column

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Batalha de <span className="text-gold">Parlamentares</span></h1>
        <p className="text-slate-400">Escolha até 4 deputados e veja o comparativo lado a lado de gastos, participação em comissões e frentes parlamentares no ano atual.</p>
      </div>

      <DeputadoSearch onSelect={handleSelect} disabled={selectedIds.length >= 4} />

      {selectedIds.length === 0 ? (
        <div className="py-24 text-center bg-slate-card/10 border border-white/5 border-dashed rounded-3xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
              <Search size={32} />
            </div>
          </div>
          <p className="text-slate-300 font-bold text-lg mb-2">Nenhum parlamentar selecionado</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Use a barra de busca acima para selecionar o primeiro deputado para a comparação.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-6">
          <div className="min-w-[800px] border-b border-r border-l border-white/5 bg-slate-card rounded-2xl shadow-xl overflow-hidden text-sm">
            
            {/* Sticky Header Row */}
            <div className={`grid ${colsClass} bg-navy border-b-2 border-gold/30 sticky top-20 z-30`}>
              {/* Coluna 1: Espaço vazio / Label */}
              <div className="p-4 flex items-end justify-start border-r border-white/5 bg-navy/90 backdrop-blur-md">
                <span className="text-white font-black text-lg">Especificações</span>
              </div>
              
              {/* Perfil dos Deputados */}
              {stats.map((stat, idx) => (
                <div key={stat.id} className="p-4 relative group flex flex-col items-center justify-between min-h-[160px] border-r border-white/5 bg-navy/90 backdrop-blur-md last:border-r-0">
                  <button onClick={() => handleRemove(stat.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 z-40">
                    <X size={16} />
                  </button>
                  
                  {stat.profile ? (
                    <>
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-white/20 mb-3 bg-slate-card flex-shrink-0">
                        <Image 
                          src={stat.profile.ultimoStatus.urlFoto} 
                          alt={stat.profile.ultimoStatus.nome} 
                          width={80} 
                          height={96} 
                          className="w-full h-full object-cover"
                          unoptimized 
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-bold leading-tight line-clamp-2">{stat.profile.ultimoStatus.nome}</h3>
                        <p className="text-slate-400 text-xs mt-1 font-mono">{stat.profile.ultimoStatus.siglaPartido}-{stat.profile.ultimoStatus.siglaUf}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SEÇÃO: IDENTIFICAÇÃO */}
            <div className="bg-white/5 px-4 py-2 border-b border-white/5">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Identificação Básica</span>
            </div>
            
            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex items-center text-slate-300 font-medium">Nome Civil</div>
              {stats.map(stat => (
                <div key={`civil-${stat.id}`} className="p-4 border-r border-white/5 flex items-center justify-center text-center text-slate-400 last:border-r-0">
                  {stat.isReady ? stat.profile?.nomeCivil : '-'}
                </div>
              ))}
            </div>

            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex items-center text-slate-300 font-medium">Idade</div>
              {stats.map(stat => {
                const idade = getIdade(stat.profile?.dataNascimento);
                return (
                  <div key={`idade-${stat.id}`} className="p-4 border-r border-white/5 flex items-center justify-center text-center text-slate-400 last:border-r-0">
                    {stat.isReady ? `${idade} anos` : '-'}
                  </div>
                );
              })}
            </div>

            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex items-center text-slate-300 font-medium">Escolaridade</div>
              {stats.map(stat => (
                <div key={`escola-${stat.id}`} className="p-4 border-r border-white/5 flex items-center justify-center text-center text-slate-400 last:border-r-0">
                  {stat.isReady ? stat.profile?.escolaridade : '-'}
                </div>
              ))}
            </div>

            {/* SEÇÃO: ATIVIDADE PARLAMENTAR */}
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 mt-4">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Atividade & Articulação</span>
            </div>

            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex items-center text-slate-300 font-medium">Comissões (ativas)</div>
              {stats.map(stat => {
                const isWinner = allReady && selectedIds.length > 1 && stat.numOrgaos === maxOrgaos && stat.numOrgaos > 0;
                return (
                  <div key={`orgaos-${stat.id}`} className={`p-4 border-r border-white/5 flex flex-col items-center justify-center text-center last:border-r-0 relative ${isWinner ? 'bg-emerald-500/10' : ''}`}>
                    {stat.isReady ? (
                      <>
                        <span className={`font-black text-lg ${isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>{stat.numOrgaos}</span>
                        {isWinner && <Check size={14} className="text-emerald-400 absolute top-2 right-2" />}
                      </>
                    ) : '-'}
                  </div>
                );
              })}
            </div>

            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex items-center text-slate-300 font-medium">Frentes Parlamentares</div>
              {stats.map(stat => {
                const isWinner = allReady && selectedIds.length > 1 && stat.numFrentes === maxFrentes && stat.numFrentes > 0;
                return (
                  <div key={`frentes-${stat.id}`} className={`p-4 border-r border-white/5 flex flex-col items-center justify-center text-center last:border-r-0 relative ${isWinner ? 'bg-emerald-500/10' : ''}`}>
                    {stat.isReady ? (
                      <>
                        <span className={`font-black text-lg ${isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>{stat.numFrentes}</span>
                        {isWinner && <Check size={14} className="text-emerald-400 absolute top-2 right-2" />}
                      </>
                    ) : '-'}
                  </div>
                );
              })}
            </div>

            {/* SEÇÃO: CUSTOS */}
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 mt-4">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Custos & Transparência</span>
            </div>

            <div className={`grid ${colsClass} border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
              <div className="p-4 border-r border-white/5 flex flex-col justify-center">
                <span className="text-slate-300 font-medium">Cota Parlamentar Total</span>
                <span className="text-[10px] text-slate-500">Gastos neste ano (menor é melhor)</span>
              </div>
              {stats.map(stat => {
                const isWinner = allReady && selectedIds.length > 1 && stat.totalGasto === minGasto && stat.totalGasto > 0;
                const isLoser = allReady && selectedIds.length > 1 && stat.totalGasto === maxGasto && stat.totalGasto > minGasto;
                return (
                  <div key={`gasto-${stat.id}`} className={`p-4 border-r border-white/5 flex flex-col items-center justify-center text-center last:border-r-0 relative ${isWinner ? 'bg-emerald-500/10' : isLoser ? 'bg-red-500/5' : ''}`}>
                    {stat.isReady ? (
                      <>
                        <span className={`font-black tracking-tight ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-slate-300'}`}>
                          {formatCurrency(stat.totalGasto)}
                        </span>
                        {isWinner && <Check size={14} className="text-emerald-400 absolute top-2 right-2" />}
                      </>
                    ) : '-'}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
