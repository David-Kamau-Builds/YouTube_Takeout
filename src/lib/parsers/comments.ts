import { fileLoader } from '../takeout/fileLoader';
import { parseCsvText } from '../data/fetchCsv';
import type { Comment, CommentTextSegment } from '../../types';

interface RawComment {
  'Comment ID': string;
  'Channel ID': string;
  'Comment Create Timestamp': string;
  Price: number;
  'Parent Comment ID'?: string;
  'Post ID'?: string;
  'Video ID'?: string;
  'Comment Text': string;
  'Top-Level Comment ID'?: string;
}

function parseTextSegments(rawText?: string): { segments: CommentTextSegment[]; plainText: string; hasCustomEmoji: boolean } {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { segments: [], plainText: '', hasCustomEmoji: false };
  }

  const trimmed = rawText.trim();
  let parsed: any = null;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsed = JSON.parse(`[${trimmed}]`);
      } catch {
        parsed = null;
      }
    }
  }

  if (parsed) {
    let segments: CommentTextSegment[] = [];
    if (Array.isArray(parsed)) {
      segments = parsed as CommentTextSegment[];
    } else if (typeof parsed === 'object') {
      segments = [parsed as CommentTextSegment];
    } else if (typeof parsed === 'string') {
      segments = [{ text: parsed }];
    }

    const hasCustomEmoji = segments.some(s => Boolean(s.emoji?.customEmojiUrl || s.customEmojiUrl));
    const textPieces = segments.map(s => s.text || '').filter(Boolean);
    let plainText = textPieces.join('');

    if (!plainText.trim()) {
      if (hasCustomEmoji) {
        plainText = '(Custom Emoji)';
      } else if (segments.length > 0) {
        plainText = '(Emoji / Non-text message)';
      }
    }

    return { segments, plainText, hasCustomEmoji };
  }

  return { segments: [{ text: trimmed }], plainText: trimmed, hasCustomEmoji: false };
}

export async function loadComments(): Promise<Comment[]> {
  const text = await fileLoader.readText('comments/comments.csv');
  const raw = await parseCsvText<RawComment>(text);
  
  return raw
    .filter(row => row && row['Comment ID'])
    .map(row => {
      const rawText = row['Comment Text'] || '';
      const { segments, plainText, hasCustomEmoji } = parseTextSegments(rawText);
      const parentId = row['Parent Comment ID'] ? String(row['Parent Comment ID']).trim() : undefined;

      return {
        commentId: String(row['Comment ID']).trim(),
        channelId: String(row['Channel ID'] || '').trim(),
        timestamp: String(row['Comment Create Timestamp'] || '').trim(),
        price: Number(row.Price) || 0,
        parentCommentId: parentId,
        postId: row['Post ID'] ? String(row['Post ID']).trim() : undefined,
        videoId: row['Video ID'] ? String(row['Video ID']).trim() : undefined,
        commentTextRaw: rawText,
        textSegments: segments,
        plainText,
        topLevelCommentId: row['Top-Level Comment ID'] ? String(row['Top-Level Comment ID']).trim() : undefined,
        isReply: Boolean(parentId),
        hasCustomEmoji,
      };
    });
}
