import { useState, useMemo } from 'react';
import type { NormalizedWatchRecord } from '../../types';
import { computeDailyContributionCalendar } from '../../lib/stats/timeSeries';
import { Calendar, Activity, Zap, Flame, Trophy } from 'lucide-react';
import { formatNumber } from '../../lib/format/numbers';
import { useAccent } from '../../hooks/useAccent';
import { useTheme } from '../../hooks/useTheme';
import { getHeatmapCellStyle, hexToRgb } from '../../lib/color';

interface GitHubCalendarHeatmapProps {
  history: NormalizedWatchRecord[];
  title?: string;
}

const ALL_DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateFormatted(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function GitHubCalendarHeatmap({ history, title = 'Viewing Activity Calendar' }: GitHubCalendarHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<string>('last12');
  const { accentColor } = useAccent();
  const { isDark } = useTheme();

  const calendarData = useMemo(() => {
    return computeDailyContributionCalendar(history, selectedYear);
  }, [history, selectedYear]);

  const {
    weeks,
    monthHeaders,
    availableYears,
    totalContributions,
    activeDaysCount,
    maxSingleDayCount,
    longestStreak,
  } = calendarData;

  const totalWeeks = weeks.length;
  const { r, g, b } = hexToRgb(accentColor);

  return (
    <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            {totalContributions > 0
              ? `${formatNumber(totalContributions)} items logged in ${
                  selectedYear === 'last12' ? 'the past 12 months' : selectedYear
                }`
              : 'Daily activity breakdown'}
          </p>
        </div>

        {/* Year Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="heatmap-year-select" className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Timeline:
          </label>
          <select
            id="heatmap-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 hover:bg-neutral-200/70 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 text-neutral-800 dark:text-neutral-200 focus:outline-hidden transition-colors cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr} className="bg-white dark:bg-[#1c1e24] text-neutral-900 dark:text-neutral-100">
                {yr === 'last12' ? 'Past 12 Months' : yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apple Health Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-white/4 border border-black/4 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Total Logged
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatNumber(totalContributions)}
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-color)',
            }}
          >
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-white/4 border border-black/4 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Active Days
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatNumber(activeDaysCount)} <span className="text-xs font-normal text-neutral-400">days</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-white/4 border border-black/4 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Single-Day Peak
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {formatNumber(maxSingleDayCount)} <span className="text-xs font-normal text-neutral-400">plays</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50/70 dark:bg-white/4 border border-black/4 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Longest Streak
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white tabular-nums mt-0.5">
              {longestStreak} <span className="text-xs font-normal text-neutral-400">days</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px] inline-block">
          {/* Month Header Row */}
          <div className="flex text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 pl-8 select-none relative h-4">
            {monthHeaders.map((m, idx) => {
              const leftPercent = (m.weekIndex / (totalWeeks || 1)) * 100;
              return (
                <span
                  key={`${m.name}-${idx}`}
                  className="absolute"
                  style={{ left: `calc(${leftPercent}% + 2rem)` }}
                >
                  {m.name}
                </span>
              );
            })}
          </div>

          {/* Grid: Day labels + 7 rows */}
          <div className="flex gap-2">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between text-[9px] font-medium text-neutral-400 select-none py-0.5 w-6 shrink-0">
              {ALL_DAYS_LABELS.map((d, i) => (
                <span key={d} className={`h-[11px] leading-[11px] ${i % 2 === 1 ? 'visible' : 'invisible'}`}>
                  {d}
                </span>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex-1 flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px] flex-1">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className="w-full aspect-square rounded-[2px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const tooltipText = `${formatDateFormatted(day.date)} • ${
                      day.count === 0 ? 'No activity' : `${day.count.toLocaleString()} watched`
                    }`;
                    const cell = getHeatmapCellStyle(day.count, maxSingleDayCount, accentColor, isDark);

                    return (
                      <div
                        key={day.date}
                        title={tooltipText}
                        style={cell.style}
                        className={`w-full aspect-square rounded-[2px] transition-transform duration-100 hover:scale-125 hover:z-10 cursor-pointer ${cell.className}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Dynamic Legend */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 select-none pt-2 border-t border-black/5 dark:border-white/5">
            <span>Daily Activity Cadence</span>
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
