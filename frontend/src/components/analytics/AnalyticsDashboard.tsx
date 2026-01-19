import { useState, useEffect } from 'react';
import { Layout, Lock, Edit3, Save, X, Plus, Activity } from 'lucide-react';
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useIndicatorStore } from '../../store/indicatorStore';
import { useAuthStore } from '../../store/authStore';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { KPIWidget } from './widgets/KPIWidget';
import { GaugeWidget } from './widgets/GaugeWidget';
import { TimeSeriesWidget } from './widgets/TimeSeriesWidget';
import { AlertWidget } from './widgets/AlertWidget';
import { WidgetLibrary } from './WidgetLibrary';
import { motion, AnimatePresence } from 'motion/react';
import type { WidgetConfig } from '../../types/indicator';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function AnalyticsDashboard() {
  const user = useAuthStore((state) => state.user);
  const isEditMode = useIndicatorStore((state) => state.isEditMode);
  const setEditMode = useIndicatorStore((state) => state.setEditMode);
  const getActiveLayout = useIndicatorStore((state) => state.getActiveLayout);
  const updateLayout = useIndicatorStore((state) => state.updateLayout);
  const drillDownPath = useIndicatorStore((state) => state.drillDownPath);
  const popDrillDown = useIndicatorStore((state) => state.popDrillDown);
  const clearDrillDown = useIndicatorStore((state) => state.clearDrillDown);
  
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [tempLayouts, setTempLayouts] = useState<any>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  // Enable real-time data simulation
  const { isSimulating } = useRealTimeData(realTimeEnabled, 5000);
  
  const activeLayout = getActiveLayout();
  const widgets = activeLayout?.widgets || [];

  // Convert widgets to react-grid-layout format
  const gridLayout: GridLayout[] = widgets.map((widget) => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.size.w,
    h: widget.size.h,
    minW: 1,
    minH: 1,
    maxW: 6,
    maxH: 4
  }));

  const handleLayoutChange = (layout: GridLayout[]) => {
    if (!isEditMode || !activeLayout) return;
    
    setTempLayouts(layout);
  };

  const handleSaveLayout = () => {
    if (!activeLayout || !tempLayouts) return;
    
    // Update widget positions based on new layout
    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = tempLayouts.find((item: GridLayout) => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: { x: layoutItem.x, y: layoutItem.y },
          size: { w: layoutItem.w, h: layoutItem.h }
        };
      }
      return widget;
    });

    updateLayout(activeLayout.id, { widgets: updatedWidgets });
    setEditMode(false);
    setTempLayouts(null);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setTempLayouts(null);
  };

  const handleAddWidget = (widget: WidgetConfig) => {
    if (!activeLayout) return;
    
    updateLayout(activeLayout.id, {
      widgets: [...widgets, widget]
    });
    setShowWidgetLibrary(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!activeLayout) return;
    
    updateLayout(activeLayout.id, {
      widgets: widgets.filter((w) => w.id !== widgetId)
    });
  };

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'kpi':
        return <KPIWidget widget={widget} isEditMode={isEditMode} onRemove={handleRemoveWidget} />;
      case 'gauge':
        return <GaugeWidget widget={widget} isEditMode={isEditMode} onRemove={handleRemoveWidget} />;
      case 'timeseries':
        return <TimeSeriesWidget widget={widget} isEditMode={isEditMode} onRemove={handleRemoveWidget} />;
      case 'alert':
        return <AlertWidget widget={widget} isEditMode={isEditMode} onRemove={handleRemoveWidget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const canEditLayout = user?.role === 'Admin' || user?.role === 'PM' || user?.role === 'BOD';

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb / Drill-down Path */}
      {drillDownPath.length > 0 && (
        <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={clearDrillDown}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Dashboard
            </button>
            {drillDownPath.map((id, index) => (
              <div key={id} className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                <button
                  onClick={() => {
                    // Pop until this level
                    const popsNeeded = drillDownPath.length - index - 1;
                    for (let i = 0; i < popsNeeded; i++) {
                      popDrillDown();
                    }
                  }}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {id}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold">
                {activeLayout?.name || 'Dashboard'}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
                </p>
                {isSimulating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400">Live</span>
                  </div>
                )}
                <button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  ({realTimeEnabled ? 'Pause' : 'Resume'})
                </button>
              </div>
            </div>
          </div>

          {canEditLayout && (
            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Layout
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWidgetLibrary(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="info" className="animate-pulse">
                    Editing Mode
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveLayout}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          )}

          {!canEditLayout && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lock className="w-4 h-4" />
              <span>View Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        {widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Layout className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                No widgets yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Add widgets to start visualizing your indicators
              </p>
              {canEditLayout && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowWidgetLibrary(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Widget
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: gridLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 6, md: 4, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={120}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            compactType="vertical"
            preventCollision={false}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="widget-container">
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>

      {/* Widget Library Modal */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <WidgetLibrary
            onClose={() => setShowWidgetLibrary(false)}
            onAddWidget={handleAddWidget}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
