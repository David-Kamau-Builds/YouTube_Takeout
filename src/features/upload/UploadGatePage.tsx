import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTakeout } from '../../context/TakeoutContext';
import { MAX_UPLOAD_BYTES } from '../../types/takeout';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import {
  PlayCircle,
  UploadCloud,
  FolderUp,
  Loader2,
  AlertCircle,
  BarChart3,
  Flame,
  Music2,
  Lock,
} from 'lucide-react';

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
        `Your archive is ${sizeMb} MB. We currently support up to ${maxMb} MB in browser memory. Try uploading an uncompressed folder instead, or use the local CLI script (npm run extract-takeout).`
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
            <PlayCircle className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            Takeout Visualizer
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Hero & Upload Card */}
      <main className="max-w-4xl w-full mx-auto my-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Discover Your YouTube Footprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visualize Your Entire YouTube History
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your Google Takeout archive to explore deep interactive statistics, watch habits, music replay, and playlist insights — completely client-side in your browser.
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {displayError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-900 dark:text-rose-200">Upload Rejected</div>
                <div>{displayError}</div>
              </div>
            </div>
          )}

          {isExtracting ? (
            <div className="py-12 px-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-5">
              <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {statusMessage || 'Unpacking archive...'}
                </div>
                <div className="text-xs text-slate-500">
                  Decompressing archives and populating local database...
                </div>
              </div>

              <div className="max-w-md mx-auto w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs font-mono text-slate-500">{progress}%</div>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragOver
                  ? 'border-red-500 bg-red-500/5 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-red-500/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
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

              <div className="p-4 sm:p-5 rounded-3xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit mx-auto mb-4">
                <UploadCloud className="w-10 h-10" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Drag & Drop your Takeout file or folder
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Drop your Google Takeout archive (.zip, .tgz, .tar.gz) or select an uncompressed Takeout folder for instant zero-overhead loading.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-all transform active:scale-95 cursor-pointer"
                >
                  Choose Archive File(s)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>Choose Folder</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">.zip</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">.tgz</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">.tar.gz</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Takeout Folder</span>
                <span>• Temporary 10 MB in-memory cap</span>
              </div>
            </div>
          )}

          {/* How to Get Takeout Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                How to download your YouTube data:
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                1. Visit Google Takeout &bull; 2. Select only &ldquo;YouTube and YouTube Music&rdquo; &bull; 3. Create export &amp; download the archive.
              </p>
            </div>
            <a
              href="https://takeout.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Open Google Takeout</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          {/* Privacy Guarantee Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">100% Client-Side</div>
                <div className="text-[11px] text-slate-500">No servers, no tracking, zero data transmission.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
              <BarChart3 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Deep Analytics</div>
                <div className="text-[11px] text-slate-500">Hours watched, top channels, playlists & rewind.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
              <Music2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">YouTube Music</div>
                <div className="text-[11px] text-slate-500">Track listening trends and saved music library.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
        YouTube Takeout Visualizer • Private & Open Source Local Tool
      </footer>
    </div>
  );
}
