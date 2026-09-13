import { useContext } from 'react';
import { AccentContext, type AccentContextType } from '../context/accentContextDef';

export function useAccent(): AccentContextType {
  const context = useContext(AccentContext);
  if (!context) {
    throw new Error('useAccent must be used within an AccentProvider');
  }
  return context;
}
