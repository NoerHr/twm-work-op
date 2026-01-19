import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  X,
  GitBranch,
  Code,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface ConditionEditorModalProps {
  edgeId: string;
  onClose: () => void;
}

const CONDITION_TEMPLATES = [
  {
    id: 'approval-approved',
    label: 'Approved',
    condition: 'approval.status == "approved"',
    icon: CheckCircle2,
    color: 'text-green-500'
  },
  {
    id: 'approval-rejected',
    label: 'Rejected',
    condition: 'approval.status == "rejected"',
    icon: XCircle,
    color: 'text-red-500'
  },
  {
    id: 'approval-rework',
    label: 'Needs Rework',
    condition: 'approval.status == "rework"',
    icon: AlertTriangle,
    color: 'text-amber-500'
  },
  {
    id: 'quality-high',
    label: 'Quality > 80%',
    condition: 'quality.score > 80',
    icon: CheckCircle2,
    color: 'text-green-500'
  },
  {
    id: 'quality-low',
    label: 'Quality < 60%',
    condition: 'quality.score < 60',
    icon: XCircle,
    color: 'text-red-500'
  },
  {
    id: 'budget-ok',
    label: 'Budget OK',
    condition: 'budget.variance <= 10',
    icon: CheckCircle2,
    color: 'text-green-500'
  },
  {
    id: 'budget-over',
    label: 'Over Budget',
    condition: 'budget.variance > 10',
    icon: AlertTriangle,
    color: 'text-amber-500'
  }
];

export function ConditionEditorModal({ edgeId, onClose }: ConditionEditorModalProps) {
  const { getEdge, setEdgeCondition, deleteEdge } = useWorkflowStore();
  const edge = getEdge(edgeId);
  
  const [conditionLabel, setConditionLabel] = useState(edge?.conditionLabel || '');
  const [condition, setCondition] = useState(edge?.condition || '');
  const [useTemplate, setUseTemplate] = useState(true);

  if (!edge) {
    onClose();
    return null;
  }

  const handleSave = () => {
    if (!conditionLabel.trim()) {
      toast.error('Condition label is required');
      return;
    }

    if (!condition.trim()) {
      toast.error('Condition expression is required');
      return;
    }

    setEdgeCondition(edgeId, condition.trim(), conditionLabel.trim());
    toast.success('Condition saved successfully');
    onClose();
  };

  const handleTemplateSelect = (template: typeof CONDITION_TEMPLATES[0]) => {
    setConditionLabel(template.label);
    setCondition(template.condition);
  };

  const handleRemoveCondition = () => {
    if (confirm('Remove condition and convert to standard dependency?')) {
      setEdgeCondition(edgeId, '', '');
      toast.success('Condition removed');
      onClose();
    }
  };

  const handleDeleteEdge = () => {
    if (confirm('Delete this dependency?')) {
      deleteEdge(edgeId);
      toast.success('Dependency deleted');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Set Conditional Branch
              </h2>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Define the condition for this workflow path
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Current Status */}
          <div className="glass-card p-4 mb-6 border-2 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">
                  Current Type
                </div>
                <Badge variant={edge.type === 'conditional' ? 'default' : 'secondary'}>
                  {edge.type === 'conditional' ? 'Conditional' : 'Standard'}
                </Badge>
              </div>
              {edge.type === 'conditional' && edge.conditionLabel && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-white/60 mb-1">
                    Current Condition
                  </div>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    {edge.conditionLabel}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Input Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUseTemplate(true)}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                useTemplate
                  ? 'glass-card text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              Use Template
            </button>
            <button
              onClick={() => setUseTemplate(false)}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                !useTemplate
                  ? 'glass-card text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Custom Expression
            </button>
          </div>

          {/* Template Selection */}
          {useTemplate && (
            <div className="space-y-3 mb-6">
              <label className="text-sm text-slate-600 dark:text-white/60 block">
                Select Condition Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONDITION_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`glass-card p-4 text-left hover-glow transition-all ${
                        condition === template.condition ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${template.color}`} />
                        <span className="text-slate-900 dark:text-white">
                          {template.label}
                        </span>
                      </div>
                      <code className="text-xs text-slate-500 dark:text-white/50">
                        {template.condition}
                      </code>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Input */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-slate-600 dark:text-white/60 mb-2 block">
                Condition Label *
              </label>
              <input
                type="text"
                value={conditionLabel}
                onChange={(e) => setConditionLabel(e.target.value)}
                placeholder="e.g., Approved, Rejected, High Quality"
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                This label will be displayed on the workflow diagram
              </p>
            </div>

            {!useTemplate && (
              <div>
                <label className="text-sm text-slate-600 dark:text-white/60 mb-2 block">
                  Condition Expression *
                </label>
                <textarea
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., approval.status == 'approved'"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                  JavaScript-like expression evaluated at runtime
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="glass-card p-4 border-2 border-blue-500/30 bg-blue-500/5 mb-6">
            <div className="flex items-start gap-3">
              <GitBranch className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-slate-600 dark:text-white/60">
                <p className="mb-2">
                  <strong className="text-blue-600 dark:text-blue-400">Conditional Branching:</strong>
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Multiple outgoing edges from a stage create decision points</li>
                  <li>• Each edge can have a different condition</li>
                  <li>• At runtime, the first edge with a true condition is followed</li>
                  <li>• Make sure conditions are mutually exclusive</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview */}
          {conditionLabel && (
            <div className="glass-card p-4 mb-6">
              <div className="text-sm text-slate-600 dark:text-white/60 mb-2">
                Preview
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-purple-500 border-dashed border-t-2 border-purple-500" />
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  {conditionLabel}
                </Badge>
                <div className="w-3 h-3 border-t-2 border-r-2 border-purple-500 transform rotate-45" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex gap-2">
              {edge.type === 'conditional' && (
                <Button
                  onClick={handleRemoveCondition}
                  variant="ghost"
                  className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  Remove Condition
                </Button>
              )}
              <Button
                onClick={handleDeleteEdge}
                variant="ghost"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Delete Edge
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                Save Condition
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}