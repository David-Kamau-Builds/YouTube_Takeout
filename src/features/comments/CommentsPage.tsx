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
import { MessageSquare, CornerDownRight } from 'lucide-react';
import { FormattedMessageText } from '../../components/ui/FormattedMessageText';
import { VideoPreviewCell } from '../../components/ui/VideoPreviewCell';

export function CommentsPage() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-600" />
            <span>Comments ({comments.length})</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comments you posted across YouTube videos and community posts.
          </p>
        </div>

        <div className="w-full md:w-72">
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
