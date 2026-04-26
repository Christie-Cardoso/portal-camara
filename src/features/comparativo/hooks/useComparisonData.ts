"use client";

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDeputadoById,
  fetchDeputadoDespesas,
  fetchDeputadoOrgaos,
  fetchDeputadoEmendas,
  fetchBeneficios,
  fetchProposicaoTotals,
  fetchFrequencia,
} from '@/lib/camara';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { CURRENT_YEAR, COMPARISON_YEARS } from '../constants';

export function useComparisonData(selectedIds: number[], selectedYear: number = CURRENT_YEAR) {
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
      queryKey: ['deputados', 'beneficios', id, selectedYear],
      queryFn: () => fetchBeneficios(id, selectedYear),
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

  // Frequência parlamentar (ano corrente)
  const frequenciaQueries = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['deputados', 'frequencia', id, selectedYear],
      queryFn: () => fetchFrequencia(id, selectedYear),
      staleTime: 6 * 60 * 60 * 1000,
    }))
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

  // Processar dados para comparação
  const stats = useMemo(() => {
    return selectedIds.map((id, index) => {
      const profile = profilesQueries[index]?.data;

      const startIdx = index * COMPARISON_YEARS.length;
      const endIdx = startIdx + COMPARISON_YEARS.length;
      const depExpensesQueries = expensesQueries.slice(startIdx, endIdx);
      const totalGasto = depExpensesQueries.reduce((acc, q) => {
        const items = q.data?.items || [];
        return acc + items.reduce((sub, d) => sub + d.valorLiquido, 0);
      }, 0);

      const depEmendasQueries = emendasQueries.slice(startIdx, endIdx);
      const totalEmendas = depEmendasQueries.reduce((acc, q) => {
        return acc + (q.data?.length || 0);
      }, 0);

      const depProposicoesQueries = proposicoesQueries.slice(startIdx, endIdx);
      const totalAutoria = depProposicoesQueries.reduce((acc, q) => {
        return acc + (q.data?.apiTotal || 0);
      }, 0);
      const totalRelatorias = depProposicoesQueries.reduce((acc, q) => {
        return acc + (q.data?.relatadas || 0);
      }, 0);

      const freq = frequenciaQueries[index]?.data;
      const presencasPlenario = freq?.plenario?.dias_presenca ? parseInt(freq.plenario.dias_presenca) : 0;
      const faltasJustificadas = freq?.plenario?.dias_ausencias_justificadas ? parseInt(freq.plenario.dias_ausencias_justificadas) : 0;
      const faltasPlenario = freq?.plenario?.dias_ausencias_nao_justificadas ? parseInt(freq.plenario.dias_ausencias_nao_justificadas) : 0;
      const comPresenca = freq?.comissoes?.presenca ? parseInt(freq.comissoes.presenca) : 0;
      const comFaltasJust = freq?.comissoes?.ausencias_justificadas ? parseInt(freq.comissoes.ausencias_justificadas) : 0;
      const comFaltasNaoJust = freq?.comissoes?.ausencias_nao_justificadas ? parseInt(freq.comissoes.ausencias_nao_justificadas) : 0;

      const orgaos = orgaosQueries[index]?.data?.items?.filter(o => !o.dataFim) || [];

      const listStaff = secretariosQueries[index]?.data || [];
      const staffCount = listStaff.length;

      const beneficios = beneficiosQueries[index]?.data;
      const imovelText = beneficios?.imovel_funcional?.toLowerCase() || '';
      const auxilioText = beneficios?.auxilio_moradia?.toLowerCase() || '';
      const usaImovel = !imovelText.includes('não') && (imovelText.includes('ocupa') || imovelText.includes('faz uso'));
      const recebeAuxilio = !auxilioText.includes('não') && (auxilioText.includes('recebe') || auxilioText.includes('recebeu'));
      const auxilioValorMatch = beneficios?.auxilio_moradia?.match(/R\$\s*([\d.,]+)/);
      const auxilioValor = auxilioValorMatch ? auxilioValorMatch[0] : null;
      const auxilioMensal = beneficios?.auxilio_moradia_mensal || [];
      const housingStatus = beneficios ? (
        usaImovel ? "Imóvel Funcional" :
          recebeAuxilio ? "Auxílio-Moradia" : "Não utiliza"
      ) : "—";
      const housingType: 'imovel' | 'auxilio' | 'nenhum' | 'loading' = beneficios ? (
        usaImovel ? 'imovel' : recebeAuxilio ? 'auxilio' : 'nenhum'
      ) : 'loading';

      const isReadyByExpenses = depExpensesQueries.every(q => !q.isLoading);
      const isReadyByEmendas = depEmendasQueries.every(q => !q.isLoading);

      return {
        id,
        profile,
        totalGasto,
        totalEmendas,
        totalAutoria,
        totalRelatorias,
        presencasPlenario,
        faltasJustificadas,
        faltasPlenario,
        comPresenca,
        comFaltasJust,
        comFaltasNaoJust,
        staffCount,
        housingStatus,
        housingType,
        auxilioValor,
        auxilioMensal,
        numOrgaos: orgaos.length,
        isReady: !!profile && isReadyByExpenses && isReadyByEmendas && !orgaosQueries[index].isLoading
      };
    });
  }, [selectedIds, profilesQueries, expensesQueries, emendasQueries, proposicoesQueries, frequenciaQueries, orgaosQueries, secretariosQueries, beneficiosQueries]);

  const allReady = stats.length > 0 && stats.every(s => s.isReady);
  const minGasto = allReady ? Math.min(...stats.map(s => s.totalGasto)) : 0;
  const maxOrgaos = allReady ? Math.max(...stats.map(s => s.numOrgaos)) : 0;
  const maxEmendas = allReady ? Math.max(...stats.map(s => s.totalEmendas)) : 0;
  const maxAutoria = allReady ? Math.max(...stats.map(s => s.totalAutoria)) : 0;
  const maxRelatorias = allReady ? Math.max(...stats.map(s => s.totalRelatorias)) : 0;
  const maxPresencaLiquida = allReady ? Math.max(...stats.map(s => s.presencasPlenario - s.faltasPlenario)) : 0;
  const maxComPresencaLiquida = allReady ? Math.max(...stats.map(s => s.comPresenca - s.comFaltasNaoJust)) : 0;
  const minFaltas = allReady ? Math.min(...stats.map(s => s.faltasPlenario)) : 0;
  const minStaff = allReady ? Math.min(...stats.map(s => s.staffCount)) : 0;

  // Determinar o Vencedor da Batalha
  const winnerIds = useMemo(() => {
    if (!allReady || stats.length < 2) return [];

    const scores = stats.map(s => {
      let points = 0;
      const presencaLiquida = s.presencasPlenario - s.faltasPlenario;
      const comPresencaLiquida = s.comPresenca - s.comFaltasNaoJust;

      if (s.totalGasto === minGasto && s.totalGasto > 0) points++;
      if (s.numOrgaos === maxOrgaos && s.numOrgaos > 0) points++;
      if (s.totalEmendas === maxEmendas && s.totalEmendas > 0) points++;
      if (s.totalAutoria === maxAutoria && s.totalAutoria > 0) points++;
      if (s.totalRelatorias === maxRelatorias && s.totalRelatorias > 0) points++;
      if (presencaLiquida === maxPresencaLiquida && presencaLiquida > 0) points++;
      if (s.faltasPlenario === minFaltas) points++;
      if (s.staffCount === minStaff && s.staffCount > 0) points++;
      if (s.housingType === 'nenhum') points++;
      return { id: s.id, points };
    });

    const maxPoints = Math.max(...scores.map(s => s.points));
    if (maxPoints === 0) return [];

    return scores.filter(s => s.points === maxPoints).map(s => s.id);
  }, [allReady, stats, minGasto, maxOrgaos, maxEmendas, maxAutoria, maxRelatorias, maxPresencaLiquida, minFaltas, minStaff]);

  return {
    stats,
    allReady,
    winnerIds,
    metrics: {
      minGasto,
      maxOrgaos,
      maxEmendas,
      maxAutoria,
      maxRelatorias,
      maxPresencaLiquida,
      maxComPresencaLiquida,
      minFaltas,
      minStaff
    }
  };
}
