"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useDeputado } from '@/hooks/use-camara';
import { SpinnerFullPage } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

import { DeputadoSidebar } from '@/features/deputado/components/DeputadoSidebar';
import { BentoGrid } from '@/features/deputado/components/BentoGrid';
import { TabNavigation } from '@/features/deputado/components/TabNavigation';
import { HousingAllowanceModal } from '@/features/deputado/components/HousingAllowanceModal';

import { DespesasTab } from '@/features/deputado/tabs/DespesasTab';
import { FrentesTab } from '@/features/deputado/tabs/FrentesTab';
import { VotacoesTab } from '@/features/deputado/tabs/VotacoesTab';
import { TrabalhoTab } from '@/features/deputado/tabs/TrabalhoTab';
import { DiscursosTab } from '@/features/deputado/tabs/DiscursosTab';
import { EmendasTab } from '@/features/deputado/tabs/EmendasTab';

export default function DeputadoDetailPage() {
  const params = useParams<{ id: string }>();
  const deputadoId = parseInt(params.id);

  const [activeTab, setActiveTab] = useState('despesas');
  const [showMoradiaModal, setShowMoradiaModal] = useState(false);

  const { data: dep, isLoading, isError, refetch } = useDeputado(deputadoId);

  if (isLoading) return <SpinnerFullPage />;

  if (isError || !dep) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message="Não foi possível carregar os dados do deputado." onRetry={() => refetch()} />
      </div>
    );
  }

  const status = dep.ultimoStatus;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Navegação de Retorno */}
      <Link href="/deputados" className="group inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-all text-sm font-medium mb-10">
        <div className="p-2 bg-slate-card rounded-xl border border-white/5 group-hover:border-gold/30 transition-all">
          <ArrowLeft size={16} />
        </div>
        Voltar para lista de deputados
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar */}
        <DeputadoSidebar dep={dep} />

        {/* Área de Conteúdo Principal */}
        <div className="flex-1 min-w-0 space-y-12" id="deputado-content-tabs">
          {/* Bento Grid de Resumo */}
          <BentoGrid
            deputadoId={deputadoId}
            deputadoNome={status.nome}
            siglaUf={status.siglaUf}
            onOpenMoradiaModal={() => setShowMoradiaModal(true)}
          />

          {/* Navegação de Tabs */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Conteúdo das Tabs */}
          <div className="pt-2 min-h-[400px]">
            {activeTab === 'despesas' && <DespesasTab deputadoId={deputadoId} />}
            {activeTab === 'frentes' && <FrentesTab deputadoId={deputadoId} />}
            {activeTab === 'votacoes' && <VotacoesTab deputadoId={deputadoId} siglaPartido={status.siglaPartido} />}
            {activeTab === 'trabalho' && <TrabalhoTab deputadoId={deputadoId} />}
            {activeTab === 'discursos' && <DiscursosTab deputadoId={deputadoId} />}
            {activeTab === 'emendas' && <EmendasTab deputadoId={deputadoId} />}
          </div>
        </div>
      </div>

      {/* Modal de Auxílio-Moradia */}
      {showMoradiaModal && (
        <HousingAllowanceModal
          deputadoId={deputadoId}
          onClose={() => setShowMoradiaModal(false)}
        />
      )}
    </div>
  );
}
