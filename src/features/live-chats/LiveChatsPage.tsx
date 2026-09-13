import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { loadLiveChats } from '../../lib/parsers/liveChats';
import type { LiveChat } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDateTime } from '../../lib/format/dates';
import { MessageCircle, Smile, Info } from 'lucide-react';
import { FormattedMessageText } from '../../components/ui/FormattedMessageText';
import { VideoPreviewCell } from '../../components/ui/VideoPreviewCell';
import { useTakeout } from '../../hooks/useTakeout';

export function LiveChatsPage() {
  const { manifest } = useTakeout();
  const { data: liveChats = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['live-chats'],
    queryFn: () => loadLiveChats(),
  });

  const [search, setSearch] = useState('');

  const filteredChats = useMemo(() => {
    if (!search) return liveChats;
    const q = search.toLowerCase();
    return liveChats.filter(
      (c) =>
        c.plainText.toLowerCase().includes(q) ||
        c.videoId.toLowerCase().includes(q)
    );
  }, [liveChats, search]);

  const columns = useMemo<ColumnDef<LiveChat, any>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Sent At',
        cell: (info) => (
          <span className="text-xs text-slate-500 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'plainText',
        header: 'Message Text',
        cell: (info) => {
          const chat = info.row.original;
          return (
            <div className="flex items-center gap-2 py-1 max-w-xl">
              <FormattedMessageText
                segments={chat.textSegments}
                fallbackText={chat.plainText}
              />
              {chat.hasCustomEmoji && (
                <Badge variant="amber">
                  <Smile className="w-3 h-3 mr-1" />
                  Custom Emoji
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'videoId',
        header: 'Live Stream Link',
        cell: (info) => {
          const videoId = info.getValue<string>();
          return <VideoPreviewCell videoId={videoId} fallbackLabel="Live Stream" />;
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
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/15 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Live Chat Messages
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Real-time messages sent during YouTube live streams and premieres.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{liveChats.length.toLocaleString()}</span> messages
          </div>
        </div>
      </div>

      {manifest && !manifest.files.liveChats && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Live chat messages are not included in this Takeout export ({manifest.archiveName}).</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search chat messages..."
          />
        </div>
      </div>

      <DataTable data={filteredChats} columns={columns} pageSize={10} />
    </div>
  );
}
