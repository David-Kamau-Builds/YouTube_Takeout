import { fetchCsv } from '../data/fetchCsv';
import type { MusicLibrarySong } from '../../types';

interface RawMusicLibrarySong {
  'Video ID': string;
  'Song Title': string;
  'Album Title': string;
  'Artist Name 1': string;
  'Artist Name 2'?: string;
  'Artist Name 3'?: string;
}

export async function loadMusicLibrary(): Promise<MusicLibrarySong[]> {
  const raw = await fetchCsv<RawMusicLibrarySong>('/data/music/music library songs.csv');

  return raw
    .filter(row => row && row['Video ID'])
    .map(row => {
      const artist1 = String(row['Artist Name 1'] || '').trim();
      const artist2 = row['Artist Name 2'] ? String(row['Artist Name 2']).trim() : undefined;
      const artist3 = row['Artist Name 3'] ? String(row['Artist Name 3']).trim() : undefined;

      const allArtists = [artist1, artist2, artist3].filter((a): a is string => Boolean(a && a.length > 0));

      return {
        videoId: String(row['Video ID']).trim(),
        songTitle: String(row['Song Title'] || '').trim(),
        albumTitle: String(row['Album Title'] || '').trim(),
        artist1,
        artist2,
        artist3,
        allArtists,
      };
    });
}
