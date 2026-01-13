import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-500`} />
      {text && (
        <p className={`text-slate-600 dark:text-white/60 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Page-level loading component
 */
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Card-level loading skeleton
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card p-6 rounded-xl animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table-level loading skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card p-6 rounded-xl animate-pulse">
      <div className="space-y-3">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-300 dark:bg-slate-700 rounded" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Widget-level loading skeleton
 */
export function WidgetSkeleton() {
  return (
    <div className="glass-card p-6 rounded-xl animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3" />
      </div>
    </div>
  );
}

/**
 * List item loading skeleton
 */
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 glass-card rounded-lg animate-pulse">
          <div className="h-10 w-10 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      ))}
    </>
  );
}
