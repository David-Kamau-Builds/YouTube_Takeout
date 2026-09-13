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
