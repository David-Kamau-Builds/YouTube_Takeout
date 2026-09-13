import type { LucideIcon } from 'lucide-react';
import { formatCompact, formatNumber } from '../../lib/format/numbers';

interface KpiCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  color?: 'red' | 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo';
  compact?: boolean;
}

const COLOR_MAP = {
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
};

export function KpiCard({
  title,
  value,
  subValue,
  icon: Icon,
  color = 'red',
  compact = false,
}: KpiCardProps) {
  const formattedValue = compact ? formatCompact(value) : formatNumber(value);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 dark:hover:border-slate-700/80 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${COLOR_MAP[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formattedValue}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
