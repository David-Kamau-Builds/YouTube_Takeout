import type { HeatmapPoint } from '../../lib/stats/timeSeries';
import { DAY_NAMES } from '../../lib/format/dates';

interface HeatmapChartProps {
  data: HeatmapPoint[];
  title?: string;
}

function getColorIntensity(count: number, maxCount: number): string {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-800/40';
  const ratio = count / (maxCount || 1);
  if (ratio < 0.25) return 'bg-red-500/20 text-red-700 dark:text-red-300';
  if (ratio < 0.5) return 'bg-red-500/40 text-white';
  if (ratio < 0.75) return 'bg-red-500/70 text-white';
  return 'bg-red-600 text-white font-bold';
}

export function HeatmapChart({ data, title = 'Hourly Activity Heatmap' }: HeatmapChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const days = Array.from({ length: 7 }, (_, dayIdx) => {
    return {
      dayName: DAY_NAMES[dayIdx],
      hours: data.filter((d) => d.dayOfWeek === dayIdx),
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs overflow-x-auto">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
        {title}
      </h3>
      <div className="min-w-[600px]">
        <div className="grid grid-cols-25 gap-1 text-[10px] font-medium text-slate-400 mb-2">
          <div className="text-left font-semibold">Day</div>
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="text-center">
              {h % 3 === 0 ? `${h}h` : ''}
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {days.map((day) => (
            <div key={day.dayName} className="grid grid-cols-25 gap-1 items-center">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {day.dayName}
              </div>
              {day.hours.map((item) => (
                <div
                  key={item.hour}
                  title={`${day.dayName} at ${item.hour}:00 - ${item.count} watches`}
                  className={`h-7 rounded-md flex items-center justify-center text-[10px] transition-transform hover:scale-110 cursor-pointer ${getColorIntensity(
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
      </div>
    </div>
  );
}
