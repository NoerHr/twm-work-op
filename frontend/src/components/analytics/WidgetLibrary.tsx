import { useState } from 'react';
import { Search, X, BarChart3, Activity, TrendingUp, Bell, Plus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'motion/react';
import { useIndicatorStore } from '../../store/indicatorStore';
import type { WidgetConfig, WidgetType } from '../../types/indicator';

interface WidgetLibraryProps {
  onClose: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
}

export function WidgetLibrary({ onClose, onAddWidget }: WidgetLibraryProps) {
  const indicators = useIndicatorStore((state) => state.indicators);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<WidgetType>('kpi');

  const widgetTypes = [
    { id: 'kpi' as WidgetType, label: 'KPI Card', icon: BarChart3, description: 'Big number with trend' },
    { id: 'gauge' as WidgetType, label: 'Gauge', icon: Activity, description: 'Circular progress' },
    { id: 'timeseries' as WidgetType, label: 'Time Series', icon: TrendingUp, description: 'Historical chart' },
    { id: 'alert' as WidgetType, label: 'Alert List', icon: Bell, description: 'Active alerts' }
  ];

  const filteredIndicators = indicators.filter((ind) =>
    ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddWidget = () => {
    if (!selectedIndicator) return;

    const indicator = indicators.find((ind) => ind.id === selectedIndicator);
    if (!indicator || indicator.values.length === 0) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: selectedType,
      indicatorId: selectedIndicator,
      title: indicator.name,
      valueKey: indicator.values[0].key,
      size: {
        w: selectedType === 'timeseries' ? 4 : selectedType === 'gauge' ? 2 : 2,
        h: selectedType === 'timeseries' ? 2 : selectedType === 'gauge' ? 2 : 1
      },
      position: { x: 0, y: 0 }, // Grid will auto-place
      config: {
        showTrend: selectedType === 'kpi',
        showSparkline: selectedType === 'kpi',
        chartType: 'line',
        timeRange: '30d',
        decimals: 1
      }
    };

    onAddWidget(newWidget);
  };

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
        className="w-full max-w-4xl max-h-[80vh] flex flex-col"
      >
        <GlassCard className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold mb-1">
                Widget Library
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add widgets to visualize your indicators
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Select Indicator */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  1. Select Indicator
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search indicators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Indicator List */}
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {filteredIndicators.map((indicator) => (
                    <button
                      key={indicator.id}
                      onClick={() => setSelectedIndicator(indicator.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedIndicator === indicator.id
                          ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/50'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                          {indicator.name}
                        </div>
                        <Badge
                          variant={
                            indicator.level === 'project'
                              ? 'primary'
                              : indicator.level === 'assignment'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {indicator.level}
                        </Badge>
                      </div>
                      {indicator.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {indicator.description}
                        </p>
                      )}
                      {indicator.tags && indicator.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {indicator.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}

                  {filteredIndicators.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-500">
                      No indicators found
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Select Widget Type */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  2. Select Widget Type
                </h3>

                <div className="space-y-3">
                  {widgetTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        disabled={!selectedIndicator}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/50'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-indigo-500/30'
                        } ${!selectedIndicator ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-indigo-500/20'
                                : 'bg-slate-100 dark:bg-slate-700'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isSelected
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-slate-900 dark:text-white mb-1">
                              {type.label}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Preview */}
                {selectedIndicator && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-white/10">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Preview
                    </h4>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Size: {selectedType === 'timeseries' ? '4x2' : selectedType === 'gauge' ? '2x2' : '2x1'} grid units
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddWidget}
              disabled={!selectedIndicator}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}