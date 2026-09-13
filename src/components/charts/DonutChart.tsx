import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface DonutChartProps {
  videosCount: number;
  musicCount: number;
  title?: string;
}

const COLORS = ['#ef4444', '#3b82f6'];

export function DonutChart({
  videosCount,
  musicCount,
  title = 'YouTube vs. Music Split',
}: DonutChartProps) {
  const { isDark } = useTheme();

  const data = [
    { name: 'YouTube Videos', value: videosCount },
    { name: 'YouTube Music', value: musicCount },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-200 h-full">
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
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
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
