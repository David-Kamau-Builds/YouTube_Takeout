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

export function TopBarChart({ data, title, barColor = '#ef4444' }: TopBarChartProps) {
  const { isDark } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all duration-200">
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-6">
        {title}
      </h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
            <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={110}
              tickFormatter={(value) => (value.length > 18 ? `${value.substring(0, 16)}...` : value)}
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
              formatter={(val: any) => [`${val} plays/watches`, 'Count']}
            />
            <Bar dataKey="count" fill={barColor} radius={[0, 6, 6, 0]} barSize={18} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
