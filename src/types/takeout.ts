export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export class UploadSizeError extends Error {
  readonly size: number;
  readonly maxSize: number;

  constructor(size: number, maxSize: number = MAX_UPLOAD_BYTES) {
    const sizeMb = (size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    super(`Selected files total ${sizeMb} MB, which exceeds the ${maxMb} MB limit. Try uploading an uncompressed Takeout folder, or use the local CLI script.`);
    this.name = 'UploadSizeError';
    this.size = size;
    this.maxSize = maxSize;
  }
}

export interface TakeoutManifest {
  archiveName: string;
  uploadedAt: number;
  totalFilesFound: number;
  files: {
    watchHistory: boolean;
    subscriptions: boolean;
    playlists: boolean;
    musicLibrary: boolean;
    comments: boolean;
    liveChats: boolean;
    channels: boolean;
  };
  playlistFileCount: number;
  extractedKeys: string[];
}

export type ActiveSource = 'none' | 'uploaded';

export interface ExtractedEntry {
  path: string;
  content: Uint8Array;
}

export type WorkerInMessage = {
  files: ArrayBuffer[];
  fileNames: string[];
};

export type WorkerOutMessage =
  | { type: 'PROGRESS'; percent: number; statusMessage: string }
  | { type: 'COMPLETE'; manifest: TakeoutManifest; files: Record<string, string> }
  | { type: 'ERROR'; message: string };
