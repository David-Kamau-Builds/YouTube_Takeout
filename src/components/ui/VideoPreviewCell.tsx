import { useState, useEffect } from 'react';
import { getYouTubeThumbnailUrl, fetchYouTubeVideoMeta } from '../../lib/utils/youtube';
import { Badge } from './Badge';
import { ExternalLink, Play } from 'lucide-react';

interface VideoPreviewCellProps {
  videoId?: string;
  fallbackLabel?: string;
  className?: string;
}

export function VideoPreviewCell({
  videoId,
  fallbackLabel = 'Community Post',
  className = '',
}: VideoPreviewCellProps) {
  const [meta, setMeta] = useState<{ title?: string; authorName?: string } | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let isMounted = true;
    fetchYouTubeVideoMeta(videoId).then((data) => {
      if (isMounted && data) {
        setMeta(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  if (!videoId) {
    return <Badge variant="slate">{fallbackLabel}</Badge>;
  }

  const cleanId = videoId.trim();
  const thumbnailUrl = getYouTubeThumbnailUrl(cleanId, 'mqdefault');
  const watchUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-2.5 max-w-xs hover:opacity-90 transition-opacity ${className}`}
    >
      <div className="relative w-14 h-9 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <img
          src={thumbnailUrl}
          alt={meta?.title || 'Video preview'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            // Hide img on load failure
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-3 h-3 text-white fill-white" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center gap-1">
          <span className="truncate">{meta?.title || `Video ${cleanId}`}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
        </p>
        {meta?.authorName ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {meta.authorName}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-slate-400 truncate">
            ID: {cleanId}
          </p>
        )}
      </div>
    </a>
  );
}
