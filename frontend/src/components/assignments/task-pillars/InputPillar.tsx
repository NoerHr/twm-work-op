import { useState } from 'react';
import { Plus, Database, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import type { TaskInput } from '../../../types/assignment';

interface InputPillarProps {
  inputs: TaskInput[];
  onChange: (inputs: TaskInput[]) => void;
}

export function InputPillar({ inputs, onChange }: InputPillarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddInput = (input: Omit<TaskInput, 'id'>) => {
    const newInput: TaskInput = {
      ...input,
      id: `input-${Date.now()}`
    };
    onChange([...inputs, newInput]);
    setShowAddModal(false);
  };

  const handleRemoveInput = (id: string) => {
    onChange(inputs.filter(inp => inp.id !== id));
  };

  const getSourceLabel = (source: TaskInput['source']) => {
    const labels = {
      indicator: 'Indicator',
      resource: 'Resource Property',
      previous_task: 'Previous Task Output'
    };
    return labels[source];
  };

  const getSourceColor = (source: TaskInput['source']) => {
    const colors = {
      indicator: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      resource: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      previous_task: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
    };
    return colors[source];
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
        <p className="text-sm text-slate-600 dark:text-white/60">
          <strong className="text-purple-600 dark:text-purple-400">Input Pillar</strong> defines what data contributors can <strong>view</strong> before executing the task. All inputs are <strong>read-only</strong> and provide context for the work.
        </p>
      </div>

      {/* Input List */}
      {inputs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Input Fields</h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
            Add data sources that contributors need to see before starting this task
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Input
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              <h3 className="text-slate-900 dark:text-white">Input Fields</h3>
              <Badge variant="outline">{inputs.length} configured</Badge>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Input
            </Button>
          </div>

          <div className="space-y-3">
            {inputs.map((input, index) => (
              <motion.div
                key={input.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`text-xs border-2 ${getSourceColor(input.source)}`}>
                          {getSourceLabel(input.source)}
                        </Badge>
                        {input.readonly && (
                          <Badge variant="outline" className="text-xs">
                            Read-Only
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="text-sm text-slate-900 dark:text-white mb-2">
                        {input.label}
                      </h4>
                      
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        <strong>Source ID:</strong> {input.sourceId}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveInput(input.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Add Input Modal */}
      {showAddModal && (
        <AddInputModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddInput}
        />
      )}
    </div>
  );
}

// Add Input Modal Component
interface AddInputModalProps {
  onClose: () => void;
  onAdd: (input: Omit<TaskInput, 'id'>) => void;
}

function AddInputModal({ onClose, onAdd }: AddInputModalProps) {
  const [formData, setFormData] = useState<Omit<TaskInput, 'id'>>({
    label: '',
    source: 'indicator',
    sourceId: '',
    readonly: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
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
            <h3 className="text-xl text-slate-900 dark:text-white">Add Input Field</h3>
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
                Field Label *
              </label>
              <Input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Project Budget Remaining"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Data Source *
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as TaskInput['source'] })}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="indicator">Indicator</option>
                <option value="resource">Resource Property</option>
                <option value="previous_task">Previous Task Output</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-900 dark:text-white mb-2">
                Source ID *
              </label>
              <Input
                type="text"
                value={formData.sourceId}
                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                placeholder="e.g., ind-budget-001"
                required
              />
              <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                The unique identifier of the data source
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="readonly"
                checked={formData.readonly}
                onChange={(e) => setFormData({ ...formData, readonly: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="readonly" className="text-sm text-slate-900 dark:text-white">
                Read-only (recommended for inputs)
              </label>
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                Add Input
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}