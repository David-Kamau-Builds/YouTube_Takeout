import { fileLoader } from '../takeout/fileLoader';
import { parseCsvText } from '../data/fetchCsv';
import type { Subscription } from '../../types';

interface RawSubscription {
  'Channel Id': string;
  'Channel Url': string;
  'Channel Title': string;
}

export async function loadSubscriptions(): Promise<Subscription[]> {
  const text = await fileLoader.readText('subscriptions/subscriptions.csv');
  const raw = await parseCsvText<RawSubscription>(text);
  return raw
    .filter(row => row && row['Channel Id'])
    .map(row => ({
      channelId: String(row['Channel Id'] || '').trim(),
      channelUrl: String(row['Channel Url'] || '').trim(),
      channelTitle: String(row['Channel Title'] || '').trim(),
    }));
}
