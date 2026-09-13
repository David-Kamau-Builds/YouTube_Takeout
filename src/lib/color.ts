import type { CSSProperties } from 'react';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
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

export function getHeatmapCellStyle(
  count: number,
  maxCount: number,
  accentColor: string,
  isDark: boolean
): { style: CSSProperties; className: string } {
  if (count === 0) {
    return {
      style: {},
      className: isDark
        ? 'bg-white/5 hover:bg-white/10 text-transparent'
        : 'bg-neutral-100/80 hover:bg-neutral-200/80 text-transparent',
    };
  }

  const { r, g, b } = hexToRgb(accentColor);
  const ratio = count / (maxCount || 1);

  if (ratio < 0.25) {
    return {
      style: {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${isDark ? 0.22 : 0.18})`,
        color: isDark
          ? 'rgba(255, 255, 255, 0.9)'
          : `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 1)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
      },
      className: 'border font-medium',
    };
  }

  if (ratio < 0.5) {
    return {
      style: {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${isDark ? 0.45 : 0.45})`,
        color: '#FFFFFF',
      },
      className: 'font-semibold',
    };
  }

  if (ratio < 0.75) {
    return {
      style: {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${isDark ? 0.75 : 0.75})`,
        color: '#FFFFFF',
      },
      className: 'font-semibold shadow-xs',
    };
  }

  return {
    style: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 1.0)`,
      color: '#FFFFFF',
    },
    className: 'font-bold shadow-xs',
  };
}
