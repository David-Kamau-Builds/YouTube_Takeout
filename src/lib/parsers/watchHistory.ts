import { fetchJson } from '../data/fetchJson';
import type { WatchHistoryRecord, NormalizedWatchRecord } from '../../types';
import { cleanTitle, cleanArtistName, extractVideoId, getActionType } from '../format/strings';

export async function loadWatchHistory(): Promise<NormalizedWatchRecord[]> {
  const rawRecords = await fetchJson<WatchHistoryRecord[]>('/data/history/watch-history.json');

  return rawRecords.map((record, index) => {
    const isMusic = record.header === 'YouTube Music';
    const date = new Date(record.time);
    const cleanedTitle = cleanTitle(record.title);
    
    // Extract channel/artist name
    let channelName = 'Unknown Channel';
    let channelUrl: string | undefined;

    if (record.subtitles && record.subtitles.length > 0) {
      const sub = record.subtitles[0];
      channelName = isMusic ? cleanArtistName(sub.name) : sub.name;
      channelUrl = sub.url;
    }

    const videoId = extractVideoId(record.titleUrl);
    const monthStr = !isNaN(date.getTime()) 
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : '';

    const isAdsView = record.details?.some(d => d.name === 'From Google Ads') ?? false;

    return {
      id: `wh-${index}-${date.getTime() || index}`,
      header: isMusic ? 'YouTube Music' : 'YouTube',
      title: cleanedTitle || record.title,
      originalTitle: record.title,
      titleUrl: record.titleUrl,
      videoId,
      channelName,
      channelUrl,
      time: record.time,
      timestamp: isNaN(date.getTime()) ? 0 : date.getTime(),
      year: isNaN(date.getTime()) ? 2026 : date.getFullYear(),
      month: monthStr,
      dayOfWeek: isNaN(date.getTime()) ? 0 : date.getDay(),
      hour: isNaN(date.getTime()) ? 0 : date.getHours(),
      type: getActionType(record.title),
      isMusic,
      isAdsView,
    };
  });
}
