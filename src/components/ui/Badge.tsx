import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'blue' | 'emerald' | 'amber' | 'slate' | 'purple';
  size?: 'sm' | 'md';
}

const VARIANTS = {
  red: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
};

export function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${VARIANTS[variant]} ${sizeClasses}`}
    >
      {children}
    </span>
  );
}
