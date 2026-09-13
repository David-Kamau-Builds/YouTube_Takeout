import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTakeout } from '../../hooks/useTakeout';
import { MAX_UPLOAD_BYTES } from '../../types/takeout';
import {
  X,
  FileArchive,
  FolderUp,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { TakeoutGuide } from './TakeoutGuide';

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
  const [showGuide, setShowGuide] = useState(false);
  const [localSizeError, setLocalSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleFiles = async (files: FileList | File[] | null) => {
    setLocalSizeError(null);
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);
    const totalBytes = fileArr.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);
      const maxMb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      setLocalSizeError(
        `Selected files total ${sizeMb} MB. Maximum supported archive in browser memory is ${maxMb} MB. For larger archives, select the uncompressed Takeout folder, or use the local CLI tool.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#15171c] border border-black/8 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/6 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <FileArchive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Load YouTube Takeout Archive
              </h2>
            </div>
          </div>
          <button
            onClick={closeUploadModal}
            disabled={isExtracting}
            type="button"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Privacy Callout */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/4 dark:border-white/5 text-[11px] text-neutral-600 dark:text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Your archive is unpacked and parsed inside your browser. No files or metrics leave your machine.
            </span>
          </div>

          {/* Error Banner */}
          {displayError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold">Import Issue</div>
                <div>{displayError}</div>
              </div>
            </div>
          )}

          {/* Progress View */}
          {isExtracting ? (
            <div className="py-8 px-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center space-y-3.5">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-neutral-700 dark:text-neutral-300" />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {statusMessage || 'Processing archive...'}
                </div>
                <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Decompressing and indexing records into local storage
                </div>
              </div>

              <div className="w-full bg-neutral-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-neutral-900 dark:bg-white h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs font-mono tabular-nums text-neutral-400">{progress}%</div>
            </div>
          ) : manifest && !displayError ? (
            /* Success Summary State */
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                <Check className="w-4 h-4" />
                <span>Archive Loaded Successfully</span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                Source: <span className="font-medium text-neutral-900 dark:text-white">{manifest.archiveName}</span> (
                {manifest.totalFilesFound} datasets parsed)
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className={`w-3 h-3 ${manifest.files.watchHistory ? 'text-emerald-500' : 'text-neutral-400'}`} />
                  <span>Watch History</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className={`w-3 h-3 ${manifest.files.subscriptions ? 'text-emerald-500' : 'text-neutral-400'}`} />
                  <span>Subscriptions</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className={`w-3 h-3 ${manifest.files.playlists ? 'text-emerald-500' : 'text-neutral-400'}`} />
                  <span>Playlists ({manifest.playlistFileCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                  <Check className={`w-3 h-3 ${manifest.files.musicLibrary ? 'text-emerald-500' : 'text-neutral-400'}`} />
                  <span>Music Library</span>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center transition-all duration-150 cursor-pointer ${isDragOver
                  ? 'border-neutral-900 dark:border-white bg-neutral-100/70 dark:bg-white/5 scale-[1.005]'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-50/50 dark:bg-white/2'
                }`}
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
                // @ts-expect-error webkitdirectory is supported in modern browsers
                webkitdirectory=""
                directory=""
                multiple
                onChange={onFileInputChange}
                className="hidden"
              />

              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Drop your Google Takeout archive here
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-4">
                Select .zip, .tgz archive or an uncompressed folder.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Select Archive File
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <FolderUp className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Choose Folder</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <span>.zip</span>
                <span>&bull;</span>
                <span>.tgz</span>
                <span>&bull;</span>
                <span>Takeout Folder</span>
                <span>&bull;</span>
                <span>Max 10 MB in-memory cap</span>
              </div>
            </div>
          )}

          {/* Collapsible Step-by-Step Export Guide */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowGuide((prev) => !prev)}
              className="w-full text-center text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-1"
            >
              <span>{showGuide ? 'Hide Takeout Export Guide' : 'How to export from Google Takeout (Step-by-Step)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${showGuide ? 'rotate-180' : ''}`} />
            </button>

            {showGuide && (
              <div className="mt-3">
                <TakeoutGuide />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-neutral-50 dark:bg-white/2 border-t border-black/5 dark:border-white/5 flex justify-end">
          <button
            onClick={closeUploadModal}
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {manifest ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
