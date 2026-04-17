'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDeputados,
  fetchDeputadoById,
  fetchDeputadoDespesas,
  fetchDeputadoOrgaos,
  fetchDeputadoFrentes,
  fetchPartidos,
  fetchVotacoes,
  fetchVotacaoVotos,
  fetchVotacaoById,
  fetchVotacaoOrientacoes,
  fetchDeputadoHistorico,
  fetchDeputadoDiscursos,
  fetchDeputadoOcupacoes,
  fetchDeputadoProfissoes,
  fetchProposicoes,
  fetchProposicaoById,
  fetchProposicaoAutores,
  fetchProposicaoTotals,
  fetchDeputadoDespesasAggregation,
  fetchDeputadoEmendas,
} from '@/lib/camara';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';

export function useDeputados(filters: {
  nome?: string;
  siglaPartido?: string;
  siglaUf?: string;
  pagina?: number;
  itens?: number;
} = {}) {
  return useQuery({
    queryKey: queryKeys.deputados.list(filters),
    queryFn: () => fetchDeputados(filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeputado(id: number) {
  return useQuery({
    queryKey: queryKeys.deputados.detail(id),
    queryFn: () => fetchDeputadoById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDeputadoDespesas(
  id: number,
  filters: { ano?: number; mes?: number; pagina?: number; itens?: number } = {}
) {
  return useQuery({
    queryKey: queryKeys.deputados.despesas(id, filters),
    queryFn: () => fetchDeputadoDespesas(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeputadoOrgaos(id: number) {
  return useQuery({
    queryKey: [...queryKeys.deputados.all, 'orgaos', id],
    queryFn: () => fetchDeputadoOrgaos(id, { itens: 50 }),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDeputadoFrentes(id: number) {
  return useQuery({
    queryKey: queryKeys.deputados.frentes(id),
    queryFn: () => fetchDeputadoFrentes(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function usePartidos() {
  return useQuery({
    queryKey: queryKeys.partidos.list(),
    queryFn: () => fetchPartidos({ itens: 100 }),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useVotacoes(filters: {
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
} = {}) {
  return useQuery({
    queryKey: queryKeys.votacoes.list(filters),
    queryFn: () => fetchVotacoes(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVotacaoVotos(idVotacao: string) {
  return useQuery({
    queryKey: queryKeys.votacoes.votos(idVotacao),
    queryFn: () => fetchVotacaoVotos(idVotacao),
    enabled: !!idVotacao,
    staleTime: 30 * 60 * 1000,
  });
}

export function useVotacao(id: string) {
  return useQuery({
    queryKey: [...queryKeys.votacoes.all, 'detail', id],
    queryFn: () => fetchVotacaoById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function useVotacaoOrientacoes(id: string) {
  return useQuery({
    queryKey: [...queryKeys.votacoes.all, 'orientacoes', id],
    queryFn: () => fetchVotacaoOrientacoes(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

interface Secretario {
  id: string;
  ponto: string;
  nome: string;
  cargo: string;
  lotacao: string;
  grupo: string | null;
  data_inicio_historico: string | null;
  remuneracao_bruta?: number;
  remuneracao_liquida?: number;
  mes_referencia?: string;
  updated_at: string;
}

export function useSecretarios(gabineteNome: string | undefined) {
  return useQuery<Secretario[]>({
    queryKey: queryKeys.deputados.secretarios(gabineteNome || ''),
    queryFn: async () => {
      if (!gabineteNome || !hasSupabaseConfig()) return [];
      const { data, error } = await supabase
        .from('secretarios')
        .select('*')
        .ilike('lotacao', `%${gabineteNome}%`)
        .order('nome', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!gabineteNome && hasSupabaseConfig(),
    staleTime: 10 * 60 * 1000,
  });
}


export function useDeputadoHistorico(id: number) {
  return useQuery({
    queryKey: [...queryKeys.deputados.all, 'historico', id],
    queryFn: () => fetchDeputadoHistorico(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDeputadoDiscursos(
  id: number,
  filters: { dataInicio?: string; dataFim?: string; pagina?: number; itens?: number } = {}
) {
  return useQuery({
    queryKey: [...queryKeys.deputados.all, 'discursos', id, filters],
    queryFn: () => fetchDeputadoDiscursos(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDeputadoOcupacoes(id: number) {
  return useQuery({
    queryKey: [...queryKeys.deputados.all, 'ocupacoes', id],
    queryFn: () => fetchDeputadoOcupacoes(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
}

export function useDeputadoProfissoes(id: number) {
  return useQuery({
    queryKey: [...queryKeys.deputados.all, 'profissoes', id],
    queryFn: () => fetchDeputadoProfissoes(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
}

export function useProposicoesByAutor(
  idDeputadoAutor: number,
  filters: { pagina?: number; itens?: number; dataInicio?: string; dataFim?: string; ano?: number } = {}
) {
  return useQuery({
    queryKey: ['proposicoes', 'autor', idDeputadoAutor, filters],
    queryFn: () => fetchProposicoes({ idDeputadoAutor, ...filters }),
    enabled: !!idDeputadoAutor,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  });
}
export function useProposicao(id: number) {
  return useQuery({
    queryKey: ['proposicao', 'detail', id],
    queryFn: () => fetchProposicaoById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function useProposicaoAutores(id: number) {
  return useQuery({
    queryKey: ['proposicao', 'autores', id],
    queryFn: () => fetchProposicaoAutores(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
}

export function useProposicaoTotals(id: number, filters: { ano?: number; dataInicio?: string; dataFim?: string } = {}) {
  return useQuery({
    queryKey: ['proposicao', 'totals', id, filters],
    queryFn: () => fetchProposicaoTotals(id, filters),
    enabled: !!id,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });
}

export function useDeputadoDespesasAggregation(id: number, year: number) {
  return useQuery({
    queryKey: ['deputados', 'despesas-agregadas', id, year],
    queryFn: () => fetchDeputadoDespesasAggregation(id, year),
    enabled: !!id && !!year,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useDeputadoEmendas(id: number, year: number) {
  return useQuery({
    queryKey: ['deputados', 'emendas', id, year],
    queryFn: () => fetchDeputadoEmendas(id, year),
    enabled: !!id && !!year,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
