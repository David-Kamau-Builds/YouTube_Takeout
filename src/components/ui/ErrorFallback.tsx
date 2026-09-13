import { AlertTriangle, RefreshCw, UploadCloud } from 'lucide-react';
import { useTakeout } from '../../context/TakeoutContext';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  message,
  onRetry,
}: ErrorFallbackProps) {
  const { activeSource, openUploadModal } = useTakeout();

  const defaultMessage =
    activeSource === 'uploaded'
      ? 'Failed to read from your uploaded Takeout. Your archive may be missing this data section.'
      : 'No Takeout archive loaded. Please upload your export to view this section.';

  const displayMessage = message || defaultMessage;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
      <div className="p-3 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full w-fit mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">
        Data Loading Error
      </h3>
      <p className="text-xs text-red-700 dark:text-red-300 mb-4">{displayMessage}</p>
      
      <div className="flex items-center justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        <button
          onClick={openUploadModal}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Your Takeout</span>
        </button>
      </div>
    </div>
  );
}
