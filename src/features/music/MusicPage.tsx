import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMusicPageData } from './hooks/useMusicPageData';
import type { MusicLibrarySong, NormalizedWatchRecord } from '../../types';
import { KpiCard } from '../../components/ui/KpiCard';
import { TopBarChart } from '../../components/charts/BarChart';
import { DataTable } from '../../components/tables/DataTable';
import { VirtualTable } from '../../components/tables/VirtualTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { KpiCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDateTime } from '../../lib/format/dates';
import { Music, Mic, Disc, Library, ExternalLink, ListFilter, Layers } from 'lucide-react';

export function MusicPage() {
  const { data, isLoading, isError, refetch } = useMusicPageData();
  const [historySearch, setHistorySearch] = useState('');
  const [viewMode, setViewMode] = useState<'paginated' | 'virtual'>('paginated');

  const libraryColumns = useMemo<ColumnDef<MusicLibrarySong, any>[]>(
    () => [
      {
        accessorKey: 'songTitle',
        header: 'Song Title',
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'albumTitle',
        header: 'Album',
        cell: (info) => (
          <span className="text-slate-600 dark:text-slate-400">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'allArtists',
        header: 'Artist(s)',
        cell: (info) => (
          <span className="text-slate-700 dark:text-slate-300">
            {info.getValue<string[]>().join(', ')}
          </span>
        ),
      },
      {
        accessorKey: 'videoId',
        header: 'Link',
        cell: (info) => {
          const videoId = info.getValue<string>();
          return (
            <a
              href={`https://music.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium text-xs"
            >
              <span>Play</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        },
      },
    ],
    []
  );

  const historyColumns = useMemo<ColumnDef<NormalizedWatchRecord, any>[]>(
    () => [
      {
        accessorKey: 'time',
        header: 'Played At',
        size: 195,
        cell: (info) => (
          <span className="text-xs text-slate-500 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Track Title',
        meta: { flex: '3 1 0%' },
        cell: (info) => {
          const record = info.row.original;
          return record.titleUrl ? (
            <a
              href={record.titleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
            >
              <span className="truncate">{record.title}</span>
              <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
            </a>
          ) : (
            <span className="font-medium text-slate-900 dark:text-white truncate">
              {record.title}
            </span>
          );
        },
      },
      {
        accessorKey: 'channelName',
        header: 'Artist',
        meta: { flex: '2 1 0%' },
        cell: (info) => (
          <span className="text-slate-700 dark:text-slate-300 truncate block">
            {info.getValue<string>()}
          </span>
        ),
      },
    ],
    []
  );

  const filteredHistory = useMemo(() => {
    if (!data?.musicHistory) return [];
    if (!historySearch.trim()) return data.musicHistory;
    const q = historySearch.toLowerCase();
    return data.musicHistory.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.channelName.toLowerCase().includes(q)
    );
  }, [data, historySearch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  const { library, topArtists, topSongs, totalPlays, uniqueArtistsCount, uniqueSongsCount } = data;

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/15 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              YouTube Music Hub
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Detailed metrics for your music streaming, saved tracks, and top artists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{totalPlays.toLocaleString()}</span> total streams
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Music Plays"
          value={totalPlays}
          icon={Music}
          color="blue"
        />
        <KpiCard
          title="Unique Artists"
          value={uniqueArtistsCount}
          icon={Mic}
          color="purple"
        />
        <KpiCard
          title="Unique Songs"
          value={uniqueSongsCount}
          icon={Disc}
          color="emerald"
        />
        <KpiCard
          title="Saved Library Songs"
          value={library.length}
          icon={Library}
          color="amber"
        />
      </div>

      {/* Top Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopBarChart data={topArtists} title="Top 10 Artists" barColor="#3b82f6" />
        <TopBarChart data={topSongs} title="Top 10 Tracks Played" barColor="#6366f1" />
      </div>

      {/* Saved Music Library */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Saved Music Library ({library.length})
        </h3>
        <DataTable data={library} columns={libraryColumns} pageSize={5} />
      </div>

      {/* Full Music Listening History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Listening History Log ({filteredHistory.length} plays)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Search and explore your complete music streaming history.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchInput
                value={historySearch}
                onChange={setHistorySearch}
                placeholder="Search track or artist..."
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
              <button
                onClick={() => setViewMode('paginated')}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'paginated'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Paginated Table View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Pages</span>
              </button>
              <button
                onClick={() => setViewMode('virtual')}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'virtual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Virtualized Scroll View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Virtual</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'paginated' ? (
          <DataTable data={filteredHistory} columns={historyColumns} pageSize={10} />
        ) : (
          <VirtualTable data={filteredHistory} columns={historyColumns} />
        )}
      </div>
    </div>
  );
}
