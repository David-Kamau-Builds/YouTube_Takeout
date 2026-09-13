import type { WatchHistoryRecord } from '../../types';

// Common timezone abbreviations present in Google Takeout exports to UTC offsets
const TZ_OFFSETS: Record<string, string> = {
  EAT: '+03:00',
  UTC: '+00:00',
  GMT: '+00:00',
  BST: '+01:00',
  CET: '+01:00',
  CEST: '+02:00',
  EET: '+02:00',
  EEST: '+03:00',
  EST: '-05:00',
  EDT: '-04:00',
  CST: '-06:00',
  CDT: '-05:00',
  MST: '-07:00',
  MDT: '-06:00',
  PST: '-08:00',
  PDT: '-07:00',
  AKST: '-09:00',
  AKDT: '-08:00',
  HST: '-10:00',
  IST: '+05:30',
  JST: '+09:00',
  KST: '+09:00',
  AEST: '+10:00',
  AEDT: '+11:00',
  ACST: '+09:30',
  ACDT: '+10:30',
  AWST: '+08:00',
  NZST: '+12:00',
  NZDT: '+13:00',
};

/**
 * Decodes standard HTML entities commonly found in Google Takeout HTML video titles.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Parses Google Takeout's localized date format (e.g., "Sep 13, 2026, 10:08:23 AM EAT") into ISO 8601 string.
 */
function parseTakeoutDate(rawStr: string): string {
  if (!rawStr) return new Date().toISOString();

  // Normalize non-breaking spaces (U+00A0) and narrow non-breaking spaces (U+202F)
  let s = rawStr.replace(/[\u202f\u00a0]/g, ' ').trim();

  // Extract timezone abbreviation if present at the end
  const tzMatch = s.match(/\s+([A-Z]{2,4})$/);
  if (tzMatch) {
    const tzCode = tzMatch[1];
    const offset = TZ_OFFSETS[tzCode];
    if (offset) {
      s = s.slice(0, -tzCode.length).trim() + ' ' + offset;
    } else {
      s = s.slice(0, -tzCode.length).trim();
    }
  }

  const d = new Date(s);
  return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

/**
 * Parses Google Takeout's default `watch-history.html` format into standard WatchHistoryRecord objects.
 */
export function parseWatchHistoryHtml(htmlContent: string): WatchHistoryRecord[] {
  const records: WatchHistoryRecord[] = [];
  if (!htmlContent) return records;

  // Match each watch event block: <div class="content-cell mdl-cell ...">...</div>
  const cellRegex = /<div[^>]*class=["'][^"']*content-cell[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let cellMatch: RegExpExecArray | null;

  while ((cellMatch = cellRegex.exec(htmlContent)) !== null) {
    const content = cellMatch[1];

    // Find all links in the cell
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const links: { href: string; text: string }[] = [];
    let lMatch: RegExpExecArray | null;

    while ((lMatch = linkRegex.exec(content)) !== null) {
      links.push({
        href: lMatch[1],
        text: decodeHtmlEntities(lMatch[2].replace(/<[^>]+>/g, '').trim()),
      });
    }

    if (links.length === 0) continue;

    // First link is always the video or community post link
    const videoLink = links[0];
    const titleUrl = videoLink.href;
    const rawTitle = videoLink.text;

    // Second link (if present) is usually the channel link
    let channelName: string | undefined;
    let channelUrl: string | undefined;

    if (links.length > 1) {
      channelName = links[1].text;
      channelUrl = links[1].href;
    }

    // Extract date from the text segment after the last <br>
    const brParts = content.split(/<br\s*\/?>/i);
    let rawDateStr = '';
    for (let i = brParts.length - 1; i >= 0; i--) {
      const candidate = brParts[i].replace(/<[^>]+>/g, '').trim();
      if (candidate && /[0-9]/.test(candidate)) {
        rawDateStr = candidate;
        break;
      }
    }

    const time = parseTakeoutDate(rawDateStr);
    const isMusic = titleUrl.includes('music.youtube.com') || content.includes('YouTube Music');

    // Retain "Viewed " or "Watched " prefix to match watch-history.json schema
    const prefix = content.trim().startsWith('Viewed') ? 'Viewed ' : 'Watched ';
    const title = rawTitle.startsWith(prefix) ? rawTitle : `${prefix}${rawTitle}`;

    records.push({
      header: isMusic ? 'YouTube Music' : 'YouTube',
      title,
      titleUrl,
      subtitles: channelName ? [{ name: channelName, url: channelUrl }] : undefined,
      time,
      products: [isMusic ? 'YouTube Music' : 'YouTube'],
    });
  }

  return records;
}
