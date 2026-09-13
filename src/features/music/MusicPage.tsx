import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMusicPageData } from './hooks/useMusicPageData';
import type { MusicLibrarySong, NormalizedWatchRecord } from '../../types';
import { KpiCard } from '../../components/ui/KpiCard';
import { TopBarChart } from '../../components/charts/BarChart';
import { DataTable } from '../../components/tables/DataTable';
import { VirtualTable } from '../../components/tables/VirtualTable';
import { KpiCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDateTime } from '../../lib/format/dates';
import { Music, Mic, Disc, Library, ExternalLink } from 'lucide-react';

export function MusicPage() {
  const { data, isLoading, isError, refetch } = useMusicPageData();

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
        size: 170,
        cell: (info) => (
          <span className="text-xs text-slate-500 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Track Title',
        size: 380,
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
        size: 220,
        cell: (info) => (
          <span className="text-slate-700 dark:text-slate-300 truncate block">
            {info.getValue<string>()}
          </span>
        ),
      },
    ],
    []
  );

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

  const { musicHistory, library, topArtists, topSongs, totalPlays, uniqueArtistsCount, uniqueSongsCount } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          YouTube Music Hub
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics for your music streaming, saved songs, and top artists.
        </p>
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
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Listening History Log ({musicHistory.length} plays)
        </h3>
        <VirtualTable data={musicHistory} columns={historyColumns} />
      </div>
    </div>
  );
}
