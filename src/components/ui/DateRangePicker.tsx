import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-sm">
      <Calendar className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        aria-label="Start date filter"
        className="bg-transparent text-slate-900 dark:text-white text-xs focus:outline-hidden cursor-pointer"
      />
      <span className="text-slate-400 text-xs">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        aria-label="End date filter"
        className="bg-transparent text-slate-900 dark:text-white text-xs focus:outline-hidden cursor-pointer pr-1"
      />
    </div>
  );
}
