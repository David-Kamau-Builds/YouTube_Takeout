import { useState, useRef, useEffect } from 'react';
import { useTakeout } from '../../context/TakeoutContext';
import { UploadCloud, ChevronDown, Check, Trash2 } from 'lucide-react';

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

  const getSourceDetails = () => {
    if (activeSource === 'uploaded') {
      return {
        label: manifest?.archiveName ? manifest.archiveName : 'Your Takeout',
        sub: 'Stored locally in browser',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dotColor: 'bg-emerald-500',
      };
    }

    return {
      label: 'No Data Loaded',
      sub: 'Upload Takeout Archive',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-500 animate-pulse',
    };
  };

  const details = getSourceDetails();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        type="button"
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-xs hover:opacity-90 cursor-pointer ${details.badgeColor}`}
        aria-label="Dataset status and source selector"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${details.dotColor}`} />
        <span className="max-w-[120px] sm:max-w-[160px] truncate font-semibold">
          {details.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active Data
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {details.label}
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                openUploadModal();
              }}
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-red-500" />
                <span>{activeSource === 'uploaded' ? 'Change Takeout Archive' : 'Upload Takeout Archive'}</span>
              </div>
              {activeSource === 'uploaded' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </button>

            {activeSource === 'uploaded' && (
              <button
                onClick={async () => {
                  setDropdownOpen(false);
                  await clearUploadedData();
                }}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Clear Stored Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
