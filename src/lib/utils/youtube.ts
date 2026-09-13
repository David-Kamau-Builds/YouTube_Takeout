interface VideoMeta {
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
}

const memoryCache = new Map<string, VideoMeta | null>();
const LOCAL_STORAGE_KEY = 'yt_meta_cache_v1';

function getStoredCache(): Record<string, VideoMeta> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredCache(id: string, meta: VideoMeta) {
  try {
    const cache = getStoredCache();
    cache[id] = meta;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'maxresdefault' = 'hqdefault'
): string {
  if (!videoId || typeof videoId !== 'string') return '';
  const cleanId = videoId.trim();
  return `https://i.ytimg.com/vi/${cleanId}/${quality}.jpg`;
}

export async function fetchYouTubeVideoMeta(videoId: string): Promise<VideoMeta | null> {
  if (!videoId || typeof videoId !== 'string') return null;
  const cleanId = videoId.trim();
  if (!cleanId) return null;

  if (memoryCache.has(cleanId)) {
    return memoryCache.get(cleanId) || null;
  }

  const stored = getStoredCache();
  if (stored[cleanId]) {
    memoryCache.set(cleanId, stored[cleanId]);
    return stored[cleanId];
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(cleanId)}&format=json`
    );
    if (!res.ok) {
      memoryCache.set(cleanId, null);
      return null;
    }
    const data = await res.json();
    const meta: VideoMeta = {
      title: data.title,
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnailUrl(cleanId, 'hqdefault'),
    };
    memoryCache.set(cleanId, meta);
    setStoredCache(cleanId, meta);
    return meta;
  } catch {
    memoryCache.set(cleanId, null);
    return null;
  }
}
