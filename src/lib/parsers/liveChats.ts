import { fetchCsv } from '../data/fetchCsv';
import type { LiveChat, CommentTextSegment } from '../../types';

interface RawLiveChat {
  'Live Chat ID': string;
  'Channel ID': string;
  'Live Chat Create Timestamp': string;
  Price: number;
  'Video ID': string;
  'Live Chat Text'?: string;
}

function parseTextSegments(rawText?: string): { segments: CommentTextSegment[]; plainText: string; hasCustomEmoji: boolean } {
  if (!rawText) return { segments: [], plainText: '', hasCustomEmoji: false };

  try {
    const parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;

    if (Array.isArray(parsed)) {
      const segments = parsed as CommentTextSegment[];
      const plainText = segments.map(s => s.text || '').join('');
      const hasCustomEmoji = segments.some(s => Boolean(s.emoji?.customEmojiUrl));
      return { segments, plainText, hasCustomEmoji };
    } else if (typeof parsed === 'object' && parsed !== null) {
      const seg = parsed as CommentTextSegment;
      const plainText = seg.text || '';
      const hasCustomEmoji = Boolean(seg.emoji?.customEmojiUrl);
      return { segments: [seg], plainText, hasCustomEmoji };
    }
  } catch {
    return { segments: [{ text: rawText }], plainText: rawText, hasCustomEmoji: false };
  }

  return { segments: [], plainText: rawText || '', hasCustomEmoji: false };
}

export async function loadLiveChats(): Promise<LiveChat[]> {
  const raw = await fetchCsv<RawLiveChat>('/data/live-chats/live chats.csv');

  return raw
    .filter(row => row && row['Live Chat ID'])
    .map(row => {
      const rawText = row['Live Chat Text'] || '';
      const { segments, plainText, hasCustomEmoji } = parseTextSegments(rawText);
      const rawVideoId = String(row['Video ID'] || '').trim();

      return {
        liveChatId: String(row['Live Chat ID']).trim(),
        channelId: String(row['Channel ID'] || '').trim(),
        timestamp: String(row['Live Chat Create Timestamp'] || '').trim(),
        price: Number(row.Price) || 0,
        videoId: rawVideoId,
        liveChatTextRaw: rawText,
        textSegments: segments,
        plainText,
        hasCustomEmoji,
      };
    });
}
