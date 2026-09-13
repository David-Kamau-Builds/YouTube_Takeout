import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadPlaylists } from '../../lib/parsers/playlists';
import type { Playlist } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDate } from '../../lib/format/dates';
import { getYouTubeThumbnailUrl } from '../../lib/utils/youtube';
import { VideoPreviewCell } from '../../components/ui/VideoPreviewCell';
import { ListVideo, ChevronDown, ChevronUp, Calendar, Film } from 'lucide-react';

export function PlaylistsPage() {
  const { data: playlists = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => loadPlaylists(),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
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
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/15 shrink-0">
            <ListVideo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Playlists & Collections
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Your curated playlists, video collections, and saved mixes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">{playlists.length.toLocaleString()}</span> playlists
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist: Playlist) => {
          const isExpanded = expandedId === playlist.playlistId;
          const firstVideoId = playlist.videos[0]?.videoId;
          const thumbnail =
            playlist.imageUrls[0] ||
            (firstVideoId ? getYouTubeThumbnailUrl(firstVideoId, 'hqdefault') : undefined);

          return (
            <div
              key={playlist.playlistId}
              className="bg-white dark:bg-[#15171c] border border-black/6 dark:border-white/8 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={playlist.title}
                    className="w-full h-36 object-cover rounded-xl mb-3 bg-slate-100 dark:bg-slate-800"
                    onError={(e) => {
                      if (firstVideoId && e.currentTarget.src !== getYouTubeThumbnailUrl(firstVideoId, 'hqdefault')) {
                        e.currentTarget.src = getYouTubeThumbnailUrl(firstVideoId, 'hqdefault');
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-slate-400">
                    <Film className="w-8 h-8 opacity-40" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {playlist.title}
                  </h3>
                  <Badge variant="slate">{playlist.visibility}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-red-500" />
                    <span><strong>{playlist.videos.length}</strong> videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {formatDate(playlist.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Expand Toggle */}
              <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
                <button
                  onClick={() => toggleExpand(playlist.playlistId)}
                  type="button"
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Video List' : 'View Video List'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded Video List */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 max-h-72 overflow-y-auto">
                    {playlist.videos.length === 0 ? (
                      <span className="text-xs text-slate-400">No videos in playlist</span>
                    ) : (
                      playlist.videos.map((v, idx) => (
                        <div
                          key={`${v.videoId}-${idx}`}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                        >
                          <VideoPreviewCell videoId={v.videoId} className="flex-1" />
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                            {formatDate(v.addedAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
