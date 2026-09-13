import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import { TakeoutProvider } from '../context/TakeoutContext';
import { AccentProvider } from '../context/AccentContext';
import { queryClient } from '../lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AccentProvider>
        <TakeoutProvider>
          {children}
        </TakeoutProvider>
      </AccentProvider>
    </QueryClientProvider>
  );
}
