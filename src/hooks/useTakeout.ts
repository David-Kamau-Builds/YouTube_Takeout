import { useContext } from 'react';
import { TakeoutContext, type TakeoutContextType } from '../context/takeoutContextDef';

export function useTakeout(): TakeoutContextType {
  const context = useContext(TakeoutContext);
  if (!context) {
    throw new Error('useTakeout must be used within a TakeoutProvider');
  }
  return context;
}
