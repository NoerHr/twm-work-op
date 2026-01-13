import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  X,
  Calendar,
  Clock,
  Shield,
  Users,
  Target,
  Palette,
  Trash2,
  AlertTriangle,
  Percent
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner@2.0.3';

interface StageConfigModalProps {
  nodeId: string;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
];

export function StageConfigModal({ nodeId, onClose }: StageConfigModalProps) {
  const { getNode, updateNode, deleteNode } = useWorkflowStore();
  const node = getNode(nodeId);
  
  const [name, setName] = useState(node?.name || '');
  const [description, setDescription] = useState(node?.description || '');
  const [duration, setDuration] = useState(node?.duration || 5);
  const [startDay, setStartDay] = useState(node?.startDay || 1);
  const [color, setColor] = useState(node?.color || '#8B5CF6');
  const [hasGate, setHasGate] = useState(node?.hasGate || false);
  const [gateTrigger, setGateTrigger] = useState<'automatic' | 'manual'>(node?.gateTrigger || 'automatic');
  
  // New fields for probability and redesign risk
  const [probability, setProbability] = useState(node?.data?.probability || 100);
  const [hasRedesignRisk, setHasRedesignRisk] = useState(node?.data?.hasRedesignRisk || false);
  const [redesignProbability, setRedesignProbability] = useState(node?.data?.redesignProbability || 0);
  const [redesignDuration, setRedesignDuration] = useState(node?.data?.redesignDuration || 0);

  // Close modal if node is not found - moved to useEffect to avoid setState during render
  useEffect(() => {
    if (!node) {
      onClose();
    }
  }, [node, onClose]);

  if (!node) {
    return null;
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a stage name');
      return;
    }

    updateNode(nodeId, {
      name,
      description,
      duration,
      startDay,
      color,
      hasGate,
      gateTrigger,
      data: {
        ...node.data,
        name,
        description,
        probability,
        hasRedesignRisk,
        redesignProbability: hasRedesignRisk ? redesignProbability : 0,
        redesignDuration: hasRedesignRisk ? redesignDuration : 0
      }
    });

    toast.success('Stage updated successfully');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this stage?')) {
      deleteNode(nodeId);
      toast.success('Stage deleted');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard className="border-2 border-white/20">
          {/* Header - Fixed */}
          <div className="sticky top-0 z-10 glass-surface border-b border-slate-200 dark:border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 dark:text-white">Configure Stage</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Stage Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  placeholder="Enter stage name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                  placeholder="Describe this stage..."
                />
              </div>

              {/* Timeline Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Day
                  </label>
                  <input
                    type="number"
                    value={startDay}
                    onChange={(e) => setStartDay(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="30"
                    className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="30"
                    className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Probability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  <Percent className="w-4 h-4 inline mr-2" />
                  Success Probability (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={probability}
                    onChange={(e) => setProbability(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="flex-1"
                  />
                  <div className="w-16 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-center text-slate-900 dark:text-white">
                    {probability}%
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                  Likelihood this stage will be completed as planned
                </p>
              </div>

              {/* Redesign Risk */}
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Redesign Risk
                  </label>
                  <button
                    onClick={() => setHasRedesignRisk(!hasRedesignRisk)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hasRedesignRisk ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hasRedesignRisk ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {hasRedesignRisk && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                        Redesign Probability (%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          value={redesignProbability}
                          onChange={(e) => setRedesignProbability(parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="flex-1"
                        />
                        <div className="w-14 px-2 py-1 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-500/20 rounded text-center text-xs text-slate-900 dark:text-white">
                          {redesignProbability}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                        Additional Duration if Redesign (days)
                      </label>
                      <input
                        type="number"
                        value={redesignDuration}
                        onChange={(e) => setRedesignDuration(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                        max="30"
                        className="w-full px-3 py-1.5 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-500/20 rounded text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Stage Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setColor(preset.value)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        color === preset.value
                          ? 'border-slate-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quality Gate */}
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Quality Gate
                  </label>
                  <button
                    onClick={() => setHasGate(!hasGate)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hasGate ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hasGate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {hasGate && (
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                      Gate Trigger
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGateTrigger('automatic')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                          gateTrigger === 'automatic'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white dark:bg-black/20 text-slate-600 dark:text-white/60 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                        }`}
                      >
                        Automatic
                      </button>
                      <button
                        onClick={() => setGateTrigger('manual')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                          gateTrigger === 'manual'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white dark:bg-black/20 text-slate-600 dark:text-white/60 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                        }`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="sticky bottom-0 glass-surface border-t border-slate-200 dark:border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Stage
              </Button>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}