import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { loadSubscriptions } from '../../lib/parsers/subscriptions';
import type { Subscription } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { ExternalLink, Users, Info } from 'lucide-react';
import { useTakeout } from '../../hooks/useTakeout';

export function SubscriptionsPage() {
  const { manifest } = useTakeout();
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
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/15 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Subscribed Channels
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Complete catalog of creator channels and subscriptions in your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{subscriptions.length.toLocaleString()}</span> channels
          </div>
        </div>
      </div>

      {manifest && !manifest.files.subscriptions && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Subscriptions data is not included in this Takeout export ({manifest.archiveName}).</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search subscribed channels..."
          />
        </div>
      </div>

      <DataTable data={filteredSubs} columns={columns} pageSize={15} />
    </div>
  );
}
