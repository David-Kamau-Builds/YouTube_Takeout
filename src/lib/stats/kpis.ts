import type { NormalizedWatchRecord, DashboardStats } from '../../types';

export function computeDashboardStats(
  history: NormalizedWatchRecord[],
  subscriptionsCount: number,
  commentsCount: number,
  liveChatsCount: number
): DashboardStats {
  let totalVideosWatched = 0;
  let totalMusicTracksPlayed = 0;
  const channelsSet = new Set<string>();
  const artistsSet = new Set<string>();
  const songsSet = new Set<string>();

  for (const record of history) {
    if (record.isMusic) {
      totalMusicTracksPlayed++;
      if (record.channelName) artistsSet.add(record.channelName);
      if (record.title) songsSet.add(record.title);
    } else {
      if (record.type === 'Watched') {
        totalVideosWatched++;
      }
      if (record.channelName) channelsSet.add(record.channelName);
    }
  }

  const totalMediaCount = totalVideosWatched + totalMusicTracksPlayed;
  const musicPercentage = totalMediaCount > 0 ? (totalMusicTracksPlayed / totalMediaCount) * 100 : 0;
  const videoPercentage = totalMediaCount > 0 ? (totalVideosWatched / totalMediaCount) * 100 : 0;

  return {
    totalVideosWatched,
    totalMusicTracksPlayed,
    uniqueChannels: channelsSet.size,
    uniqueArtists: artistsSet.size,
    uniqueSongs: songsSet.size,
    totalSubscriptions: subscriptionsCount,
    totalComments: commentsCount,
    totalLiveChats: liveChatsCount,
    musicPercentage,
    videoPercentage,
  };
}
