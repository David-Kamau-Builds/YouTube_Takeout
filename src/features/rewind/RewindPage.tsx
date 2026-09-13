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
    <div className="space-y-8">
      {/* Header + Year Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            <span>Yearly Rewind Summary</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your personalized annual YouTube and YouTube Music highlights.
          </p>
        </div>

        <div>
          <Select
            value={String(year)}
            onChange={(val) => setYear(Number(val))}
            options={yearOptions}
            ariaLabel="Select rewind year"
          />
        </div>
      </div>

      {/* Hero Rewind Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-purple-600 to-indigo-700 p-8 lg:p-10 text-white shadow-xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5" />
            Rewind {stats.year}
          </span>
          <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ~{stats.totalEstimatedHours} Hours of Watch & Music Time
          </h3>
          <p className="text-base text-white/80 font-medium">
            You played <strong>{stats.totalVideos}</strong> videos and <strong>{stats.totalMusicTracks}</strong> songs in {stats.year}.
          </p>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 w-fit">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.longestStreakDays} Days
          </div>
          <div className="text-xs text-slate-400">Longest Active Watching Streak</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 w-fit">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.mostActiveDayCount} items
          </div>
          <div className="text-xs text-slate-400">
            Most Active Day ({formatDate(stats.mostActiveDayDate)})
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 w-fit">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.mostActiveHour}:00
          </div>
          <div className="text-xs text-slate-400">Peak Active Hour of Day</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 w-fit">
            <Music className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ~{stats.estimatedMusicHours} Hours
          </div>
          <div className="text-xs text-slate-400">Estimated Music Streaming</div>
        </div>
      </div>

      {/* Top Channels & Top Artists Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Channels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span>Top 5 Channels in {stats.year}</span>
          </h3>

          <div className="space-y-3">
            {stats.topChannels.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {item.count} watches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Artists */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-500" />
            <span>Top 5 Artists in {stats.year}</span>
          </h3>

          <div className="space-y-3">
            {stats.topArtists.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
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
