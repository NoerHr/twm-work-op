import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Network, 
  Target, 
  ListChecks,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ResourceInheritanceTab } from './ResourceInheritanceTab';
import { AssignmentMappingTab } from './AssignmentMappingTab';
import { IndicatorConnectionsTab } from './IndicatorConnectionsTab';
import { TaskConfigurationTab } from './TaskConfigurationTab';
import type { Project } from '../../../types/project';
import type { ProjectResourceType, AssignmentResourceMapping, IndicatorConnection } from '../../../types/resource';

interface ProjectSetupWorkspaceProps {
  project: Project;
  onComplete: (setupData: SetupData) => void;
  onCancel: () => void;
}

interface SetupData {
  resourceTypes: ProjectResourceType[];
  assignmentMappings: AssignmentResourceMapping[];
  indicatorConnections: IndicatorConnection[];
  tasksConfigured: boolean;
}

type SetupTab = 'resources' | 'mappings' | 'indicators' | 'tasks';

export function ProjectSetupWorkspace({ project, onComplete, onCancel }: ProjectSetupWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<SetupTab>('resources');
  const [setupData, setSetupData] = useState<SetupData>({
    resourceTypes: [],
    assignmentMappings: [],
    indicatorConnections: [],
    tasksConfigured: false
  });

  const tabs = [
    {
      id: 'resources' as SetupTab,
      label: 'Resource Inheritance',
      icon: Package,
      description: 'Inherit organizational capabilities',
      stepNumber: 1,
      completed: setupData.resourceTypes.length > 0
    },
    {
      id: 'mappings' as SetupTab,
      label: 'Assignment Mapping',
      icon: Network,
      description: 'Map resources to assignments',
      stepNumber: 2,
      completed: setupData.assignmentMappings.length > 0,
      disabled: setupData.resourceTypes.length === 0
    },
    {
      id: 'indicators' as SetupTab,
      label: 'Indicator Connections',
      icon: Target,
      description: 'Connect metrics to KPIs',
      stepNumber: 3,
      completed: setupData.indicatorConnections.length > 0,
      disabled: setupData.assignmentMappings.length === 0
    },
    {
      id: 'tasks' as SetupTab,
      label: 'Task Configuration',
      icon: ListChecks,
      description: 'Configure task workflows',
      stepNumber: 4,
      completed: setupData.tasksConfigured,
      disabled: setupData.indicatorConnections.length === 0
    }
  ];

  const handleResourcesUpdate = (resourceTypes: ProjectResourceType[]) => {
    setSetupData(prev => ({ ...prev, resourceTypes }));
  };

  const handleMappingsUpdate = (mappings: AssignmentResourceMapping[]) => {
    setSetupData(prev => ({ ...prev, assignmentMappings: mappings }));
  };

  const handleIndicatorsUpdate = (connections: IndicatorConnection[]) => {
    setSetupData(prev => ({ ...prev, indicatorConnections: connections }));
  };

  const handleTasksUpdate = (configured: boolean) => {
    setSetupData(prev => ({ ...prev, tasksConfigured: configured }));
  };

  const canActivate = () => {
    return tabs.every(tab => tab.completed);
  };

  const handleActivate = () => {
    if (canActivate()) {
      onComplete(setupData);
    }
  };

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const canProceedToNext = tabs[currentTabIndex]?.completed;

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white">Project Setup</h1>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  {project.details.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleActivate}
              disabled={!canActivate()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Activate Project
            </Button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center flex-1">
              <button
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg flex-1 transition-all ${
                  activeTab === tab.id
                    ? 'glass-card border-2 border-purple-500/30'
                    : tab.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:glass-card'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tab.completed
                      ? 'bg-green-500 text-white'
                      : activeTab === tab.id
                      ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60'
                  }`}
                >
                  {tab.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{tab.stepNumber}</span>
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {tab.label}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-white/60 truncate">
                    {tab.description}
                  </div>
                </div>
                {tab.completed && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </button>
              {index < tabs.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-400 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {activeTab === 'resources' && (
              <ResourceInheritanceTab
                project={project}
                selectedTypes={setupData.resourceTypes}
                onUpdate={handleResourcesUpdate}
              />
            )}
            {activeTab === 'mappings' && (
              <AssignmentMappingTab
                project={project}
                resourceTypes={setupData.resourceTypes}
                mappings={setupData.assignmentMappings}
                onUpdate={handleMappingsUpdate}
              />
            )}
            {activeTab === 'indicators' && (
              <IndicatorConnectionsTab
                project={project}
                assignments={project.assignments || []}
                connections={setupData.indicatorConnections}
                onUpdate={handleIndicatorsUpdate}
              />
            )}
            {activeTab === 'tasks' && (
              <TaskConfigurationTab
                project={project}
                resourceTypes={setupData.resourceTypes}
                assignmentMappings={setupData.assignmentMappings}
                configured={setupData.tasksConfigured}
                onUpdate={handleTasksUpdate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="glass-surface border-t border-slate-200 dark:border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-white/60">
            {tabs[currentTabIndex]?.completed ? (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                Step {currentTabIndex + 1} completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Complete this step to proceed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentTabIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setActiveTab(tabs[currentTabIndex - 1].id)}
              >
                Previous
              </Button>
            )}
            {currentTabIndex < tabs.length - 1 && (
              <Button
                onClick={() => setActiveTab(tabs[currentTabIndex + 1].id)}
                disabled={!canProceedToNext || tabs[currentTabIndex + 1].disabled}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}