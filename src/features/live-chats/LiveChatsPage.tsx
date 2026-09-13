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
import { MessageCircle, Smile } from 'lucide-react';
import { FormattedMessageText } from '../../components/ui/FormattedMessageText';
import { VideoPreviewCell } from '../../components/ui/VideoPreviewCell';

export function LiveChatsPage() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-red-600" />
            <span>Live Chat History ({liveChats.length})</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Messages sent during YouTube live stream chats.
          </p>
        </div>

        <div className="w-full md:w-72">
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
