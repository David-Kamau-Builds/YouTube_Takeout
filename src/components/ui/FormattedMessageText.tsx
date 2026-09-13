import type { CommentTextSegment } from '../../types';
import { ExternalLink } from 'lucide-react';

interface FormattedMessageTextProps {
  segments?: CommentTextSegment[];
  fallbackText?: string;
  className?: string;
}

export function FormattedMessageText({
  segments,
  fallbackText,
  className = '',
}: FormattedMessageTextProps) {
  if (!segments || segments.length === 0) {
    const textToShow = fallbackText || '(No text content)';
    return (
      <span className={`text-slate-600 dark:text-slate-400 italic text-sm ${className}`}>
        {textToShow}
      </span>
    );
  }

  const hasAnyContent = segments.some(
    (s) =>
      Boolean(s.text?.trim()) ||
      Boolean(s.emoji?.customEmojiUrl || s.customEmojiUrl) ||
      Boolean(s.videoLink)
  );

  if (!hasAnyContent) {
    return (
      <span className={`text-slate-500 dark:text-slate-400 italic text-sm ${className}`}>
        {fallbackText || '(Emoji / Non-text message)'}
      </span>
    );
  }

  return (
    <div className={`inline-wrap text-sm text-slate-900 dark:text-white leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        const customEmojiUrl = seg.emoji?.customEmojiUrl || seg.customEmojiUrl;

        return (
          <span key={idx} className="inline align-middle">
            {/* Custom Emoji Rendering */}
            {customEmojiUrl && (
              customEmojiUrl.startsWith('http') ? (
                <img
                  src={customEmojiUrl}
                  alt="Custom Emoji"
                  title="Custom Emoji"
                  className="inline-block w-6 h-6 object-contain align-middle rounded mx-0.5"
                  onError={(e) => {
                    // Fallback on image error
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium align-middle">
                  🖼️ Custom Emoji
                </span>
              )
            )}

            {/* Video Timestamp Link */}
            {seg.videoLink && (
              <a
                href={`https://www.youtube.com/watch?v=${seg.videoLink.externalVideoId}&t=${seg.videoLink.startTimeSeconds || 0}s`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-1 rounded text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                title={`Jump to video at ${seg.text || 'timestamp'}`}
              >
                <span>{seg.text || `${seg.videoLink.startTimeSeconds}s`}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {/* Plain Text (if not already handled by videoLink timestamp text) */}
            {!seg.videoLink && seg.text && (
              <span className="whitespace-pre-wrap">{seg.text}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
