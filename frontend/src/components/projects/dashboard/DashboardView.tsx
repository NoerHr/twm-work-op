import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  LineChart, 
  Gauge as GaugeIcon,
  Hash,
  Plus,
  Settings,
  Lock,
  Eye,
  Grid3x3,
  LayoutGrid,
  CheckCircle,
  Shield,
  Briefcase,
  FileCheck,
  X // Add X icon for close button
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Indicator } from '../../../types/project';

// BOD-specific widgets
import { PendingApprovalsWidget } from '../../monitoring/widgets/PendingApprovalsWidget';
import { GovernanceHealthWidget } from '../../monitoring/widgets/GovernanceHealthWidget';
import { PortfolioOverviewWidget } from '../../monitoring/widgets/PortfolioOverviewWidget';
import { RecentDecisionsWidget } from '../../monitoring/widgets/RecentDecisionsWidget';

// PM-specific widgets
import { MyProjectsWidget } from '../../monitoring/widgets/MyProjectsWidget';

// Operational widgets
import { TeamWorkloadWidget } from '../../monitoring/widgets/TeamWorkloadWidget';
import { TaskProgressWidget } from '../../monitoring/widgets/TaskProgressWidget';
import { SLAComplianceWidget } from '../../monitoring/widgets/SLAComplianceWidget';
import { BlockedTasksWidget } from '../../monitoring/widgets/BlockedTasksWidget';

interface DashboardViewProps {
  projectId?: string;
  projectName?: string;
  userRole: 'admin' | 'bod' | 'pm' | 'leader' | 'contributor';
}

interface DashboardWidget {
  id: string;
  indicatorId: string;
  indicator: Indicator;
  size: 'small' | 'medium' | 'large' | 'wide';
  position: { row: number; col: number };
  allowedRoles: string[];
}

// Mock indicators data with role-based access
const MOCK_INDICATORS: (Indicator & { allowedRoles: string[] })[] = [
  {
    id: 'ind-1',
    name: 'Project Progress',
    description: 'Overall project completion percentage',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: true },
    visualization: {
      widget: 'gauge',
      thresholds: { red: 30, yellow: 70, green: 90 }
    },
    currentValue: 68,
    targetValue: 100,
    allowedRoles: ['admin', 'bod', 'pm', 'leader', 'contributor']
  },
  {
    id: 'ind-2',
    name: 'Budget Utilization',
    description: 'Percentage of budget spent',
    type: 'formula',
    visibility: { showOnDashboard: true, useInGates: true },
    visualization: {
      widget: 'gauge',
      thresholds: { red: 90, yellow: 75, green: 50 }
    },
    currentValue: 72,
    targetValue: 100,
    allowedRoles: ['admin', 'bod', 'pm'] // Only leadership roles
  },
  {
    id: 'ind-3',
    name: 'Team Velocity',
    description: 'Story points completed per sprint',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'line-chart',
      thresholds: { red: 20, yellow: 35, green: 50 }
    },
    currentValue: 42,
    targetValue: 50,
    allowedRoles: ['admin', 'pm', 'leader']
  },
  {
    id: 'ind-4',
    name: 'Active Tasks',
    description: 'Number of tasks in progress',
    type: 'manual',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'big-number',
      thresholds: { red: 20, yellow: 15, green: 10 }
    },
    currentValue: 12,
    targetValue: 10,
    allowedRoles: ['admin', 'bod', 'pm', 'leader', 'contributor']
  },
  {
    id: 'ind-5',
    name: 'Code Quality Score',
    description: 'Overall code quality rating',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: true },
    visualization: {
      widget: 'gauge',
      thresholds: { red: 60, yellow: 75, green: 85 }
    },
    currentValue: 82,
    targetValue: 90,
    allowedRoles: ['admin', 'pm', 'leader', 'contributor']
  },
  {
    id: 'ind-6',
    name: 'Sprint Burndown',
    description: 'Remaining work vs time',
    type: 'formula',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'line-chart',
      thresholds: { red: 80, yellow: 50, green: 20 }
    },
    currentValue: 35,
    targetValue: 0,
    allowedRoles: ['admin', 'pm', 'leader', 'contributor']
  },
  {
    id: 'ind-7',
    name: 'Risk Level',
    description: 'Overall project risk assessment',
    type: 'manual',
    visibility: { showOnDashboard: true, useInGates: true },
    visualization: {
      widget: 'gauge',
      thresholds: { red: 70, yellow: 40, green: 20 }
    },
    currentValue: 28,
    targetValue: 0,
    allowedRoles: ['admin', 'bod', 'pm'] // Only top leadership
  },
  {
    id: 'ind-8',
    name: 'Team Satisfaction',
    description: 'Team morale and satisfaction score',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'bar-chart',
      thresholds: { red: 50, yellow: 70, green: 85 }
    },
    currentValue: 78,
    targetValue: 90,
    allowedRoles: ['admin', 'bod', 'pm', 'leader']
  },
  // MONITORING WIDGETS (Leader/PM only)
  {
    id: 'mon-1',
    name: 'Team Workload',
    description: 'Real-time team capacity and availability',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'team-workload',
      thresholds: { red: 100, yellow: 80, green: 60 }
    },
    currentValue: 85,
    targetValue: 75,
    allowedRoles: ['admin', 'pm', 'leader']
  },
  {
    id: 'mon-2',
    name: 'Task Progress',
    description: 'Overall task execution metrics',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'task-progress',
      thresholds: { red: 50, yellow: 70, green: 90 }
    },
    currentValue: 78,
    targetValue: 100,
    allowedRoles: ['admin', 'pm', 'leader']
  },
  {
    id: 'mon-3',
    name: 'SLA Compliance',
    description: 'Service level agreement tracking',
    type: 'formula',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'sla-compliance',
      thresholds: { red: 70, yellow: 85, green: 95 }
    },
    currentValue: 78,
    targetValue: 95,
    allowedRoles: ['admin', 'pm', 'leader']
  },
  {
    id: 'mon-4',
    name: 'Blocked Tasks',
    description: 'Tasks requiring immediate attention',
    type: 'manual',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'blocked-tasks',
      thresholds: { red: 5, yellow: 3, green: 0 }
    },
    currentValue: 3,
    targetValue: 0,
    allowedRoles: ['admin', 'pm', 'leader']
  },
  // BOD-SPECIFIC WIDGETS
  {
    id: 'bod-1',
    name: 'Pending Approvals',
    description: 'Projects awaiting BOD review and decision',
    type: 'manual',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'pending-approvals',
      thresholds: { red: 5, yellow: 3, green: 0 }
    },
    currentValue: 5,
    targetValue: 0,
    allowedRoles: ['admin', 'bod'] // BOD exclusive
  },
  {
    id: 'bod-2',
    name: 'Governance Health',
    description: 'Overall governance performance and compliance metrics',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'governance-health',
      thresholds: { red: 50, yellow: 70, green: 90 }
    },
    currentValue: 95,
    targetValue: 100,
    allowedRoles: ['admin', 'bod'] // BOD exclusive
  },
  {
    id: 'bod-3',
    name: 'Portfolio Overview',
    description: 'Enterprise-wide project portfolio status and budget',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'portfolio-overview',
      thresholds: { red: 50, yellow: 70, green: 90 }
    },
    currentValue: 12,
    targetValue: 15,
    allowedRoles: ['admin', 'bod', 'pm'] // BOD + PM access
  },
  {
    id: 'bod-4',
    name: 'Recent Decisions',
    description: 'Decision history and approval/rejection log',
    type: 'manual',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'recent-decisions',
      thresholds: { red: 0, yellow: 5, green: 10 }
    },
    currentValue: 8,
    targetValue: 10,
    allowedRoles: ['admin', 'bod'] // BOD exclusive
  },
  // PM-SPECIFIC WIDGETS
  {
    id: 'pm-1',
    name: 'My Projects',
    description: 'Projects under your management with progress tracking',
    type: 'aggregation',
    visibility: { showOnDashboard: true, useInGates: false },
    visualization: {
      widget: 'my-projects',
      thresholds: { red: 10, yellow: 7, green: 5 }
    },
    currentValue: 5,
    targetValue: 5,
    allowedRoles: ['admin', 'pm'] // PM exclusive
  }
];

export function DashboardView({ projectId, projectName, userRole }: DashboardViewProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const navigate = useNavigate();

  // Filter indicators based on role
  const accessibleIndicators = MOCK_INDICATORS.filter(ind => 
    ind.allowedRoles.includes(userRole)
  );

  // Initialize default dashboard layout
  useEffect(() => {
    const defaultWidgets: DashboardWidget[] = accessibleIndicators
      .filter(ind => ind.visibility.showOnDashboard)
      .slice(0, 6)
      .map((ind, index) => ({
        id: `widget-${ind.id}`,
        indicatorId: ind.id,
        indicator: ind,
        size: index === 0 ? 'large' : index === 1 ? 'wide' : 'medium',
        position: { row: Math.floor(index / 3), col: index % 3 },
        allowedRoles: ind.allowedRoles
      }));

    setWidgets(defaultWidgets);
  }, [userRole]);

  const handleAddWidget = (indicator: typeof MOCK_INDICATORS[0]) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      indicatorId: indicator.id,
      indicator,
      size: 'medium',
      position: { row: widgets.length, col: 0 },
      allowedRoles: indicator.allowedRoles
    };

    setWidgets([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleResizeWidget = (widgetId: string, newSize: DashboardWidget['size']) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, size: newSize } : w
    ));
  };

  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    const dragWidget = widgets[dragIndex];
    const newWidgets = [...widgets];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(hoverIndex, 0, dragWidget);
    setWidgets(newWidgets);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 dark:text-white mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Role: <Badge variant="outline" className="ml-2">{userRole.toUpperCase()}</Badge>
                {' • '}
                {accessibleIndicators.length} indicators accessible
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddWidget(!showAddWidget)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-2"
              >
                {isEditMode ? (
                  <>
                    <Eye className="w-4 h-4" />
                    View Mode
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4" />
                    Edit Layout
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Add Widget Panel */}
        <AnimatePresence>
          {showAddWidget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="mb-4">
                  <h3 className="text-slate-900 dark:text-white mb-1">
                    Available Indicators
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    Select an indicator to add to your dashboard
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {accessibleIndicators
                    .filter(ind => !widgets.find(w => w.indicatorId === ind.id))
                    .map((indicator) => {
                      // Get icon based on widget type
                      let IconComponent = Hash;
                      let iconColor = 'text-purple-500';
                      
                      if (indicator.visualization.widget === 'gauge') {
                        IconComponent = GaugeIcon;
                        iconColor = 'text-purple-500';
                      } else if (indicator.visualization.widget === 'line-chart') {
                        IconComponent = LineChart;
                        iconColor = 'text-blue-500';
                      } else if (indicator.visualization.widget === 'bar-chart') {
                        IconComponent = BarChart3;
                        iconColor = 'text-green-500';
                      } else if (indicator.visualization.widget === 'big-number') {
                        IconComponent = Hash;
                        iconColor = 'text-amber-500';
                      } else if (indicator.visualization.widget === 'pending-approvals') {
                        IconComponent = CheckCircle;
                        iconColor = 'text-purple-500';
                      } else if (indicator.visualization.widget === 'governance-health') {
                        IconComponent = Shield;
                        iconColor = 'text-indigo-500';
                      } else if (indicator.visualization.widget === 'portfolio-overview') {
                        IconComponent = Briefcase;
                        iconColor = 'text-blue-500';
                      } else if (indicator.visualization.widget === 'recent-decisions') {
                        IconComponent = FileCheck;
                        iconColor = 'text-emerald-500';
                      } else if (indicator.visualization.widget === 'my-projects') {
                        IconComponent = Briefcase;
                        iconColor = 'text-pink-500';
                      } else if (indicator.visualization.widget === 'team-workload' || indicator.visualization.widget === 'task-progress' || indicator.visualization.widget === 'sla-compliance' || indicator.visualization.widget === 'blocked-tasks') {
                        IconComponent = Activity;
                        iconColor = 'text-cyan-500';
                      }
                      
                      return (
                        <button
                          key={indicator.id}
                          onClick={() => handleAddWidget(indicator)}
                          className="p-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-purple-500/50 rounded-xl text-left transition-all group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className={`w-4 h-4 ${iconColor}`} />
                            <span className="text-sm text-slate-900 dark:text-white">
                              {indicator.name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2">
                            {indicator.description}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid Dashboard */}
        {widgets.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <LayoutGrid className="w-16 h-16 text-slate-400 dark:text-white/40 mx-auto mb-4" />
            <h3 className="text-slate-900 dark:text-white mb-2">
              No Widgets Yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
              Add indicators to your dashboard to get started
            </p>
            <Button
              onClick={() => setShowAddWidget(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          </GlassCard>
        ) : (
          <div className="bento-grid">
            {widgets.map((widget, index) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                index={index}
                isEditMode={isEditMode}
                onRemove={() => handleRemoveWidget(widget.id)}
                onResize={(size) => handleResizeWidget(widget.id, size)}
                moveWidget={moveWidget}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        {/* Role-based Access Info */}
        {isEditMode && (
          <GlassCard className="p-4 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm text-blue-900 dark:text-blue-300 mb-1">
                  Role-based Access Control
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  You are viewing as <strong>{userRole.toUpperCase()}</strong>. 
                  Some indicators may be hidden based on your access level. 
                  {userRole === 'admin' && ' As an Admin, you have access to all indicators.'}
                  {userRole === 'bod' && ' As BOD, you have access to strategic and financial indicators.'}
                  {userRole === 'pm' && ' As PM, you have access to project management indicators.'}
                  {userRole === 'leader' && ' As Leader, you have access to team and execution indicators.'}
                  {userRole === 'contributor' && ' As Contributor, you have access to task-level indicators.'}
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          grid-auto-flow: dense;
        }

        .bento-grid .widget-small {
          grid-column: span 1;
          min-height: 250px;
        }

        .bento-grid .widget-medium {
          grid-column: span 1;
          min-height: 350px;
        }

        .bento-grid .widget-large {
          grid-column: span 2;
          min-height: 400px;
        }

        .bento-grid .widget-wide {
          grid-column: 1 / -1;
          min-height: 300px;
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
          
          .bento-grid .widget-large {
            grid-column: span 1;
            min-height: 350px;
          }
        }

        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          
          .bento-grid .widget-small,
          .bento-grid .widget-medium,
          .bento-grid .widget-large,
          .bento-grid .widget-wide {
            grid-column: span 1;
            min-height: 280px;
          }
        }
      `}</style>
    </DndProvider>
  );
}

// Draggable Widget Component
interface DraggableWidgetProps {
  widget: DashboardWidget;
  index: number;
  isEditMode: boolean;
  onRemove: () => void;
  onResize: (size: DashboardWidget['size']) => void;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  userRole: string;
}

function DraggableWidget({ 
  widget, 
  index, 
  isEditMode, 
  onRemove, 
  onResize, 
  moveWidget,
  userRole 
}: DraggableWidgetProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: { index },
    canDrag: isEditMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveWidget(item.index, index);
        item.index = index;
      }
    }
  });

  // Check if user has access to this widget
  const hasAccess = widget.allowedRoles.includes(userRole);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`widget-${widget.size} ${isDragging ? 'opacity-50' : ''} relative group`}
    >
      {/* Edit Mode Controls - Inside card with better contrast */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
          <select
            value={widget.size}
            onChange={(e) => onResize(e.target.value as DashboardWidget['size'])}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-slate-200 dark:border-white/10 text-white shadow-xl hover:shadow-2xl hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="wide">Wide</option>
          </select>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 border-2 border-slate-200 dark:border-white/10 rounded-lg transition-all shadow-xl hover:shadow-2xl"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Drag Handle Indicator (only in edit mode) */}
      {isEditMode && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 bg-slate-900/90 dark:bg-white/10 backdrop-blur-sm border border-slate-200 dark:border-white/20 rounded text-xs text-slate-900 dark:text-white">
            <Grid3x3 className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Widget Content - No wrapper card, just the widget itself */}
      {!hasAccess ? (
        <GlassCard className="p-6 h-full flex flex-col items-center justify-center text-center">
          <Lock className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-sm text-slate-600 dark:text-white/60">
            Access Restricted
          </p>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
            This indicator is not available for your role
          </p>
        </GlassCard>
      ) : (
        <IndicatorWidget indicator={widget.indicator} size={widget.size} />
      )}
    </div>
  );
}

// Indicator Widget Renderer
interface IndicatorWidgetProps {
  indicator: Indicator;
  size: DashboardWidget['size'];
}

function IndicatorWidget({ indicator, size }: IndicatorWidgetProps) {
  const value = indicator.currentValue || 0;
  const target = indicator.targetValue || 100;
  const percentage = (value / target) * 100;

  // Determine color based on thresholds
  const getColor = () => {
    const { red, yellow, green } = indicator.visualization.thresholds;
    
    if (percentage >= green) return { bg: 'bg-green-500', text: 'text-green-500', gradient: 'from-green-500 to-emerald-500' };
    if (percentage >= yellow) return { bg: 'bg-yellow-500', text: 'text-yellow-500', gradient: 'from-yellow-500 to-orange-500' };
    return { bg: 'bg-red-500', text: 'text-red-500', gradient: 'from-red-500 to-rose-500' };
  };

  const color = getColor();

  // Check if it's a BOD/PM widget (custom widgets)
  if (indicator.visualization.widget === 'pending-approvals') {
    return <PendingApprovalsWidget />;
  }
  if (indicator.visualization.widget === 'governance-health') {
    return <GovernanceHealthWidget />;
  }
  if (indicator.visualization.widget === 'portfolio-overview') {
    return <PortfolioOverviewWidget />;
  }
  if (indicator.visualization.widget === 'recent-decisions') {
    return <RecentDecisionsWidget />;
  }
  if (indicator.visualization.widget === 'my-projects') {
    return <MyProjectsWidget />;
  }

  // Check if it's a monitoring widget (operational widgets)
  if (indicator.visualization.widget === 'team-workload') {
    return <TeamWorkloadWidget />;
  }
  if (indicator.visualization.widget === 'task-progress') {
    return <TaskProgressWidget />;
  }
  if (indicator.visualization.widget === 'sla-compliance') {
    return <SLAComplianceWidget />;
  }
  if (indicator.visualization.widget === 'blocked-tasks') {
    return <BlockedTasksWidget />;
  }

  // Standard indicator widgets
  switch (indicator.visualization.widget) {
    case 'gauge':
      return <GaugeWidget indicator={indicator} value={value} target={target} color={color} size={size} />;
    case 'line-chart':
      return <LineChartWidget indicator={indicator} value={value} target={target} color={color} />;
    case 'bar-chart':
      return <BarChartWidget indicator={indicator} value={value} target={target} color={color} />;
    case 'big-number':
      return <BigNumberWidget indicator={indicator} value={value} target={target} color={color} />;
    default:
      return null;
  }
}

// Gauge Widget
function GaugeWidget({ 
  indicator,
  value, 
  target, 
  color,
  size 
}: { 
  indicator: Indicator;
  value: number; 
  target: number; 
  color: any;
  size: DashboardWidget['size'];
}) {
  const percentage = (value / target) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClass = size === 'large' ? 'w-40 h-40' : 'w-32 h-32';

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <GaugeIcon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">{indicator.name}</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {indicator.description}
          </p>
        </div>
      </div>

      {/* Gauge Visual */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`relative ${sizeClass}`}>
          <svg className="transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200 dark:text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={color.text}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
            <span className="text-xs text-slate-600 dark:text-white/60">
              of target
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${color.text}`}>{value}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Current</div>
          </div>
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{target}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Target</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Line Chart Widget
function LineChartWidget({ 
  indicator, 
  value, 
  target, 
  color 
}: { 
  indicator: Indicator;
  value: number; 
  target: number; 
  color: any;
}) {
  // Mock data for line chart
  const data = [32, 45, 38, 52, 48, 55, value];
  const max = Math.max(...data, target);
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (val / max) * 100
  }));

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const change = ((value / data[0] - 1) * 100);
  const isPositive = change >= 0;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <LineChart className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">{indicator.name}</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {indicator.description}
          </p>
        </div>
      </div>

      {/* Line Chart Visual */}
      <div className="flex-1 flex flex-col">
        <div className="h-40 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200 dark:text-white/10"
              />
            ))}
            
            {/* Line path */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={color.text}
            />
            
            {/* Points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2"
                fill="currentColor"
                className={color.text}
              />
            ))}
          </svg>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${color.text}`}>{value}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Current</div>
          </div>
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{target}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Target</div>
          </div>
          <div className={`${isPositive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'} rounded-lg p-3 text-center`}>
            <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </div>
            <div className={`text-xs mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              Change
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Bar Chart Widget
function BarChartWidget({ 
  indicator, 
  value, 
  target, 
  color 
}: { 
  indicator: Indicator;
  value: number; 
  target: number; 
  color: any;
}) {
  const data = [65, 78, 82, 70, value];
  const max = Math.max(...data, target);
  const average = Math.round(data.reduce((a, b) => a + b) / data.length);

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">{indicator.name}</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {indicator.description}
          </p>
        </div>
      </div>

      {/* Bar Chart Visual */}
      <div className="flex-1 flex flex-col">
        <div className="h-40 mb-4">
          <div className="flex items-end justify-around h-full gap-2">
            {data.map((val, i) => {
              const height = (val / max) * 100;
              const isLast = i === data.length - 1;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative" style={{ height: '100%' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all ${ 
                        isLast 
                          ? `bg-gradient-to-t ${color.gradient}` 
                          : 'bg-slate-300 dark:bg-white/20'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-white/50 mt-2">
                    {i === data.length - 1 ? 'Now' : `W${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${color.text}`}>{value}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Current</div>
          </div>
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{average}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Average</div>
          </div>
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{target}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Target</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Big Number Widget
function BigNumberWidget({ 
  indicator, 
  value, 
  target, 
  color 
}: { 
  indicator: Indicator;
  value: number; 
  target: number; 
  color: any;
}) {
  const percentage = ((value / target) * 100) - 100;
  const isPositive = percentage >= 0;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Hash className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">{indicator.name}</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {indicator.description}
          </p>
        </div>
      </div>

      {/* Big Number Visual */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`text-6xl mb-4 font-bold bg-gradient-to-br ${color.gradient} bg-clip-text text-transparent`}>
          {value}
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          {isPositive ? (
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-500" />
          )}
          <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{percentage.toFixed(1)}%
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{target}</div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Target</div>
          </div>
          <div className={`${isPositive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'} rounded-lg p-3 text-center`}>
            <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {Math.abs(percentage).toFixed(1)}%
            </div>
            <div className={`text-xs mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? 'Above' : 'Below'}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}