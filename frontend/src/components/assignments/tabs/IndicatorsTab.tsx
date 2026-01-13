import { useState } from 'react';
import { Plus, Target, TrendingUp, Link2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import type { Assignment, AssignmentIndicator } from '../../../types/assignment';

interface IndicatorsTabProps {
  assignment: Assignment;
}

interface OperationalIndicator {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  sourceTaskIds: string[];
  connectedAssignmentIndicators: string[]; // IDs of assignment indicators
}

export function IndicatorsTab({ assignment }: IndicatorsTabProps) {
  const [operationalIndicators, setOperationalIndicators] = useState<OperationalIndicator[]>([
    {
      id: 'op-1',
      name: 'Design Files Completed',
      description: 'Number of approved design files',
      currentValue: 12,
      targetValue: 20,
      unit: 'files',
      sourceTaskIds: ['task-1'],
      connectedAssignmentIndicators: ['ind-3']
    },
    {
      id: 'op-2',
      name: 'Review Sessions',
      description: 'Stakeholder review meetings conducted',
      currentValue: 3,
      targetValue: 5,
      unit: 'sessions',
      sourceTaskIds: ['task-2'],
      connectedAssignmentIndicators: []
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOperational, setSelectedOperational] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'assignment' | 'operational'; id: string } | null>(null);

  const handleCreateIndicator = (data: Omit<OperationalIndicator, 'id' | 'currentValue' | 'sourceTaskIds' | 'connectedAssignmentIndicators'>) => {
    const newIndicator: OperationalIndicator = {
      ...data,
      id: `op-${Date.now()}`,
      currentValue: 0,
      sourceTaskIds: [],
      connectedAssignmentIndicators: []
    };
    setOperationalIndicators([...operationalIndicators, newIndicator]);
    setShowCreateModal(false);
  };

  const handleConnect = (assignmentIndId: string, operationalIndId: string) => {
    setOperationalIndicators(prev => prev.map(op => 
      op.id === operationalIndId
        ? {
            ...op,
            connectedAssignmentIndicators: [...op.connectedAssignmentIndicators, assignmentIndId]
          }
        : op
    ));
  };

  const handleDisconnect = (assignmentIndId: string, operationalIndId: string) => {
    setOperationalIndicators(prev => prev.map(op => 
      op.id === operationalIndId
        ? {
            ...op,
            connectedAssignmentIndicators: op.connectedAssignmentIndicators.filter(id => id !== assignmentIndId)
          }
        : op
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl text-slate-900 dark:text-white mb-1">Operational Indicators</h2>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Create operational KPIs and connect them to assignment indicators
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Operational Indicator
        </Button>
      </div>

      {/* Main Layout: Sidebar + Canvas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar: Assignment Indicators */}
        <div className="col-span-3">
          <GlassCard className="p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-500" />
              <h3 className="text-slate-900 dark:text-white">Assignment Indicators</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-white/60 mb-4">
              Drag to connect with operational indicators
            </p>

            <div className="space-y-3">
              {assignment.assignmentIndicators.map((indicator) => (
                <motion.div
                  key={indicator.id}
                  draggable
                  onDragStart={() => setDraggedItem({ type: 'assignment', id: indicator.id })}
                  onDragEnd={() => setDraggedItem(null)}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border-2 border-purple-500/30 cursor-move hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm text-slate-900 dark:text-white">
                      {indicator.name}
                    </h4>
                    <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                    {indicator.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-white/50">Target:</span>
                    <Badge variant="outline" className="text-xs">
                      {indicator.targetValue} {indicator.unit}
                    </Badge>
                  </div>

                  <div className="mt-2 pt-2 border-t border-purple-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-white/50">Current:</span>
                      <span className="text-slate-900 dark:text-white">
                        {indicator.currentValue} {indicator.unit}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: Operational Indicators Canvas */}
        <div className="col-span-9">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="text-slate-900 dark:text-white">Operational Indicators</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                {operationalIndicators.length} Created
              </Badge>
            </div>

            {operationalIndicators.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="text-slate-900 dark:text-white mb-2">No Operational Indicators</h4>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                  Create operational indicators to track task-level metrics
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Indicator
                </Button>
              </div>
            ) : (
              // Indicators Grid
              <div className="grid grid-cols-2 gap-4">
                {operationalIndicators.map((indicator) => (
                  <motion.div
                    key={indicator.id}
                    draggable
                    onDragStart={() => setDraggedItem({ type: 'operational', id: indicator.id })}
                    onDragEnd={() => setDraggedItem(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedItem?.type === 'assignment') {
                        handleConnect(draggedItem.id, indicator.id);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-move"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm text-slate-900 dark:text-white flex-1">
                        {indicator.name}
                      </h4>
                      <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-white/60 mb-3">
                      {indicator.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 dark:text-white/50">Progress</span>
                        <span className="text-slate-900 dark:text-white">
                          {indicator.currentValue} / {indicator.targetValue} {indicator.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(indicator.currentValue / indicator.targetValue) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Connected Assignment Indicators */}
                    {indicator.connectedAssignmentIndicators.length > 0 && (
                      <div className="pt-3 border-t border-blue-500/20">
                        <div className="flex items-center gap-1 mb-2">
                          <Link2 className="w-3 h-3 text-purple-500" />
                          <span className="text-xs text-slate-600 dark:text-white/60">
                            Connected to:
                          </span>
                        </div>
                        <div className="space-y-1">
                          {indicator.connectedAssignmentIndicators.map((connId) => {
                            const assignmentInd = assignment.assignmentIndicators.find(a => a.id === connId);
                            if (!assignmentInd) return null;
                            return (
                              <div
                                key={connId}
                                className="flex items-center justify-between text-xs bg-purple-500/10 px-2 py-1 rounded"
                              >
                                <span className="text-purple-600 dark:text-purple-400">
                                  {assignmentInd.name}
                                </span>
                                <button
                                  onClick={() => handleDisconnect(connId, indicator.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateIndicatorModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateIndicator}
        />
      )}
    </div>
  );
}

// Create Indicator Modal Component
interface CreateIndicatorModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; targetValue: number; unit: string }) => void;
}

function CreateIndicatorModal({ onClose, onCreate }: CreateIndicatorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetValue: 0,
    unit: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-slate-900 dark:text-white">Create Operational Indicator</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Indicator Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., API Endpoints Completed"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this indicator measures..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-900 dark:text-white mb-2">
                  Target Value *
                </label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-900 dark:text-white mb-2">
                  Unit *
                </label>
                <Input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., endpoints, %"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Create Indicator
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}