import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useTakeout } from '../hooks/useTakeout';
import { UploadGatePage } from '../features/upload/UploadGatePage';
import { TakeoutUploadModal } from '../components/takeout/TakeoutUploadModal';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeSource, isInitialLoading } = useTakeout();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#0d0e11] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mb-3" />
        <div className="text-xs font-medium text-neutral-500 tracking-wide uppercase">
          Initializing Local Database...
        </div>
      </div>
    );
  }

  if (activeSource === 'none') {
    return (
      <>
        <UploadGatePage />
        <TakeoutUploadModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#0d0e11] text-neutral-900 dark:text-neutral-100 flex">
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <TakeoutUploadModal />
    </div>
  );
}
