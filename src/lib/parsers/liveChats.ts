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
