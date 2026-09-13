import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { loadSubscriptions } from '../../lib/parsers/subscriptions';
import type { Subscription } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { ExternalLink, Users } from 'lucide-react';

export function SubscriptionsPage() {
  const { data: subscriptions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => loadSubscriptions(),
  });

  const [search, setSearch] = useState('');

  const filteredSubs = useMemo(() => {
    if (!search) return subscriptions;
    const q = search.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.channelTitle.toLowerCase().includes(q) ||
        sub.channelId.toLowerCase().includes(q)
    );
  }, [subscriptions, search]);

  const columns = useMemo<ColumnDef<Subscription, any>[]>(
    () => [
      {
        accessorKey: 'channelTitle',
        header: 'Channel Name',
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'channelId',
        header: 'Channel ID',
        cell: (info) => (
          <span className="text-xs font-mono text-slate-500">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'channelUrl',
        header: 'YouTube Link',
        cell: (info) => {
          const url = info.getValue<string>();
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs flex items-center gap-1"
            >
              <span>Visit Channel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          );
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
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <span>Subscribed Channels ({subscriptions.length})</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete list of all YouTube channels you are subscribed to.
          </p>
        </div>

        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search channels..."
          />
        </div>
      </div>

      <DataTable data={filteredSubs} columns={columns} pageSize={15} />
    </div>
  );
}
