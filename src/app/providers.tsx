import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import { TakeoutProvider } from '../context/TakeoutContext';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TakeoutProvider>
        {children}
      </TakeoutProvider>
    </QueryClientProvider>
  );
}
