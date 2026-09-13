import type { WorkerInMessage, WorkerOutMessage } from '../../types/takeout';
import { extractArchiveBuffer } from './archiveExtractor';
import { normalizeTakeoutPaths, buildTakeoutManifest } from './pathNormalizer';

addEventListener('message', async (event: MessageEvent<WorkerInMessage>) => {
  const { files, fileNames } = event.data;

  try {
    const totalFiles = files.length;
    if (totalFiles === 0) {
      postMessage({
        type: 'ERROR',
        message: 'No files were provided for extraction.',
      } satisfies WorkerOutMessage);
      return;
    }

    const mergedRawMap = new Map<string, string>();

    for (let i = 0; i < totalFiles; i++) {
      const buffer = files[i];
      const name = fileNames[i];

      const startPercent = Math.round((i / totalFiles) * 70);
      postMessage({
        type: 'PROGRESS',
        percent: startPercent,
        statusMessage: `Extracting ${name} (${i + 1} of ${totalFiles})...`,
      } satisfies WorkerOutMessage);

      const rawMap = await extractArchiveBuffer(buffer, name);

      // Merge entries
      for (const [k, v] of rawMap.entries()) {
        mergedRawMap.set(k, v);
      }
    }

    postMessage({
      type: 'PROGRESS',
      percent: 85,
      statusMessage: 'Normalizing Takeout folder structure...',
    } satisfies WorkerOutMessage);

    const normalizedMap = normalizeTakeoutPaths(mergedRawMap);

    postMessage({
      type: 'PROGRESS',
      percent: 95,
      statusMessage: 'Building dataset manifest...',
    } satisfies WorkerOutMessage);

    const archiveLabel = fileNames.length === 1 ? fileNames[0] : `${fileNames.length} Takeout Archives`;
    const manifest = buildTakeoutManifest(normalizedMap, archiveLabel);

    const filesRecord: Record<string, string> = {};
    for (const [k, v] of normalizedMap.entries()) {
      filesRecord[k] = v;
    }

    postMessage({
      type: 'COMPLETE',
      manifest,
      files: filesRecord,
    } satisfies WorkerOutMessage);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    postMessage({
      type: 'ERROR',
      message,
    } satisfies WorkerOutMessage);
  }
});
