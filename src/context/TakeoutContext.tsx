import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ActiveSource, TakeoutManifest } from '../types/takeout';
import { MAX_UPLOAD_BYTES, UploadSizeError } from '../types/takeout';
import { fileLoader } from '../lib/takeout/fileLoader';
import { getMeta, saveFiles, clearAll } from '../lib/takeout/indexedDbStorage';
import { shouldExtractFileName } from '../lib/takeout/archiveExtractor';
import { queryClient } from '../lib/queryClient';
import { TakeoutContext } from './takeoutContextDef';

export function TakeoutProvider({ children }: { children: ReactNode }) {
  const [activeSource, setActiveSourceState] = useState<ActiveSource>('none');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [manifest, setManifest] = useState<TakeoutManifest | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const setSource = useCallback((source: ActiveSource) => {
    setActiveSourceState(source);
    fileLoader.setActiveSource(source);
  }, []);

  // Check stored IndexedDB session on initial mount
  useEffect(() => {
    let mounted = true;
    getMeta()
      .then((meta) => {
        if (!mounted) return;
        if (meta && meta.manifest) {
          setManifest(meta.manifest);
          setSource('uploaded');
        } else {
          setSource('none');
        }
      })
      .catch((err) => {
        console.warn('Failed to check IndexedDB session:', err);
        if (mounted) setSource('none');
      })
      .finally(() => {
        if (mounted) setIsInitialLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [setSource]);

  const openUploadModal = useCallback(() => setIsUploadModalOpen(true), []);
  const closeUploadModal = useCallback(() => {
    if (!isExtracting) {
      setIsUploadModalOpen(false);
      setUploadError(null);
    }
  }, [isExtracting]);

  const clearUploadedData = useCallback(async () => {
    try {
      await clearAll();
    } catch (e) {
      console.error('Failed to clear IndexedDB:', e);
    }
    setManifest(null);
    setSource('none');
    await queryClient.resetQueries();
  }, [setSource]);

  const uploadFiles = useCallback(
    async (rawFiles: File[]) => {
      setUploadError(null);
      if (!rawFiles || rawFiles.length === 0) return;

      // Filter candidate files: either archives or individual JSON/CSV files (skipping media)
      const isArchive = (name: string) => {
        const lower = name.toLowerCase();
        return (
          lower.endsWith('.zip') ||
          lower.endsWith('.tar.gz') ||
          lower.endsWith('.tgz') ||
          lower.endsWith('.tz') ||
          lower.endsWith('.tar')
        );
      };

      const candidateFiles = rawFiles.filter((f) => isArchive(f.name) || shouldExtractFileName(f.name));

      if (candidateFiles.length === 0) {
        setUploadError('No valid Takeout archives or YouTube JSON/CSV files found in selection.');
        return;
      }

      // Pre-flight total byte size check
      const totalBytes = candidateFiles.reduce((acc, f) => acc + f.size, 0);
      if (totalBytes > MAX_UPLOAD_BYTES) {
        const err = new UploadSizeError(totalBytes, MAX_UPLOAD_BYTES);
        setUploadError(err.message);
        throw err;
      }

      setIsExtracting(true);
      setProgress(5);
      setStatusMessage('Reading selected files into memory...');

      try {
        const buffers: ArrayBuffer[] = [];
        const fileNames: string[] = [];

        for (let i = 0; i < candidateFiles.length; i++) {
          const file = candidateFiles[i];
          const relativePath = file.webkitRelativePath && file.webkitRelativePath.length > 0
            ? file.webkitRelativePath
            : file.name;

          setStatusMessage(`Reading ${file.name} (${i + 1}/${candidateFiles.length})...`);
          const buf = await file.arrayBuffer();
          buffers.push(buf);
          fileNames.push(relativePath);
        }

        setProgress(15);
        setStatusMessage('Starting background Web Worker extraction...');

        await new Promise<void>((resolve, reject) => {
          const worker = new Worker(
            new URL('../lib/takeout/takeoutWorker.ts', import.meta.url),
            { type: 'module' }
          );

          worker.onmessage = async (e: MessageEvent) => {
            const data = e.data;
            if (data.type === 'PROGRESS') {
              setProgress(data.percent);
              setStatusMessage(data.statusMessage);
            } else if (data.type === 'COMPLETE') {
              setProgress(98);
              setStatusMessage('Saving extracted files to local database...');
              try {
                await saveFiles(data.files, {
                  uploadedAt: data.manifest.uploadedAt,
                  archiveName: data.manifest.archiveName,
                  manifest: data.manifest,
                });
                setManifest(data.manifest);
                setSource('uploaded');
                await queryClient.resetQueries();
                setProgress(100);
                setStatusMessage('Archive processed and loaded successfully!');
                worker.terminate();
                resolve();
              } catch (storageErr) {
                worker.terminate();
                reject(storageErr);
              }
            } else if (data.type === 'ERROR') {
              worker.terminate();
              reject(new Error(data.message));
            }
          };

          worker.onerror = (err) => {
            worker.terminate();
            reject(new Error(err.message || 'Unknown Web Worker error during extraction'));
          };

          // Transfer ArrayBuffers to worker zero-copy
          worker.postMessage({ files: buffers, fileNames }, buffers);
        });

        setIsExtracting(false);
      } catch (err: unknown) {
        setIsExtracting(false);
        const msg = err instanceof Error ? err.message : String(err);
        setUploadError(msg);
        throw err;
      }
    },
    [setSource]
  );

  return (
    <TakeoutContext.Provider
      value={{
        activeSource,
        isInitialLoading,
        isExtracting,
        progress,
        statusMessage,
        manifest,
        uploadError,
        isUploadModalOpen,
        openUploadModal,
        closeUploadModal,
        uploadFiles,
        clearUploadedData,
      }}
    >
      {children}
    </TakeoutContext.Provider>
  );
}
