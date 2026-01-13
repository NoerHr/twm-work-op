import { useState } from 'react';
import { X, Eye } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useIndicatorStore } from '../../../store/indicatorStore';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format } from 'date-fns';
import type { WidgetConfig } from '../../../types/indicator';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface TimeSeriesWidgetProps {
  widget: WidgetConfig;
  isEditMode?: boolean;
  onRemove?: (id: string) => void;
}

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {payload[0].value}
      </p>
    </div>
  );
}

export function TimeSeriesWidget({ widget, isEditMode, onRemove }: TimeSeriesWidgetProps) {
  const getHistory = useIndicatorStore((state) => state.getHistory);
  const pushDrillDown = useIndicatorStore((state) => state.pushDrillDown);
  
  const [timeRange, setTimeRange] = useState(widget.config.timeRange || '30d');
  
  const rawHistory = getHistory(widget.indicatorId, widget.valueKey);
  const { config } = widget;
  
  // Filter by time range
  const filterByTimeRange = (data: typeof rawHistory) => {
    const now = new Date();
    const ranges: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'ytd': Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
      'all': Infinity
    };
    
    const days = ranges[timeRange] || 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(d => new Date(d.timestamp) >= cutoff);
  };
  
  const historyData = filterByTimeRange(rawHistory).map(d => ({
    timestamp: format(new Date(d.timestamp), 'MMM d'),
    value: d.value
  }));

  const handleDrillDown = () => {
    if (!isEditMode) {
      pushDrillDown(widget.indicatorId);
    }
  };

  const renderChart = () => {
    const chartProps = {
      data: historyData,
      margin: { top: 5, right: 5, left: 0, bottom: 5 }
    };

    switch (config.chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        );
      
      default: // line
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
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
        <div className="flex-1">
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {widget.title}
          </h3>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => {
              e.stopPropagation();
              setTimeRange(e.target.value as any);
            }}
            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        {!isEditMode && (
          <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            No data available for this time range
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {historyData.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
          <div>
            <span className="text-slate-500">Min:</span>
            <span className="ml-1 text-slate-900 dark:text-white font-medium">
              {Math.min(...historyData.map(d => d.value)).toFixed(config.decimals ?? 1)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Avg:</span>
            <span className="ml-1 text-slate-900 dark:text-white font-medium">
              {(historyData.reduce((sum, d) => sum + d.value, 0) / historyData.length).toFixed(config.decimals ?? 1)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Max:</span>
            <span className="ml-1 text-slate-900 dark:text-white font-medium">
              {Math.max(...historyData.map(d => d.value)).toFixed(config.decimals ?? 1)}
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
