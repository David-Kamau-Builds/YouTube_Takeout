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
import { ExternalLink } from 'lucide-react';

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
        size: 195,
        cell: (info) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        meta: { flex: '3 1 0%' },
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              {record.titleUrl ? (
                <a
                  href={record.titleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 group truncate"
                >
                  <span className="truncate">{record.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-red-500" />
                </a>
              ) : (
                <span className="font-medium text-slate-900 dark:text-white truncate">
                  {record.title}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'channelName',
        header: 'Channel / Artist',
        meta: { flex: '2 1 0%' },
        cell: (info) => {
          const record = info.row.original;
          return record.channelUrl ? (
            <a
              href={record.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-300 hover:underline truncate block"
            >
              {record.channelName}
            </a>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 truncate block">
              {record.channelName}
            </span>
          );
        },
      },
      {
        accessorKey: 'header',
        header: 'Product',
        size: 140,
        cell: (info) => {
          const isMusic = info.row.original.isMusic;
          return (
            <Badge variant={isMusic ? 'blue' : 'red'}>
              {isMusic ? 'YouTube Music' : 'YouTube'}
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Watch & Activity History
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search, filter, and sort your complete YouTube watch log ({history.length} records).
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
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
