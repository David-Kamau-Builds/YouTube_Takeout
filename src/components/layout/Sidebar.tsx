import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Music,
  Users,
  ListVideo,
  Tv,
  MessageSquare,
  MessageCircle,
  Sparkles,
  X,
  HardDrive,
  FolderOpen,
} from 'lucide-react';
import { useTakeout } from '../../hooks/useTakeout';
import { YouTubeLogo } from '../ui/YouTubeLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, color: 'text-red-500' },
  { path: '/history', label: 'Watch History', icon: History, color: 'text-rose-500' },
  { path: '/music', label: 'Music Library', icon: Music, color: 'text-blue-500' },
  { path: '/subscriptions', label: 'Subscriptions', icon: Users, color: 'text-amber-500' },
  { path: '/playlists', label: 'Playlists', icon: ListVideo, color: 'text-emerald-500' },
  { path: '/channels', label: 'Channel Stats', icon: Tv, color: 'text-purple-500' },
  { path: '/comments', label: 'Comments', icon: MessageSquare, color: 'text-orange-500' },
  { path: '/live-chats', label: 'Live Chats', icon: MessageCircle, color: 'text-cyan-500' },
  { path: '/rewind', label: 'Yearly Rewind', icon: Sparkles, color: 'text-pink-500' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { openUploadModal, activeSource, manifest } = useTakeout();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 border-r border-black/6 dark:border-white/8 bg-white/90 dark:bg-[#111215]/90 backdrop-blur-xl transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-black/6 dark:border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <YouTubeLogo className="w-6 h-6" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-neutral-100">
                YouTube Takeout
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                Personal Analytics
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Navigation
          </div>
          {NAV_ITEMS.map(({ path, label, icon: Icon, color }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              style={({ isActive }) =>
                isActive
                  ? {
                    backgroundColor: 'var(--accent-soft)',
                    borderColor: 'var(--accent-border)',
                  }
                  : undefined
              }
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${isActive
                  ? 'text-neutral-950 dark:text-white font-semibold shadow-2xs'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900/4 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? color : 'text-neutral-400 dark:text-neutral-500 group-hover:' + color
                      }`}
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer & Storage Status */}
        <div className="p-3 border-t border-black/6 dark:border-white/8 space-y-2">
          <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-white/5 border border-black/4 dark:border-white/5">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <HardDrive className="w-3 h-3 text-neutral-400" />
                <span>IndexedDB Storage</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Local</span>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
              {manifest?.totalFilesFound
                ? `${manifest.totalFilesFound} files indexed`
                : 'No external server telemetry.'}
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              openUploadModal();
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/8 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-neutral-500" />
            <span>{activeSource === 'uploaded' ? 'Switch Archive' : 'Import Takeout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
