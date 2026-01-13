import { useState } from 'react';
import { TrendingUp, TrendingDown, X, Eye, Edit3 } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { ManualEntryModal } from '../ManualEntryModal';
import { useIndicatorStore } from '../../../store/indicatorStore';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import type { WidgetConfig } from '../../../types/indicator';

interface KPIWidgetProps {
  widget: WidgetConfig;
  isEditMode?: boolean;
  onRemove?: (id: string) => void;
}

export function KPIWidget({ widget, isEditMode, onRemove }: KPIWidgetProps) {
  const getLatestData = useIndicatorStore((state) => state.getLatestData);
  const getHistory = useIndicatorStore((state) => state.getHistory);
  const getIndicator = useIndicatorStore((state) => state.getIndicator);
  const pushDrillDown = useIndicatorStore((state) => state.pushDrillDown);
  
  const [showManualEntry, setShowManualEntry] = useState(false);
  const indicator = getIndicator(widget.indicatorId);
  const hasManualValues = indicator?.values.some(v => v.source === 'manual');
  
  const dataPoint = getLatestData(widget.indicatorId, widget.valueKey);
  const historyData = getHistory(widget.indicatorId, widget.valueKey).slice(-10);
  
  const value = dataPoint?.value ?? 0;
  const { config } = widget;
  
  // Calculate trend
  const trend = historyData.length >= 2
    ? ((historyData[historyData.length - 1].value - historyData[historyData.length - 2].value) / historyData[historyData.length - 2].value) * 100
    : 0;

  const formatValue = (val: number) => {
    const formatted = val.toFixed(config.decimals ?? 0);
    return `${config.prefix || ''}${formatted}${config.suffix || ''}`;
  };

  const handleDrillDown = () => {
    if (!isEditMode) {
      pushDrillDown(widget.indicatorId);
    }
  };

  return (
    <GlassCard 
      hover={!isEditMode}
      className="p-4 h-full flex flex-col cursor-pointer relative group"
      onClick={handleDrillDown}
    >
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {/* Manual Entry Button */}
        {!isEditMode && hasManualValues && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowManualEntry(true);
            }}
            className="p-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded transition-all opacity-0 group-hover:opacity-100"
            title="Manual entry"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        
        {/* Remove Button (Edit Mode) */}
        {isEditMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(widget.id);
            }}
            className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntry && indicator && (
          <ManualEntryModal
            indicator={indicator}
            onClose={() => setShowManualEntry(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm text-slate-600 dark:text-slate-400">
          {widget.title}
        </h3>
        {!isEditMode && (
          <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Big Number */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-auto"
      >
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {formatValue(value)}
        </div>
      </motion.div>

      {/* Trend Indicator */}
      {config.showTrend && historyData.length >= 2 && (
        <div className="flex items-center gap-2 mt-3">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">vs last period</span>
        </div>
      )}

      {/* Sparkline */}
      {config.showSparkline && historyData.length > 0 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Badge */}
      {dataPoint?.status && dataPoint.status !== 'normal' && (
        <div className="mt-3">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
            dataPoint.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
            dataPoint.status === 'critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' :
            'bg-slate-500/10 text-slate-600 dark:text-slate-400'
          }`}>
            {dataPoint.status}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
