import { fetchCsv } from '../data/fetchCsv';
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

function parseTextSegments(rawText: string): { segments: CommentTextSegment[]; plainText: string } {
  if (!rawText) return { segments: [], plainText: '' };
  
  try {
    // rawText can be double JSON encoded or standard JSON array string
    const parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
    
    if (Array.isArray(parsed)) {
      const segments = parsed as CommentTextSegment[];
      const plainText = segments.map(s => s.text || '').join('');
      return { segments, plainText };
    } else if (typeof parsed === 'string') {
      return { segments: [{ text: parsed }], plainText: parsed };
    }
  } catch {
    // If parse fails, return raw text directly
    return { segments: [{ text: rawText }], plainText: rawText };
  }

  return { segments: [], plainText: rawText };
}

export async function loadComments(): Promise<Comment[]> {
  const raw = await fetchCsv<RawComment>('/data/comments/comments.csv');
  
  return raw
    .filter(row => row && row['Comment ID'])
    .map(row => {
      const rawText = row['Comment Text'] || '';
      const { segments, plainText } = parseTextSegments(rawText);
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
      };
    });
}
