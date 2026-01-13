import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
}

export interface TaskFilters {
  projects: string[];
  priorities: string[];
  types: string[];
  statuses: string[];
}

export function FilterModal({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<TaskFilters>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: TaskFilters = {
      projects: [],
      priorities: [],
      types: [],
      statuses: []
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  const toggleFilter = (category: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value]
    }));
  };

  if (!isOpen) return null;

  const filterOptions = {
    projects: [
      { value: 'digital-transformation', label: 'Digital Transformation' },
      { value: 'finance-automation', label: 'Finance Automation' },
      { value: 'production-line', label: 'Production Line' },
      { value: 'customer-success', label: 'Customer Success' }
    ],
    priorities: [
      { value: 'critical', label: 'Critical', color: 'red' },
      { value: 'high', label: 'High', color: 'orange' },
      { value: 'medium', label: 'Medium', color: 'yellow' },
      { value: 'low', label: 'Low', color: 'blue' }
    ],
    types: [
      { value: 'batch', label: 'Batch Tasks' },
      { value: 'individual', label: 'Individual Tasks' }
    ],
    statuses: [
      { value: 'todo', label: 'To Do' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ]
  };

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

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
        className="w-full max-w-2xl"
      >
        <GlassCard variant="frosted" className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white">Filter Tasks</h2>
                {activeFilterCount > 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6">
            {/* Projects */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Projects
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.projects.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('projects', option.value)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all text-sm
                      ${filters.projects.includes(option.value)
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:border-indigo-500/50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Priority
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {filterOptions.priorities.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('priorities', option.value)}
                    className={`
                      p-3 rounded-lg border-2 text-center transition-all text-sm
                      ${filters.priorities.includes(option.value)
                        ? `border-${option.color}-500 bg-${option.color}-500/10 text-${option.color}-600 dark:text-${option.color}-400`
                        : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:border-indigo-500/50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Task Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.types.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('types', option.value)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all text-sm
                      ${filters.types.includes(option.value)
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:border-indigo-500/50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <Button variant="ghost" onClick={handleReset}>
              Reset All
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}