import { useDashboardData } from './hooks/useDashboardStats';
import { KpiCard } from '../../components/ui/KpiCard';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { TopBarChart } from '../../components/charts/BarChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart';
import { GitHubCalendarHeatmap } from '../../components/charts/GitHubCalendarHeatmap';
import { KpiCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { PlayCircle, Music, Tv, Mic, Disc, Users, Sparkles, Activity } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-red-500/10 via-slate-100 to-blue-500/10 dark:from-red-950/30 dark:via-slate-900 dark:to-blue-950/30 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Takeout Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Takeout Analytics Overview
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Complete breakdown of your lifetime YouTube watch history, music listening habits, top creators, and activity patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Data Loaded</span>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Videos Watched"
          value={kpis.totalVideosWatched}
          icon={PlayCircle}
          color="red"
        />
        <KpiCard
          title="Music Tracks"
          value={kpis.totalMusicTracksPlayed}
          icon={Music}
          color="blue"
        />
        <KpiCard
          title="Unique Channels"
          value={kpis.uniqueChannels}
          icon={Tv}
          color="purple"
        />
        <KpiCard
          title="Unique Artists"
          value={kpis.uniqueArtists}
          icon={Mic}
          color="indigo"
        />
        <KpiCard
          title="Unique Songs"
          value={kpis.uniqueSongs}
          icon={Disc}
          color="emerald"
        />
        <KpiCard
          title="Subscriptions"
          value={kpis.totalSubscriptions}
          icon={Users}
          color="amber"
        />
      </div>

      {/* GitHub-Styled Heatmap Section */}
      <div className="w-full">
        <GitHubCalendarHeatmap history={data.history} title="Watch Activity Calendar (GitHub Style)" />
      </div>

      {/* Hourly Breakdown Matrix */}
      <div className="w-full">
        <HeatmapChart data={heatmap} title="Hourly Activity Breakdown (Day vs Hour)" />
      </div>

      {/* Time Series + Donut Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesChart data={timeSeries} title="Watch & Listening Activity Over Time" />
        </div>
        <div className="lg:col-span-1">
          <DonutChart
            videosCount={kpis.totalVideosWatched}
            musicCount={kpis.totalMusicTracksPlayed}
          />
        </div>
      </div>

      {/* Top Rankings Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopBarChart data={topChannels} title="Top 10 Channels Watched" barColor="#ef4444" />
        <TopBarChart data={topArtists} title="Top 10 Artists Listened To" barColor="#3b82f6" />
      </div>
    </div>
  );
}
