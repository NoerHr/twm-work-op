import { motion } from 'motion/react';
import { X, AlertTriangle, Users, Split, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { AllocationConflict } from '../../types/resource';

interface ConflictResolutionModalProps {
  conflict: AllocationConflict;
  onResolve: (resolution: 'swap' | 'split' | 'overbook') => void;
  onClose: () => void;
}

export function ConflictResolutionModal({ conflict, onResolve, onClose }: ConflictResolutionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white mb-1">Resource Allocation Conflict</h2>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  {conflict.resourceName} is overbooked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Conflict Details */}
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-900 dark:text-white">Total Utilization</span>
              <Badge variant="destructive">{conflict.totalUtilization}%</Badge>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                style={{ width: `${Math.min(conflict.totalUtilization, 100)}%` }}
              />
            </div>
            <p className="text-xs text-red-400 mt-2">
              Warning: Resource is overbooked by {conflict.totalUtilization - 100}%
            </p>
          </div>

          {/* Conflicting Allocations */}
          <div className="mb-6">
            <h3 className="text-sm text-slate-600 dark:text-white/60 mb-3">Conflicting Allocations:</h3>
            <div className="space-y-2">
              {conflict.conflictingAllocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-900 dark:text-white mb-1">
                        {allocation.projectName}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">{allocation.utilizationPercent}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Options */}
          <div className="mb-6">
            <h3 className="text-sm text-slate-600 dark:text-white/60 mb-3">Suggested Resolutions:</h3>
            <div className="space-y-3">
              {conflict.suggestedResolutions.map((resolution) => (
                <button
                  key={resolution.type}
                  onClick={() => onResolve(resolution.type)}
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-white/10 hover:border-purple-500 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      {resolution.type === 'swap' && <Users className="w-5 h-5 text-purple-400" />}
                      {resolution.type === 'split' && <Split className="w-5 h-5 text-purple-400" />}
                      {resolution.type === 'overbook' && <AlertCircle className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-900 dark:text-white mb-1 capitalize">
                        {resolution.type}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {resolution.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}