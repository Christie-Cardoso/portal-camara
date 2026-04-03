import { AlertTriangle, RefreshCw, WifiOff, ExternalLink } from 'lucide-react';

const EXTERNAL_LINK = 'https://dadosabertos.camara.leg.br/swagger/api.html';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  message = 'Não foi possível conectar à API da Câmara dos Deputados.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
        <AlertTriangle size={18} className="shrink-0" />
        <span className="flex-1">{message}</span>
        <div className="flex items-center gap-2">
          <a href={EXTERNAL_LINK} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-xs font-bold text-blue-400">
            <ExternalLink size={12} /> Site oficial
          </a>
          {onRetry && (
            <button onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-xs font-bold cursor-pointer">
              <RefreshCw size={12} /> Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-6 bg-slate-card/10 rounded-[3rem] border border-dashed border-white/10">
      <div className="p-6 bg-navy rounded-full border border-red-500/20">
        <WifiOff className="w-12 h-12 text-red-400" />
      </div>
      <div className="text-center space-y-2 max-w-lg">
        <p className="text-xl font-bold text-white">Falha na conexão</p>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-4">
        {onRetry && (
          <button onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-navy font-bold rounded-2xl hover:bg-gold-hover transition-all shadow-lg shadow-gold/20 cursor-pointer">
            <RefreshCw size={18} /> Tentar novamente
          </button>
        )}
        <a href={EXTERNAL_LINK} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 font-bold rounded-2xl hover:bg-blue-500/20 transition-all border border-blue-500/20">
          <ExternalLink size={18} /> Dados Abertos
        </a>
      </div>
    </div>
  );
}
