import { X, Eye } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useIndicatorStore } from '../../../store/indicatorStore';
import { motion } from 'motion/react';
import type { WidgetConfig } from '../../../types/indicator';

interface GaugeWidgetProps {
  widget: WidgetConfig;
  isEditMode?: boolean;
  onRemove?: (id: string) => void;
}

export function GaugeWidget({ widget, isEditMode, onRemove }: GaugeWidgetProps) {
  const getLatestData = useIndicatorStore((state) => state.getLatestData);
  const pushDrillDown = useIndicatorStore((state) => state.pushDrillDown);
  
  const dataPoint = getLatestData(widget.indicatorId, widget.valueKey);
  const value = dataPoint?.value ?? 0;
  const { config } = widget;
  
  const thresholds = config.thresholds || [];
  
  // Gauge configuration
  const size = 200;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  
  // Calculate arc path
  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Normalize value to 0-100 range
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Determine current color based on thresholds
  const getCurrentColor = () => {
    for (const threshold of thresholds) {
      if (normalizedValue >= (threshold.min || 0) && normalizedValue <= (threshold.max || 100)) {
        return threshold.color === 'green' ? '#10b981' :
               threshold.color === 'yellow' ? '#f59e0b' :
               '#ef4444';
      }
    }
    return '#6366f1';
  };

  const handleDrillDown = () => {
    if (!isEditMode) {
      pushDrillDown(widget.indicatorId);
    }
  };

  return (
    <GlassCard
      hover={!isEditMode}
      className="p-4 h-full flex flex-col cursor-pointer relative"
      onClick={handleDrillDown}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(widget.id);
            }}
            className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm text-slate-600 dark:text-slate-400">
          {widget.title}
        </h3>
        {!isEditMode && (
          <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Gauge */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-[200px] aspect-square">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {/* Background Arc */}
            <path
              d={getArcPath(180, 0)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-slate-200 dark:text-slate-700"
            />
            
            {/* Threshold Segments */}
            {thresholds.map((threshold, index) => {
              const startAngle = 180 - ((threshold.min || 0) * 180) / 100;
              const endAngle = 180 - ((threshold.max || 100) * 180) / 100;
              const color = threshold.color === 'green' ? '#10b981' :
                           threshold.color === 'yellow' ? '#f59e0b' :
                           '#ef4444';
              
              return (
                <path
                  key={index}
                  d={getArcPath(startAngle, endAngle)}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth - 4}
                  strokeLinecap="round"
                  opacity={0.3}
                />
              );
            })}
            
            {/* Value Arc (Animated) */}
            <motion.path
              d={getArcPath(180, 180 - (normalizedValue * 180) / 100)}
              fill="none"
              stroke={getCurrentColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            
            {/* Center Text */}
            <text
              x={center}
              y={center - 10}
              textAnchor="middle"
              className="text-4xl font-bold fill-slate-900 dark:fill-white"
            >
              {value.toFixed(config.decimals ?? 0)}
            </text>
            <text
              x={center}
              y={center + 15}
              textAnchor="middle"
              className="text-sm fill-slate-600 dark:fill-slate-400"
            >
              {config.suffix || '%'}
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      {thresholds.length > 0 && (
        <div className="flex justify-center gap-4 mt-4 text-xs">
          {thresholds.map((threshold) => (
            <div key={threshold.id} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${
                threshold.color === 'green' ? 'bg-emerald-500' :
                threshold.color === 'yellow' ? 'bg-amber-500' :
                'bg-red-500'
              }`} />
              <span className="text-slate-600 dark:text-slate-400">{threshold.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Target Value */}
      {config.targetValue !== undefined && (
        <div className="mt-3 text-center text-xs text-slate-500">
          Target: {config.targetValue}{config.suffix || '%'}
        </div>
      )}
    </GlassCard>
  );
}
