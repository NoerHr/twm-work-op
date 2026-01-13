import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface IssueReportModalProps {
  onSubmit: (reason: string, description: string, severity: string) => void;
  onClose: () => void;
}

export function IssueReportModal({ onSubmit, onClose }: IssueReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('low');

  const handleSubmit = () => {
    if (!reason || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSubmit(reason, description, severity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl text-slate-900 dark:text-white">Report Issue</h3>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Pause this task and notify the Leader
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

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
              >
                <option value="">Select issue type...</option>
                <option value="missing_info">Missing Information</option>
                <option value="technical_issue">Technical Issue</option>
                <option value="unclear_instructions">Unclear Instructions</option>
                <option value="data_error">Data Error</option>
                <option value="access_issue">Access Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Severity
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeverity('low')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
                    severity === 'low'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setSeverity('medium')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
                    severity === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setSeverity('high')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
                    severity === 'high'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>⚠️ Note:</strong> Reporting this issue will:
              </p>
              <ul className="text-xs text-amber-600 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                <li>Pause the SLA timer for this task</li>
                <li>Notify the Leader who assigned this task</li>
                <li>Move this task to "Blocked" status</li>
                <li>Require Leader action before you can resume</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}