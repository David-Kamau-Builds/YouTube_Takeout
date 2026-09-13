import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { RankingItem } from '../../lib/stats/rankings';
import { useTheme } from '../../hooks/useTheme';

interface TopBarChartProps {
  data: RankingItem[];
  title: string;
  barColor?: string;
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RankingItem }>;
}

function CustomBarTooltip({ active, payload }: CustomBarTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 dark:bg-[#1f2128]/95 backdrop-blur-md text-white border border-white/10 shadow-xl text-xs space-y-0.5">
      <div className="font-medium text-neutral-200">{item.name}</div>
      <div className="text-[11px] text-neutral-400">
        <span className="font-semibold tabular-nums text-white">{item.count.toLocaleString()}</span> plays / views
      </div>
    </div>
  );
}

export function TopBarChart({ data, title, barColor }: TopBarChartProps) {
  const { isDark } = useTheme();
  const effectiveBarColor = barColor || (isDark ? '#e5e7eb' : '#171717');

  return (
    <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          Top creators and performers by frequency
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 15, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              horizontal={false}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            />
            <XAxis
              type="number"
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke={isDark ? '#9ca3af' : '#4b5563'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={(value) => (value.length > 18 ? `${value.substring(0, 16)}...` : value)}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={false} />
            <Bar dataKey="count" fill={effectiveBarColor} radius={[0, 4, 4, 0]} barSize={14} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
