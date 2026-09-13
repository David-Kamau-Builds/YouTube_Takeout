import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AccentContext, ACCENT_PRESETS } from './accentContextDef';

const STORAGE_KEY = 'yt_takeout_accent';
const DEFAULT_ACCENT = '#EF4444';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    return { r: 239, g: 68, b: 68 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function applyAccentToDocument(hex: string) {
  if (typeof document === 'undefined') return;
  const { r, g, b } = hexToRgb(hex);
  const root = document.documentElement;

  root.style.setProperty('--accent-color', hex);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty('--accent-hover', `rgba(${r}, ${g}, ${b}, 0.18)`);
  root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.28)`);
  root.style.setProperty('--accent-ring', `rgba(${r}, ${g}, ${b}, 0.35)`);
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && /^#[0-9A-Fa-f]{6}$/i.test(saved) ? saved : DEFAULT_ACCENT;
    } catch {
      return DEFAULT_ACCENT;
    }
  });

  useEffect(() => {
    applyAccentToDocument(accentColor);
  }, [accentColor]);

  const setAccentColor = useCallback((hex: string) => {
    const sanitized = hex.startsWith('#') ? hex : `#${hex}`;
    setAccentColorState(sanitized);
    try {
      localStorage.setItem(STORAGE_KEY, sanitized);
    } catch {
      // Ignored if storage full/blocked
    }
  }, []);

  const resetAccentColor = useCallback(() => {
    setAccentColor(DEFAULT_ACCENT);
  }, [setAccentColor]);

  return (
    <AccentContext.Provider
      value={{
        accentColor,
        setAccentColor,
        resetAccentColor,
        presets: ACCENT_PRESETS,
      }}
    >
      {children}
    </AccentContext.Provider>
  );
}
