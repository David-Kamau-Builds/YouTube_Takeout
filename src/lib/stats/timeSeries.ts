import type { NormalizedWatchRecord } from '../../types';
import { getMonthLabel, DAY_NAMES } from '../format/dates';

export interface TimeSeriesPoint {
  key: string;
  label: string;
  total: number;
  youtube: number;
  music: number;
}

export function computeMonthlyActivity(history: NormalizedWatchRecord[]): TimeSeriesPoint[] {
  const map = new Map<string, { youtube: number; music: number }>();

  for (const record of history) {
    const key = record.month;
    if (!key) continue;

    const current = map.get(key) || { youtube: 0, music: 0 };
    if (record.isMusic) {
      current.music++;
    } else {
      current.youtube++;
    }
    map.set(key, current);
  }

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map(key => {
    const item = map.get(key)!;
    return {
      key,
      label: getMonthLabel(key),
      total: item.youtube + item.music,
      youtube: item.youtube,
      music: item.music,
    };
  });
}

export interface HeatmapPoint {
  dayOfWeek: number; // 0-6
  dayName: string;
  hour: number; // 0-23
  count: number;
}

export function computeHourlyHeatmap(history: NormalizedWatchRecord[]): HeatmapPoint[] {
  // 7 days x 24 hours grid
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const record of history) {
    if (record.dayOfWeek >= 0 && record.dayOfWeek < 7 && record.hour >= 0 && record.hour < 24) {
      grid[record.dayOfWeek][record.hour]++;
    }
  }

  const points: HeatmapPoint[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      points.push({
        dayOfWeek: d,
        dayName: DAY_NAMES[d],
        hour: h,
        count: grid[d][h],
      });
    }
  }

  return points;
}

export interface DailyContributionDay {
  date: string; // "YYYY-MM-DD"
  count: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  weekIndex: number; // 0..52
  month: number; // 0-11
  monthName: string;
  year: number;
}

export interface MonthHeader {
  name: string;
  weekIndex: number;
}

export interface DailyContributionCalendar {
  days: DailyContributionDay[];
  weeks: (DailyContributionDay | null)[][]; // 7 days (rows) x N weeks (cols)
  monthHeaders: MonthHeader[];
  availableYears: string[];
  selectedYear: string;
  totalContributions: number;
  activeDaysCount: number;
  maxSingleDayCount: number;
  currentStreak: number;
  longestStreak: number;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function computeDailyContributionCalendar(
  history: NormalizedWatchRecord[],
  selectedYear: string = 'last12'
): DailyContributionCalendar {
  // Map date string 'YYYY-MM-DD' -> total watches
  const countsByDate = new Map<string, number>();
  const yearSet = new Set<number>();

  for (const record of history) {
    if (!record.time) continue;
    const dateStr = record.time.substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

    countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);

    const yearNum = parseInt(dateStr.substring(0, 4), 10);
    if (!isNaN(yearNum)) {
      yearSet.add(yearNum);
    }
  }

  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
  const availableYears = ['last12', ...sortedYears.map(String)];

  // Determine start & end dates
  let startDate: Date;
  let endDate: Date;

  if (selectedYear === 'last12' || !selectedYear) {
    // End date is today or max history date
    const latestDateStr = Array.from(countsByDate.keys()).sort().pop();
    const latestDate = latestDateStr ? new Date(latestDateStr) : new Date();
    endDate = isNaN(latestDate.getTime()) ? new Date() : latestDate;

    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364); // Past 52 weeks (365 days)
  } else {
    const yr = parseInt(selectedYear, 10);
    startDate = new Date(yr, 0, 1);
    endDate = new Date(yr, 11, 31);
  }

  // Adjust start date to previous Sunday to align weeks cleanly
  const startDayOfWeek = startDate.getDay(); // 0 = Sun
  const calendarStart = new Date(startDate);
  calendarStart.setDate(calendarStart.getDate() - startDayOfWeek);

  const days: DailyContributionDay[] = [];
  const weeks: (DailyContributionDay | null)[][] = [];

  let currentWeek: (DailyContributionDay | null)[] = Array(7).fill(null);
  let weekIndex = 0;
  const monthHeaders: MonthHeader[] = [];
  let lastMonth = -1;

  let totalContributions = 0;
  let activeDaysCount = 0;
  let maxSingleDayCount = 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  const curr = new Date(calendarStart);
  while (curr <= endDate || currentWeek.some(d => d !== null)) {
    const dateStr = curr.toISOString().substring(0, 10);
    const dayOfWeek = curr.getDay(); // 0 = Sun, ..., 6 = Sat
    const month = curr.getMonth();
    const year = curr.getFullYear();
    const isWithinRange = curr >= startDate && curr <= endDate;

    const count = isWithinRange ? (countsByDate.get(dateStr) || 0) : 0;

    if (isWithinRange) {
      totalContributions += count;
      if (count > 0) {
        activeDaysCount++;
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
      if (count > maxSingleDayCount) {
        maxSingleDayCount = count;
      }
    }

    const dayObj: DailyContributionDay = {
      date: dateStr,
      count,
      dayOfWeek,
      weekIndex,
      month,
      monthName: SHORT_MONTHS[month],
      year,
    };

    if (isWithinRange) {
      days.push(dayObj);
    }

    currentWeek[dayOfWeek] = dayObj;

    // Track month headers
    if (dayOfWeek === 0 && month !== lastMonth && isWithinRange) {
      monthHeaders.push({
        name: SHORT_MONTHS[month],
        weekIndex,
      });
      lastMonth = month;
    }

    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = Array(7).fill(null);
      weekIndex++;
    }

    curr.setDate(curr.getDate() + 1);
    if (curr > endDate && dayOfWeek === 6) break;
  }

  if (currentWeek.some(d => d !== null)) {
    weeks.push(currentWeek);
  }

  currentStreak = runningStreak;

  return {
    days,
    weeks,
    monthHeaders,
    availableYears,
    selectedYear,
    totalContributions,
    activeDaysCount,
    maxSingleDayCount,
    currentStreak,
    longestStreak,
  };
}
