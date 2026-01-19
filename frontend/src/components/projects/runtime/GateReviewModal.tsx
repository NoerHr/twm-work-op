import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner@2.0.3';
import type { Stage, Task } from '../../../types/project';

interface GateReviewModalProps {
  stage: Stage;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  budgetUsed: number;
  budgetAllocated: number;
  deliverables: string[];
  onApprove: (comments: string) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function GateReviewModal({
  stage,
  tasks,
  completedTasks,
  totalTasks,
  budgetUsed,
  budgetAllocated,
  deliverables,
  onApprove,
  onReject,
  onClose,
  isSubmitting = false
}: GateReviewModalProps) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const budgetRate = budgetAllocated > 0 ? (budgetUsed / budgetAllocated) * 100 : 0;
  const isOverBudget = budgetUsed > budgetAllocated;

  const handleDecision = (type: 'approve' | 'reject') => {
    setDecision(type);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (decision === 'approve') {
      onApprove(comments);
    } else if (decision === 'reject') {
      if (!comments.trim()) {
        toast.error('Rejection reason is required');
        return;
      }
      onReject(comments);
    }
  };

  const canApprove = completionRate === 100 && deliverables.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden"
        >
          <GlassCard className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-slate-900 dark:text-white">
                        Gate Review Required
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        {stage.name}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Badge variant={completionRate === 100 ? 'success' : 'warning'}>
                  {completionRate.toFixed(0)}% Complete
                </Badge>
                <Badge variant={isOverBudget ? 'error' : 'default'}>
                  {budgetRate.toFixed(0)}% Budget Used
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                  <Clock className="w-4 h-4" />
                  Review Deadline: 2 days
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stage Summary */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Stage Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Tasks */}
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Tasks
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {completedTasks}/{totalTasks}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {completionRate.toFixed(0)}% completed
                    </div>
                    <div className="mt-3 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </GlassCard>

                  {/* Budget */}
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Budget
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      ${budgetUsed.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      of ${budgetAllocated.toLocaleString()}
                    </div>
                    <div className="mt-3 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isOverBudget
                            ? 'bg-gradient-to-r from-red-500 to-orange-600'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        style={{ width: `${Math.min(budgetRate, 100)}%` }}
                      />
                    </div>
                  </GlassCard>

                  {/* Deliverables */}
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Deliverables
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {deliverables.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      items submitted
                    </div>
                  </GlassCard>
                </div>
              </div>

              {/* Completed Tasks List */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Completed Tasks ({completedTasks})
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((task) => task.status === 'done')
                    .slice(0, 5)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {task.title}
                            </div>
                            {task.assignedTo && (
                              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                                <img
                                  src={task.assignedTo.avatar}
                                  alt={task.assignedTo.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                {task.assignedTo.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="success" size="sm">
                          Done
                        </Badge>
                      </div>
                    ))}
                  {completedTasks > 5 && (
                    <div className="text-xs text-center text-slate-600 dark:text-white/60 py-2">
                      +{completedTasks - 5} more tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverables */}
              {deliverables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                    Deliverables
                  </h3>
                  <div className="space-y-2">
                    {deliverables.map((deliverable, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                      >
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {deliverable}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {(isOverBudget || completionRate < 100) && (
                <GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        Review Warnings
                      </div>
                      <ul className="text-yellow-700 dark:text-yellow-400 space-y-1">
                        {isOverBudget && (
                          <li>
                            • Budget exceeded by ${(budgetUsed - budgetAllocated).toLocaleString()}
                          </li>
                        )}
                        {completionRate < 100 && (
                          <li>• {totalTasks - completedTasks} task(s) still pending</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Review Comments {decision === 'reject' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    decision === 'reject'
                      ? 'Please provide reason for rejection...'
                      : 'Add review comments (optional)...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10">
              {!showConfirmation ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-white/60">
                    {canApprove ? (
                      <span className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Stage ready for approval
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                        <AlertTriangle className="w-4 h-4" />
                        Review warnings present
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleDecision('reject')}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Stage
                    </Button>
                    <Button
                      onClick={() => handleDecision('approve')}
                      disabled={isSubmitting || !canApprove}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Transition
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <GlassCard
                    className={`p-4 ${
                      decision === 'approve'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {decision === 'approve' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white mb-1">
                          {decision === 'approve'
                            ? 'Confirm Stage Approval'
                            : 'Confirm Stage Rejection'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-white/60">
                          {decision === 'approve'
                            ? 'The project will proceed to the next stage. This action cannot be undone.'
                            : 'The stage will be sent back for revision. PM will be notified.'}
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConfirmation(false);
                        setDecision(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className={
                        decision === 'approve'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {decision === 'approve' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirm Approval
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Confirm Rejection
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}