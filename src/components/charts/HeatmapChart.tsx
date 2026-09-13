import type { HeatmapPoint } from '../../lib/stats/timeSeries';
import { DAY_NAMES } from '../../lib/format/dates';
import { Flame } from 'lucide-react';

interface HeatmapChartProps {
  data: HeatmapPoint[];
  title?: string;
}

function getColorIntensity(count: number, maxCount: number): string {
  if (count === 0) {
    return 'bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-transparent';
  }
  const ratio = count / (maxCount || 1);
  if (ratio < 0.25) {
    return 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200/50 dark:border-red-900/50';
  }
  if (ratio < 0.5) {
    return 'bg-red-300 text-red-950 dark:bg-red-800 dark:text-red-100 font-medium';
  }
  if (ratio < 0.75) {
    return 'bg-red-500 text-white dark:bg-red-600 dark:text-white font-semibold shadow-xs shadow-red-500/20';
  }
  return 'bg-red-600 text-white dark:bg-red-500 dark:text-white font-bold shadow-md shadow-red-500/30';
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

export function HeatmapChart({ data, title = 'Watch Activity Heatmap (Day vs Hour)' }: HeatmapChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const peakPoint = data.reduce((max, pt) => (pt.count > max.count ? pt : max), data[0] || { dayOfWeek: 0, hour: 0, count: 0 });

  const days = Array.from({ length: 7 }, (_, dayIdx) => {
    return {
      dayName: DAY_NAMES[dayIdx],
      hours: data.filter((d) => d.dayOfWeek === dayIdx),
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distribution of watch events broken down by day of the week and hour of day.
          </p>
        </div>

        {peakPoint && peakPoint.count > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 shrink-0 self-start sm:self-auto">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Peak: {DAY_NAMES[peakPoint.dayOfWeek]} at {formatHour(peakPoint.hour)} ({peakPoint.count} watches)</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Hours Row */}
          <div className="grid grid-cols-25 gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 select-none">
            <div className="text-left font-semibold text-slate-500 dark:text-slate-400">Day</div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-center">
                {h % 3 === 0 ? formatHour(h).replace(' ', '') : ''}
              </div>
            ))}
          </div>

          {/* Days Grid Rows */}
          <div className="space-y-1.5">
            {days.map((day) => (
              <div key={day.dayName} className="grid grid-cols-25 gap-1.5 items-center">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                  {day.dayName}
                </div>
                {day.hours.map((item) => (
                  <div
                    key={item.hour}
                    title={`${day.dayName}s at ${formatHour(item.hour)} • ${item.count} watches`}
                    className={`h-7 rounded-[5px] flex items-center justify-center text-[10px] transition-all duration-150 hover:scale-110 hover:z-10 cursor-pointer ${getColorIntensity(
                      item.count,
                      maxCount
                    )}`}
                  >
                    {item.count > 0 ? item.count : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* GitHub-style Heatmap Legend */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span>Hover over cells for activity details</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Less</span>
              <div className="w-3.5 h-3.5 rounded-[3px] bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800" />
              <div className="w-3.5 h-3.5 rounded-[3px] bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-900" />
              <div className="w-3.5 h-3.5 rounded-[3px] bg-red-300 dark:bg-red-800" />
              <div className="w-3.5 h-3.5 rounded-[3px] bg-red-500 dark:bg-red-600" />
              <div className="w-3.5 h-3.5 rounded-[3px] bg-red-600 dark:bg-red-500 shadow-xs shadow-red-500/40" />
              <span className="text-[11px]">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
