import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Package,
  AlertCircle,
  X,
  Loader2,
  Download
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project } from '../../../types/project';

interface ProjectCompletionModalProps {
  project: Project;
  onConfirm: (notes: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface CompletionChecklist {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export function ProjectCompletionModal({
  project,
  onConfirm,
  onClose,
  isSubmitting = false
}: ProjectCompletionModalProps) {
  const [step, setStep] = useState<'review' | 'checklist' | 'confirm'>('review');
  const [confirmationText, setConfirmationText] = useState('');
  const [notes, setNotes] = useState('');
  
  const [checklist, setChecklist] = useState<CompletionChecklist[]>([
    { id: 'resources', label: 'Release all project resources', completed: false, required: true },
    { id: 'documents', label: 'Archive all project documents', completed: false, required: true },
    { id: 'stakeholders', label: 'Notify all stakeholders', completed: false, required: true },
    { id: 'lessons', label: 'Document lessons learned', completed: false, required: false },
    { id: 'feedback', label: 'Collect team feedback', completed: false, required: false }
  ]);

  // Calculate project metrics
  const totalTasks = project.workflow?.tasks?.length || 0;
  const completedTasks = project.workflow?.tasks?.filter(t => t.status === 'done').length || 0;
  const totalBudget = project.details?.budget || 0;
  const usedBudget = Math.round(totalBudget * 0.92); // Mock calculation
  const duration = project.details?.startDate && project.details?.endDate
    ? Math.ceil((new Date(project.details.endDate).getTime() - new Date(project.details.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const teamSize = project.team?.length || 0;

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const allRequiredChecked = checklist
    .filter(item => item.required)
    .every(item => item.completed);

  const handleNext = () => {
    if (step === 'review') {
      setStep('checklist');
    } else if (step === 'checklist') {
      if (!allRequiredChecked) {
        toast.error('Please complete all required checklist items');
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('checklist');
    } else if (step === 'checklist') {
      setStep('review');
    }
  };

  const handleConfirm = () => {
    if (confirmationText.toLowerCase() !== 'complete project') {
      toast.error('Please type "COMPLETE PROJECT" to confirm');
      return;
    }
    onConfirm(notes);
  };

  const budgetVariance = ((usedBudget - totalBudget) / totalBudget) * 100;
  const isOverBudget = usedBudget > totalBudget;

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
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-slate-900 dark:text-white">
                        Complete Project
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        {project.details.name}
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

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex items-center gap-2 ${step === 'review' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'review' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-white/10'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Review</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200 dark:bg-white/10" />
                <div className={`flex items-center gap-2 ${step === 'checklist' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'checklist' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-white/10'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Checklist</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200 dark:bg-white/10" />
                <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'confirm' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-white/10'
                  }`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Confirm</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Review */}
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                        Project Summary
                      </h3>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* Duration */}
                        <GlassCard className="p-4">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {duration}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Days Duration
                          </div>
                        </GlassCard>

                        {/* Tasks */}
                        <GlassCard className="p-4">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {completedTasks}/{totalTasks}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Tasks Complete
                          </div>
                        </GlassCard>

                        {/* Budget */}
                        <GlassCard className="p-4">
                          <DollarSign className={`w-5 h-5 mb-2 ${
                            isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            ${usedBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            of ${totalBudget.toLocaleString()}
                          </div>
                        </GlassCard>

                        {/* Team */}
                        <GlassCard className="p-4">
                          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {teamSize}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Team Members
                          </div>
                        </GlassCard>
                      </div>

                      {/* Budget Analysis */}
                      <GlassCard className="p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                            Budget Analysis
                          </h4>
                          <Badge variant={isOverBudget ? 'error' : 'success'}>
                            {isOverBudget ? 'Over Budget' : 'Under Budget'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-white/60">Allocated:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              ${totalBudget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-white/60">Used:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              ${usedBudget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-white/60">Variance:</span>
                            <span className={`font-medium ${
                              isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isOverBudget ? '+' : ''}{budgetVariance.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverBudget
                                ? 'bg-gradient-to-r from-red-500 to-orange-600'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                            }`}
                            style={{ width: `${Math.min((usedBudget / totalBudget) * 100, 100)}%` }}
                          />
                        </div>
                      </GlassCard>

                      {/* Quality Metrics */}
                      <GlassCard className="p-4">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                          Quality Metrics
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-white/60">
                              Task Completion Rate
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-white/60">
                              On-Time Delivery
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              95%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-white/60">
                              Stakeholder Satisfaction
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              4.8/5.0
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Checklist */}
                {step === 'checklist' && (
                  <motion.div
                    key="checklist"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Completion Checklist
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                        Complete all required items before finalizing the project
                      </p>

                      <div className="space-y-3">
                        {checklist.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className="w-full"
                          >
                            <GlassCard
                              className={`p-4 transition-all ${
                                item.completed
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'hover:bg-white/80 dark:hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    item.completed
                                      ? 'bg-green-500 text-white'
                                      : 'bg-slate-200 dark:bg-white/10'
                                  }`}
                                >
                                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                      {item.label}
                                    </span>
                                    {item.required && (
                                      <Badge variant="error" size="sm">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </GlassCard>
                          </button>
                        ))}
                      </div>

                      {!allRequiredChecked && (
                        <GlassCard className="mt-4 p-4 bg-yellow-500/10 border-yellow-500/30">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                              Please complete all required checklist items before proceeding
                            </div>
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Final Confirmation
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                        This action will archive the project and cannot be undone
                      </p>

                      <GlassCard className="p-4 bg-red-500/10 border-red-500/30 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-700 dark:text-red-300">
                            <strong>Warning:</strong> Completing this project will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Change project status to "Completed"</li>
                              <li>Make the project read-only</li>
                              <li>Release all allocated resources</li>
                              <li>Generate final report and archive documents</li>
                            </ul>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Notes */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Completion Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any final notes or comments about the project..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Confirmation Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Type <strong>"COMPLETE PROJECT"</strong> to confirm
                        </label>
                        <input
                          type="text"
                          value={confirmationText}
                          onChange={(e) => setConfirmationText(e.target.value)}
                          placeholder="COMPLETE PROJECT"
                          className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  {step !== 'review' && (
                    <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  {step !== 'confirm' ? (
                    <Button
                      onClick={handleNext}
                      disabled={isSubmitting || (step === 'checklist' && !allRequiredChecked)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={
                        isSubmitting ||
                        confirmationText.toLowerCase() !== 'complete project'
                      }
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Project
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}