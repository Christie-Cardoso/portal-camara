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


export function BentoGrid({ deputadoId, deputadoNome, siglaUf, onOpenMoradiaModal }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="md:col-span-2 lg:col-span-3">
        <ExpenseChartCard deputadoId={deputadoId} />
      </div>

      <StaffCard deputadoId={deputadoId} deputadoNome={deputadoNome} siglaUf={siglaUf} />

      <BenefitsCard deputadoId={deputadoId} onOpenMoradiaModal={onOpenMoradiaModal} />

      <CommitteesCard deputadoId={deputadoId} />

      <div className="md:col-span-2 lg:col-span-3">
        <AttendanceCard deputadoId={deputadoId} />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <LegislativeProductionCard deputadoId={deputadoId} />
      </div>
    </div>
  );
}
