import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, gunzipSync } from 'fflate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const targetDataDir = path.resolve(projectRoot, 'public', 'data');

const MEDIA_EXTENSIONS = new Set([
  'mp4', 'webm', 'mkv', 'avi', 'mov', '3gp', 'flv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus',
]);

const ALLOWED_EXTENSIONS = new Set(['json', 'csv']);

function isMediaOrIgnored(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  if (MEDIA_EXTENSIONS.has(ext)) return true;
  return !ALLOWED_EXTENSIONS.has(ext);
}

function readTarString(bytes, start, length) {
  let end = start;
  const max = start + length;
  while (end < max && bytes[end] !== 0) {
    end++;
  }
  return new TextDecoder('utf-8').decode(bytes.subarray(start, end)).trim();
}

function parseTar(rawBytes) {
  const entries = [];
  const totalLength = rawBytes.length;
  let offset = 0;
  let nextOverrideName = null;

  while (offset + 512 <= totalLength) {
    const header = rawBytes.subarray(offset, offset + 512);

    let isZero = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        isZero = false;
        break;
      }
    }

    if (isZero) {
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

    let fileName = nextOverrideName || readTarString(header, 0, 100);
    nextOverrideName = null;

    const sizeStr = readTarString(header, 124, 12);
    const size = sizeStr ? parseInt(sizeStr, 8) || 0 : 0;
    const typeFlag = String.fromCharCode(header[156]);

    const prefix = readTarString(header, 345, 155);
    if (prefix && !fileName.startsWith(prefix)) {
      fileName = `${prefix}/${fileName}`;
    }

    const dataStart = offset + 512;
    const dataEnd = dataStart + size;

    if (dataEnd > totalLength) break;

    if (typeFlag === 'L') {
      nextOverrideName = new TextDecoder('utf-8').decode(rawBytes.subarray(dataStart, dataEnd)).replace(/\0+$/, '');
    } else if (typeFlag === '0' || typeFlag === '\0' || typeFlag === '') {
      if (!isMediaOrIgnored(fileName)) {
        entries.push({
          path: fileName,
          content: rawBytes.subarray(dataStart, dataEnd),
        });
      }
    }

    const paddedSize = Math.ceil(size / 512) * 512;
    offset = dataStart + paddedSize;
  }

  return entries;
}

function normalizeTakeoutKey(rawPath) {
  let relPath = rawPath.replace(/\\/g, '/');
  const match = relPath.match(/(?:.*?[/\\])?(?:YouTube and YouTube Music|YouTube)[/\\](.*)/i);
  if (match && match[1]) {
    relPath = match[1];
  }

  relPath = relPath.replace(/^\/+/, '');
  const lower = relPath.toLowerCase();

  if (lower.endsWith('watch-history.json') || lower === 'watch-history.json') {
    return 'history/watch-history.json';
  }
  if (lower.endsWith('subscriptions.csv') || lower === 'subscriptions.csv') {
    return 'subscriptions/subscriptions.csv';
  }
  if (lower.endsWith('playlists/playlists.csv') || lower === 'playlists.csv') {
    return 'playlists/playlists.csv';
  }
  if (lower.endsWith('-videos.csv')) {
    const name = relPath.split('/').pop();
    return `playlists/${name}`;
  }
  if (lower.includes('music') && (lower.endsWith('music library songs.csv') || lower.endsWith('music-library-songs.csv'))) {
    return 'music/music library songs.csv';
  }
  if (lower.endsWith('comments.csv') || lower === 'comments.csv') {
    return 'comments/comments.csv';
  }
  if (lower.includes('live') && (lower.endsWith('live chats.csv') || lower.endsWith('live-chats.csv'))) {
    return 'live-chats/live chats.csv';
  }
  if (lower.endsWith('channels/channel.csv') || lower === 'channel.csv') {
    return 'channels/channel.csv';
  }
  if (lower.endsWith('channel url configs.csv') || lower.endsWith('channel-url-configs.csv')) {
    return 'channels/channel URL configs.csv';
  }
  if (lower.endsWith('channel feature data.csv') || lower.endsWith('channel-feature-data.csv')) {
    return 'channels/channel feature data.csv';
  }
  if (lower.endsWith('channel community moderation settings.csv')) {
    return 'channels/channel community moderation settings.csv';
  }
  if (lower.endsWith('channel page settings.csv')) {
    return 'channels/channel page settings.csv';
  }

  return relPath;
}

async function processArchive(archivePath, extractedMap) {
  console.log(`Processing: ${archivePath}`);
  const buffer = fs.readFileSync(archivePath);
  const uint8 = new Uint8Array(buffer);
  const lower = archivePath.toLowerCase();

  if (lower.endsWith('.zip')) {
    const unzipped = unzipSync(uint8, {
      filter(file) {
        return !isMediaOrIgnored(file.name);
      },
    });

    for (const [entryPath, fileBytes] of Object.entries(unzipped)) {
      if (!isMediaOrIgnored(entryPath) && fileBytes.length > 0) {
        const normalized = normalizeTakeoutKey(entryPath);
        extractedMap.set(normalized, fileBytes);
      }
    }
  } else if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz') || lower.endsWith('.tz')) {
    const gunzipped = gunzipSync(uint8);
    const tarEntries = parseTar(gunzipped);
    for (const entry of tarEntries) {
      const normalized = normalizeTakeoutKey(entry.path);
      extractedMap.set(normalized, entry.content);
    }
  } else if (lower.endsWith('.tar')) {
    const tarEntries = parseTar(uint8);
    for (const entry of tarEntries) {
      const normalized = normalizeTakeoutKey(entry.path);
      extractedMap.set(normalized, entry.content);
    }
  } else {
    console.warn(`Skipping unrecognized archive extension: ${archivePath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npm run extract-takeout -- <path-to-archive-1> [path-to-archive-2 ...]');
    process.exit(1);
  }

  const extractedMap = new Map();

  for (const arg of args) {
    const resolvedPath = path.resolve(process.cwd(), arg);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`File not found: ${resolvedPath}`);
      continue;
    }
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      // Process directory of takeout files
      console.log(`Scanning folder: ${resolvedPath}`);
      function walkDir(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(full);
          } else if (!isMediaOrIgnored(entry.name)) {
            const normalized = normalizeTakeoutKey(path.relative(resolvedPath, full));
            extractedMap.set(normalized, fs.readFileSync(full));
          }
        }
      }
      walkDir(resolvedPath);
    } else {
      await processArchive(resolvedPath, extractedMap);
    }
  }

  console.log(`\nWriting ${extractedMap.size} extracted files to ${targetDataDir}...`);

  for (const [relPath, content] of extractedMap.entries()) {
    const dest = path.join(targetDataDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    console.log(`  ✓ ${relPath}`);
  }

  console.log('\nTakeout data extracted successfully into public/data/!\n');
}

main().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
