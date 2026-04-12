'use client';

import { useState, Suspense, useEffect } from 'react';
import { useDeputados, usePartidos } from '@/hooks/use-camara';
import { DeputadoGridSkeleton } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Pagination } from '@/components/Pagination';
import { Search, Users, SearchX, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function DeputadosContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [page, setPage] = useState(1);
  const [itensPerPage, setItensPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [selectedPartido, setSelectedPartido] = useState('');
  const [selectedUF, setSelectedUF] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useDeputados({
    pagina: page,
    itens: itensPerPage,
    nome: query || undefined,
    siglaPartido: selectedPartido || undefined,
    siglaUf: selectedUF || undefined,
  });

  const { data: partidos } = usePartidos();

  const deputados = data?.items || [];
  const hasNext = data?.hasNext || false;
  const totalPaginas = data?.totalPaginas;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.length >= 3 || searchInput.length === 0) {
      setQuery(searchInput);
      setPage(1);
    }
  };

  useEffect(() => {
    // Se o input for menor que 3 caracteres, resetamos a query de nome
    if (searchInput.length < 3) {
      if (query !== '') {
        setQuery('');
        setPage(1);
      }
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Só dispara a busca automática se tiver no mínimo 3 caracteres
    const timer = setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          <span className="text-gold italic">Deputados</span> Federais
        </h1>
        <p className="text-slate-400 text-lg">
          Todos os 513 deputados federais em exercício na 57ª legislatura. Clique em qualquer um para ver despesas detalhadas.
        </p>
      </section>

      {/* Search + Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
            {isSearching || isFetching ? (
              <Loader2 size={20} className="animate-spin text-gold" />
            ) : (
              <Search size={20} />
            )}
          </div>
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar deputado por nome..."
            className="w-full bg-slate-card border border-white/10 rounded-2xl pl-12 pr-36 py-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-lg" />
          <button type="submit"
            className="absolute right-3 top-2 bottom-2 px-6 bg-gold hover:bg-yellow-500 text-navy font-bold rounded-xl transition-all cursor-pointer">
            Pesquisar
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <select value={selectedPartido} onChange={(e) => { setSelectedPartido(e.target.value); setPage(1); }}
            className="bg-navy border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer">
            <option value="">Todos os partidos</option>
            {partidos?.items?.map((p) => (
              <option key={p.id} value={p.sigla}>{p.sigla}</option>
            ))}
          </select>

          <select value={selectedUF} onChange={(e) => { setSelectedUF(e.target.value); setPage(1); }}
            className="bg-navy border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer">
            <option value="">Todos os estados</option>
            {ESTADOS_BR.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-gold animate-pulse' : 'bg-gold'}`} />
            <h2 className="text-lg font-bold text-white">
              {query ? `Resultados para "${query}"` : 'Todos os Deputados Federais'}
            </h2>
          </div>
        </div>

        {(isLoading || (isFetching && deputados.length === 0)) && <DeputadoGridSkeleton count={20} />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && deputados.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-40' : ''}`}>
            {deputados.map((dep) => (
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

        {!isLoading && !isError && deputados.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center space-y-6 bg-slate-card/10 rounded-[3rem] border border-dashed border-white/10">
            <SearchX className="w-12 h-12 text-slate-600" />
            <p className="text-xl font-bold text-white">Nenhum deputado encontrado</p>
            <p className="text-slate-500">Verifique o nome ou ajuste os filtros.</p>
          </div>
        )}

        <Pagination
          page={page}
          totalPaginas={totalPaginas}
          hasNext={hasNext}
          itensPerPage={itensPerPage}
          onItensPerPageChange={(n) => { setItensPerPage(n); setPage(1); }}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </div>
    </div>
  );
}

export default function DeputadosPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><DeputadoGridSkeleton count={20} /></div>}>
      <DeputadosContent />
    </Suspense>
  );
}
