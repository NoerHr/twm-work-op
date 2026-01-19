import { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Database } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';

interface ContextPanelProps {
  inputContext: Record<string, any>;
  showRawData: boolean;
  onToggleRawData: () => void;
}

export function ContextPanel({ inputContext, showRawData, onToggleRawData }: ContextPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyValue = (key: string, value: any) => {
    const textValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textValue);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <GlassCard className="p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="text-slate-900 dark:text-white">Context Data</h3>
        </div>
        
        <Button
          variant="outline"
          onClick={onToggleRawData}
          className="text-xs"
        >
          {showRawData ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Hide Raw
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Raw JSON
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-600 dark:text-white/60 mb-4">
        Read-only data fetched from workflow data sources
      </p>

      {/* Raw JSON View */}
      {showRawData ? (
        <div className="space-y-3">
          <div className="relative">
            <pre className="p-4 bg-slate-900 dark:bg-black/50 rounded-lg text-xs text-green-400 overflow-x-auto max-h-96 overflow-y-auto font-mono">
              {JSON.stringify(inputContext, null, 2)}
            </pre>
            <button
              onClick={() => handleCopyValue('raw', inputContext)}
              className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copiedKey === 'raw' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Key-Value Grid */
        <div className="space-y-3">
          {Object.entries(inputContext).map(([key, value]) => (
            <div
              key={key}
              className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 dark:text-white/60 mb-1 uppercase tracking-wide">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white break-words">
                    {formatValue(value)}
                  </p>
                </div>
                
                <button
                  onClick={() => handleCopyValue(key, value)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copiedKey === key ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          <strong>💡 Tip:</strong> This data comes from workflow Data Nodes. You can copy values to use in the form.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-white/60">
          <span>Data Fields</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {Object.keys(inputContext).length}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
