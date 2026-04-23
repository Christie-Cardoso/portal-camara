"use client";

import Link from 'next/link';
import { useDeputado } from '@/hooks/use-camara';

/**
 * Card que exibe informações do relator de uma proposição.
 * Recebe a URI do relator e busca seus dados automaticamente.
 */
export function ReporterInfo({ uri }: { uri: string }) {
  const reporterId = parseInt(uri.split('/').pop() || '0');
  const { data: dep, isLoading } = useDeputado(reporterId);

  if (isLoading) return <div className="animate-pulse p-4 bg-white/5 rounded-2xl h-16" />;
  if (!dep) return null;

  return (
    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between group/rel">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 overflow-hidden bg-navy group-hover/rel:border-blue-400 transition-all">
          <img src={dep.ultimoStatus.urlFoto} alt={dep.ultimoStatus.nome} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Relator(a) Atual</span>
          <p className="text-white text-base font-bold truncate max-w-[150px] md:max-w-[200px]">
            {dep.ultimoStatus.nome}
          </p>
        </div>
      </div>
      <Link
        href={`/deputados/${dep.id}`}
        target="_blank"
        className="px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-black rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
      >
        VER PERFIL
      </Link>
    </div>
  );
}
