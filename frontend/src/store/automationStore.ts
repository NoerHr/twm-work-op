import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Indicator } from '../types/indicator';

interface AutomationRule {
  id: string;
  name: string;
  type: 'task-completion' | 'indicator-threshold' | 'hierarchy-aggregate';
  enabled: boolean;
  condition: {
    sourceType: 'task' | 'indicator' | 'assignment' | 'project';
    sourceId?: string;
    threshold?: number;
    operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  };
  action: {
    targetType: 'indicator' | 'notification' | 'alert';
    targetId?: string;
    updateType?: 'increment' | 'decrement' | 'calculate' | 'aggregate';
    value?: number;
  };
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  sourceType: string;
  sourceId: string;
  action: string;
  result: 'success' | 'failed';
  details: string;
}

interface AutomationStore {
  rules: AutomationRule[];
  logs: AutomationLog[];
  isAutoUpdateEnabled: boolean;
  
  // Rule Management
  addRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'triggerCount'>) => void;
  updateRule: (id: string, updates: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  
  // Automation Execution
  triggerTaskCompletionAutomation: (taskId: string, taskName: string, assignmentId: string) => void;
  calculateIndicatorValue: (indicatorId: string) => number | null;
  aggregateHierarchy: (parentIndicatorId: string) => void;
  checkThresholds: (indicatorId: string, value: number) => void;
  
  // Settings
  toggleAutoUpdate: () => void;
  
  // Logs
  addLog: (log: Omit<AutomationLog, 'id'>) => void;
  clearLogs: () => void;
  getRecentLogs: (limit: number) => AutomationLog[];
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => ({
      rules: [
        // Default rule: Task completion updates Assignment indicators
        {
          id: 'rule-task-completion-1',
          name: 'Update Assignment Indicators on Task Completion',
          type: 'task-completion',
          enabled: true,
          condition: {
            sourceType: 'task',
          },
          action: {
            targetType: 'indicator',
            updateType: 'calculate',
          },
          createdAt: new Date(),
          triggerCount: 0
        },
        // Default rule: Check indicator thresholds
        {
          id: 'rule-threshold-1',
          name: 'Alert on Critical Threshold Breach',
          type: 'indicator-threshold',
          enabled: true,
          condition: {
            sourceType: 'indicator',
            threshold: 80,
            operator: 'gte'
          },
          action: {
            targetType: 'alert',
          },
          createdAt: new Date(),
          triggerCount: 0
        },
        // Default rule: Hierarchy aggregation
        {
          id: 'rule-hierarchy-1',
          name: 'Auto-aggregate Child Indicators to Parent',
          type: 'hierarchy-aggregate',
          enabled: true,
          condition: {
            sourceType: 'indicator',
          },
          action: {
            targetType: 'indicator',
            updateType: 'aggregate',
          },
          createdAt: new Date(),
          triggerCount: 0
        }
      ],
      logs: [],
      isAutoUpdateEnabled: true,

      // Rule Management
      addRule: (rule) => set((state) => ({
        rules: [...state.rules, {
          ...rule,
          id: `rule-${Date.now()}`,
          createdAt: new Date(),
          triggerCount: 0
        }]
      })),

      updateRule: (id, updates) => set((state) => ({
        rules: state.rules.map(rule =>
          rule.id === id ? { ...rule, ...updates } : rule
        )
      })),

      deleteRule: (id) => set((state) => ({
        rules: state.rules.filter(rule => rule.id !== id)
      })),

      toggleRule: (id) => set((state) => ({
        rules: state.rules.map(rule =>
          rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        )
      })),

      // Automation Execution
      triggerTaskCompletionAutomation: (taskId, taskName, assignmentId) => {
        const { rules, isAutoUpdateEnabled, addLog } = get();
        
        if (!isAutoUpdateEnabled) return;

        // Find active task completion rules
        const activeRules = rules.filter(
          rule => rule.enabled && rule.type === 'task-completion'
        );

        activeRules.forEach(rule => {
          try {
            // Get indicators linked to this assignment
            const indicators = (window as any).__indicatorStore?.getState().indicators || [];
            const assignmentIndicators = indicators.filter((ind: Indicator) => 
              ind.level === 'assignment' && ind.linkedAssignmentId === assignmentId
            );

            assignmentIndicators.forEach((indicator: Indicator) => {
              // Recalculate indicator value
              const newValue = get().calculateIndicatorValue(indicator.id);
              
              if (newValue !== null) {
                // Update indicator
                (window as any).__indicatorStore?.getState().updateIndicator(indicator.id, {
                  currentValue: newValue,
                  lastUpdated: new Date()
                });

                // Check thresholds
                get().checkThresholds(indicator.id, newValue);

                // If indicator has parent, trigger hierarchy aggregation
                if (indicator.parentId) {
                  get().aggregateHierarchy(indicator.parentId);
                }

                addLog({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  triggeredAt: new Date(),
                  sourceType: 'task',
                  sourceId: taskId,
                  action: `Updated indicator "${indicator.name}" from task completion`,
                  result: 'success',
                  details: `Task "${taskName}" completed. Indicator recalculated to ${newValue}%`
                });
              }
            });

            // Update rule trigger count
            set((state) => ({
              rules: state.rules.map(r =>
                r.id === rule.id
                  ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date() }
                  : r
              )
            }));

            // Dispatch custom event for notifications
            window.dispatchEvent(new CustomEvent('indicator-auto-updated', {
              detail: {
                taskName,
                assignmentId,
                indicatorCount: assignmentIndicators.length
              }
            }));

          } catch (error) {
            addLog({
              ruleId: rule.id,
              ruleName: rule.name,
              triggeredAt: new Date(),
              sourceType: 'task',
              sourceId: taskId,
              action: 'Failed to update indicators',
              result: 'failed',
              details: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        });
      },

      calculateIndicatorValue: (indicatorId) => {
        try {
          const indicators = (window as any).__indicatorStore?.getState().indicators || [];
          const indicator = indicators.find((ind: Indicator) => ind.id === indicatorId);
          
          if (!indicator) return null;

          // For Assignment-level indicators
          if (indicator.level === 'assignment' && indicator.linkedAssignmentId) {
            const tasks = (window as any).__taskStore?.getState().tasks || [];
            const assignmentTasks = tasks.filter((t: any) => 
              t.assignmentId === indicator.linkedAssignmentId
            );

            if (assignmentTasks.length === 0) return 0;

            const completedTasks = assignmentTasks.filter((t: any) => t.status === 'completed').length;
            return Math.round((completedTasks / assignmentTasks.length) * 100);
          }

          // For Project-level indicators
          if (indicator.level === 'project' && indicator.linkedProjectId) {
            const projects = (window as any).__projectStore?.getState().projects || [];
            const project = projects.find((p: any) => p.id === indicator.linkedProjectId);
            
            if (!project || !project.assignments) return 0;

            const totalAssignments = project.assignments.length;
            const completedAssignments = project.assignments.filter((a: any) => 
              a.status === 'completed'
            ).length;

            return Math.round((completedAssignments / totalAssignments) * 100);
          }

          // For Operational indicators (manual tracking)
          return indicator.currentValue;

        } catch (error) {
          console.error('Error calculating indicator value:', error);
          return null;
        }
      },

      aggregateHierarchy: (parentIndicatorId) => {
        const { rules, isAutoUpdateEnabled, addLog } = get();
        
        if (!isAutoUpdateEnabled) return;

        // Find active hierarchy rules
        const activeRules = rules.filter(
          rule => rule.enabled && rule.type === 'hierarchy-aggregate'
        );

        if (activeRules.length === 0) return;

        try {
          const indicators = (window as any).__indicatorStore?.getState().indicators || [];
          const parentIndicator = indicators.find((ind: Indicator) => ind.id === parentIndicatorId);
          
          if (!parentIndicator) return;

          // Get all child indicators
          const childIndicators = indicators.filter((ind: Indicator) => 
            ind.parentId === parentIndicatorId
          );

          if (childIndicators.length === 0) return;

          // Calculate average of child indicators
          const total = childIndicators.reduce((sum: number, child: Indicator) => 
            sum + (child.currentValue || 0), 0
          );
          const average = Math.round(total / childIndicators.length);

          // Update parent indicator
          (window as any).__indicatorStore?.getState().updateIndicator(parentIndicatorId, {
            currentValue: average,
            lastUpdated: new Date()
          });

          // Check thresholds for parent
          get().checkThresholds(parentIndicatorId, average);

          // If parent has a parent, recurse
          if (parentIndicator.parentId) {
            get().aggregateHierarchy(parentIndicator.parentId);
          }

          // Log the aggregation
          activeRules.forEach(rule => {
            addLog({
              ruleId: rule.id,
              ruleName: rule.name,
              triggeredAt: new Date(),
              sourceType: 'indicator',
              sourceId: parentIndicatorId,
              action: `Aggregated ${childIndicators.length} child indicators`,
              result: 'success',
              details: `Parent indicator "${parentIndicator.name}" updated to ${average}%`
            });

            // Update rule trigger count
            set((state) => ({
              rules: state.rules.map(r =>
                r.id === rule.id
                  ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date() }
                  : r
              )
            }));
          });

          // Dispatch event
          window.dispatchEvent(new CustomEvent('hierarchy-aggregated', {
            detail: {
              parentId: parentIndicatorId,
              parentName: parentIndicator.name,
              childCount: childIndicators.length,
              newValue: average
            }
          }));

        } catch (error) {
          console.error('Error in hierarchy aggregation:', error);
        }
      },

      checkThresholds: (indicatorId, value) => {
        const { rules, addLog } = get();

        // Find active threshold rules
        const activeRules = rules.filter(
          rule => rule.enabled && rule.type === 'indicator-threshold'
        );

        if (activeRules.length === 0) return;

        try {
          const indicators = (window as any).__indicatorStore?.getState().indicators || [];
          const indicator = indicators.find((ind: Indicator) => ind.id === indicatorId);
          
          if (!indicator) return;

          activeRules.forEach(rule => {
            const { threshold = 0, operator = 'gte' } = rule.condition;
            let thresholdBreached = false;

            switch (operator) {
              case 'gt':
                thresholdBreached = value > threshold;
                break;
              case 'lt':
                thresholdBreached = value < threshold;
                break;
              case 'eq':
                thresholdBreached = value === threshold;
                break;
              case 'gte':
                thresholdBreached = value >= threshold;
                break;
              case 'lte':
                thresholdBreached = value <= threshold;
                break;
            }

            if (thresholdBreached) {
              // Create notification
              window.dispatchEvent(new CustomEvent('indicator-threshold-breached', {
                detail: {
                  indicatorId,
                  indicatorName: indicator.name,
                  currentValue: value,
                  threshold,
                  operator,
                  level: indicator.level
                }
              }));

              addLog({
                ruleId: rule.id,
                ruleName: rule.name,
                triggeredAt: new Date(),
                sourceType: 'indicator',
                sourceId: indicatorId,
                action: 'Threshold breach detected',
                result: 'success',
                details: `Indicator "${indicator.name}" value ${value}% breached threshold ${threshold}%`
              });

              // Update rule trigger count
              set((state) => ({
                rules: state.rules.map(r =>
                  r.id === rule.id
                    ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date() }
                    : r
                )
              }));
            }
          });

        } catch (error) {
          console.error('Error checking thresholds:', error);
        }
      },

      toggleAutoUpdate: () => set((state) => ({
        isAutoUpdateEnabled: !state.isAutoUpdateEnabled
      })),

      // Logs
      addLog: (log) => set((state) => ({
        logs: [...state.logs, {
          ...log,
          id: `log-${Date.now()}-${Math.random()}`
        }].slice(-100) // Keep last 100 logs
      })),

      clearLogs: () => set({ logs: [] }),

      getRecentLogs: (limit) => {
        const { logs } = get();
        return logs.slice(-limit).reverse();
      }
    }),
    {
      name: 'automation-storage',
      partialize: (state) => ({
        rules: state.rules,
        logs: state.logs,
        isAutoUpdateEnabled: state.isAutoUpdateEnabled
      })
    }
  )
);

// Export store instance to window for cross-store access
if (typeof window !== 'undefined') {
  (window as any).__automationStore = useAutomationStore;
}