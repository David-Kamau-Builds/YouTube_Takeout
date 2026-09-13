import { fileLoader } from '../takeout/fileLoader';
import { parseCsvText } from '../data/fetchCsv';
import type { Playlist, PlaylistVideo } from '../../types';

interface RawPlaylist {
  'Playlist ID': string;
  'Playlist Title (Original)': string;
  'Playlist Title (Original) Language'?: string;
  'Playlist Create Timestamp': string;
  'Playlist Update Timestamp': string;
  'Playlist Video Order': string;
  'Playlist Visibility': string;
  'Add new videos to top': boolean | string;
  'Playlist Image 1 URL'?: string;
  'Playlist Image 2 URL'?: string;
  'Playlist Image 3 URL'?: string;
}

interface RawPlaylistVideo {
  'Video ID': string;
  'Playlist Video Creation Timestamp': string;
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const text = await fileLoader.readTextOptional('playlists/playlists.csv');
  if (!text) return [];

  const rawPlaylists = await parseCsvText<RawPlaylist>(text);
  const storedKeys = await fileLoader.listStoredKeys('playlists/');
  const playlistPromises = rawPlaylists
    .filter(p => p && p['Playlist ID'])
    .map(async (p) => {
      const title = String(p['Playlist Title (Original)'] || '').trim();
      const playlistId = String(p['Playlist ID']).trim();

      const imageUrls = [
        p['Playlist Image 1 URL'],
        p['Playlist Image 2 URL'],
        p['Playlist Image 3 URL'],
      ].filter((url): url is string => Boolean(url && url.length > 0));

      let videos: PlaylistVideo[] = [];
      try {
        const sanitizedTitle = title.replace(/'/g, '_').toLowerCase();
        const found = storedKeys.find((k) => {
          const fileName = k.replace(/^playlists\//, '').toLowerCase();
          const baseWithoutSuffix = fileName.replace(/-videos\.csv$/i, '');
          return baseWithoutSuffix === sanitizedTitle || baseWithoutSuffix === title.toLowerCase();
        });
        const videoCsvKey = found || `playlists/${title.replace(/'/g, '_')}-videos.csv`;

        if (videoCsvKey) {
          const videoCsvText = await fileLoader.readText(videoCsvKey);
          const rawVideos = await parseCsvText<RawPlaylistVideo>(videoCsvText);
          videos = rawVideos
            .filter(v => v && v['Video ID'])
            .map(v => ({
              videoId: String(v['Video ID'] || '').trim(),
              addedAt: String(v['Playlist Video Creation Timestamp'] || '').trim(),
            }));
        }
      } catch (err) {
        console.warn(`Could not load companion videos for playlist "${title}":`, err);
      }

      return {
        playlistId,
        title,
        language: p['Playlist Title (Original) Language'] ? String(p['Playlist Title (Original) Language']).trim() : undefined,
        createdAt: String(p['Playlist Create Timestamp'] || '').trim(),
        updatedAt: String(p['Playlist Update Timestamp'] || '').trim(),
        order: String(p['Playlist Video Order'] || '').trim(),
        visibility: String(p['Playlist Visibility'] || '').trim(),
        addNewVideosToTop: String(p['Add new videos to top']).toLowerCase() === 'true',
        imageUrls,
        videos,
      };
    });

  return Promise.all(playlistPromises);
}
