import { useQuery } from '@tanstack/react-query';
import { loadWatchHistory } from '../../../lib/parsers/watchHistory';

export function useWatchHistoryData() {
  return useQuery({
    queryKey: ['watch-history-all'],
    queryFn: () => loadWatchHistory(),
  });
}
