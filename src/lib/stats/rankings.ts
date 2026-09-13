import type { NormalizedWatchRecord } from '../../types';

export interface RankingItem {
  name: string;
  count: number;
  subText?: string;
}

export function getTopChannels(history: NormalizedWatchRecord[], limit = 10): RankingItem[] {
  const counts = new Map<string, number>();

  for (const record of history) {
    if (!record.isMusic && record.channelName && record.channelName !== 'Unknown Channel') {
      counts.set(record.channelName, (counts.get(record.channelName) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopArtists(history: NormalizedWatchRecord[], limit = 10): RankingItem[] {
  const counts = new Map<string, number>();

  for (const record of history) {
    if (record.isMusic && record.channelName && record.channelName !== 'Unknown Artist') {
      counts.set(record.channelName, (counts.get(record.channelName) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopSongs(history: NormalizedWatchRecord[], limit = 10): RankingItem[] {
  const counts = new Map<string, { count: number; artist: string }>();

  for (const record of history) {
    if (record.isMusic && record.title) {
      const existing = counts.get(record.title);
      if (existing) {
        existing.count++;
      } else {
        counts.set(record.title, { count: 1, artist: record.channelName });
      }
    }
  }

  return Array.from(counts.entries())
    .map(([name, data]) => ({ name, count: data.count, subText: data.artist }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
