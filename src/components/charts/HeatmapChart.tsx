import type { HeatmapPoint } from '../../lib/stats/timeSeries';
import { DAY_NAMES } from '../../lib/format/dates';
import { Clock } from 'lucide-react';
import { useAccent } from '../../hooks/useAccent';
import { useTheme } from '../../hooks/useTheme';
import { getHeatmapCellStyle, hexToRgb } from '../../lib/color';

interface HeatmapChartProps {
  data: HeatmapPoint[];
  title?: string;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

export function HeatmapChart({ data, title = 'Consumption Rhythm (Day vs. Hour)' }: HeatmapChartProps) {
  const { accentColor } = useAccent();
  const { isDark } = useTheme();

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const peakPoint = data.reduce((max, pt) => (pt.count > max.count ? pt : max), data[0] || { dayOfWeek: 0, hour: 0, count: 0 });

  const days = Array.from({ length: 7 }, (_, dayIdx) => {
    return {
      dayName: DAY_NAMES[dayIdx],
      hours: data.filter((d) => d.dayOfWeek === dayIdx),
    };
  });

  const { r, g, b } = hexToRgb(accentColor);

  return (
    <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Hourly consumption density across the week
          </p>
        </div>

        {peakPoint && peakPoint.count > 0 && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border shadow-2xs self-start sm:self-auto transition-all"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-color)',
            }}
          >
            <Clock className="w-3 h-3" />
            <span>
              Peak: {DAY_NAMES[peakPoint.dayOfWeek]} at {formatHour(peakPoint.hour)} ({peakPoint.count.toLocaleString()} watches)
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hours Header */}
          <div className="grid grid-cols-25 gap-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 select-none">
            <div className="text-left font-semibold text-neutral-500 dark:text-neutral-400">Day</div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-center">
                {h % 3 === 0 ? formatHour(h).replace(' ', '') : ''}
              </div>
            ))}
          </div>

          {/* Days Grid Rows */}
          <div className="space-y-1">
            {days.map((day) => (
              <div key={day.dayName} className="grid grid-cols-25 gap-1 items-center">
                <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 select-none">
                  {day.dayName}
                </div>
                {day.hours.map((item) => {
                  const cell = getHeatmapCellStyle(item.count, maxCount, accentColor, isDark);
                  return (
                    <div
                      key={item.hour}
                      title={`${day.dayName} at ${formatHour(item.hour)} • ${item.count.toLocaleString()} watches`}
                      style={cell.style}
                      className={`h-6 rounded-[4px] flex items-center justify-center text-[9px] tabular-nums transition-all duration-100 hover:scale-110 hover:z-10 cursor-pointer ${cell.className}`}
                    >
                      {item.count > 0 ? item.count : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Dynamic Legend */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 select-none pt-3 border-t border-black/5 dark:border-white/5">
            <span>24-Hour Rhythm Matrix</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${isDark ? 0.22 : 0.18})` }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.45)` }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.75)` }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 1.0)` }}
                />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
