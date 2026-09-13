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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="px-3 py-2 rounded-xl bg-neutral-900/90 dark:bg-[#1f2128]/95 backdrop-blur-md text-white border border-white/10 shadow-xl text-xs space-y-1">
      <div className="text-[11px] font-medium text-neutral-400 border-b border-white/10 pb-1">
        {label}
      </div>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
          </span>
          <span className="font-semibold tabular-nums text-white">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TimeSeriesChart({ data, title = 'Watch Activity Over Time' }: TimeSeriesChartProps) {
  const { isDark } = useTheme();

  return (
    <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Monthly consumption distribution
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Videos</span>
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Music</span>
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMusic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={false}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            />
            <XAxis
              dataKey="label"
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="youtube"
              name="Videos"
              stroke="#dc2626"
              strokeWidth={1.75}
              fillOpacity={1}
              fill="url(#colorYoutube)"
            />
            <Area
              type="monotone"
              dataKey="music"
              name="Music"
              stroke="#2563eb"
              strokeWidth={1.75}
              fillOpacity={1}
              fill="url(#colorMusic)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
