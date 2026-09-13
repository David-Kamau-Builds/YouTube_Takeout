import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useAccent } from '../../hooks/useAccent';
import { Palette, Check, RotateCcw, Pipette } from 'lucide-react';

export function AccentColorPicker() {
  const { accentColor, setAccentColor, resetAccentColor, presets } = useAccent();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customInputHex, setCustomInputHex] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayHex = customInputHex ?? accentColor;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setCustomInputHex(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = `#${val}`;
    setCustomInputHex(val);
    if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
      setAccentColor(val);
    }
  };

  const handleNativeColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputHex(null);
    setAccentColor(val);
  };

  const handleSelectPreset = (hex: string) => {
    setCustomInputHex(null);
    setAccentColor(hex);
  };

  const handleReset = () => {
    setCustomInputHex(null);
    resetAccentColor();
  };

  const isDefault = accentColor.toUpperCase() === '#EF4444';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        type="button"
        className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-full border border-black/5 dark:border-white/10 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
        aria-label="Customize accent color"
        title="Customize accent color"
      >
        <Palette className="w-3.5 h-3.5" />
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs border border-black/10 dark:border-white/20 transition-transform duration-150"
          style={{ backgroundColor: accentColor }}
        />
      </button>

      {/* Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3.5 bg-white dark:bg-[#16181d] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Header & Presets */}
          <div className="pb-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-0.5">
              <span>Accent Color</span>
              <span className="font-mono">{accentColor.toUpperCase()}</span>
            </div>

            {/* Presets Grid */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {presets.map((preset) => {
                const isSelected = preset.hex.toUpperCase() === accentColor.toUpperCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.hex)}
                    className="relative w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-sm stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Wheel & Hex */}
          <div className="py-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-0.5">
              Custom Palette
            </div>

            <div className="flex items-center gap-2">
              {/* Native color wheel picker input hidden under styled button */}
              <label
                className="relative w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 overflow-hidden shadow-2xs"
                style={{ backgroundColor: displayHex }}
                title="Open color wheel"
              >
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/i.test(displayHex) ? displayHex : accentColor}
                  onChange={handleNativeColorChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <Pipette className="w-3.5 h-3.5 text-white mix-blend-difference drop-shadow-sm pointer-events-none" />
              </label>

              {/* Hex Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={displayHex}
                  onChange={handleHexChange}
                  maxLength={7}
                  placeholder="#EF4444"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          {/* Footer Reset */}
          {!isDefault && (
            <div className="pt-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to YouTube Red</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
