import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadPlaylists } from '../../lib/parsers/playlists';
import type { Playlist } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { formatDate } from '../../lib/format/dates';
import { ListVideo, ChevronDown, ChevronUp, ExternalLink, Calendar, Film } from 'lucide-react';

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ListVideo className="w-6 h-6 text-red-600" />
          <span>Playlists ({playlists.length})</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your saved playlists and video collections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist: Playlist) => {
          const isExpanded = expandedId === playlist.playlistId;
          const thumbnail = playlist.imageUrls[0];

          return (
            <div
              key={playlist.playlistId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={playlist.title}
                    className="w-full h-36 object-cover rounded-xl mb-3"
                  />
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
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 max-h-60 overflow-y-auto">
                    {playlist.videos.length === 0 ? (
                      <span className="text-xs text-slate-400">No videos in playlist</span>
                    ) : (
                      playlist.videos.map((v, idx) => (
                        <div
                          key={`${v.videoId}-${idx}`}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        >
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            {v.videoId}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {formatDate(v.addedAt)}
                            </span>
                            <a
                              href={`https://www.youtube.com/watch?v=${v.videoId.trim()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Watch</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
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
