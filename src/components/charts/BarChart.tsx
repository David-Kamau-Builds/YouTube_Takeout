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

interface TopBarChartProps {
  data: RankingItem[];
  title: string;
  barColor?: string;
}

export function TopBarChart({ data, title, barColor = '#ef4444' }: TopBarChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
        {title}
      </h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={110}
              tickFormatter={(value) => (value.length > 18 ? `${value.substring(0, 16)}...` : value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
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
