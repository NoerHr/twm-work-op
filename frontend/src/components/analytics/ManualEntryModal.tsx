import { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { useIndicatorStore } from '../../store/indicatorStore';
import { toast } from 'sonner@2.0.3';
import type { IndicatorDefinition } from '../../types/indicator';

interface ManualEntryModalProps {
  indicator: IndicatorDefinition;
  onClose: () => void;
}

export function ManualEntryModal({ indicator, onClose }: ManualEntryModalProps) {
  const addDataPoint = useIndicatorStore((state) => state.addDataPoint);
  const getLatestData = useIndicatorStore((state) => state.getLatestData);
  
  // Get manual entry values
  const manualValues = indicator.values.filter(v => v.source === 'manual');
  
  const [values, setValues] = useState<Record<string, number>>(
    manualValues.reduce((acc, v) => {
      const latest = getLatestData(indicator.id, v.key);
      acc[v.key] = latest?.value ?? v.defaultValue ?? 0;
      return acc;
    }, {} as Record<string, number>)
  );
  
  const [comment, setComment] = useState('');

  const handleSave = () => {
    const now = new Date();
    
    manualValues.forEach(value => {
      const enteredValue = values[value.key];
      
      if (enteredValue !== undefined) {
        addDataPoint({
          id: `dp-manual-${indicator.id}-${value.key}-${Date.now()}`,
          indicatorId: indicator.id,
          valueKey: value.key,
          value: enteredValue,
          timestamp: now,
          source: 'manual',
          status: 'normal',
          metadata: {
            manualEntryBy: 'current-user',
            comment: comment || undefined
          }
        });
      }
    });
    
    toast.success(`Updated ${manualValues.length} value(s)`);
    onClose();
  };

  if (manualValues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <GlassCard className="p-6">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
              No Manual Entry Values
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              This indicator has no values that allow manual entry.
            </p>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Close
            </Button>
          </GlassCard>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <GlassCard className="flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white font-semibold">
                  Manual Data Entry
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {indicator.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {manualValues.map((value) => {
              const latest = getLatestData(indicator.id, value.key);
              
              return (
                <div key={value.key}>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {value.label}
                    {value.unit && (
                      <span className="ml-1 text-slate-500">({value.unit})</span>
                    )}
                  </label>
                  {value.description && (
                    <p className="text-xs text-slate-500 mb-2">{value.description}</p>
                  )}
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      value={values[value.key] ?? ''}
                      onChange={(e) => setValues({ ...values, [value.key]: Number(e.target.value) })}
                      step={value.type === 'percentage' ? '0.1' : '1'}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Enter ${value.label.toLowerCase()}`}
                    />
                    {latest && (
                      <div className="text-sm text-slate-500">
                        Previous: {latest.value}{value.unit || ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add a note about this entry..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Values
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}