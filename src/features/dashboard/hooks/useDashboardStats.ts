import { useQuery } from '@tanstack/react-query';
import { loadWatchHistory } from '../../../lib/parsers/watchHistory';
import { loadSubscriptions } from '../../../lib/parsers/subscriptions';
import { loadComments } from '../../../lib/parsers/comments';
import { loadLiveChats } from '../../../lib/parsers/liveChats';
import { computeDashboardStats } from '../../../lib/stats/kpis';
import { computeMonthlyActivity, computeHourlyHeatmap } from '../../../lib/stats/timeSeries';
import { getTopChannels, getTopArtists, getTopSongs } from '../../../lib/stats/rankings';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [history, subs, comments, liveChats] = await Promise.all([
        loadWatchHistory(),
        loadSubscriptions().catch(() => []),
        loadComments().catch(() => []),
        loadLiveChats().catch(() => []),
      ]);

      const kpis = computeDashboardStats(history, subs.length, comments.length, liveChats.length);
      const timeSeries = computeMonthlyActivity(history);
      const heatmap = computeHourlyHeatmap(history);
      const topChannels = getTopChannels(history, 10);
      const topArtists = getTopArtists(history, 10);
      const topSongs = getTopSongs(history, 10);

      return {
        history,
        kpis,
        timeSeries,
        heatmap,
        topChannels,
        topArtists,
        topSongs,
      };
    },
  });
}
