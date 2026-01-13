import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSampleDataPoints } from '../utils/generateIndicatorData';
import type {
  IndicatorDefinition,
  IndicatorDataPoint,
  IndicatorHistory,
  DashboardLayout,
  IndicatorAlert,
  IndicatorLevel,
  AnalyticsScope
} from '../types/indicator';

interface IndicatorStore {
  // Definitions
  indicators: IndicatorDefinition[];
  
  // Runtime Data
  dataPoints: Map<string, IndicatorDataPoint[]>; // key: indicatorId
  history: Map<string, IndicatorHistory>; // key: indicatorId_valueKey
  
  // Dashboards
  layouts: DashboardLayout[];
  activeLayoutId: string | null;
  
  // Alerts
  alerts: IndicatorAlert[];
  
  // UI State
  selectedIndicatorId: string | null;
  analyticsScope: AnalyticsScope;
  drillDownPath: string[]; // Stack of indicator IDs
  isEditMode: boolean;
  
  // Actions: Indicators
  addIndicator: (indicator: IndicatorDefinition) => void;
  updateIndicator: (id: string, updates: Partial<IndicatorDefinition>) => void;
  deleteIndicator: (id: string) => void;
  getIndicator: (id: string) => IndicatorDefinition | undefined;
  getIndicatorsByLevel: (level: IndicatorLevel) => IndicatorDefinition[];
  getIndicatorsByProject: (projectId: string) => IndicatorDefinition[];
  
  // Actions: Data
  addDataPoint: (dataPoint: IndicatorDataPoint) => void;
  getLatestData: (indicatorId: string, valueKey: string) => IndicatorDataPoint | undefined;
  getHistory: (indicatorId: string, valueKey: string) => IndicatorDataPoint[];
  
  // Actions: Dashboards
  addLayout: (layout: DashboardLayout) => void;
  updateLayout: (id: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (id: string) => void;
  setActiveLayout: (id: string) => void;
  getActiveLayout: () => DashboardLayout | undefined;
  
  // Actions: Alerts
  addAlert: (alert: IndicatorAlert) => void;
  updateAlert: (id: string, updates: Partial<IndicatorAlert>) => void;
  deleteAlert: (id: string) => void;
  getActiveAlerts: () => IndicatorAlert[];
  
  // Actions: UI
  setSelectedIndicator: (id: string | null) => void;
  setAnalyticsScope: (scope: Partial<AnalyticsScope>) => void;
  pushDrillDown: (indicatorId: string) => void;
  popDrillDown: () => void;
  clearDrillDown: () => void;
  setEditMode: (enabled: boolean) => void;
  
  // Utility
  calculateIndicatorValue: (indicatorId: string, valueKey: string) => number | null;
  checkAlerts: (indicatorId: string) => IndicatorAlert[];
}

export const useIndicatorStore = create<IndicatorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      indicators: [
        // Sample Project Level Indicator
        {
          id: 'ind-proj-health',
          name: 'Project Health Score',
          description: 'Overall project performance indicator',
          level: 'project',
          projectId: 'proj-swiz',
          values: [
            {
              key: 'health_score',
              label: 'Health Score',
              type: 'percentage',
              source: 'calculated',
              formula: {
                operator: 'average',
                operands: ['quality_score', 'schedule_performance', 'budget_health']
              },
              unit: '%'
            },
            {
              key: 'quality_score',
              label: 'Quality Score',
              type: 'percentage',
              source: 'calculated',
              unit: '%'
            },
            {
              key: 'schedule_performance',
              label: 'Schedule Performance',
              type: 'percentage',
              source: 'calculated',
              unit: '%'
            },
            {
              key: 'budget_health',
              label: 'Budget Health',
              type: 'percentage',
              source: 'calculated',
              unit: '%'
            }
          ],
          connections: [],
          visualizations: [
            {
              id: 'widget-health-gauge',
              type: 'gauge',
              indicatorId: 'ind-proj-health',
              title: 'Project Health',
              valueKey: 'health_score',
              size: { w: 2, h: 2 },
              position: { x: 0, y: 0 },
              config: {
                thresholds: [
                  { id: 't1', color: 'red', min: 0, max: 60, label: 'At Risk' },
                  { id: 't2', color: 'yellow', min: 60, max: 80, label: 'Warning' },
                  { id: 't3', color: 'green', min: 80, max: 100, label: 'On Track' }
                ],
                decimals: 0,
                suffix: '%'
              }
            }
          ],
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['executive', 'health']
        },
        // Sample Assignment Level Indicator
        {
          id: 'ind-assign-efficiency',
          name: 'Team Efficiency',
          description: 'Assignment team performance metrics',
          level: 'assignment',
          projectId: 'proj-swiz',
          assignmentId: 'assign-1',
          values: [
            {
              key: 'efficiency_score',
              label: 'Efficiency Score',
              type: 'number',
              source: 'calculated',
              formula: {
                operator: 'divide',
                operands: ['tasks_completed', 'hours_logged']
              },
              unit: 'tasks/hr'
            },
            {
              key: 'tasks_completed',
              label: 'Tasks Completed',
              type: 'number',
              source: 'task'
            },
            {
              key: 'hours_logged',
              label: 'Hours Logged',
              type: 'number',
              source: 'task'
            }
          ],
          connections: [],
          visualizations: [
            {
              id: 'widget-efficiency-kpi',
              type: 'kpi',
              indicatorId: 'ind-assign-efficiency',
              title: 'Team Efficiency',
              valueKey: 'efficiency_score',
              size: { w: 2, h: 1 },
              position: { x: 0, y: 0 },
              config: {
                showTrend: true,
                showSparkline: true,
                decimals: 2,
                suffix: ' tasks/hr'
              }
            }
          ],
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['team', 'performance']
        },
        // Sample Operational Indicator
        {
          id: 'ind-oper-defects',
          name: 'Defect Rate',
          description: 'Quality defects per task',
          level: 'operational',
          assignmentId: 'assign-1',
          values: [
            {
              key: 'defect_count',
              label: 'Defect Count',
              type: 'number',
              source: 'manual',
              defaultValue: 0
            },
            {
              key: 'defect_rate',
              label: 'Defect Rate',
              type: 'percentage',
              source: 'calculated',
              formula: {
                operator: 'divide',
                operands: ['defect_count', 'task_count']
              },
              unit: '%'
            },
            {
              key: 'task_count',
              label: 'Task Count',
              type: 'number',
              source: 'task'
            }
          ],
          connections: [],
          visualizations: [
            {
              id: 'widget-defects-chart',
              type: 'timeseries',
              indicatorId: 'ind-oper-defects',
              title: 'Defect Trend',
              valueKey: 'defect_rate',
              size: { w: 3, h: 2 },
              position: { x: 0, y: 0 },
              config: {
                chartType: 'line',
                timeRange: '30d',
                decimals: 1,
                suffix: '%'
              }
            }
          ],
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['quality', 'operational']
        }
      ],
      
      dataPoints: (() => {
        const sampleData = generateSampleDataPoints();
        return new Map(Object.entries(sampleData));
      })(),
      
      history: new Map(),
      
      layouts: [
        {
          id: 'layout-executive',
          name: 'Executive Dashboard',
          userId: 'user-1',
          role: 'Admin',
          scope: 'project',
          widgets: [
            {
              id: 'widget-health-gauge',
              type: 'gauge',
              indicatorId: 'ind-proj-health',
              title: 'Project Health',
              valueKey: 'health_score',
              size: { w: 2, h: 2 },
              position: { x: 0, y: 0 },
              config: {
                thresholds: [
                  { id: 't1', color: 'red', min: 0, max: 60, label: 'At Risk' },
                  { id: 't2', color: 'yellow', min: 60, max: 80, label: 'Warning' },
                  { id: 't3', color: 'green', min: 80, max: 100, label: 'On Track' }
                ],
                decimals: 0,
                suffix: '%'
              }
            },
            {
              id: 'widget-efficiency-kpi',
              type: 'kpi',
              indicatorId: 'ind-assign-efficiency',
              title: 'Team Efficiency',
              valueKey: 'efficiency_score',
              size: { w: 2, h: 1 },
              position: { x: 2, y: 0 },
              config: {
                showTrend: true,
                showSparkline: true,
                decimals: 2,
                suffix: ' tasks/hr'
              }
            },
            {
              id: 'widget-defects-chart',
              type: 'timeseries',
              indicatorId: 'ind-oper-defects',
              title: 'Defect Trend',
              valueKey: 'defect_rate',
              size: { w: 4, h: 2 },
              position: { x: 0, y: 2 },
              config: {
                chartType: 'line',
                timeRange: '30d',
                decimals: 1,
                suffix: '%'
              }
            }
          ],
          isDefault: true
        }
      ],
      
      activeLayoutId: 'layout-executive',
      
      alerts: [
        {
          id: 'alert-1',
          indicatorId: 'ind-oper-defects',
          valueKey: 'defect_rate',
          condition: {
            operator: 'gt',
            value: 5
          },
          severity: 'warning',
          message: 'Defect rate exceeds acceptable threshold',
          notifyRoles: ['PM', 'Leader'],
          isActive: true
        }
      ],
      
      selectedIndicatorId: null,
      analyticsScope: {},
      drillDownPath: [],
      isEditMode: false,
      
      // Indicator Actions
      addIndicator: (indicator) => set((state) => ({
        indicators: [...state.indicators, indicator]
      })),
      
      updateIndicator: (id, updates) => set((state) => ({
        indicators: state.indicators.map((ind) =>
          ind.id === id ? { ...ind, ...updates, updatedAt: new Date() } : ind
        )
      })),
      
      deleteIndicator: (id) => set((state) => ({
        indicators: state.indicators.filter((ind) => ind.id !== id)
      })),
      
      getIndicator: (id) => {
        return get().indicators.find((ind) => ind.id === id);
      },
      
      getIndicatorsByLevel: (level) => {
        return get().indicators.filter((ind) => ind.level === level);
      },
      
      getIndicatorsByProject: (projectId) => {
        return get().indicators.filter((ind) => ind.projectId === projectId);
      },
      
      // Data Actions
      addDataPoint: (dataPoint) => set((state) => {
        const newDataPoints = new Map(state.dataPoints);
        const existing = newDataPoints.get(dataPoint.indicatorId) || [];
        newDataPoints.set(dataPoint.indicatorId, [...existing, dataPoint]);
        return { dataPoints: newDataPoints };
      }),
      
      getLatestData: (indicatorId, valueKey) => {
        const points = get().dataPoints.get(indicatorId) || [];
        const filtered = points.filter((p) => p.valueKey === valueKey);
        return filtered.length > 0 ? filtered[filtered.length - 1] : undefined;
      },
      
      getHistory: (indicatorId, valueKey) => {
        const points = get().dataPoints.get(indicatorId) || [];
        return points.filter((p) => p.valueKey === valueKey);
      },
      
      // Dashboard Actions
      addLayout: (layout) => set((state) => ({
        layouts: [...state.layouts, layout]
      })),
      
      updateLayout: (id, updates) => set((state) => ({
        layouts: state.layouts.map((layout) =>
          layout.id === id ? { ...layout, ...updates } : layout
        )
      })),
      
      deleteLayout: (id) => set((state) => ({
        layouts: state.layouts.filter((layout) => layout.id !== id)
      })),
      
      setActiveLayout: (id) => set({ activeLayoutId: id }),
      
      getActiveLayout: () => {
        const state = get();
        return state.layouts.find((layout) => layout.id === state.activeLayoutId);
      },
      
      // Alert Actions
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
      
      updateAlert: (id, updates) => set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === id ? { ...alert, ...updates } : alert
        )
      })),
      
      deleteAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id)
      })),
      
      getActiveAlerts: () => {
        return get().alerts.filter((alert) => alert.isActive && alert.triggeredAt);
      },
      
      // UI Actions
      setSelectedIndicator: (id) => set({ selectedIndicatorId: id }),
      
      setAnalyticsScope: (scope) => set((state) => ({
        analyticsScope: { ...state.analyticsScope, ...scope }
      })),
      
      pushDrillDown: (indicatorId) => set((state) => ({
        drillDownPath: [...state.drillDownPath, indicatorId]
      })),
      
      popDrillDown: () => set((state) => ({
        drillDownPath: state.drillDownPath.slice(0, -1)
      })),
      
      clearDrillDown: () => set({ drillDownPath: [] }),
      
      setEditMode: (enabled) => set({ isEditMode: enabled }),
      
      // Utility Functions
      calculateIndicatorValue: (indicatorId, valueKey) => {
        // Simple mock calculation - in real app, would evaluate formula
        const dataPoint = get().getLatestData(indicatorId, valueKey);
        return dataPoint ? dataPoint.value : null;
      },
      
      checkAlerts: (indicatorId) => {
        const state = get();
        const alerts = state.alerts.filter((alert) => alert.indicatorId === indicatorId && alert.isActive);
        
        // Check each alert condition
        alerts.forEach((alert) => {
          const dataPoint = state.getLatestData(indicatorId, alert.valueKey);
          if (dataPoint) {
            let triggered = false;
            const value = dataPoint.value;
            
            switch (alert.condition.operator) {
              case 'gt':
                triggered = value > alert.condition.value;
                break;
              case 'lt':
                triggered = value < alert.condition.value;
                break;
              case 'eq':
                triggered = value === alert.condition.value;
                break;
              case 'gte':
                triggered = value >= alert.condition.value;
                break;
              case 'lte':
                triggered = value <= alert.condition.value;
                break;
            }
            
            if (triggered && !alert.triggeredAt) {
              state.updateAlert(alert.id, { triggeredAt: new Date() });
            } else if (!triggered && alert.triggeredAt) {
              state.updateAlert(alert.id, { triggeredAt: undefined });
            }
          }
        });
        
        return alerts.filter((alert) => alert.triggeredAt);
      }
    }),
    {
      name: 'indicator-storage',
      partialize: (state) => ({
        indicators: state.indicators,
        layouts: state.layouts,
        activeLayoutId: state.activeLayoutId,
        alerts: state.alerts
      })
    }
  )
);

// ⚡ PHASE 5: Export store instance to window for cross-store access
if (typeof window !== 'undefined') {
  (window as any).__indicatorStore = useIndicatorStore;
}
