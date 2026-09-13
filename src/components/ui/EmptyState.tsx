import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'No matching data was found for the selected filters.',
}: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 rounded-full w-fit mx-auto mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
}
