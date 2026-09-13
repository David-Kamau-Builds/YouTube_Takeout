import { fileLoader } from '../takeout/fileLoader';
import { parseCsvText } from '../data/fetchCsv';
import type { ChannelProfile } from '../../types';

interface RawChannel {
  'Channel ID': string;
  'Channel Title (Original)': string;
  'Channel Visibility': string;
}

interface RawChannelUrl {
  'Channel ID': string;
  'Channel Vanity URL 1 Name': string;
}

interface RawChannelFeature {
  'Channel ID': string;
  'Channel Auto Moderation in Live Chat': boolean | string;
  'Video Default Allowed Comments Type': string;
  'Video Default Targeted Audience': string;
  'Video Default License': string;
}

async function safeLoadCsv<T>(path: string): Promise<T[]> {
  try {
    const text = await fileLoader.readText(path);
    return await parseCsvText<T>(text);
  } catch {
    return [];
  }
}

export async function loadChannelProfile(): Promise<ChannelProfile | null> {
  try {
    const [channels, urls, features] = await Promise.all([
      safeLoadCsv<RawChannel>('channels/channel.csv'),
      safeLoadCsv<RawChannelUrl>('channels/channel URL configs.csv'),
      safeLoadCsv<RawChannelFeature>('channels/channel feature data.csv'),
    ]);

    if (!channels || channels.length === 0 || !channels[0]['Channel ID']) {
      return null;
    }

    const ch = channels[0];
    const url = urls.length > 0 ? urls[0] : undefined;
    const feat = features.length > 0 ? features[0] : undefined;

    return {
      channelId: String(ch['Channel ID']).trim(),
      channelTitle: String(ch['Channel Title (Original)'] || '').trim(),
      visibility: String(ch['Channel Visibility'] || '').trim(),
      vanityUrl: url ? String(url['Channel Vanity URL 1 Name'] || '').trim() : undefined,
      autoModeration: feat ? String(feat['Channel Auto Moderation in Live Chat']).toLowerCase() === 'true' : false,
      defaultAllowedCommentsType: feat ? String(feat['Video Default Allowed Comments Type'] || '').trim() : 'Not set',
      defaultTargetedAudience: feat ? String(feat['Video Default Targeted Audience'] || '').trim() : 'Not set',
      defaultLicense: feat ? String(feat['Video Default License'] || '').trim() : 'Not set',
    };
  } catch (err) {
    console.error('Error loading channel profile:', err);
    return null;
  }
}
