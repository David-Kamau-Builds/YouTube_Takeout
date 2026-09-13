import { useDashboardData } from './hooks/useDashboardStats';
import { KpiCard } from '../../components/ui/KpiCard';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { TopBarChart } from '../../components/charts/BarChart';
import { HeatmapChart } from '../../components/charts/HeatmapChart';
import { KpiCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { PlayCircle, Music, Tv, Mic, Disc, Users } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Overview Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Takeout Dashboard Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Aggregated watch history, listening habits, and activity breakdown.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Videos Watched"
          value={kpis.totalVideosWatched}
          icon={PlayCircle}
          color="red"
        />
        <KpiCard
          title="Music Played"
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

      {/* Time Series + Donut Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesChart data={timeSeries} title="Watch & Listening Activity Over Time" />
        </div>
        <div>
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

      {/* Hourly Heatmap */}
      <div>
        <HeatmapChart data={heatmap} title="Watch Activity Heatmap (Day vs Hour)" />
      </div>
    </div>
  );
}
