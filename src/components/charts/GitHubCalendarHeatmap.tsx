import { useState, useMemo } from 'react';
import type { NormalizedWatchRecord } from '../../types';
import { computeDailyContributionCalendar } from '../../lib/stats/timeSeries';
import { Calendar, Flame, Trophy, Activity } from 'lucide-react';
import { formatNumber } from '../../lib/format/numbers';

interface GitHubCalendarHeatmapProps {
  history: NormalizedWatchRecord[];
  title?: string;
}

const ALL_DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCellColorClass(count: number, maxCount: number): string {
  if (count === 0) {
    return 'bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200/40 dark:border-slate-800/40';
  }
  const ratio = count / (maxCount || 1);
  if (ratio < 0.25) {
    return 'bg-red-100 text-red-800 dark:bg-red-950/90 dark:text-red-300 border-red-200/60 dark:border-red-900/60';
  }
  if (ratio < 0.5) {
    return 'bg-red-300 text-red-950 dark:bg-red-800 dark:text-red-100 font-medium border-red-400/60 dark:border-red-700/60';
  }
  if (ratio < 0.75) {
    return 'bg-red-500 text-white dark:bg-red-600 dark:text-white font-semibold border-red-600 dark:border-red-500 shadow-xs shadow-red-500/20';
  }
  return 'bg-red-600 text-white dark:bg-red-500 dark:text-white font-bold border-red-700 dark:border-red-400 shadow-md shadow-red-500/30';
}

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

export function GitHubCalendarHeatmap({ history, title = 'Watch Activity Calendar' }: GitHubCalendarHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<string>('last12');

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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalContributions > 0
              ? `${formatNumber(totalContributions)} videos & tracks watched in ${
                  selectedYear === 'last12' ? 'the past 12 months' : selectedYear
                }`
              : 'Daily watch activity timeline'}
          </p>
        </div>

        {/* Year Filter Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <label htmlFor="heatmap-year-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Year:
          </label>
          <select
            id="heatmap-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr === 'last12' ? 'Past 12 Months' : yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Watches</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatNumber(totalContributions)}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Days</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatNumber(activeDaysCount)} days
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Peak Single Day</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatNumber(maxSingleDayCount)} max
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Longest Streak</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {longestStreak} days
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Calendar Grid View */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px] inline-block">
          {/* Month Header Row */}
          <div className="flex text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 pl-9 select-none relative h-5">
            {monthHeaders.map((m, idx) => {
              const leftPercent = (m.weekIndex / (totalWeeks || 1)) * 100;
              return (
                <span
                  key={`${m.name}-${idx}`}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute transform -translate-x-1/2 whitespace-nowrap"
                >
                  {m.name}
                </span>
              );
            })}
          </div>

          {/* 7 Days Rows x 52 Weeks Grid */}
          <div className="flex gap-1.5">
            {/* Days of Week Row Labels (All 7 Days) */}
            <div className="grid grid-rows-7 gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pr-2 select-none shrink-0 py-0.5">
              {ALL_DAYS_LABELS.map((dayLabel) => (
                <div key={dayLabel} className="h-3.5 flex items-center justify-end leading-none">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1 flex-1">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const dayObj = week[dIdx];
                    if (!dayObj) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className="h-3.5 w-3.5 rounded-[3px] bg-transparent"
                        />
                      );
                    }

                    return (
                      <div
                        key={dayObj.date}
                        title={`${formatDateFormatted(dayObj.date)} • ${dayObj.count} watches`}
                        className={`h-3.5 w-3.5 rounded-[3px] border transition-all duration-150 hover:scale-125 hover:z-20 cursor-pointer ${getCellColorClass(
                          dayObj.count,
                          maxSingleDayCount
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* GitHub-Style Legend */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span>Hover over squares to see watch totals for specific dates</span>
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
