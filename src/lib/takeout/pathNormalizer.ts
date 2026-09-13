import type { TakeoutManifest } from '../../types/takeout';

/**
 * Normalizes raw archive file paths into canonical keys matching the visualizer's expectations:
 * - history/watch-history.json
 * - subscriptions/subscriptions.csv
 * - playlists/playlists.csv
 * - playlists/<name>-videos.csv
 * - music/music library songs.csv
 * - comments/comments.csv
 * - live-chats/live chats.csv
 * - channels/channel.csv
 * - channels/channel URL configs.csv
 * - channels/channel feature data.csv
 */
export function normalizeTakeoutPaths(rawMap: Map<string, string>): Map<string, string> {
  const normalized = new Map<string, string>();

  // Find root prefix if exists, e.g. "Takeout/YouTube and YouTube Music/"
  const keys = Array.from(rawMap.keys());
  let commonPrefix = '';

  for (const k of keys) {
    const idx = k.toLowerCase().indexOf('youtube and youtube music/');
    if (idx !== -1) {
      commonPrefix = k.slice(0, idx + 'youtube and youtube music/'.length);
      break;
    }
    const idxYt = k.toLowerCase().indexOf('youtube/');
    if (idxYt !== -1) {
      commonPrefix = k.slice(0, idxYt + 'youtube/'.length);
      break;
    }
  }

  for (const [rawPath, content] of rawMap.entries()) {
    let relPath = rawPath;
    if (commonPrefix && relPath.startsWith(commonPrefix)) {
      relPath = relPath.slice(commonPrefix.length);
    } else {
      // If common prefix wasn't stripped, check if there's a Takeout prefix
      const match = relPath.match(/(?:.*?[/\\])?(?:YouTube and YouTube Music|YouTube)[/\\](.*)/i);
      if (match && match[1]) {
        relPath = match[1];
      }
    }

    relPath = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const lower = relPath.toLowerCase();

    // Map specific files to standard normalized paths
    if (lower.endsWith('watch-history.json') || lower === 'watch-history.json') {
      normalized.set('history/watch-history.json', content);
    } else if (lower.endsWith('subscriptions.csv') || lower === 'subscriptions.csv') {
      normalized.set('subscriptions/subscriptions.csv', content);
    } else if (lower.endsWith('playlists/playlists.csv') || lower === 'playlists.csv') {
      normalized.set('playlists/playlists.csv', content);
    } else if (lower.includes('playlists/') && lower.endsWith('-videos.csv')) {
      const fileName = relPath.split('/').pop()!;
      normalized.set(`playlists/${fileName}`, content);
    } else if (lower.endsWith('-videos.csv')) {
      // Loose playlist videos file
      const fileName = relPath.split('/').pop()!;
      normalized.set(`playlists/${fileName}`, content);
    } else if (lower.includes('music') && (lower.endsWith('music library songs.csv') || lower.endsWith('music-library-songs.csv'))) {
      normalized.set('music/music library songs.csv', content);
    } else if (lower.endsWith('comments.csv') || lower === 'comments.csv') {
      normalized.set('comments/comments.csv', content);
    } else if (lower.includes('live') && (lower.endsWith('live chats.csv') || lower.endsWith('live-chats.csv'))) {
      normalized.set('live-chats/live chats.csv', content);
    } else if (lower.endsWith('channels/channel.csv') || lower === 'channel.csv') {
      normalized.set('channels/channel.csv', content);
    } else if (lower.endsWith('channels/channel url configs.csv') || lower.endsWith('channel-url-configs.csv') || lower === 'channel url configs.csv') {
      normalized.set('channels/channel URL configs.csv', content);
    } else if (lower.endsWith('channels/channel feature data.csv') || lower.endsWith('channel-feature-data.csv') || lower === 'channel feature data.csv') {
      normalized.set('channels/channel feature data.csv', content);
    } else if (lower.endsWith('channels/channel community moderation settings.csv') || lower === 'channel community moderation settings.csv') {
      normalized.set('channels/channel community moderation settings.csv', content);
    } else if (lower.endsWith('channels/channel page settings.csv') || lower === 'channel page settings.csv') {
      normalized.set('channels/channel page settings.csv', content);
    } else {
      // Retain under cleaned relative path if it's json or csv
      if (lower.endsWith('.json') || lower.endsWith('.csv')) {
        normalized.set(relPath, content);
      }
    }
  }

  return normalized;
}

export function buildTakeoutManifest(
  normalizedMap: Map<string, string>,
  archiveName: string
): TakeoutManifest {
  const extractedKeys = Array.from(normalizedMap.keys());
  let playlistFileCount = 0;

  for (const k of extractedKeys) {
    if (k.startsWith('playlists/') && k.endsWith('-videos.csv')) {
      playlistFileCount++;
    }
  }

  return {
    archiveName,
    uploadedAt: Date.now(),
    totalFilesFound: extractedKeys.length,
    files: {
      watchHistory: normalizedMap.has('history/watch-history.json'),
      subscriptions: normalizedMap.has('subscriptions/subscriptions.csv'),
      playlists: normalizedMap.has('playlists/playlists.csv'),
      musicLibrary: normalizedMap.has('music/music library songs.csv'),
      comments: normalizedMap.has('comments/comments.csv'),
      liveChats: normalizedMap.has('live-chats/live chats.csv'),
      channels: normalizedMap.has('channels/channel.csv'),
    },
    playlistFileCount,
    extractedKeys,
  };
}
