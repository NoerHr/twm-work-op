import { useState } from 'react';
import { X, Save, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import type { TaskInstance } from '../../types/task';
import { useToast } from '../../hooks/useToast';

interface TaskExecutionModalProps {
  task: TaskInstance;
  onClose: () => void;
  onComplete: () => void;
}

export function TaskExecutionModal({ task, onClose, onComplete }: TaskExecutionModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Task Completed', 'Your work has been submitted successfully.');
      onComplete();
    } catch (error) {
      toast.error('Submission Failed', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    toast.info('Draft Saved', 'Your progress has been saved.');
  };

  const handleReject = () => {
    // Open rejection reason modal
    toast.warning('Task Rejected', 'This will trigger the rejection workflow.');
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
        className="w-full h-full max-w-7xl max-h-[90vh] flex"
      >
        {/* Split Screen Layout */}
        <div className="flex w-full gap-4">
          {/* Left Panel - Context (The Source of Truth) */}
          <div className="w-1/3">
            <GlassCard variant="frosted" className="h-full p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-white font-semibold">
                  Context Data
                </h3>
                <FileText className="w-5 h-5 text-slate-400" />
              </div>

              {/* Key-Value Grid */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Task ID
                  </label>
                  <div className="text-slate-900 dark:text-white font-mono text-sm mt-1">
                    {task.id}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Workflow
                  </label>
                  <div className="text-slate-900 dark:text-white text-sm mt-1">
                    {task.workflowName}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Project
                  </label>
                  <div className="text-slate-900 dark:text-white text-sm mt-1">
                    {task.projectName}
                  </div>
                </div>

                {/* Input Context - Fetched from Data Nodes */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                    Input Data
                  </label>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(task.inputContext, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Visual Widgets could go here */}
                <div className="pt-4">
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                    Status Indicators
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        95%
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Accuracy
                      </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        42
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Items Left
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Panel - Form (The Action Area) */}
          <div className="flex-1">
            <GlassCard variant="frosted" className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-slate-900 dark:text-white mb-1">
                      {task.formSchema.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Complete the form below to process this task
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

              {/* Form Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Dynamic Form Renderer - Based on task.formSchema */}
                <div className="space-y-6">
                  {/* Example Fields - In production, render from formSchema */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      placeholder="Enter customer name"
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Verification Status *
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="">Select status</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      rows={4}
                      placeholder="Add any notes or comments"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="secondary"
                    onClick={handleSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="danger"
                      onClick={handleReject}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}