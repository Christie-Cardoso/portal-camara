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
} from '@/lib/camara';

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
  filters: { ano?: number; pagina?: number; itens?: number } = {}
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

