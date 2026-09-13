import { useState } from 'react';
import {
  ExternalLink,
  FileText,
  FileCode2,
} from 'lucide-react';

export function TakeoutGuide() {
  const [activeTab, setActiveTab] = useState<'steps' | 'schema'>('steps');

  return (
    <div className="rounded-2xl bg-white dark:bg-[#121316] border border-black/8 dark:border-white/8 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-black/6 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/70 dark:bg-white/[0.02]">
        <div>
          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
            Export Guide &amp; Expected Schema
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            How to export your YouTube archive from Google Takeout
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Apple-style Segmented Control */}
          <div className="inline-flex p-0.5 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/80 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('steps')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'steps'
                ? 'bg-white dark:bg-[#1c1d22] text-neutral-950 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              Export Steps
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeTab === 'schema'
                ? 'bg-white dark:bg-[#1c1d22] text-neutral-950 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              Expected Files
            </button>
          </div>

          <a
            href="https://takeout.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <span>takeout.google.com</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Tab 1: 4 Linear Steps */}
      {activeTab === 'steps' ? (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/6 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold flex items-center justify-center">
                  1
                </div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Deselect all products
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Open <span className="font-medium text-neutral-700 dark:text-neutral-300">takeout.google.com</span> and click <span className="font-medium text-neutral-800 dark:text-neutral-200">"Deselect all"</span> so you don't export Drive or Photos files.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/6 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold flex items-center justify-center">
                  2
                </div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Select YouTube
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Scroll down and check <span className="font-medium text-neutral-800 dark:text-neutral-200">"YouTube and YouTube Music"</span>. Keep all sub-items selected.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/6 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold flex items-center justify-center">
                  3
                </div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  HTML or JSON format
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Google exports history as HTML by default. Both <span className="font-mono text-neutral-700 dark:text-neutral-300">.html</span> and <span className="font-mono text-neutral-700 dark:text-neutral-300">.json</span> files are supported automatically.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/6 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-semibold flex items-center justify-center">
                  4
                </div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Export &amp; download
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Click <span className="font-medium text-neutral-800 dark:text-neutral-200">"Next step"</span>, choose <span className="font-mono text-neutral-700 dark:text-neutral-300">.zip</span> delivery, and download the archive once emailed.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Tab 2: Expected File Schema */
        <div className="p-4 sm:p-5 space-y-3">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
            Your Google Takeout archive extracts into <code className="font-mono text-neutral-700 dark:text-neutral-300">Takeout/YouTube and YouTube Music/</code> containing these files:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileCode2 className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">history/watch-history.json</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-sans shrink-0 ml-1">
                or .html
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">subscriptions/subscriptions.csv</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans shrink-0 ml-1">CSV</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">playlists/playlists.csv</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans shrink-0 ml-1">CSV</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">music/music library songs.csv</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans shrink-0 ml-1">CSV</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">comments/comments.csv</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans shrink-0 ml-1">CSV</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-800 dark:text-neutral-200 truncate">live-chats/live chats.csv</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans shrink-0 ml-1">CSV</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
