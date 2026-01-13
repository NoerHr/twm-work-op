import { X, Calendar, User, Tag, Clock, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { TaskInstance } from '../../types/task';

interface TaskPreviewModalProps {
  task: TaskInstance;
  onClose: () => void;
  onStart?: () => void;
  isLocked?: boolean;
}

export function TaskPreviewModal({ task, onClose, onStart, isLocked }: TaskPreviewModalProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const priorityColors = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    high: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <GlassCard variant="frosted" className="overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  {task.isBatch && (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Batch: {task.batchSize} items
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-600 dark:text-slate-400">
                      Locked
                    </Badge>
                  )}
                </div>
                <h2 className="text-slate-900 dark:text-white mb-1">
                  {task.workflowName}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {task.projectName}
                  {task.assignmentName && ` • ${task.assignmentName}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  Scheduled
                </div>
                <div className="text-slate-900 dark:text-white">
                  {formatDate(task.scheduledDate)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Clock className="w-4 h-4" />
                  Due Date
                </div>
                <div className={`font-medium ${
                  task.status === 'overdue' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {formatDate(task.dueDate)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <User className="w-4 h-4" />
                  Assigned To
                </div>
                <div className="text-slate-900 dark:text-white">
                  {task.assigneeName}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Tag className="w-4 h-4" />
                  Status
                </div>
                <div className="text-slate-900 dark:text-white capitalize">
                  {task.status.replace('-', ' ')}
                </div>
              </div>
            </div>

            {/* Form Preview */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                <FileText className="w-4 h-4" />
                Form Fields ({task.formSchema.fields.length})
              </div>
              <div className="space-y-2">
                {task.formSchema.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900 dark:text-white">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Context Preview */}
            {Object.keys(task.inputContext).length > 0 && (
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Context Data
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                    {JSON.stringify(task.inputContext, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Created {formatDate(task.createdAt)}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {onStart && !isLocked && (
                <Button variant="primary" onClick={onStart}>
                  Start Task
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}