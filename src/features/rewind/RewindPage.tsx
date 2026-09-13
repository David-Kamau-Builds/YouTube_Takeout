import { useState } from 'react';
import { useRewindData } from './hooks/useRewindData';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { Sparkles, Flame, Clock, Calendar, Tv, Mic, Music } from 'lucide-react';
import { formatDate } from '../../lib/format/dates';

export function RewindPage() {
  const [year, setYear] = useState<number>(2026);
  const { data, isLoading, isError, refetch } = useRewindData(year);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  const { availableYears, stats } = data;

  const yearOptions = availableYears.map((y) => ({
    value: String(y),
    label: `${y} Rewind`,
  }));

  return (
    <div className="space-y-6">
      {/* Executive Header + Year Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/15 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Yearly Rewind
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Personalized annual retrospective for your YouTube watch habits and music streaming.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-44 self-start sm:self-auto">
          <Select
            value={String(year)}
            onChange={(val) => setYear(Number(val))}
            options={yearOptions}
            ariaLabel="Select rewind year"
          />
        </div>
      </div>

      {/* Hero Rewind Banner - Apple Replay style */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 dark:bg-[#13151a] border border-neutral-800 dark:border-white/10 p-8 lg:p-10 text-white shadow-xs">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide text-neutral-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Rewind {stats.year}
          </span>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            ~{stats.totalEstimatedHours.toLocaleString()} Hours of Watch & Music Time
          </h3>
          <p className="text-sm sm:text-base text-neutral-300 font-medium">
            You streamed <strong className="text-white">{stats.totalVideos.toLocaleString()}</strong> videos and <strong className="text-white">{stats.totalMusicTracks.toLocaleString()}</strong> songs in {stats.year}.
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 w-fit">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
            {stats.longestStreakDays} Days
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Longest Active Watching Streak</div>
        </div>

        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15 w-fit">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
            {stats.mostActiveDayCount} items
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Most Active Day ({formatDate(stats.mostActiveDayDate)})
          </div>
        </div>

        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15 w-fit">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
            {stats.mostActiveHour}:00
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Peak Active Hour of Day</div>
        </div>

        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 w-fit">
            <Music className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
            ~{stats.estimatedMusicHours.toLocaleString()} Hours
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Estimated Music Streaming</div>
        </div>
      </div>

      {/* Top Channels & Top Artists Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Channels */}
        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
            <Tv className="w-4 h-4 text-red-500" />
            <span>Top 5 Channels in {stats.year}</span>
          </h3>

          <div className="space-y-2.5">
            {stats.topChannels.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/4 border border-black/4 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {item.count} watches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Artists */}
        <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <span>Top 5 Artists in {stats.year}</span>
          </h3>

          <div className="space-y-2.5">
            {stats.topArtists.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/4 border border-black/4 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {item.count} plays
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
