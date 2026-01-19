import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Edit2, 
  Trash2,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Link2
} from 'lucide-react';
import { useWorkflowStore, type WorkflowNode } from '../../store/workflowStore';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';

interface StageDetailPopupProps {
  nodeId?: string;
  node?: WorkflowNode;
  onClose: () => void;
  onUpdate?: (node: WorkflowNode) => void;
  readOnly?: boolean;
}

export function StageDetailPopup({ 
  nodeId,
  node: externalNode,
  onClose,
  onUpdate,
  readOnly = false
}: StageDetailPopupProps) {
  const { getNode, getPredecessors, getSuccessors, deleteNode, updateNode } = useWorkflowStore();
  
  const node = externalNode || (nodeId ? getNode(nodeId) : null);
  
  if (!node) {
    onClose();
    return null;
  }
  
  const predecessors = getPredecessors(node.id);
  const successors = getSuccessors(node.id);
  
  const startDate = node.startDate instanceof Date ? node.startDate : new Date(node.startDate);
  const endDate = new Date(startDate.getTime() + node.duration * 24 * 60 * 60 * 1000);
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this stage?')) {
      deleteNode(nodeId);
      onClose();
    }
  };

  const handleEdit = () => {
    // Implement edit functionality here
    // For example, open a modal or redirect to an edit page
    console.log('Edit stage:', node);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <GlassCard className="relative overflow-hidden border border-white/20">
            {/* Header with gradient */}
            <div 
              className="relative px-6 py-6 border-b border-white/10"
              style={{
                background: node.color 
                  ? `linear-gradient(135deg, ${node.color}20, ${node.color}05)`
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02))'
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: node.color ? `${node.color}30` : '#8B5CF620',
                    border: `2px solid ${node.color || '#8B5CF6'}40`
                  }}
                >
                  {node.hasGate ? (
                    <Shield className="w-6 h-6" style={{ color: node.color || '#8B5CF6' }} />
                  ) : (
                    <PlayCircle className="w-6 h-6" style={{ color: node.color || '#8B5CF6' }} />
                  )}
                </div>

                {/* Title & Status */}
                <div className="flex-1">
                  <h2 className="text-xl text-slate-900 dark:text-white mb-1">
                    {node.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: node.color ? `${node.color}20` : '#8B5CF620',
                        color: node.color || '#8B5CF6'
                      }}
                    >
                      {node.type === 'stage' ? 'Stage' : 'Gateway'}
                    </span>
                    {node.hasGate && (
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        Quality Gate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Description */}
              {node.description && (
                <div>
                  <h3 className="text-sm text-slate-500 dark:text-white/50 mb-2">Description</h3>
                  <p className="text-slate-700 dark:text-white/80">
                    {node.description}
                  </p>
                </div>
              )}

              {/* Timeline Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-slate-500 dark:text-white/50">Start Date</span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {startDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="glass-card p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-slate-500 dark:text-white/50">Duration</span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {node.duration} {node.duration === 1 ? 'day' : 'days'}
                  </p>
                </div>

                <div className="glass-card p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-slate-500 dark:text-white/50">End Date</span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {endDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Gate Configuration */}
              {node.hasGate && (
                <div className="glass-card p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm text-slate-900 dark:text-white">Gate Configuration</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-white/60">Trigger Type</span>
                      <span className="text-xs text-slate-900 dark:text-white capitalize">
                        {node.gateTrigger || 'manual'}
                      </span>
                    </div>
                    {node.gateApprovers && node.gateApprovers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-white/60">Approvers</span>
                        <span className="text-xs text-slate-900 dark:text-white">
                          {node.gateApprovers.length} assigned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              <div className="grid grid-cols-2 gap-4">
                {/* Predecessors */}
                <div>
                  <h3 className="text-sm text-slate-500 dark:text-white/50 mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Dependencies ({predecessors.length})
                  </h3>
                  {predecessors.length > 0 ? (
                    <div className="space-y-2">
                      {predecessors.map((pred) => (
                        <div 
                          key={pred.id}
                          className="glass-card p-2 border border-white/10"
                        >
                          <p className="text-xs text-slate-700 dark:text-white/70 truncate">
                            {pred.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-white/40 italic">
                      No dependencies
                    </p>
                  )}
                </div>

                {/* Successors */}
                <div>
                  <h3 className="text-sm text-slate-500 dark:text-white/50 mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4 rotate-180" />
                    Dependents ({successors.length})
                  </h3>
                  {successors.length > 0 ? (
                    <div className="space-y-2">
                      {successors.map((succ) => (
                        <div 
                          key={succ.id}
                          className="glass-card p-2 border border-white/10"
                        >
                          <p className="text-xs text-slate-700 dark:text-white/70 truncate">
                            {succ.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-white/40 italic">
                      No dependents
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Stage
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Stage
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}