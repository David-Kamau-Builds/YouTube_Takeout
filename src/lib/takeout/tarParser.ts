import type { ExtractedEntry } from '../../types/takeout';

const MEDIA_EXTENSIONS = new Set([
  'mp4', 'webm', 'mkv', 'avi', 'mov', '3gp', 'flv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus',
]);

const ALLOWED_EXTENSIONS = new Set(['json', 'csv']);

function readString(bytes: Uint8Array, start: number, length: number): string {
  let end = start;
  const max = start + length;
  while (end < max && bytes[end] !== 0) {
    end++;
  }
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes.subarray(start, end)).trim();
}

function parseOctal(bytes: Uint8Array, start: number, length: number): number {
  const str = readString(bytes, start, length);
  if (!str) return 0;
  const val = parseInt(str, 8);
  return Number.isNaN(val) ? 0 : val;
}

function shouldExtractPath(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  if (MEDIA_EXTENSIONS.has(ext)) return false;
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Parses raw TAR bytes (POSIX / GNU / UStar) and extracts .json and .csv files.
 */
export function parseTar(rawBytes: Uint8Array): ExtractedEntry[] {
  const entries: ExtractedEntry[] = [];
  const totalLength = rawBytes.length;
  let offset = 0;
  let nextOverrideName: string | null = null;

  while (offset + 512 <= totalLength) {
    const header = rawBytes.subarray(offset, offset + 512);

    // Check for 512-byte zero block
    let isZero = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        isZero = false;
        break;
      }
    }

    if (isZero) {
      // Check next 512 bytes if available; two consecutive zero blocks mark EOF
      if (offset + 1024 <= totalLength) {
        let isNextZero = true;
        for (let i = 512; i < 1024; i++) {
          if (rawBytes[offset + i] !== 0) {
            isNextZero = false;
            break;
          }
        }
        if (isNextZero) break;
      }
      offset += 512;
      continue;
    }

    // Name: 0-99
    let fileName = nextOverrideName ?? readString(header, 0, 100);
    nextOverrideName = null;

    // Size: 124-135
    const size = parseOctal(header, 124, 12);

    // Typeflag: 156
    const typeFlag = String.fromCharCode(header[156]);

    // Prefix: 345-499 (UStar)
    const prefix = readString(header, 345, 155);
    if (prefix && !fileName.startsWith(prefix)) {
      fileName = `${prefix}/${fileName}`;
    }

    const dataStart = offset + 512;
    const dataEnd = dataStart + size;

    if (dataEnd > totalLength) {
      // Corrupt or truncated archive block
      break;
    }

    // GNU LongLink filename (typeflag 'L')
    if (typeFlag === 'L') {
      nextOverrideName = new TextDecoder('utf-8').decode(rawBytes.subarray(dataStart, dataStart + size)).replace(/\0+$/, '');
    } else if (typeFlag === '0' || typeFlag === '\0' || typeFlag === '') {
      // Regular file
      if (shouldExtractPath(fileName)) {
        entries.push({
          path: fileName,
          content: rawBytes.subarray(dataStart, dataEnd),
        });
      }
    }

    // Advance by 512-byte aligned blocks
    const paddedSize = Math.ceil(size / 512) * 512;
    offset = dataStart + paddedSize;
  }

  return entries;
}
