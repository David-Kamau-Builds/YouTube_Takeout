import { useQuery } from '@tanstack/react-query';
import { loadWatchHistory } from '../../../lib/parsers/watchHistory';
import { loadMusicLibrary } from '../../../lib/parsers/musicLibrary';
import { getTopArtists, getTopSongs } from '../../../lib/stats/rankings';

export function useMusicPageData() {
  return useQuery({
    queryKey: ['music-page-data'],
    queryFn: async () => {
      const [history, library] = await Promise.all([
        loadWatchHistory(),
        loadMusicLibrary().catch(() => []),
      ]);

      const musicHistory = history.filter((r) => r.isMusic);

      const topArtists = getTopArtists(musicHistory, 10);
      const topSongs = getTopSongs(musicHistory, 10);

      const uniqueArtistsCount = new Set(musicHistory.map((r) => r.channelName)).size;
      const uniqueSongsCount = new Set(musicHistory.map((r) => r.title)).size;

      return {
        musicHistory,
        library,
        topArtists,
        topSongs,
        totalPlays: musicHistory.length,
        uniqueArtistsCount,
        uniqueSongsCount,
      };
    },
  });
}
