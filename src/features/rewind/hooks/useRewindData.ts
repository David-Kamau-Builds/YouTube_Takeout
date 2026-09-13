import { useQuery } from '@tanstack/react-query';
import { loadWatchHistory } from '../../../lib/parsers/watchHistory';
import { computeRewindStats } from '../../../lib/stats/rewind';
import type { RewindStats } from '../../../lib/stats/rewind';

export function useRewindData(selectedYear: number) {
  return useQuery({
    queryKey: ['rewind-data', selectedYear],
    queryFn: async () => {
      const history = await loadWatchHistory();

      // Extract unique available years
      const yearsSet = new Set<number>();
      for (const r of history) {
        if (r.year) yearsSet.add(r.year);
      }
      const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

      const stats: RewindStats = computeRewindStats(history, selectedYear);

      return {
        availableYears,
        stats,
      };
    },
  });
}
