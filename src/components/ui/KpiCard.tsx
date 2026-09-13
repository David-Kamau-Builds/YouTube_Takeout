import type { LucideIcon } from 'lucide-react';
import { formatCompact, formatNumber } from '../../lib/format/numbers';

export type KpiColor =
  | 'red'
  | 'blue'
  | 'purple'
  | 'indigo'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | string;

export interface KpiCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  color?: KpiColor;
  compact?: boolean;
}

const COLOR_VARIANTS: Record<string, { chip: string; hover: string }> = {
  red: {
    chip: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    hover: 'group-hover:border-red-500/30',
  },
  blue: {
    chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    hover: 'group-hover:border-blue-500/30',
  },
  purple: {
    chip: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hover: 'group-hover:border-purple-500/30',
  },
  indigo: {
    chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    hover: 'group-hover:border-indigo-500/30',
  },
  cyan: {
    chip: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    hover: 'group-hover:border-cyan-500/30',
  },
  emerald: {
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hover: 'group-hover:border-emerald-500/30',
  },
  amber: {
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hover: 'group-hover:border-amber-500/30',
  },
  rose: {
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    hover: 'group-hover:border-rose-500/30',
  },
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
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.red;

  return (
    <div
      className={`bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-black/15 dark:hover:border-white/15 transition-all duration-150 group ${variant.hover}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 truncate">
          {title}
        </span>
        {/* Apple Health style chromatic squircle chip */}
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-transform duration-150 group-hover:scale-105 shrink-0 ${variant.chip}`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-semibold text-neutral-950 dark:text-white tracking-tight tabular-nums">
          {formattedValue}
        </span>
      </div>

      {subValue && (
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate">
          {subValue}
        </div>
      )}
    </div>
  );
}
