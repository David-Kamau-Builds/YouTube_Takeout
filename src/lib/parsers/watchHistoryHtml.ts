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

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Strip all HTML tags from a string. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/** Decode common HTML entities found in Takeout exports. */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&emsp;/g, ' ')
    .replace(/&nbsp;/g, ' ')
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
 *
 * Google Takeout HTML structure per entry:
 *   <div class="outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp">
 *     <div class="mdl-grid">
 *       <div class="header-cell ..."><p ...>YouTube<br></p></div>
 *       <div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">
 *         Watched <a href="VIDEO_URL">TITLE</a><br>
 *         <a href="CHANNEL_URL">CHANNEL</a><br>
 *         DATE_STRING<br>
 *       </div>
 *       <div class="content-cell mdl-cell mdl-cell--6-col ... mdl-typography--text-right"></div>
 *       <div class="content-cell mdl-cell mdl-cell--12-col mdl-typography--caption">
 *         Products: ... Why is this here? ... <a href="...">here</a>
 *       </div>
 *     </div>
 *   </div>
 */
export function parseWatchHistoryHtml(htmlContent: string): WatchHistoryRecord[] {
  const records: WatchHistoryRecord[] = [];
  if (!htmlContent) return records;

  // ── Step 1: split by outer-cell divs so each chunk is ONE watch entry ────────
  // This prevents the caption cells ("Why is this here? <a>here</a>") from bleeding
  // into the next entry's data and producing "here" as a title.
  const outerCellParts = htmlContent.split(
    /<div[^>]+class="[^"]*outer-cell[^"]*"[^>]*>/i
  );

  for (let oi = 1; oi < outerCellParts.length; oi++) {
    const outerBlock = outerCellParts[oi];

    // ── Step 2: determine product (YouTube vs YouTube Music) from header-cell ──
    const headerMatch = outerBlock.match(
      /<div[^>]+class="[^"]*header-cell[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    );
    const headerText = headerMatch ? stripTags(headerMatch[1]).trim() : 'YouTube';
    const isMusic = /music/i.test(headerText);

    // ── Step 3: extract ONLY the 6-col body-1 content cell (not caption, not right-aligned) ──
    // The caption cell has mdl-cell--12-col; the right empty cell has mdl-typography--text-right.
    // We want ONLY the cell that has mdl-cell--6-col AND mdl-typography--body-1 but NOT text-right.
    const bodyCellMatch = outerBlock.match(
      /<div[^>]+class="([^"]*content-cell[^"]*mdl-cell--6-col[^"]*mdl-typography--body-1[^"]*)"[^>]*>([\s\S]*?)<\/div>/i
    );

    if (!bodyCellMatch) continue;

    const cellClass = bodyCellMatch[1];
    // Skip if it's the right-aligned (empty) cell
    if (/mdl-typography--text-right/.test(cellClass)) continue;

    const bodyContent = bodyCellMatch[2];

    // ── Step 4: detect action prefix from text node before first <a> ───────────
    const prefixMatch = bodyContent.match(/^\s*(Watched|Viewed|Answered)\s+/i);
    const prefix: string = prefixMatch ? prefixMatch[1] : 'Watched';

    // ── Step 5: extract <a> links, skipping Google Account / myaccount links ───
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const links: { href: string; text: string }[] = [];
    let lMatch: RegExpExecArray | null;

    while ((lMatch = linkRegex.exec(bodyContent)) !== null) {
      const href = lMatch[1];
      const text = decodeHtmlEntities(stripTags(lMatch[2])).trim();
      // Skip privacy/account links and empty link texts
      if (!text || href.includes('myaccount.google.com')) continue;
      links.push({ href, text });
    }

    if (links.length === 0) continue;

    // First link → video or community post
    const videoLink = links[0];
    const titleUrl = videoLink.href;
    const rawTitle = videoLink.text;

    // If the title text is just a raw URL (deleted/unavailable video), keep it minimal
    const isUrlOnly = /^https?:\/\//.test(rawTitle);
    const titleText = isUrlOnly ? titleUrl : rawTitle;

    // Second link → channel (validate it's actually a YouTube channel URL)
    let channelName: string | undefined;
    let channelUrl: string | undefined;

    if (links.length > 1) {
      const cl = links[1];
      const isChannelUrl =
        cl.href.includes('youtube.com/channel/') ||
        cl.href.includes('youtube.com/@') ||
        cl.href.includes('youtube.com/c/') ||
        cl.href.includes('youtube.com/user/');
      if (isChannelUrl) {
        channelName = cl.text;
        channelUrl = cl.href;
      }
    }

    // ── Step 6: extract date — last <br>-separated segment with 4-digit year ───
    const brParts = bodyContent.split(/<br\s*\/?>/i);
    let rawDateStr = '';
    for (let i = brParts.length - 1; i >= 0; i--) {
      const candidate = decodeHtmlEntities(stripTags(brParts[i])).trim();
      // Valid date has a 4-digit year and at least one letter (month abbreviation)
      if (candidate && /\d{4}/.test(candidate) && /[A-Za-z]/.test(candidate)) {
        rawDateStr = candidate;
        break;
      }
    }

    const time = parseTakeoutDate(rawDateStr);

    // Build the final title with action prefix so getActionType() works correctly
    const finalTitle = `${prefix} ${titleText}`;

    records.push({
      header: isMusic ? 'YouTube Music' : 'YouTube',
      title: finalTitle,
      titleUrl,
      subtitles: channelName ? [{ name: channelName, url: channelUrl }] : undefined,
      time,
      products: [isMusic ? 'YouTube Music' : 'YouTube'],
    });
  }

  return records;
}
