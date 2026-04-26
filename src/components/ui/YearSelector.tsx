import { Calendar, ChevronDown } from 'lucide-react';

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  years: number[];
  accentColor?: string;
  keyPrefix?: string;
}
export function YearSelector({
  value,
  onChange,
  years,
  accentColor = 'text-indigo-400',
  keyPrefix = 'year',
}: YearSelectorProps) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20 hover:bg-white/10 group/sel shadow-inner">
      <Calendar size={16} className={accentColor} />
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="bg-transparent border-none text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer pr-2"
      >
        {years.map(y => <option key={`${keyPrefix}-${y}`} value={y} className="bg-navy">{y}</option>)}
      </select>
      <ChevronDown size={14} className="text-slate-500 group-hover/sel:text-white transition-colors" />
    </div>
  );
}
