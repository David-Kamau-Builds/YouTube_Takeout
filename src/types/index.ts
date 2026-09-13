export interface Subtitle {
  name: string;
  url?: string;
}

export interface Detail {
  name: string;
}

export interface WatchHistoryRecord {
  header: 'YouTube' | 'YouTube Music' | string;
  title: string;
  titleUrl?: string;
  subtitles?: Subtitle[];
  time: string;
  products: string[];
  activityControls?: string[];
  details?: Detail[];
}

export interface NormalizedWatchRecord {
  id: string;
  header: 'YouTube' | 'YouTube Music';
  title: string;
  originalTitle: string;
  titleUrl?: string;
  videoId?: string;
  channelName: string;
  channelUrl?: string;
  time: string;
  timestamp: number;
  year: number;
  month: string; // YYYY-MM
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
  type: 'Watched' | 'Viewed' | 'Answered' | 'Other';
  isMusic: boolean;
  isAdsView: boolean;
}

export interface Subscription {
  channelId: string;
  channelUrl: string;
  channelTitle: string;
}

export interface CommentTextSegment {
  text?: string;
  videoLink?: {
    externalVideoId: string;
    startTimeSeconds?: number;
  };
  mention?: {
    externalChannelId: string;
  };
  emoji?: {
    customEmojiUrl?: string;
  };
}

export interface Comment {
  commentId: string;
  channelId: string;
  timestamp: string;
  price: number;
  parentCommentId?: string;
  postId?: string;
  videoId?: string;
  commentTextRaw: string;
  textSegments: CommentTextSegment[];
  plainText: string;
  topLevelCommentId?: string;
  isReply: boolean;
}

export interface LiveChat {
  liveChatId: string;
  channelId: string;
  timestamp: string;
  price: number;
  videoId: string;
  liveChatTextRaw: string;
  textSegments: CommentTextSegment[];
  plainText: string;
  hasCustomEmoji: boolean;
}

export interface MusicLibrarySong {
  videoId: string;
  songTitle: string;
  albumTitle: string;
  artist1: string;
  artist2?: string;
  artist3?: string;
  allArtists: string[];
}

export interface PlaylistVideo {
  videoId: string;
  addedAt: string;
}

export interface Playlist {
  playlistId: string;
  title: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  order: string;
  visibility: string;
  addNewVideosToTop: boolean;
  imageUrls: string[];
  videos: PlaylistVideo[];
}

export interface ChannelProfile {
  channelId: string;
  channelTitle: string;
  visibility: string;
  vanityUrl?: string;
  autoModeration: boolean;
  defaultAllowedCommentsType: string;
  defaultTargetedAudience: string;
  defaultLicense: string;
}

export interface DashboardStats {
  totalVideosWatched: number;
  totalMusicTracksPlayed: number;
  uniqueChannels: number;
  uniqueArtists: number;
  uniqueSongs: number;
  totalSubscriptions: number;
  totalComments: number;
  totalLiveChats: number;
  musicPercentage: number;
  videoPercentage: number;
}
