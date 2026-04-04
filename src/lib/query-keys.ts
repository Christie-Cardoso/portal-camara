export const queryKeys = {
  deputados: {
    all: ['deputados'] as const,
    lists: () => [...queryKeys.deputados.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.deputados.lists(), filters] as const,
    details: () => [...queryKeys.deputados.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.deputados.details(), id] as const,
    despesas: (id: number, filters: Record<string, unknown>) => [...queryKeys.deputados.all, 'despesas', id, filters] as const,
    frentes: (id: number) => [...queryKeys.deputados.all, 'frentes', id] as const,
    secretarios: (gabineteNome: string) => [...queryKeys.deputados.all, 'secretarios', gabineteNome] as const,
  },
  partidos: {
    all: ['partidos'] as const,
    list: () => [...queryKeys.partidos.all, 'list'] as const,
  },
  proposicoes: {
    all: ['proposicoes'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.proposicoes.all, 'list', filters] as const,
  },
  frentes: {
    all: ['frentes'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.frentes.all, 'list', filters] as const,
  },
  votacoes: {
    all: ['votacoes'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.votacoes.all, 'list', filters] as const,
    votos: (id: string) => [...queryKeys.votacoes.all, 'votos', id] as const,
  },
} as const;
