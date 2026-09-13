import { useDashboardData } from './hooks/useDashboardStats';
import { KpiCard } from '../../components/ui/KpiCard';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { TopBarChart } from '../../components/charts/BarChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart';
import { GitHubCalendarHeatmap } from '../../components/charts/GitHubCalendarHeatmap';
import { KpiCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { PlayCircle, Music, Tv, Mic, Disc, Users, Check } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  const { kpis, timeSeries, heatmap, topChannels, topArtists } = data;

  // Informative context computations
  const totalMedia = (kpis.totalVideosWatched || 0) + (kpis.totalMusicTracksPlayed || 0);
  const musicPercent = totalMedia > 0 ? Math.round((kpis.totalMusicTracksPlayed / totalMedia) * 100) : 0;
  const videoPercent = 100 - musicPercent;

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Analytics Overview
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium">
              IndexedDB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Personal consumption breakdown spanning watch history, audio streaming, top creators, and viewing patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {totalMedia.toLocaleString()} events analyzed
            </span>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid with Domain Identifiers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Videos Watched"
          value={kpis.totalVideosWatched}
          subValue={`${videoPercent}% of media events`}
          icon={PlayCircle}
          color="red"
        />
        <KpiCard
          title="Music Tracks"
          value={kpis.totalMusicTracksPlayed}
          subValue={`${musicPercent}% of media events`}
          icon={Music}
          color="blue"
        />
        <KpiCard
          title="Unique Channels"
          value={kpis.uniqueChannels}
          subValue="Distinct creators"
          icon={Tv}
          color="purple"
        />
        <KpiCard
          title="Unique Artists"
          value={kpis.uniqueArtists}
          subValue="Music catalog"
          icon={Mic}
          color="cyan"
        />
        <KpiCard
          title="Saved Tracks"
          value={kpis.uniqueSongs}
          subValue="Library records"
          icon={Disc}
          color="emerald"
        />
        <KpiCard
          title="Subscriptions"
          value={kpis.totalSubscriptions}
          subValue="Active channels"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Calendar Heatmap */}
      <div className="w-full">
        <GitHubCalendarHeatmap history={data.history} title="Viewing Activity Calendar" />
      </div>

      {/* Hourly Breakdown Matrix */}
      <div className="w-full">
        <HeatmapChart data={heatmap} title="Consumption Rhythm (Day vs. Hour)" />
      </div>

      {/* Time Series + Donut Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TimeSeriesChart data={timeSeries} title="Watch & Listening Timeline" />
        </div>
        <div className="lg:col-span-1">
          <DonutChart
            videosCount={kpis.totalVideosWatched}
            musicCount={kpis.totalMusicTracksPlayed}
          />
        </div>
      </div>

      {/* Top Rankings Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopBarChart data={topChannels} title="Top 10 Channels Watched" barColor="#8B5CF6" />
        <TopBarChart data={topArtists} title="Top 10 Artists Listened To" barColor="#2563EB" />
      </div>
    </div>
  );
}
