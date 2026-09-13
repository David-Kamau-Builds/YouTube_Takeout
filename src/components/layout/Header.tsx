import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { DatasetStatusBadge } from '../takeout/DatasetStatusBadge';

const ROUTE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/history': 'Watch History',
  '/music': 'Music Hub',
  '/subscriptions': 'Subscriptions',
  '/playlists': 'Playlists',
  '/channels': 'Channel Profile',
  '/comments': 'Comments',
  '/live-chats': 'Live Chats',
  '/rewind': 'Yearly Rewind',
};

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const location = useLocation();
  const title = ROUTE_NAMES[location.pathname] || 'Takeout Analytics';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          type="button"
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <DatasetStatusBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
