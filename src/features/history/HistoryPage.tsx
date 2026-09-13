import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useWatchHistoryData } from './hooks/useWatchHistoryData';
import type { NormalizedWatchRecord } from '../../types';
import { VirtualTable } from '../../components/tables/VirtualTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDateTime } from '../../lib/format/dates';
import { ExternalLink, History } from 'lucide-react';

export function HistoryPage() {
  const { data: history = [], isLoading, isError, refetch } = useWatchHistoryData();

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtered records
  const filteredData = useMemo(() => {
    return history.filter((item) => {
      // Product filter
      if (productFilter === 'youtube' && item.isMusic) return false;
      if (productFilter === 'music' && !item.isMusic) return false;

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Date range filter
      if (startDate) {
        const itemDateStr = item.time.split('T')[0];
        if (itemDateStr < startDate) return false;
      }
      if (endDate) {
        const itemDateStr = item.time.split('T')[0];
        if (itemDateStr > endDate) return false;
      }

      // Keyword search (title & channel name)
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const channelMatch = item.channelName.toLowerCase().includes(q);
        if (!titleMatch && !channelMatch) return false;
      }

      return true;
    });
  }, [history, search, productFilter, typeFilter, startDate, endDate]);

  const columns = useMemo<ColumnDef<NormalizedWatchRecord, any>[]>(
    () => [
      {
        accessorKey: 'time',
        header: 'Date & Time',
        size: 190,
        cell: (info) => (
          <span className="text-xs text-slate-500 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title & Channel',
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex flex-col min-w-0 pr-4">
              <span
                className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm"
                title={item.title}
              >
                {item.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[200px]" title={item.channelName}>
                  {item.channelName || 'Unknown Channel'}
                </span>
                {item.titleUrl && (
                  <a
                    href={item.titleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'isMusic',
        header: 'Product',
        size: 130,
        cell: (info) => {
          const isMusic = info.getValue<boolean>();
          return (
            <Badge variant={isMusic ? 'blue' : 'slate'}>
              {isMusic ? 'YT Music' : 'YouTube'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Action',
        size: 120,
        cell: (info) => {
          const type = info.getValue<string>();
          let variant: 'slate' | 'amber' | 'purple' = 'slate';
          if (type === 'Viewed') variant = 'purple';
          if (type === 'Answered') variant = 'amber';
          return <Badge variant={variant}>{type}</Badge>;
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/15 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Watch & Activity History
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Search, filter, and inspect your YouTube watch log and playback events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{history.length.toLocaleString()}</span> total records
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title or channel name..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={productFilter}
            onChange={setProductFilter}
            ariaLabel="Product filter"
            options={[
              { value: 'all', label: 'All Products' },
              { value: 'youtube', label: 'YouTube' },
              { value: 'music', label: 'YouTube Music' },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            ariaLabel="Action type filter"
            options={[
              { value: 'all', label: 'All Actions' },
              { value: 'Watched', label: 'Watched' },
              { value: 'Viewed', label: 'Viewed Posts' },
              { value: 'Answered', label: 'Answered Surveys' },
            ]}
          />

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
      </div>

      {/* Virtualized Table */}
      <VirtualTable data={filteredData} columns={columns} />
    </div>
  );
}
