import { useState } from 'react';
import { Target, Plus, Trash2, X, Bell, Database, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import type { TaskOutput } from '../../../types/assignment';

interface OutputPillarProps {
  outputs: TaskOutput[];
  onChange: (outputs: TaskOutput[]) => void;
}

const OUTPUT_ACTIONS = [
  {
    action: 'update_resource' as const,
    label: 'Update Resource',
    icon: Database,
    color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    description: 'Modify resource properties'
  },
  {
    action: 'feed_indicator' as const,
    label: 'Feed Indicator',
    icon: Target,
    color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    description: 'Update indicator values'
  },
  {
    action: 'trigger_next' as const,
    label: 'Trigger Next Task',
    icon: Zap,
    color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    description: 'Activate dependent task'
  },
  {
    action: 'notify' as const,
    label: 'Send Notification',
    icon: Bell,
    color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: 'Notify team members'
  }
];

export function OutputPillar({ outputs, onChange }: OutputPillarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddOutput = (output: Omit<TaskOutput, 'id'>) => {
    const newOutput: TaskOutput = {
      ...output,
      id: `output-${Date.now()}`
    };
    onChange([...outputs, newOutput]);
    setShowAddModal(false);
  };

  const handleRemoveOutput = (id: string) => {
    onChange(outputs.filter(out => out.id !== id));
  };

  const getActionMeta = (action: TaskOutput['action']) => {
    const found = OUTPUT_ACTIONS.find(a => a.action === action);
    // Fallback to default if action not found
    return found || {
      action: 'update_resource' as const,
      label: 'Unknown Action',
      icon: Database,
      color: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
      description: 'Unknown action type'
    };
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
        <p className="text-sm text-slate-600 dark:text-white/60">
          <strong className="text-amber-600 dark:text-amber-400">Output Pillar</strong> defines what happens <strong>automatically</strong> after a contributor completes the task. Configure actions that trigger when the task is marked as done.
        </p>
      </div>

      {/* Output List */}
      {outputs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Output Actions</h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
            Add actions that execute automatically when this task is completed
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Output
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <h3 className="text-slate-900 dark:text-white">Output Actions</h3>
              <Badge variant="outline">{outputs.length} configured</Badge>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Output
            </Button>
          </div>

          <div className="space-y-3">
            {outputs.map((output, index) => {
              const actionMeta = getActionMeta(output.action);
              const Icon = actionMeta.icon;
              
              return (
                <motion.div
                  key={output.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4 hover:border-amber-500/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`text-xs border-2 ${actionMeta.color}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {actionMeta.label}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-slate-900 dark:text-white">
                            <strong>Target ID:</strong> {output.targetId}
                          </div>
                          
                          {Object.keys(output.mapping).length > 0 && (
                            <div>
                              <div className="text-xs text-slate-600 dark:text-white/60 mb-1">
                                Field Mappings:
                              </div>
                              <div className="space-y-1">
                                {Object.entries(output.mapping).map(([fieldId, targetProp]) => (
                                  <div
                                    key={fieldId}
                                    className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-white/5 px-2 py-1 rounded"
                                  >
                                    <span className="text-slate-600 dark:text-white/60">{fieldId}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="text-slate-900 dark:text-white">{targetProp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveOutput(output.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Output Modal */}
      {showAddModal && (
        <AddOutputModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddOutput}
        />
      )}
    </div>
  );
}

// Add Output Modal Component
interface AddOutputModalProps {
  onClose: () => void;
  onAdd: (output: Omit<TaskOutput, 'id'>) => void;
}

function AddOutputModal({ onClose, onAdd }: AddOutputModalProps) {
  const [formData, setFormData] = useState<Omit<TaskOutput, 'id'>>({
    action: 'feed_indicator',
    targetId: '',
    mapping: {}
  });

  const [mappingKey, setMappingKey] = useState('');
  const [mappingValue, setMappingValue] = useState('');

  const handleAddMapping = () => {
    if (!mappingKey || !mappingValue) return;
    
    setFormData({
      ...formData,
      mapping: {
        ...formData.mapping,
        [mappingKey]: mappingValue
      }
    });
    
    setMappingKey('');
    setMappingValue('');
  };

  const handleRemoveMapping = (key: string) => {
    const newMapping = { ...formData.mapping };
    delete newMapping[key];
    setFormData({ ...formData, mapping: newMapping });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  const selectedAction = OUTPUT_ACTIONS.find(a => a.action === formData.action) || OUTPUT_ACTIONS[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-slate-900 dark:text-white">Add Output Action</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Type */}
            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Action Type *
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {OUTPUT_ACTIONS.map((actionType) => {
                  const Icon = actionType.icon;
                  const isSelected = formData.action === actionType.action;
                  
                  return (
                    <button
                      key={actionType.action}
                      type="button"
                      onClick={() => setFormData({ ...formData, action: actionType.action })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {actionType.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-white/60">
                        {actionType.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target ID */}
            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Target ID *
              </label>
              <Input
                type="text"
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                placeholder={
                  formData.action === 'feed_indicator' ? 'e.g., ind-001' :
                  formData.action === 'update_resource' ? 'e.g., res-001' :
                  formData.action === 'trigger_next' ? 'e.g., task-002' :
                  'e.g., user-001'
                }
                required
              />
              <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                {formData.action === 'feed_indicator' && 'Indicator ID to update'}
                {formData.action === 'update_resource' && 'Resource ID to modify'}
                {formData.action === 'trigger_next' && 'Task ID to activate'}
                {formData.action === 'notify' && 'User/Role ID to notify'}
              </p>
            </div>

            {/* Field Mapping */}
            {(formData.action === 'feed_indicator' || formData.action === 'update_resource') && (
              <div>
                <label className="block text-sm text-slate-900 dark:text-white mb-2">
                  Field Mapping
                </label>
                
                <div className="space-y-2 mb-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={mappingKey}
                      onChange={(e) => setMappingKey(e.target.value)}
                      placeholder="Form field ID"
                      className="flex-1"
                    />
                    <span className="flex items-center text-slate-400">→</span>
                    <Input
                      type="text"
                      value={mappingValue}
                      onChange={(e) => setMappingValue(e.target.value)}
                      placeholder="Target property"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddMapping}
                      disabled={!mappingKey || !mappingValue}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    Map form fields to {formData.action === 'feed_indicator' ? 'indicator' : 'resource'} properties
                  </p>
                </div>

                {Object.keys(formData.mapping).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(formData.mapping).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/5 rounded"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600 dark:text-white/60">{key}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-900 dark:text-white">{value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMapping(key)}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
              >
                Add Output
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}