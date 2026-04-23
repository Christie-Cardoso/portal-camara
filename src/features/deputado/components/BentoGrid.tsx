"use client";

import { ExpenseChartCard } from './ExpenseChartCard';
import { StaffCard } from './StaffCard';
import { BenefitsCard } from './BenefitsCard';
import { CommitteesCard } from './CommitteesCard';
import { AttendanceCard } from './AttendanceCard';
import { LegislativeProductionCard } from './LegislativeProductionCard';

interface BentoGridProps {
  deputadoId: number;
  deputadoNome: string;
  siglaUf: string;
  onOpenMoradiaModal: () => void;
}

/**
 * Orquestrador do grid Bento Box do resumo do deputado.
 * Renderiza os 6 cards principais em um layout responsivo.
 */
export function BentoGrid({ deputadoId, deputadoNome, siglaUf, onOpenMoradiaModal }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Distribuição de Gastos (Full Width) */}
      <ExpenseChartCard deputadoId={deputadoId} />

      {/* 2. Equipe de Gabinete */}
      <StaffCard deputadoId={deputadoId} deputadoNome={deputadoNome} siglaUf={siglaUf} />

      {/* 3. Benefícios e Recursos */}
      <BenefitsCard deputadoId={deputadoId} onOpenMoradiaModal={onOpenMoradiaModal} />

      {/* 4. Comissões */}
      <CommitteesCard deputadoId={deputadoId} />

      {/* 5. Frequência Parlamentar (Full Width) */}
      <AttendanceCard deputadoId={deputadoId} />

      {/* 6. Produção Legislativa (Full Width) */}
      <LegislativeProductionCard deputadoId={deputadoId} />
    </div>
  );
}
