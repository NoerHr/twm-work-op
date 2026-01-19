import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, category: string) => void;
  taskName: string;
}

export function RejectionReasonModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  taskName 
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'incomplete-data', label: 'Incomplete Data' },
    { value: 'incorrect-info', label: 'Incorrect Information' },
    { value: 'missing-docs', label: 'Missing Documents' },
    { value: 'requires-review', label: 'Requires Further Review' },
    { value: 'policy-violation', label: 'Policy Violation' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!reason.trim() || !category) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onConfirm(reason, category);
    setIsSubmitting(false);
    
    // Reset form
    setReason('');
    setCategory('');
  };

  const handleCancel = () => {
    setReason('');
    setCategory('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-[60] flex items-center justify-center p-6"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <GlassCard variant="frosted" className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 dark:text-white mb-1">
                Reject Task
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Provide a reason for rejecting "{taskName}"
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Rejection Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Detailed Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this task is being rejected..."
                rows={5}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-500 resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum 10 characters required
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {reason.length} / 500
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> This will trigger the rejection workflow path and notify relevant parties.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={!reason.trim() || reason.length < 10 || !category || isSubmitting}
              loading={isSubmitting}
            >
              Confirm Rejection
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}