import { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { TaskExecution } from '../../../store/taskStore';

interface SubmitConfirmationModalProps {
  task: TaskExecution;
  formData: Record<string, any>;
  onConfirm: () => void;
  onClose: () => void;
}

export function SubmitConfirmationModal({ task, formData, onConfirm, onClose }: SubmitConfirmationModalProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  const handleSlideStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsSliding(true);
  };

  const handleSlideMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSliding) return;

    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const progress = Math.min(Math.max((clientX - container.left) / container.width, 0), 1);
    
    setSlideProgress(progress);

    if (progress >= 0.95) {
      setIsSliding(false);
      onConfirm();
    }
  };

  const handleSlideEnd = () => {
    setIsSliding(false);
    setSlideProgress(0);
  };

  const getFieldLabel = (fieldId: string): string => {
    const field = task.formSchema.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      if (value.processed) {
        return `${value.processed.length} items processed`;
      }
      return JSON.stringify(value);
    }
    if (typeof value === 'string' && value.startsWith('data:image')) {
      return '[Image/Signature]';
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl text-slate-900 dark:text-white">Confirm Submission</h3>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Review your work before submitting
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

          {/* Task Info */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-900 dark:text-white">{task.workflowName}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{task.projectName}</Badge>
                <Badge variant="outline">{task.assignmentName}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
              <span>Assigned by {task.assignedBy.name}</span>
              {task.isBatch && (
                <>
                  <span>•</span>
                  <span>Batch: {task.batchTotal} items</span>
                </>
              )}
            </div>
          </div>

          {/* Form Data Summary */}
          <div className="mb-6">
            <h4 className="text-sm text-slate-900 dark:text-white mb-3">Submitted Data</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(formData).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
                        {getFieldLabel(key)}
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Box */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400 mb-2">
              <strong>✓ Ready to Submit</strong>
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Once submitted, this task will be marked as complete and you cannot edit it. Make sure all information is correct.
            </p>
          </div>

          {/* Slide to Submit */}
          <div
            className="relative h-14 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer select-none"
            onMouseDown={handleSlideStart}
            onMouseMove={handleSlideMove}
            onMouseUp={handleSlideEnd}
            onMouseLeave={handleSlideEnd}
            onTouchStart={handleSlideStart}
            onTouchMove={handleSlideMove}
            onTouchEnd={handleSlideEnd}
          >
            {/* Progress Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600"
              style={{ width: `${slideProgress * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Slider Button */}
            <motion.div
              className="absolute left-1 top-1 bottom-1 w-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center"
              style={{ x: `${slideProgress * (100 - 3.5)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Send className={`w-5 h-5 ${slideProgress > 0.5 ? 'text-green-500' : 'text-slate-400'}`} />
            </motion.div>

            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-sm font-medium transition-colors ${
                slideProgress > 0.5 ? 'text-white' : 'text-slate-600 dark:text-white/60'
              }`}>
                {slideProgress > 0.8 ? 'Release to Submit' : 'Slide to Submit'}
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 dark:text-white/40 mt-3">
            Slide the button to the right to confirm submission
          </p>

          {/* Alternative: Regular Button */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Task
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}