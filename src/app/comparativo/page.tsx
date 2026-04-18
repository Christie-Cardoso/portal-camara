'use client';

import { useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDeputados,
  fetchDeputadoById,
  fetchDeputadoDespesas,
  fetchDeputadoOrgaos,
  fetchDeputadoEmendas,
  fetchBeneficios,
  fetchProposicaoTotals,
} from '@/lib/camara';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import {
  Search, X, Check, XCircle,
  TrendingUp, TrendingDown, Minus, Trophy, Plus, UserPlus,
  HelpCircle, Home, DollarSign, Activity, Users, Info, ChevronRight,
  User, Crown, Medal,
  FileText, Mic2
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';

const CURRENT_YEAR = 2026;
const COMPARISON_YEARS = [2023, 2024, 2025, 2026];

// Dados estáticos dos parlamentares mais votados / famosos em exercício (57ª Legislatura)
const TOP_15_DEPUTADOS = [
  { id: 209787, nome: "Nikolas Ferreira", partido: "PL", uf: "MG", votos: 1492047, rank: 1 },
  { id: 204534, nome: "Tabata Amaral", partido: "PSB", uf: "SP", votos: 243037, rank: 2 },
  { id: 160976, nome: "Tiririca", partido: "PL", uf: "SP", votos: 222036, rank: 3 },
  { id: 74646, nome: "Aécio Neves", partido: "PSDB", uf: "MG", votos: 85341, rank: 4 },
  { id: 220645, nome: "Erika Hilton", partido: "PSOL", uf: "SP", votos: 256903, rank: 5 },
  { id: 204536, nome: "Kim Kataguiri", partido: "UNIÃO", uf: "SP", votos: 295460, rank: 6 },
  { id: 204515, nome: "André Janones", partido: "AVANTE", uf: "MG", votos: 238967, rank: 7 },
  { id: 204374, nome: "Bia Kicis", partido: "PL", uf: "DF", votos: 214733, rank: 8 },
  { id: 107283, nome: "Gleisi Hoffmann", partido: "PT", uf: "PR", votos: 261247, rank: 9 },
  { id: 156190, nome: "Marcel van Hattem", partido: "NOVO", uf: "RS", votos: 226816, rank: 10 },
  { id: 204535, nome: "Sâmia Bomfim", partido: "PSOL", uf: "SP", votos: 226187, rank: 11 },
  { id: 220623, nome: "Duda Salabert", partido: "PDT", uf: "MG", votos: 222985, rank: 12 },
  { id: 74398, nome: "Maria do Rosário", partido: "PT", uf: "RS", votos: 151057, rank: 13 },
  { id: 178947, nome: "Sóstenes Cavalcante", partido: "PL", uf: "RJ", votos: 154733, rank: 14 },
  { id: 160592, nome: "Zeca Dirceu", partido: "PT", uf: "PR", votos: 123033, rank: 15 },
].sort((a, b) => b.votos - a.votos);

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNumber(v: number): string {
  return v.toLocaleString('pt-BR');
}

// ---------------------------------------------------------------------------
// Search Component (Integrated in Slot)
// ---------------------------------------------------------------------------

function SlotSearchOverlay({ onSelect, onClose }: { onSelect: (id: number) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.deputados.list({ nome: debouncedQuery, itens: 5 }),
    queryFn: () => fetchDeputados({ nome: debouncedQuery, itens: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="absolute inset-0 z-50 bg-navy/95 backdrop-blur-xl p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gold text-center w-full">Buscar Parlamentar</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 absolute right-4">
          <X size={16} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all shadow-inner"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : data?.items?.map(dep => (
          <button
            key={dep.id}
            onClick={() => onSelect(dep.id)}
            className="w-full flex items-center gap-3 p-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl transition-all group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-navy border border-white/10 pointer-events-none">
              <Image src={dep.urlFoto} alt={dep.nome} width={32} height={32} className="object-cover" unoptimized />
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="text-[10px] font-black text-white uppercase truncate leading-tight">{dep.nome}</h4>
              <p className="text-[8px] text-slate-500 font-bold uppercase">{dep.siglaPartido} • {dep.siglaUf}</p>
            </div>
            <Plus size={12} className="ml-auto text-slate-700 group-hover:text-gold transition-colors" />
          </button>
        ))}
        {debouncedQuery.length >= 2 && !isLoading && (!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum resultado</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparison Slot
// ---------------------------------------------------------------------------

function ComparisonSlot({
  id,
  profile,
  onSelect,
  onRemove,
  rank,
  isWinner
}: {
  id?: number;
  profile?: any;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  rank: number;
  isWinner?: boolean;
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className={`relative flex flex-col items-center justify-center aspect-[3/4] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 group overflow-hidden ${profile
      ? 'bg-slate-card/80 border-gold/20 shadow-2xl shadow-black/40'
      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-gold/20'
      }`}>
      {profile ? (
        <>
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => onRemove(id!)}
              className="p-2 bg-black/40 hover:bg-red-500/80 text-white rounded-full backdrop-blur-lg border border-white/10 transition-all hover:scale-110 active:scale-90"
            >
              <X size={14} />
            </button>
          </div>

          <div className="w-full h-full relative p-6 flex flex-col items-center">
            <div className={`relative w-full aspect-square rounded-[2rem] overflow-hidden border shadow-2xl mb-4 group-hover:scale-105 transition-transform duration-500 ${
              isWinner ? 'border-gold shadow-[0_0_30px_rgba(255,215,0,0.3)] ring-2 ring-gold/20' : 'border-white/10'
            }`}>
              <Image
                src={profile.ultimoStatus.urlFoto}
                alt={profile.ultimoStatus.nome}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60"></div>
              
              {isWinner && (
                <div className="absolute -top-1 -right-1 z-20 animate-bounce">
                  <div className="bg-gold text-navy p-2 rounded-2xl shadow-xl shadow-gold/40 border-2 border-yellow-200">
                    <Crown size={20} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            <div className="text-center space-y-1 w-full translate-y-0 group-hover:-translate-y-2 transition-transform">
              {isWinner && (
                <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em] mb-1 block animate-pulse">
                  Vencedor da Batalha
                </span>
              )}
              <h3 className={`text-sm font-black uppercase tracking-tighter line-clamp-2 leading-tight px-2 ${isWinner ? 'text-gold' : 'text-white'}`}>
                {profile.ultimoStatus.nome}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {profile.ultimoStatus.siglaPartido}
                </span>
                <span className="px-2 py-0.5 bg-white/5 text-slate-400 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {profile.ultimoStatus.siglaUf}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-gold/40 group-hover:scale-110 transition-all duration-500 relative">
            <User size={32} strokeWidth={1} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold text-navy rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={14} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-gold transition-colors">Slot #{rank}</p>
            <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Comparar Parlamentar</p>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className="px-6 py-2.5 bg-white/5 hover:bg-gold hover:text-navy border border-white/10 hover:border-gold rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Adicionar
          </button>
        </div>
      )}

      {showSearch && (
        <SlotSearchOverlay
          onSelect={(selectedId) => {
            onSelect(selectedId);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Comparativo Page
// ---------------------------------------------------------------------------

export default function ComparativoPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Carregar perfis detalhados
  const profilesQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: queryKeys.deputados.detail(id),
      queryFn: () => fetchDeputadoById(id),
      staleTime: 60 * 60 * 1000,
    }))
  });

  // Carregar estatísticas acumuladas de despesas (2023-2026)
  const expensesQueries = useQueries({
    queries: selectedIds.flatMap(id =>
      COMPARISON_YEARS.map(year => ({
        queryKey: queryKeys.deputados.despesas(id, { ano: year, itens: 100 }),
        queryFn: () => fetchDeputadoDespesas(id, { ano: year, itens: 100 }),
        staleTime: 60 * 60 * 1000,
      }))
    )
  });

  // Carregar emendas acumuladas (2023-2026)
  const emendasQueries = useQueries({
    queries: selectedIds.flatMap(id =>
      COMPARISON_YEARS.map(year => ({
        queryKey: ['deputados', 'emendas', id, year],
        queryFn: () => fetchDeputadoEmendas(id, year),
        staleTime: 60 * 60 * 1000,
      }))
    )
  });

  const orgaosQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: [...queryKeys.deputados.all, 'orgaos', id, { itens: 100 }],
      queryFn: () => fetchDeputadoOrgaos(id, { itens: 100 }),
      staleTime: 60 * 60 * 1000,
    }))
  });

  const beneficiosQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['deputados', 'beneficios', id, CURRENT_YEAR],
      queryFn: () => fetchBeneficios(id, CURRENT_YEAR),
      staleTime: 6 * 60 * 60 * 1000,
    }))
  });

  // Carregar total de atos/proposições (2023-2026)
  const proposicoesQueries = useQueries({
    queries: selectedIds.flatMap(id => 
      COMPARISON_YEARS.map(year => ({
        queryKey: ['proposicao', 'totals', id, { ano: year }],
        queryFn: () => fetchProposicaoTotals(id, { ano: year }),
        staleTime: 6 * 60 * 60 * 1000,
      }))
    )
  });

  // Consultar secretários habilitado apenas quando o nome do gabinete estiver disponível
  const secretariosQueries = useQueries({
    queries: selectedIds.map((id, index) => {
      const gabineteNome = profilesQueries[index]?.data?.ultimoStatus?.gabinete?.nome;
      return {
        queryKey: queryKeys.deputados.secretarios(gabineteNome || ''),
        queryFn: async () => {
          if (!gabineteNome || !hasSupabaseConfig()) return [];
          const { data, error } = await supabase
            .from('secretarios')
            .select('*')
            .ilike('lotacao', `%${gabineteNome}%`);
          if (error) throw new Error(error.message);
          return data || [];
        },
        enabled: !!gabineteNome && hasSupabaseConfig(),
        staleTime: 10 * 60 * 1000,
      };
    })
  });

  const handleSelect = (id: number) => {
    if (!selectedIds.includes(id) && selectedIds.length < 3) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(prev => prev.filter(item => item !== id));
  };

  // Processar dados para comparação
  const stats = useMemo(() => {
    return selectedIds.map((id, index) => {
      const profile = profilesQueries[index]?.data;

      // Despesas
      const startIdx = index * COMPARISON_YEARS.length;
      const endIdx = startIdx + COMPARISON_YEARS.length;
      const depExpensesQueries = expensesQueries.slice(startIdx, endIdx);
      const totalGasto = depExpensesQueries.reduce((acc, q) => {
        const items = q.data?.items || [];
        return acc + items.reduce((sub, d) => sub + d.valorLiquido, 0);
      }, 0);

      // Emendas
      const depEmendasQueries = emendasQueries.slice(startIdx, endIdx);
      const totalEmendas = depEmendasQueries.reduce((acc, q) => {
        return acc + (q.data?.length || 0);
      }, 0);

      // Atos (Proposições)
      const depProposicoesQueries = proposicoesQueries.slice(startIdx, endIdx);
      const totalAtos = depProposicoesQueries.reduce((acc, q) => {
        return acc + (q.data?.total || 0);
      }, 0);

      // Órgãos
      const orgaos = orgaosQueries[index]?.data?.items?.filter(o => !o.dataFim) || [];

      // Equipe
      const listStaff = secretariosQueries[index]?.data || [];
      const staffCount = listStaff.length;

      // Benefícios (Moradia)
      const beneficios = beneficiosQueries[index]?.data;
      const housingStatus = beneficios ? (
        beneficios.imovel_funcional.toLowerCase().includes("ocupa") ? "Imóvel Funcional" :
          beneficios.auxilio_moradia.toLowerCase().includes("recebe") ? "Auxílio-moradia" : "Não utiliza"
      ) : "—";

      const isReadyByExpenses = depExpensesQueries.every(q => !q.isLoading);
      const isReadyByEmendas = depEmendasQueries.every(q => !q.isLoading);

      return {
        id,
        profile,
        totalGasto,
        totalEmendas,
        totalAtos,
        staffCount,
        housingStatus,
        numOrgaos: orgaos.length,
        isReady: !!profile && isReadyByExpenses && isReadyByEmendas && !orgaosQueries[index].isLoading
      };
    });
  }, [selectedIds, profilesQueries, expensesQueries, emendasQueries, proposicoesQueries, orgaosQueries, secretariosQueries, beneficiosQueries]);

  const allReady = stats.length > 0 && stats.every(s => s.isReady);
  const minGasto = allReady ? Math.min(...stats.map(s => s.totalGasto)) : 0;
  const maxOrgaos = allReady ? Math.max(...stats.map(s => s.numOrgaos)) : 0;
  const maxEmendas = allReady ? Math.max(...stats.map(s => s.totalEmendas)) : 0;
  const maxAtos = allReady ? Math.max(...stats.map(s => s.totalAtos)) : 0;
  const minStaff = allReady ? Math.min(...stats.map(s => s.staffCount)) : 0;

  // Determinar o Vencedor da Batalha (Scoring)
  const winnerIds = useMemo(() => {
    if (!allReady || stats.length < 2) return [];
    
    // Pontuação por métrica
    const scores = stats.map(s => {
      let points = 0;
      if (s.totalGasto === minGasto && s.totalGasto > 0) points++;
      if (s.numOrgaos === maxOrgaos && s.numOrgaos > 0) points++;
      if (s.totalEmendas === maxEmendas && s.totalEmendas > 0) points++;
      if (s.totalAtos === maxAtos && s.totalAtos > 0) points++;
      if (s.staffCount === minStaff && s.staffCount > 0) points++;
      return { id: s.id, points };
    });

    const maxPoints = Math.max(...scores.map(s => s.points));
    if (maxPoints === 0) return [];
    
    return scores.filter(s => s.points === maxPoints).map(s => s.id);
  }, [allReady, stats, minGasto, maxOrgaos, maxEmendas, maxAtos, minStaff]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Header & Logo Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto relative">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold mb-4">
          <Trophy size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comparativo Parlamentar 2026</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
          Batalha de <span className="text-gold">Gigantes</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
          Compare gastos, atuação legislativa e participação em comissões dos deputados federais brasileiros em tempo real.
        </p>
      </div>

      {/* Comparison Slots Section (Estilo TudoCelular) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[0, 1, 2].map((idx) => (
          <ComparisonSlot
            key={idx}
            rank={idx + 1}
            id={selectedIds[idx]}
            profile={profilesQueries[idx]?.data}
            onSelect={handleSelect}
            onRemove={handleRemove}
            isWinner={winnerIds.includes(selectedIds[idx])}
          />
        ))}
      </div>

      {/* Conditional Content: TOP 15 or TOPICS */}
      <div className="relative">
        {selectedIds.length < 3 ? (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 mb-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold text-navy rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ranking de Votação</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Os 15 parlamentares mais votados nas eleições gerais de 2022</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-400">
                <Info size={14} className="text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Clique para comparar</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOP_15_DEPUTADOS.map((dep, index) => {
                const isSelected = selectedIds.includes(dep.id);
                return (
                  <button
                    key={dep.id}
                    onClick={() => !isSelected && handleSelect(dep.id)}
                    disabled={isSelected}
                    className={`group relative flex items-center gap-5 p-5 bg-slate-card/40 border rounded-3xl transition-all text-left overflow-hidden active:scale-95 ${isSelected
                      ? 'opacity-40 border-white/5 cursor-default'
                      : 'border-white/5 hover:bg-white/5 hover:border-gold/30'
                      }`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gold transition-opacity ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                    <div className="relative shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy border border-white/10 text-slate-500 font-black text-xs group-hover:text-gold transition-colors shrink-0">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-gold transition-colors">{dep.nome}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{dep.partido} • {dep.uf}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest">{formatNumber(dep.votos)} votos</span>
                        {!isSelected && <ChevronRight size={10} className="text-slate-700 group-hover:translate-x-1 transition-transform" />}
                      </div>
                    </div>
                    {!isSelected ? (
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-gold group-hover:text-navy transition-all shadow-inner">
                        <Plus size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {selectedIds.length > 0 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-center">
              <div className="inline-flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Detalhes da Comparação</h2>
                <div className="h-1 w-24 bg-gold rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-card/60 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Tópico: Identificação */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <User className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Perfil Básico</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Nome Civil</h3>
                  </div>
                </div>
                {stats.map(s => (
                  <div key={s.id} className="p-8 flex flex-col items-center justify-center text-center border-l border-white/5">
                    <span className="text-[11px] font-bold text-slate-300">{s.isReady ? s.profile?.nomeCivil : '—'}</span>
                  </div>
                ))}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-id-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>

              {/* Tópico: Gastos */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <DollarSign className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Financeiro</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Cota Acumulada</h3>
                  </div>
                </div>
                {stats.map(s => {
                  const isWinner = allReady && s.totalGasto === minGasto && stats.length > 1 && s.totalGasto > 0;
                  return (
                    <div key={s.id} className={`p-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className={`text-base font-black ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                          {s.isReady ? formatCurrency(s.totalGasto) : (
                            <div className="w-24 h-4 bg-white/5 rounded animate-pulse"></div>
                          )}
                        </span>
                        {s.isReady && (
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total 2023-2026</span>
                        )}
                      </div>
                      {isWinner && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/30">
                          Mais Econômico
                        </div>
                      )}
                    </div>
                  );
                })}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-gasto-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>
              {/* Tópico: Produção Legislativa */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <Activity className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Atuação</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Comissões</h3>
                  </div>
                </div>
                {stats.map(s => {
                  const isWinner = allReady && s.numOrgaos === maxOrgaos && s.numOrgaos > 0 && stats.length > 1;
                  return (
                    <div key={s.id} className={`p-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-gold/5' : ''}`}>
                      <span className={`text-2xl font-black ${isWinner ? 'text-gold' : 'text-white'}`}>
                        {s.isReady ? s.numOrgaos : '—'}
                      </span>
                      {isWinner && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold/20 text-gold text-[8px] font-black uppercase rounded-lg border border-gold/30">
                          Mais Ativo
                        </div>
                      )}
                    </div>
                  );
                })}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-atua-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <FileText className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Produção</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Emendas</h3>
                  </div>
                </div>
                {stats.map(s => {
                  const isWinner = allReady && s.totalEmendas === maxEmendas && stats.length > 1 && s.totalEmendas > 0;
                  return (
                    <div key={s.id} className={`p-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-indigo-500/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className={`text-base font-black ${isWinner ? 'text-indigo-400' : 'text-white'}`}>
                          {s.isReady ? `${s.totalEmendas} emendas` : '—'}
                        </span>
                        {s.isReady && (
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 text-center">Acumulado 2023-2026</span>
                        )}
                      </div>
                      {isWinner && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase rounded-lg border border-indigo-500/30">
                          Recordista
                        </div>
                      )}
                    </div>
                  );
                })}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-emendas-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>

              {/* Linha: Atos */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5 group">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <Mic2 className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legislativo</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Total de Atos</h3>
                  </div>
                </div>
                {stats.map(s => {
                  const isWinner = allReady && s.totalAtos === maxAtos && stats.length > 1 && s.totalAtos > 0;
                  return (
                    <div key={s.id} className={`p-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-orange-500/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className={`text-base font-black ${isWinner ? 'text-orange-400' : 'text-white'}`}>
                          {s.isReady ? `${s.totalAtos} atos` : '—'}
                        </span>
                        {s.isReady && (
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 text-center">Acumulado 2023-2026</span>
                        )}
                      </div>
                      {isWinner && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-black uppercase rounded-lg border border-orange-500/30">
                          Mais Ativo
                        </div>
                      )}
                    </div>
                  );
                })}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-atos-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>

              {/* Tópico: Estrutura & Benefícios */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <Users className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gabinete</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Equipe</h3>
                  </div>
                </div>
                {stats.map(s => {
                  const isWinner = allReady && s.staffCount === minStaff && stats.length > 1 && s.staffCount > 0;
                  return (
                    <div key={s.id} className={`p-8 flex flex-col items-center justify-center text-center border-l border-white/5 relative ${isWinner ? 'bg-emerald-500/5' : ''}`}>
                      <span className={`text-base font-black ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                        {s.isReady ? `${s.staffCount} pessoas` : '—'}
                      </span>
                      {isWinner && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase rounded-lg border border-emerald-500/30">
                          Equipe Enxuta
                        </div>
                      )}
                    </div>
                  );
                })}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-equipe-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="p-8 bg-white/[0.02] flex items-center gap-4">
                  <Home className="text-gold" size={24} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Residência</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Moradia</h3>
                  </div>
                </div>
                {stats.map(s => (
                  <div key={s.id} className="p-8 flex flex-col items-center justify-center text-center border-l border-white/5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                      {s.isReady ? s.housingStatus : '—'}
                    </span>
                  </div>
                ))}
                {[...Array(3 - stats.length)].map((_, i) => (
                  <div key={`empty-moradia-${i}`} className="p-8 border-l border-white/5 bg-black/10 opacity-20 hidden md:block"></div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-12 pb-20">
              <button
                onClick={() => setSelectedIds([])}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-3xl transition-all active:scale-95"
              >
                <XCircle size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest">Limpar Comparação</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
