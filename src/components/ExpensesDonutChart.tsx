'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Text
} from 'recharts';
import { DollarSign, AlertCircle, Info } from 'lucide-react';

interface AggregateExpense {
  name: string;
  value: number;
}

interface ExpensesDonutChartProps {
  data: AggregateExpense[];
  loading?: boolean;
}

const COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444', // Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#64748b', // Slate
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-900/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{data.name}</p>
        <p className="text-lg font-black text-white">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export function ExpensesDonutChart({ data, loading }: ExpensesDonutChartProps) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Processando Gastos...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500">
          <AlertCircle size={24} />
        </div>
        <p className="text-slate-400 text-sm font-medium">Nenhum dado de despesa disponível para este período.</p>
      </div>
    );
  }

  // Filter out very small values for the pie but show in legend
  const chartData = data.filter(item => (item.value / total) > 0.005);
  const othersValue = total - chartData.reduce((acc, curr) => acc + curr.value, 0);
  
  if (othersValue > 0) {
    chartData.push({ name: 'Outras Despesas', value: othersValue });
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center gap-8">
      {/* Chart container */}
      <div className="relative w-full md:w-1/2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
              animationBegin={200}
              stroke="none"
              cornerRadius={8}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Total label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Total do Ano</span>
          <span className="text-xl font-black text-white tabular-nums tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(total)}
          </span>
          <span className="text-[10px] text-indigo-400 font-bold">BRL</span>
        </div>
      </div>

      {/* Modern Legend */}
      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <DollarSign size={12} className="text-indigo-400" />
          Categorias Principais
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
          {data.slice(0, 10).map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={entry.name} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-all cursor-default border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm shadow-black/20"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[11px] text-slate-300 font-medium truncate group-hover:text-white transition-colors" title={entry.name}>
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[10px] text-slate-500 font-black tabular-nums">{percentage}%</span>
                  <span className="text-[11px] text-white font-black tabular-nums min-w-[70px] text-right">
                    {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(entry.value)}
                  </span>
                </div>
              </div>
            );
          })}
          {data.length > 10 && (
            <div className="flex items-center gap-2 p-2 text-slate-500 italic text-[10px]">
              <Info size={10} />
              <span>+ {data.length - 10} outras categorias menores</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
