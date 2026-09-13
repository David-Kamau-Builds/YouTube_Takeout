import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { HistoryPage } from '../features/history/HistoryPage';
import { MusicPage } from '../features/music/MusicPage';
import { SubscriptionsPage } from '../features/subscriptions/SubscriptionsPage';
import { PlaylistsPage } from '../features/playlists/PlaylistsPage';
import { ChannelsPage } from '../features/channels/ChannelsPage';
import { CommentsPage } from '../features/comments/CommentsPage';
import { LiveChatsPage } from '../features/live-chats/LiveChatsPage';
import { RewindPage } from '../features/rewind/RewindPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'music', element: <MusicPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'channels', element: <ChannelsPage /> },
      { path: 'comments', element: <CommentsPage /> },
      { path: 'live-chats', element: <LiveChatsPage /> },
      { path: 'rewind', element: <RewindPage /> },
    ],
  },
]);
