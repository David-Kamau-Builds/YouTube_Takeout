import { useState, useRef, useEffect } from 'react';
import { useTakeout } from '../../hooks/useTakeout';
import { ChevronDown, Check, Trash2, HardDrive, RefreshCw, Lock, FileArchive, X, AlertTriangle } from 'lucide-react';

function formatArchiveName(name: string | undefined): string {
  if (!name) return 'Takeout Archive';
  if (name.length <= 22) return name;
  const extIndex = name.lastIndexOf('.');
  const ext = extIndex !== -1 ? name.substring(extIndex) : '';
  const base = extIndex !== -1 ? name.substring(0, extIndex) : name;
  const front = base.substring(0, 10);
  const back = base.substring(base.length - 4);
  return `${front}…${back}${ext}`;
}

export function DatasetStatusBadge() {
  const { activeSource, manifest, openUploadModal, clearUploadedData } = useTakeout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = manifest?.uploadedAt
    ? new Date(manifest.uploadedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const datasetList = manifest?.files
    ? [
        { label: 'Watch History', active: manifest.files.watchHistory },
        { label: 'Subscriptions', active: manifest.files.subscriptions },
        { label: 'Playlists', active: manifest.files.playlists },
        { label: 'Music Library', active: manifest.files.musicLibrary },
        { label: 'Comments', active: manifest.files.comments },
        { label: 'Live Chats', active: manifest.files.liveChats },
      ]
    : [];

  const activeCount = datasetList.filter((d) => d.active).length;
  const isInvalidUploaded = activeSource === 'uploaded' && activeCount === 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Apple-style minimalist active status capsule */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        type="button"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border active:scale-[0.98] ${
          isInvalidUploaded
            ? dropdownOpen
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
              : 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30'
            : activeSource === 'uploaded'
              ? dropdownOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-500/25 hover:border-emerald-500/40 shadow-2xs'
              : dropdownOpen
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
        }`}
        aria-label="Dataset status and archive details"
      >
        {isInvalidUploaded && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
        <span className="max-w-[150px] sm:max-w-[210px] truncate font-medium tabular-nums">
          {manifest?.archiveName ? formatArchiveName(manifest.archiveName) : 'No Takeout Loaded'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-150 ${
            dropdownOpen ? 'rotate-180 opacity-90' : 'hover:opacity-100'
          }`}
        />
      </button>

      {/* Control Center Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[340px] p-3.5 bg-white dark:bg-[#16181d] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Top section: Storage & File Details */}
          <div className="pb-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-[10px]">
                <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                <span>Local Storage</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" />
                <span>100% On-Device</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
              <div className="flex items-start gap-2">
                <FileArchive className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white break-all leading-snug">
                    {manifest?.archiveName || 'YouTube Takeout Archive'}
                  </div>
                  {formattedDate && (
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Imported on {formattedDate}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isInvalidUploaded && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>No YouTube data detected</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-normal">
                  This archive does not contain recognized YouTube Takeout files. Click below to switch to a valid YouTube export.
                </p>
              </div>
            )}
          </div>

          {/* Dataset Detection Grid */}
          <div className="py-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] px-0.5">
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Detected Datasets
              </span>
              <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                {activeCount} of {datasetList.length} active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {datasetList.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors border ${
                    item.active
                      ? 'bg-neutral-50/80 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
                      : 'bg-transparent border-transparent text-neutral-400 dark:text-neutral-600 opacity-60'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      item.active
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-neutral-200/50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {item.active ? (
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    ) : (
                      <X className="w-2.5 h-2.5 stroke-[2]" />
                    )}
                  </div>
                  <span className="truncate text-[11px] font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-1.5">
            <button
              onClick={() => {
                setDropdownOpen(false);
                openUploadModal();
              }}
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span>Switch or Re-import Archive</span>
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">.zip / folder</span>
            </button>

            {activeSource === 'uploaded' && (
              <button
                onClick={async () => {
                  setDropdownOpen(false);
                  await clearUploadedData();
                }}
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Stored Data</span>
                </div>
                <span className="text-[10px] text-rose-500/70">Reset database</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
