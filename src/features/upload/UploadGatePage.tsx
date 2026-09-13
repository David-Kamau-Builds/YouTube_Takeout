import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTakeout } from '../../hooks/useTakeout';
import { MAX_UPLOAD_BYTES } from '../../types/takeout';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import {
  FolderUp,
  Loader2,
  AlertCircle,
  Lock,
  FileArchive,
  HardDrive,
} from 'lucide-react';
import { YouTubeLogo } from '../../components/ui/YouTubeLogo';
import { TakeoutGuide } from '../../components/takeout/TakeoutGuide';

export function UploadGatePage() {
  const {
    uploadFiles,
    isExtracting,
    progress,
    statusMessage,
    uploadError,
  } = useTakeout();

  const [isDragOver, setIsDragOver] = useState(false);
  const [localSizeError, setLocalSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[] | null) => {
    setLocalSizeError(null);
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);
    const totalBytes = fileArr.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);
      const maxMb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      setLocalSizeError(
        `Archive size is ${sizeMb} MB. Browser memory allows up to ${maxMb} MB for compressed archives. For larger histories, select the uncompressed Takeout folder, or use the local CLI script (npm run extract-takeout).`
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
    if (!isExtracting) setIsDragOver(true);
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
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#0d0e11] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-red-500/10">
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <YouTubeLogo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              YouTube Takeout
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto my-6 space-y-6">
        {/* Header Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
            Import YouTube Archive
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Extract, index, and analyze your watch history, playlist habits, and YouTube Music library entirely inside your browser.
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-white dark:bg-[#15171c] border border-black/8 dark:border-white/8 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {displayError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold">Import Issue</div>
                <div className="leading-relaxed">{displayError}</div>
              </div>
            </div>
          )}

          {isExtracting ? (
            <div className="py-12 px-6 rounded-xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-800 dark:text-neutral-200" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {statusMessage || 'Processing archive streams...'}
                </div>
                <div className="text-xs text-neutral-500">
                  Decompressing archives and indexing into client IndexedDB...
                </div>
              </div>

              <div className="max-w-xs mx-auto w-full bg-neutral-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-neutral-900 dark:bg-white h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs tabular-nums font-mono text-neutral-500">{progress}%</div>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-150 cursor-pointer ${isDragOver
                ? 'border-neutral-900 dark:border-white bg-neutral-100/60 dark:bg-white/5 scale-[1.005]'
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

              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto mb-3">
                <FileArchive className="w-5 h-5" />
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                Drop your Google Takeout archive here
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-5">
                Select your Takeout <code className="text-neutral-700 dark:text-neutral-300 font-mono">.zip</code> archive, or choose an uncompressed folder for instant loading.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Select Archive File
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <FolderUp className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Choose Folder</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
                <span className="font-mono bg-neutral-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">.zip</span>
                <span className="font-mono bg-neutral-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">.tgz</span>
                <span className="font-mono bg-neutral-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">.tar.gz</span>
                <span>&bull; Up to 10 MB in-memory compressed archive</span>
              </div>
            </div>
          )}

          {/* Step-by-Step Export Guide & Expected Archive Structure */}
          <TakeoutGuide />

          {/* Privacy & Architecture Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50/50 dark:bg-white/2 border border-black/4 dark:border-white/5 text-xs">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Zero Cloud Uploads</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Archives are parsed locally. Nothing ever leaves your browser.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50/50 dark:bg-white/2 border border-black/4 dark:border-white/5 text-xs">
              <HardDrive className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">IndexedDB Indexed</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  High-speed local queries and caching so subsequent visits load instantly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="text-center text-[11px] text-neutral-400 dark:text-neutral-600 py-3">
        YouTube Takeout
      </footer>
    </div>
  );
}
