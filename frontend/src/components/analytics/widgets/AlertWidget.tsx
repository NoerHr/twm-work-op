import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';
import { useIndicatorStore } from '../../../store/indicatorStore';
import { formatDistanceToNow } from 'date-fns';
import type { WidgetConfig } from '../../../types/indicator';

interface AlertWidgetProps {
  widget: WidgetConfig;
  isEditMode?: boolean;
  onRemove?: (id: string) => void;
}

export function AlertWidget({ widget, isEditMode, onRemove }: AlertWidgetProps) {
  const alerts = useIndicatorStore((state) => state.getActiveAlerts());
  const updateAlert = useIndicatorStore((state) => state.updateAlert);
  
  const handleDismiss = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAlert(alertId, { isActive: false });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <GlassCard className="p-4 h-full flex flex-col relative">
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-slate-600 dark:text-slate-400">
          {widget.title || 'Active Alerts'}
        </h3>
        {alerts.length > 0 && (
          <Badge variant={getSeverityBadge(alerts[0].severity) as any} className="animate-pulse">
            {alerts.length}
          </Badge>
        )}
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-auto space-y-3">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <Info className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                All Clear
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No active alerts
              </p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-all ${
                alert.severity === 'critical'
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
                  : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityBadge(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                    {alert.triggeredAt && (
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-900 dark:text-white mb-1">
                    {alert.message}
                  </p>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {alert.valueKey} • Threshold: {alert.condition.operator} {alert.condition.value}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
