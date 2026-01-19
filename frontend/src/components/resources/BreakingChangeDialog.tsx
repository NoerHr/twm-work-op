import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChangeAnalysis } from '../../lib/breakingChangeDetector';

interface BreakingChangeDialogProps {
  analysis: ChangeAnalysis;
  currentVersion: string;
  usedInProjects?: string[];
  onConfirm: (newVersion: string, changelog: string) => void;
  onCancel: () => void;
}

export function BreakingChangeDialog({
  analysis,
  currentVersion,
  usedInProjects = [],
  onConfirm,
  onCancel
}: BreakingChangeDialogProps) {
  const [customVersion, setCustomVersion] = useState(analysis.recommendedVersion);
  const [changelog, setChangelog] = useState('');
  const [understood, setUnderstood] = useState(false);

  const impactColor = {
    MAJOR: 'red',
    MINOR: 'yellow',
    PATCH: 'green'
  }[analysis.impactLevel];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r ${
            analysis.hasBreakingChanges
              ? 'from-red-500/10 to-orange-500/10'
              : 'from-green-500/10 to-blue-500/10'
          }`}>
            <div className="flex items-center gap-3">
              {analysis.hasBreakingChanges ? (
                <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {analysis.hasBreakingChanges ? 'Breaking Changes Detected' : 'Ready to Publish'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  {analysis.summary}
                </p>
              </div>
              <Badge variant={impactColor === 'red' ? 'destructive' : impactColor === 'yellow' ? 'warning' : 'success'} className="text-lg px-4 py-2">
                {analysis.impactLevel}
              </Badge>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Version Increment */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className={`w-5 h-5 text-${impactColor}-600 dark:text-${impactColor}-400`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Version Increment
                  </div>
                  <div className="text-xs text-slate-600 dark:text-white/60">
                    {analysis.impactLevel === 'MAJOR' && 'Breaking changes require major version bump'}
                    {analysis.impactLevel === 'MINOR' && 'New features added - minor version bump'}
                    {analysis.impactLevel === 'PATCH' && 'Bug fixes only - patch version bump'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 dark:text-white/40 mb-1">Current Version</div>
                  <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-center">
                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                      v{currentVersion}
                    </span>
                  </div>
                </div>

                <div className="text-slate-400">→</div>

                <div className="flex-1">
                  <div className="text-xs text-slate-500 dark:text-white/40 mb-1">New Version</div>
                  <input
                    type="text"
                    value={customVersion}
                    onChange={(e) => setCustomVersion(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-2 border-purple-500 rounded-lg text-center font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            {/* Breaking Changes */}
            {analysis.breakingChanges.length > 0 && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
                    Breaking Changes ({analysis.breakingChanges.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.breakingChanges.map((change, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white dark:bg-slate-900/50 rounded border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {change.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {change.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {change.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Breaking Changes */}
            {analysis.nonBreakingChanges.length > 0 && (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-bold text-green-600 dark:text-green-400">
                    Non-Breaking Changes ({analysis.nonBreakingChanges.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysis.nonBreakingChanges.map((change, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white dark:bg-slate-900/50 rounded border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {change.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {change.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {change.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact on Existing Projects */}
            {usedInProjects.length > 0 && analysis.hasBreakingChanges && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    Impact Assessment
                  </h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-white/70 mb-3">
                  This resource type is currently used in <strong>{usedInProjects.length} project(s)</strong>.
                  Breaking changes may require updates to these projects:
                </p>
                <div className="space-y-1">
                  {usedInProjects.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {project}
                    </div>
                  ))}
                  {usedInProjects.length > 5 && (
                    <div className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      ... and {usedInProjects.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Changelog */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                Changelog / Release Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Describe the changes in this version..."
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                This will be visible in version history
              </p>
            </div>

            {/* Confirmation Checkbox (for breaking changes) */}
            {analysis.hasBreakingChanges && (
              <div className="p-4 bg-red-500/5 border-2 border-red-500/20 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-1 w-5 h-5 text-red-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      I understand the impact
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      I acknowledge that this version contains breaking changes that may affect existing projects.
                      Projects using this resource type may need to be updated to work with the new version.
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-white/40">
              {analysis.hasBreakingChanges 
                ? 'Publishing will create a new major version'
                : 'Publishing will update the resource type'
              }
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={() => onConfirm(customVersion, changelog)}
                disabled={
                  !changelog.trim() || 
                  (analysis.hasBreakingChanges && !understood) ||
                  !customVersion.trim()
                }
                className={analysis.hasBreakingChanges ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {analysis.hasBreakingChanges ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Publish v{customVersion}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Publish v{customVersion}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}