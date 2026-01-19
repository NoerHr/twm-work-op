import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner@2.0.3';
import type { Stage, Assignment } from '../../../types/project';

interface ChangeManagementModalProps {
  type: 'stage' | 'assignment';
  existingStages?: Stage[];
  onSubmit: (changeRequest: ChangeRequest) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface ChangeRequest {
  type: 'stage' | 'assignment';
  name: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  assignedTo?: string;
  parentStageId?: string;
  reason: string;
}

export function ChangeManagementModal({
  type,
  existingStages = [],
  onSubmit,
  onClose,
  isSubmitting = false
}: ChangeManagementModalProps) {
  const [formData, setFormData] = useState<ChangeRequest>({
    type,
    name: '',
    description: '',
    startDate: undefined,
    endDate: undefined,
    budget: undefined,
    assignedTo: undefined,
    parentStageId: existingStages[0]?.id,
    reason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Change reason is required';
    }

    if (type === 'stage') {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (type === 'assignment' && !formData.parentStageId) {
      newErrors.parentStageId = 'Stage selection is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const updateField = (field: keyof ChangeRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl m-4"
        >
          <GlassCard className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-slate-900 dark:text-white">
                        Request {type === 'stage' ? 'Stage' : 'Assignment'} Addition
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        Requires BOD approval
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

              <GlassCard className="mt-4 p-4 bg-blue-500/10 border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Change Management Process:</strong> This request will be sent to the
                    Board of Directors for review. The project timeline may be affected. All
                    stakeholders will be notified.
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {type === 'stage' ? 'Stage' : 'Assignment'} Name
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={
                    type === 'stage'
                      ? 'e.g., Additional Testing Phase'
                      : 'e.g., Security Audit'
                  }
                  className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Description
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide detailed description of what needs to be done..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Stage-specific fields */}
              {type === 'stage' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Start Date
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={
                            formData.startDate
                              ? formData.startDate.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            updateField('startDate', new Date(e.target.value))
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        End Date
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={
                            formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''
                          }
                          onChange={(e) => updateField('endDate', new Date(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Budget Estimate
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.budget || ''}
                        onChange={(e) => updateField('budget', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        step="1000"
                        className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Assignment-specific fields */}
              {type === 'assignment' && (
                <>
                  {/* Parent Stage */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Parent Stage
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.parentStageId || ''}
                      onChange={(e) => updateField('parentStageId', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a stage</option>
                      {existingStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    {errors.parentStageId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.parentStageId}
                      </p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Assign To (Leader)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.assignedTo || ''}
                        onChange={(e) => updateField('assignedTo', e.target.value)}
                        placeholder="Search for team member..."
                        className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Change Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Reason for Change
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => updateField('reason', e.target.value)}
                  placeholder="Explain why this change is necessary and how it impacts the project..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  disabled={isSubmitting}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                )}
              </div>

              {/* Impact Warning */}
              <GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      Potential Impact
                    </div>
                    <ul className="text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Project timeline may be extended</li>
                      <li>• Budget allocation may need revision</li>
                      <li>• Team assignments may be affected</li>
                      <li>• Requires BOD approval before activation</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-white/60">
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  BOD will be notified for review
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Change Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}