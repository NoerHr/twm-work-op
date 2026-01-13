import { useState } from 'react';
import { X, Plus, Package, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ResourceCoin {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}

interface ResourceCoinSelectorProps {
  availableResources: ResourceCoin[]; // From inherited project resources
  selectedResourceIds: string[];
  onChange: (resourceIds: string[]) => void;
}

export function ResourceCoinSelector({
  availableResources,
  selectedResourceIds,
  onChange
}: ResourceCoinSelectorProps) {
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const selectedResources = availableResources.filter(r => 
    selectedResourceIds.includes(r.id)
  );

  const availableToAdd = availableResources.filter(r => 
    !selectedResourceIds.includes(r.id)
  );

  const handleAddResource = (resourceId: string) => {
    onChange([...selectedResourceIds, resourceId]);
    setShowResourcePicker(false);
  };

  const handleRemoveResource = (resourceId: string) => {
    onChange(selectedResourceIds.filter(id => id !== resourceId));
  };

  // Color palette for resource coins
  const getResourceColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'equipment': 'from-blue-500 to-cyan-600',
      'software': 'from-purple-500 to-pink-600',
      'material': 'from-green-500 to-emerald-600',
      'facility': 'from-orange-500 to-red-600',
      'vehicle': 'from-yellow-500 to-amber-600',
      'default': 'from-slate-500 to-slate-700'
    };
    return colorMap[type.toLowerCase()] || colorMap['default'];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm text-slate-600 dark:text-white/60">
          Resource Mapping {selectedResources.length > 0 && `(${selectedResources.length})`}
        </label>
        <button
          onClick={() => setShowResourcePicker(!showResourcePicker)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Resource
        </button>
      </div>

      {/* Resource Picker Dropdown */}
      <AnimatePresence>
        {showResourcePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-600 dark:text-white/60 mb-3">
                Select from inherited project resources:
              </div>
              {availableToAdd.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-white/50 text-center py-4">
                  All available resources are already mapped
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableToAdd.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => handleAddResource(resource.id)}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 rounded-lg transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getResourceColor(resource.type)} flex items-center justify-center flex-shrink-0`}>
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-900 dark:text-white truncate">
                          {resource.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/50 truncate">
                          {resource.type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Resource Coins */}
      <div className="min-h-[120px] p-4 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
        {selectedResources.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-slate-400 dark:text-white/40" />
            </div>
            <p className="text-sm text-slate-500 dark:text-white/50">
              No resources mapped yet
            </p>
            <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
              Click "Add Resource" to map project resources
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="group relative"
                >
                  {/* The Coin */}
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${getResourceColor(resource.type)}
                    flex items-center justify-center
                    shadow-lg shadow-${resource.type === 'equipment' ? 'blue' : 'purple'}-500/20
                    cursor-pointer transition-transform hover:scale-110
                  `}>
                    <Package className="w-7 h-7 text-white" />
                  </div>

                  {/* Remove Button (appears on hover) */}
                  <button
                    onClick={() => handleRemoveResource(resource.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>

                  {/* Resource Name Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-white/90 text-white dark:text-slate-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {resource.name}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Resource Count Info */}
      {selectedResources.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span>{selectedResources.length} resource{selectedResources.length > 1 ? 's' : ''} mapped to this assignment</span>
        </div>
      )}
    </div>
  );
}
