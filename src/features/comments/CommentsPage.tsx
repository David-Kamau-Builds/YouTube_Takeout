import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { loadComments } from '../../lib/parsers/comments';
import type { Comment } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDateTime } from '../../lib/format/dates';
import { MessageSquare, CornerDownRight, Info } from 'lucide-react';
import { FormattedMessageText } from '../../components/ui/FormattedMessageText';
import { VideoPreviewCell } from '../../components/ui/VideoPreviewCell';
import { useTakeout } from '../../hooks/useTakeout';

export function CommentsPage() {
  const { manifest } = useTakeout();
  const { data: comments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['comments'],
    queryFn: () => loadComments(),
  });

  const [search, setSearch] = useState('');

  const filteredComments = useMemo(() => {
    if (!search) return comments;
    const q = search.toLowerCase();
    return comments.filter(
      (c) =>
        c.plainText.toLowerCase().includes(q) ||
        (c.videoId && c.videoId.toLowerCase().includes(q))
    );
  }, [comments, search]);

  const columns = useMemo<ColumnDef<Comment, any>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Posted Date',
        cell: (info) => (
          <span className="text-xs text-slate-500 font-mono">
            {formatDateTime(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'plainText',
        header: 'Comment Text',
        cell: (info) => {
          const comment = info.row.original;
          return (
            <div className="space-y-1 py-1 max-w-xl">
              {comment.isReply && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  <CornerDownRight className="w-3 h-3" />
                  <span>Reply to comment</span>
                </div>
              )}
              <FormattedMessageText
                segments={comment.textSegments}
                fallbackText={comment.plainText}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'videoId',
        header: 'Video Link',
        cell: (info) => {
          const videoId = info.getValue<string | undefined>();
          return <VideoPreviewCell videoId={videoId} fallbackLabel="Community Post" />;
        },
      },
      {
        accessorKey: 'isReply',
        header: 'Type',
        cell: (info) => {
          const isReply = info.getValue<boolean>();
          return (
            <Badge variant={isReply ? 'purple' : 'blue'}>
              {isReply ? 'Reply' : 'Top Level'}
            </Badge>
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
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/15 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              User Comments
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Public comments and responses posted from your YouTube profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{comments.length.toLocaleString()}</span> comments
          </div>
        </div>
      </div>

      {manifest && !manifest.files.comments && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Comments data is not included in this Takeout export ({manifest.archiveName}).</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search comment text..."
          />
        </div>
      </div>

      <DataTable data={filteredComments} columns={columns} pageSize={10} />
    </div>
  );
}
