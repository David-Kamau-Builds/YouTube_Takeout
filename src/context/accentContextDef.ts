import { createContext } from 'react';

export interface AccentPreset {
  id: string;
  name: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'youtube', name: 'YouTube Red', hex: '#EF4444' },
  { id: 'cupertino', name: 'Cupertino Blue', hex: '#0A84FF' },
  { id: 'vision', name: 'VisionOS Purple', hex: '#8B5CF6' },
  { id: 'emerald', name: 'Emerald Mint', hex: '#10B981' },
  { id: 'amber', name: 'Amber Gold', hex: '#F59E0B' },
  { id: 'rose', name: 'Rose Pink', hex: '#EC4899' },
  { id: 'graphite', name: 'Graphite Slate', hex: '#64748B' },
];

export interface AccentContextType {
  accentColor: string;
  setAccentColor: (hex: string) => void;
  resetAccentColor: () => void;
  presets: AccentPreset[];
}

export const AccentContext = createContext<AccentContextType | undefined>(undefined);
