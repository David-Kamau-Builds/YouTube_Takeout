import type { NormalizedWatchRecord } from '../../types';
import { getTopChannels, getTopArtists } from './rankings';
import type { RankingItem } from './rankings';

export interface RewindStats {
  year: number;
  totalVideos: number;
  totalMusicTracks: number;
  estimatedVideoHours: number;
  estimatedMusicHours: number;
  totalEstimatedHours: number;
  topChannels: RankingItem[];
  topArtists: RankingItem[];
  mostActiveDayDate: string;
  mostActiveDayCount: number;
  mostActiveHour: number;
  longestStreakDays: number;
}

export function computeRewindStats(history: NormalizedWatchRecord[], targetYear: number): RewindStats {
  const filtered = history.filter(r => r.year === targetYear);

  let totalVideos = 0;
  let totalMusicTracks = 0;
  const dayCounts = new Map<string, number>(); // YYYY-MM-DD -> count
  const hourCounts = new Array(24).fill(0);

  for (const r of filtered) {
    if (r.isMusic) {
      totalMusicTracks++;
    } else if (r.type === 'Watched') {
      totalVideos++;
    }

    if (r.time) {
      const dateStr = r.time.split('T')[0];
      if (dateStr) {
        dayCounts.set(dateStr, (dayCounts.get(dateStr) || 0) + 1);
      }
    }

    if (r.hour >= 0 && r.hour < 24) {
      hourCounts[r.hour]++;
    }
  }

  // Estimated hours: ~8 mins per video (0.133 hrs), ~3.5 mins per music track (0.0583 hrs)
  const estimatedVideoHours = Math.round(totalVideos * 0.1333);
  const estimatedMusicHours = Math.round(totalMusicTracks * 0.0583);
  const totalEstimatedHours = estimatedVideoHours + estimatedMusicHours;

  // Top rankings for this year
  const topChannels = getTopChannels(filtered, 5);
  const topArtists = getTopArtists(filtered, 5);

  // Most active day
  let mostActiveDayDate = 'N/A';
  let mostActiveDayCount = 0;
  for (const [date, count] of dayCounts.entries()) {
    if (count > mostActiveDayCount) {
      mostActiveDayCount = count;
      mostActiveDayDate = date;
    }
  }

  // Most active hour
  let mostActiveHour = 0;
  let maxHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxHourCount) {
      maxHourCount = hourCounts[h];
      mostActiveHour = h;
    }
  }

  // Longest streak calculation
  const sortedDays = Array.from(dayCounts.keys()).sort();
  let longestStreakDays = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const currentDate = new Date(dayStr);
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    if (currentStreak > longestStreakDays) {
      longestStreakDays = currentStreak;
    }
    prevDate = currentDate;
  }

  return {
    year: targetYear,
    totalVideos,
    totalMusicTracks,
    estimatedVideoHours,
    estimatedMusicHours,
    totalEstimatedHours,
    topChannels,
    topArtists,
    mostActiveDayDate,
    mostActiveDayCount,
    mostActiveHour,
    longestStreakDays,
  };
}
