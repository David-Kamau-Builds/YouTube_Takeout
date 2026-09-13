import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TimeSeriesPoint } from '../../lib/stats/timeSeries';
import { useTheme } from '../../hooks/useTheme';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

export function TimeSeriesChart({ data, title = 'Watch Activity Over Time' }: TimeSeriesChartProps) {
  const { isDark } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all duration-200">
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-6">
        {title}
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMusic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
            <XAxis
              dataKey="label"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '0.75rem',
                color: isDark ? '#fff' : '#0f172a',
                fontSize: '12px',
                boxShadow: isDark ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="youtube"
              name="YouTube Videos"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorYoutube)"
            />
            <Area
              type="monotone"
              dataKey="music"
              name="YouTube Music"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMusic)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
