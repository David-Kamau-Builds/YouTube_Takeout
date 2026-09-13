export function cleanTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/^Watched\s+/i, '')
    .replace(/^Viewed\s+/i, '')
    .replace(/^Answered\s+/i, '')
    .trim();
}

export function cleanArtistName(name: string): string {
  if (!name) return 'Unknown Artist';
  return name.replace(/\s*-\s*Topic$/i, '').trim();
}

export function extractVideoId(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];
  const postMatch = url.match(/\/post\/([^?&]+)/);
  if (postMatch) return postMatch[1];
  return undefined;
}

export function getActionType(title: string): 'Watched' | 'Viewed' | 'Answered' | 'Other' {
  if (title.startsWith('Watched')) return 'Watched';
  if (title.startsWith('Viewed')) return 'Viewed';
  if (title.startsWith('Answered')) return 'Answered';
  return 'Other';
}
