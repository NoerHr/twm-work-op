import { CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { ResourceType } from '../../../types/resource';

interface VersionsTabProps {
  resourceType: Partial<ResourceType>;
  onPublish: () => void;
  onValidate: () => void;
}

export function VersionsTab({ resourceType, onPublish, onValidate }: VersionsTabProps) {
  const hasErrors = resourceType.validationErrors && resourceType.validationErrors.some(e => e.type === 'error');
  const hasWarnings = resourceType.validationErrors && resourceType.validationErrors.some(e => e.type === 'warning');

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <GlassCard className="p-6">
        <h2 className="text-slate-900 dark:text-white mb-6">Publishing Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Status */}
          <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {resourceType.status === 'published' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : resourceType.status === 'validated' ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-sm text-slate-600 dark:text-white/60">Status</span>
            </div>
            <div className="text-lg text-slate-900 dark:text-white capitalize">
              {resourceType.status || 'Draft'}
            </div>
          </div>

          {/* Version */}
          <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-600 dark:text-white/60">Version</span>
            </div>
            <div className="text-lg text-slate-900 dark:text-white">
              v{resourceType.version || '1.0.0'}
            </div>
          </div>

          {/* Validation */}
          <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {hasErrors ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : hasWarnings ? (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              <span className="text-sm text-slate-600 dark:text-white/60">Validation</span>
            </div>
            <div className="text-lg text-slate-900 dark:text-white">
              {hasErrors ? 'Has Errors' : hasWarnings ? 'Has Warnings' : 'Passed'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={onValidate} variant="outline" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Validate
          </Button>
          {resourceType.status === 'validated' && (
            <Button onClick={onPublish} className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Publish v{resourceType.version}
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Validation Report */}
      {resourceType.validationErrors && resourceType.validationErrors.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-slate-900 dark:text-white mb-4">Validation Report</h3>
          <div className="space-y-2">
            {resourceType.validationErrors.map((error, index) => (
              <div
                key={index}
                className={`
                  p-3 rounded-lg border
                  ${error.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      error.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-white mb-1">
                      {error.message}
                    </div>
                    {error.location && (
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Location: {error.location}
                      </div>
                    )}
                  </div>
                  <Badge variant={error.type === 'error' ? 'destructive' : 'warning'} className="text-xs">
                    {error.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Version History */}
      <GlassCard className="p-6">
        <h3 className="text-slate-900 dark:text-white mb-4">Version History</h3>
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg">
          <Clock className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-white/60">
            Version history will appear here after publishing
          </p>
        </div>
      </GlassCard>

      {/* Publishing Guidelines */}
      <GlassCard className="p-6 bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-blue-400 mb-3">Publishing Guidelines</h3>
        <ul className="text-sm text-slate-600 dark:text-white/60 space-y-2">
          <li>• Ensure all required fields are configured in the schema</li>
          <li>• Test operations using the simulation tool</li>
          <li>• Review validation errors before publishing</li>
          <li>• Once published, the schema becomes immutable for existing instances</li>
          <li>• Create a new version to make breaking changes</li>
        </ul>
      </GlassCard>
    </div>
  );
}
