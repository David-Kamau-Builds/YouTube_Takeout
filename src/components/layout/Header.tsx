import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccentColorPicker } from './AccentColorPicker';
import { DatasetStatusBadge } from '../takeout/DatasetStatusBadge';
import { YouTubeLogo } from '../ui/YouTubeLogo';

const ROUTE_NAMES: Record<string, string> = {
  '/': 'Overview',
  '/history': 'Watch History',
  '/music': 'Music Library',
  '/subscriptions': 'Subscriptions',
  '/playlists': 'Playlists',
  '/channels': 'Channel Stats',
  '/comments': 'Comments',
  '/live-chats': 'Live Chats',
  '/rewind': 'Yearly Rewind',
};

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const location = useLocation();
  const activeTitle = ROUTE_NAMES[location.pathname] || 'Analytics';

  useEffect(() => {
    document.title = `${activeTitle} • YouTube Takeout Visualizer`;
  }, [activeTitle]);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-black/6 dark:border-white/8 bg-white/80 dark:bg-[#0d0e11]/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          type="button"
          className="lg:hidden p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Minimalist Apple/Google Breadcrumb with authentic logo */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <YouTubeLogo className="w-5 h-5 shrink-0" />
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline font-medium">
              YouTube Takeout
            </span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">/</span>
          <span className="font-semibold text-neutral-900 dark:text-white tracking-tight text-sm">
            {activeTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DatasetStatusBadge />
        <AccentColorPicker />
        <ThemeToggle />
      </div>
    </header>
  );
}
