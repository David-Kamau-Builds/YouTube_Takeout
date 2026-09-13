import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface DonutChartProps {
  videosCount: number;
  musicCount: number;
  title?: string;
}

const COLORS = ['#dc2626', '#2563eb'];

interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

function CustomDonutTooltip({ active, payload }: CustomDonutTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];

  return (
    <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 dark:bg-[#1f2128]/95 backdrop-blur-md text-white border border-white/10 shadow-xl text-xs space-y-0.5">
      <div className="text-[11px] text-neutral-400">{item.name}</div>
      <div className="font-semibold tabular-nums text-white">
        {item.value.toLocaleString()} events
      </div>
    </div>
  );
}

export function DonutChart({
  videosCount,
  musicCount,
  title = 'Media Distribution',
}: DonutChartProps) {
  const total = videosCount + musicCount;
  const videoPercent = total > 0 ? Math.round((videosCount / total) * 100) : 0;
  const musicPercent = total > 0 ? 100 - videoPercent : 0;

  const data = [
    { name: 'YouTube Videos', value: videosCount },
    { name: 'YouTube Music', value: musicCount },
  ];

  return (
    <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all duration-200 h-full">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          Video vs. Music breakdown
        </p>
      </div>

      <div className="h-48 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomDonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-neutral-950 dark:text-white tabular-nums tracking-tight">
            {videoPercent}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
            Video
          </span>
        </div>
      </div>

      {/* Sleek bottom legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/5 dark:border-white/5 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Videos</span>
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {videoPercent}%
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Music</span>
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {musicPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
