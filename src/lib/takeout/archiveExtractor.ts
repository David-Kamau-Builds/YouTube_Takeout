import { unzipSync, gunzipSync } from 'fflate';
import { MAX_UPLOAD_BYTES, UploadSizeError } from '../../types/takeout';
import { parseTar } from './tarParser';

const MEDIA_EXTENSIONS = new Set([
  'mp4', 'webm', 'mkv', 'avi', 'mov', '3gp', 'flv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus',
]);

const ALLOWED_EXTENSIONS = new Set(['json', 'csv']);

export function shouldExtractFileName(filePath: string): boolean {
  const parts = filePath.split('.');
  if (parts.length <= 1) return false;
  const ext = parts.pop()?.toLowerCase() ?? '';
  if (MEDIA_EXTENSIONS.has(ext)) return false;
  if (ext === 'html' || ext === 'htm') {
    const lower = filePath.toLowerCase();
    return lower.includes('watch-history') || lower.includes('history');
  }
  return ALLOWED_EXTENSIONS.has(ext);
}

export function validateTotalSize(totalBytes: number, maxBytes: number = MAX_UPLOAD_BYTES): void {
  if (totalBytes > maxBytes) {
    throw new UploadSizeError(totalBytes, maxBytes);
  }
}

/**
 * Extracts raw file text maps from an archive ArrayBuffer.
 */
export async function extractArchiveBuffer(
  buffer: ArrayBuffer,
  fileName: string
): Promise<Map<string, string>> {
  validateTotalSize(buffer.byteLength);

  const lowerName = fileName.toLowerCase();
  const rawMap = new Map<string, string>();
  const textDecoder = new TextDecoder('utf-8');
  const uint8 = new Uint8Array(buffer);

  if (lowerName.endsWith('.zip')) {
    // Unzip with fflate filter to avoid decompressing media files
    const unzipped = unzipSync(uint8, {
      filter(file) {
        return shouldExtractFileName(file.name);
      },
    });

    for (const [relativePath, fileBytes] of Object.entries(unzipped)) {
      if (shouldExtractFileName(relativePath) && fileBytes.length > 0) {
        rawMap.set(relativePath.replace(/\\/g, '/'), textDecoder.decode(fileBytes));
      }
    }
  } else if (
    lowerName.endsWith('.tar.gz') ||
    lowerName.endsWith('.tgz') ||
    lowerName.endsWith('.tz')
  ) {
    // Gunzip first, then parse TAR
    const tarBytes = gunzipSync(uint8);
    const tarEntries = parseTar(tarBytes);
    for (const entry of tarEntries) {
      rawMap.set(entry.path.replace(/\\/g, '/'), textDecoder.decode(entry.content));
    }
  } else if (lowerName.endsWith('.tar')) {
    // Raw TAR
    const tarEntries = parseTar(uint8);
    for (const entry of tarEntries) {
      rawMap.set(entry.path.replace(/\\/g, '/'), textDecoder.decode(entry.content));
    }
  } else if (shouldExtractFileName(fileName)) {
    // Standalone file upload (e.g. directly uploading watch-history.json)
    rawMap.set(fileName.replace(/\\/g, '/'), textDecoder.decode(uint8));
  } else {
    throw new Error(`Unsupported archive format: ${fileName}`);
  }

  return rawMap;
}
