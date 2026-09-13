import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTakeout } from '../../context/TakeoutContext';
import { MAX_UPLOAD_BYTES } from '../../types/takeout';
import {
  X,
  UploadCloud,
  FileArchive,
  FolderUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export function TakeoutUploadModal() {
  const {
    isUploadModalOpen,
    closeUploadModal,
    uploadFiles,
    isExtracting,
    progress,
    statusMessage,
    uploadError,
    manifest,
  } = useTakeout();

  const [isDragOver, setIsDragOver] = useState(false);
  const [localSizeError, setLocalSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleFiles = async (files: FileList | File[] | null) => {
    setLocalSizeError(null);
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);

    // Pre-flight size check across candidate files
    const totalBytes = fileArr.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);
      const maxMb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      setLocalSizeError(
        `Your archive is ${sizeMb} MB. We currently support up to ${maxMb} MB in browser memory. Try uploading an uncompressed folder instead, or use the CLI script (npm run extract-takeout).`
      );
      return;
    }

    try {
      await uploadFiles(fileArr);
    } catch {
      // Handled in context
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExtracting) {
      setIsDragOver(true);
    }
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isExtracting) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const displayError = localSizeError || uploadError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Load Google Takeout Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% private & client-side extraction in your browser
              </p>
            </div>
          </div>
          <button
            onClick={closeUploadModal}
            disabled={isExtracting}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Privacy badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Your data never leaves your device. Decompression and parsing occur completely offline via Web Workers & IndexedDB.
            </span>
          </div>

          {/* Size guard error banner */}
          {displayError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-900 dark:text-rose-200">Upload Rejected</div>
                <div>{displayError}</div>
              </div>
            </div>
          )}

          {/* Extraction progress view */}
          {isExtracting ? (
            <div className="py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {statusMessage || 'Processing Takeout...'}
                </div>
                <div className="text-xs text-slate-500">
                  Extracting JSON/CSV records in Web Worker thread
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs font-mono text-slate-500">{progress}%</div>
            </div>
          ) : manifest && !displayError ? (
            /* Success manifest checklist */
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Archive Processed Successfully!</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Source: <span className="font-semibold">{manifest.archiveName}</span> (
                {manifest.totalFilesFound} data files detected)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.watchHistory ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Watch History</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.subscriptions ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Subscriptions</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.playlists ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Playlists ({manifest.playlistFileCount} files)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.musicLibrary ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Music Library</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.comments ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Comments</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${manifest.files.liveChats ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>Live Chats</span>
                </div>
              </div>
            </div>
          ) : (
            /* Drag and drop zone */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragOver
                  ? 'border-red-500 bg-red-500/5 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".zip,.tgz,.tar.gz,.tz,.tar,.json,.csv"
                onChange={onFileInputChange}
                className="hidden"
              />
              <input
                ref={folderInputRef}
                type="file"
                // @ts-expect-error webkitdirectory is non-standard but supported in all modern browsers
                webkitdirectory=""
                directory=""
                multiple
                onChange={onFileInputChange}
                className="hidden"
              />

              <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit mx-auto mb-4">
                <FileArchive className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                Drop your Google Takeout archive here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Supports single or multi-part sequential ZIPs (.zip), Tarballs (.tgz, .tar.gz), or uncompressed Takeout folders.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-colors cursor-pointer"
                >
                  Select Archive File(s)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Select Takeout Folder</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.zip</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.tgz</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.tar.gz</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Takeout/</span>
                <span>• Max 10 MB in browser</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeUploadModal}
            type="button"
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            {manifest ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
