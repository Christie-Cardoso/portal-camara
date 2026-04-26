"use client";

import { Receipt, Flag, Vote, FileText, Info, PiggyBank } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'despesas', label: 'Despesas', icon: Receipt, color: 'emerald' },
  { id: 'frentes', label: 'Frentes', icon: Flag, color: 'amber' },
  { id: 'votacoes', label: 'Votações', icon: Vote, color: 'blue' },
  { id: 'trabalho', label: 'Trabalho', icon: FileText, color: 'indigo' },
  { id: 'discursos', label: 'Discursos', icon: Info, color: 'purple' },
  { id: 'emendas', label: 'Emendas', icon: PiggyBank, color: 'emerald' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide border-b border-white/5 no-scrollbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap shadow-sm active:scale-95 border
            ${isActive
                ? `bg-${tab.color}-500/10 text-${tab.color}-400 border-${tab.color}-500/30 shadow-${tab.color}-500/5`
                : 'text-slate-500 hover:bg-white/5 border-transparent'}`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
