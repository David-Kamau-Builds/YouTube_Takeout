import { createContext } from 'react';
import type { ActiveSource, TakeoutManifest } from '../types/takeout';

export interface TakeoutContextType {
  activeSource: ActiveSource;
  isInitialLoading: boolean;
  isExtracting: boolean;
  progress: number;
  statusMessage: string;
  manifest: TakeoutManifest | null;
  uploadError: string | null;
  isUploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
  clearUploadedData: () => Promise<void>;
}

export const TakeoutContext = createContext<TakeoutContextType | undefined>(undefined);
