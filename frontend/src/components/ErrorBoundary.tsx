import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service like Sentry)
    console.error('🔴 Error caught by ErrorBoundary:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error tracking service
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="glass-card p-8 rounded-2xl max-w-2xl w-full">
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe. 
                You can try refreshing this section or return to the home page.
              </p>

              {/* Error Details (only show in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2">
                    Show error details
                  </summary>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 text-sm">
                    <p className="font-mono text-red-800 dark:text-red-400 mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <pre className="text-xs text-red-700 dark:text-red-500 overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                          Component stack
                        </summary>
                        <pre className="text-xs text-red-700 dark:text-red-500 overflow-auto max-h-40 mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-6">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Widget-level error boundary with minimal fallback
 */
export function WidgetErrorBoundary({ children, widgetName }: { children: ReactNode; widgetName?: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="glass-card p-6 rounded-xl border border-red-500/20">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-white/60">
              Error loading {widgetName || 'widget'}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
              Try refreshing the page
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
