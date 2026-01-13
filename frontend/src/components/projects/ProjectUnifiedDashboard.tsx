import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Database, GitBranch, Users, BarChart3, MessageSquare, Settings } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Project } from '../../types/project';

// Import existing wizard tabs
import { DetailsTab } from './wizard/DetailsTab';
import { ResourcesTab } from './wizard/ResourcesTab';
import { WorkflowBuilderTab } from './wizard/WorkflowBuilderTab';
import { AssignmentsTab } from './wizard/AssignmentsTab';
import { IndicatorsTab } from './wizard/IndicatorsTab';

interface ProjectUnifiedDashboardProps {
  project: Project;
  onBack: () => void;
}

type TabId = 'details' | 'resources' | 'workflow' | 'assignments' | 'indicators';

const TABS = [
  { id: 'details' as const, label: 'Detail', icon: FileText },
  { id: 'resources' as const, label: 'Resources', icon: Database },
  { id: 'workflow' as const, label: 'Stage', icon: GitBranch },
  { id: 'assignments' as const, label: 'Assignments', icon: Users },
  { id: 'indicators' as const, label: 'Indicator', icon: BarChart3 }
];

export function ProjectUnifiedDashboard({ project, onBack }: ProjectUnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [formData, setFormData] = useState<Partial<Project>>(project);
  const [validationErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'approved':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <DetailsTab
            data={formData.details || {
              name: '',
              description: '',
              expectedStartDate: new Date(),
              expectedEndDate: new Date(),
              priority: 'medium',
              tags: []
            }}
            errors={validationErrors}
            onChange={(data) => updateFormData('details', data)}
            readOnly={true} // Read-only for active projects
          />
        );

      case 'resources':
        return (
          <ResourcesTab
            project={formData}
            onUpdate={updateFormData}
            readOnly={true} // Read-only for active projects
          />
        );

      case 'workflow':
        return (
          <WorkflowBuilderTab
            stages={formData.workflow || []}
            indicators={formData.indicators || []}
            errors={validationErrors}
            onChange={(stages) => updateFormData('workflow', stages)}
            readOnly={false} // ✅ EXCEPTION: Stage tab is always interactive
          />
        );

      case 'assignments':
        return (
          <AssignmentsTab
            projectId={project.id}
            projectName={project.details.name}
            assignments={formData.assignments || []}
            stages={formData.workflow || []}
            onChange={(assignments) => updateFormData('assignments', assignments)}
            readOnly={true} // Read-only for active projects
          />
        );

      case 'indicators':
        return (
          <IndicatorsTab
            projectId={project.id}
            indicators={formData.indicators || []}
            onChange={(indicators) => updateFormData('indicators', indicators)}
            readOnly={true} // Read-only for active projects
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="md" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </Button>
            <Badge variant={getStatusColor(project.status as string)}>
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 dark:text-white mb-2">
                {project.details.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                {project.details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="px-8">
          <div className="flex gap-1 border-b border-slate-200 dark:border-white/10">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 flex items-center gap-2 transition-all
                    ${isActive
                      ? 'text-purple-500'
                      : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Info Banner for Read-Only State */}
      {activeTab !== 'workflow' && (
        <div className="border-t border-slate-200 dark:border-white/10 bg-blue-500/5 backdrop-blur-xl px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm text-slate-700 dark:text-white/70">
              <strong>Read-Only Mode:</strong> This project is {project.status}. 
              {activeTab === 'workflow' ? ' Stage tab remains interactive for timeline adjustments.' : ' Configuration changes are disabled.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}