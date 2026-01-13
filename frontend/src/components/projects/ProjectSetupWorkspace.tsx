import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useResourceStore } from '../../store/resourceStore';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Package,
  Link as LinkIcon,
  BarChart3,
  CheckCircle2,
  Play,
  AlertCircle,
  Download,
  RefreshCw,
  Unlink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project } from '../../types/project';

interface ProjectSetupWorkspaceProps {
  project: Project;
  onBack: () => void;
}

type SetupTab = 'resource-types' | 'mapping' | 'indicators' | 'review';

export function ProjectSetupWorkspace({ project, onBack }: ProjectSetupWorkspaceProps) {
  const activateProject = useProjectStore((state) => state.activateProject);
  const addResourceType = useProjectStore((state) => state.addResourceType);
  const resourceTypes = useResourceStore((state) => state.resourceTypes);
  
  const [activeTab, setActiveTab] = useState<SetupTab>('resource-types');
  const [inheritedTypes, setInheritedTypes] = useState<string[]>(
    project.resourceTypes?.map(rt => rt.id) || []
  );
  const [assignmentMappings, setAssignmentMappings] = useState<Record<string, string[]>>({});
  const [indicatorConnections, setIndicatorConnections] = useState<any[]>([]);

  // Setup completion checks
  const hasResourceTypes = inheritedTypes.length > 0;
  const hasMappings = Object.keys(assignmentMappings).length > 0;
  const hasConnections = indicatorConnections.length > 0;
  const isSetupComplete = hasResourceTypes; // Minimum requirement

  const tabs = [
    { id: 'resource-types' as SetupTab, label: 'Resource Types', icon: Package, complete: hasResourceTypes },
    { id: 'mapping' as SetupTab, label: 'Mapping', icon: LinkIcon, complete: hasMappings },
    { id: 'indicators' as SetupTab, label: 'Indicator Connections', icon: BarChart3, complete: hasConnections },
    { id: 'review' as SetupTab, label: 'Review & Activate', icon: CheckCircle2, complete: isSetupComplete },
  ];

  const handleInheritResourceType = (typeId: string) => {
    const orgType = resourceTypes.find(rt => rt.id === typeId);
    if (!orgType) return;

    addResourceType(project.id, {
      id: `proj-${project.id}-type-${Date.now()}`,
      organizationalTypeId: typeId,
      name: orgType.name,
      schema: orgType.schema,
      version: '1.0.0',
      isInherited: true,
      isSynced: true,
      lastSyncedAt: new Date()
    });

    setInheritedTypes([...inheritedTypes, typeId]);
    toast.success('Resource Type Inherited', {
      description: `${orgType.name} added to project`
    });
  };

  const handleMapResourceToAssignment = (assignmentId: string, resourceTypeId: string) => {
    setAssignmentMappings({
      ...assignmentMappings,
      [assignmentId]: [...(assignmentMappings[assignmentId] || []), resourceTypeId]
    });
    toast.success('Resource Mapped', {
      description: 'Resource type available to assignment'
    });
  };

  const handleActivateProject = () => {
    if (!isSetupComplete) {
      toast.error('Setup Incomplete', {
        description: 'Please inherit at least one resource type before activating'
      });
      return;
    }

    activateProject(project.id);
    toast.success('Project Activated!', {
      description: 'Project is now active. Leaders can start working on assignments.',
      icon: <Play className="w-5 h-5" />
    });
    onBack();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="md" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-slate-900 dark:text-white mb-2">
                Project Setup: {project.details.name}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Configuration Phase
                </Badge>
                <span className="text-sm text-slate-600 dark:text-white/60">
                  Complete setup to activate project
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleActivateProject}
            disabled={!isSetupComplete}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Play className="w-5 h-5 mr-2" />
            Activate Project
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'glass-card text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.complete && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'resource-types' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-2">Inherit Resource Types</h2>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Select organizational resource types to use in this project. They will stay synced with the organization library.
              </p>
            </div>

            {/* Available Organizational Resource Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourceTypes.map((type) => {
                const isInherited = inheritedTypes.includes(type.id);
                return (
                  <GlassCard key={type.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-white">{type.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-white/60">
                            v{type.version || '1.0.0'}
                          </p>
                        </div>
                      </div>
                      {isInherited && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Inherited
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                      {type.schema?.properties ? Object.keys(type.schema.properties).length : 0} fields
                    </p>
                    <div className="flex gap-2">
                      {!isInherited ? (
                        <Button
                          onClick={() => handleInheritResourceType(type.id)}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Inherit
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" className="flex-1 text-sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync
                          </Button>
                          <Button variant="ghost" className="flex-1 text-sm text-red-500 hover:text-red-600">
                            <Unlink className="w-4 h-4 mr-2" />
                            Detach
                          </Button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {resourceTypes.length === 0 && (
              <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-white mb-2">No Resource Types Available</h3>
                <p className="text-slate-600 dark:text-white/60">
                  Admin needs to create organizational resource types first.
                </p>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-2">Map Resources to Assignments</h2>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Control which resource types are available to each assignment and its leader.
              </p>
            </div>

            {project.assignments && project.assignments.length > 0 ? (
              <div className="space-y-4">
                {project.assignments.map((assignment) => (
                  <GlassCard key={assignment.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-slate-900 dark:text-white">{assignment.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                          Leader: {assignment.leaderName}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {assignmentMappings[assignment.id]?.length || 0} resources mapped
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {inheritedTypes.map((typeId) => {
                        const type = resourceTypes.find(rt => rt.id === typeId);
                        if (!type) return null;
                        
                        const isMapped = assignmentMappings[assignment.id]?.includes(typeId);
                        
                        return (
                          <button
                            key={typeId}
                            onClick={() => !isMapped && handleMapResourceToAssignment(assignment.id, typeId)}
                            disabled={isMapped}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              isMapped
                                ? 'glass-card text-green-500 cursor-default'
                                : 'border border-slate-300 dark:border-white/20 text-slate-600 dark:text-white/60 hover:glass-card cursor-pointer'
                            }`}
                          >
                            <Package className="w-4 h-4 inline mr-2" />
                            {type.name}
                            {isMapped && <CheckCircle2 className="w-4 h-4 inline ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-white mb-2">No Assignments</h3>
                <p className="text-slate-600 dark:text-white/60">
                  Create assignments in the wizard before mapping resources.
                </p>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'indicators' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-2">Connect Indicators</h2>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Link assignment-level indicators to project-level KPIs to enable automatic aggregation.
              </p>
            </div>

            <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
              <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white mb-2">Visual Node Editor</h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Drag connections from assignment indicators to project indicators to define aggregation rules.
              </p>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                Coming Soon: Interactive Canvas
              </Badge>
            </GlassCard>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-2">Setup Review</h2>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Review your configuration and activate the project when ready.
              </p>
            </div>

            {/* Setup Checklist */}
            <GlassCard className="p-6">
              <h3 className="text-slate-900 dark:text-white mb-4">Configuration Checklist</h3>
              <div className="space-y-3">
                {[
                  { 
                    label: 'Resource Types Inherited', 
                    complete: hasResourceTypes,
                    required: true,
                    description: `${inheritedTypes.length} type(s) inherited`
                  },
                  { 
                    label: 'Resources Mapped to Assignments', 
                    complete: hasMappings,
                    required: false,
                    description: `${Object.keys(assignmentMappings).length} assignment(s) configured`
                  },
                  { 
                    label: 'Indicators Connected', 
                    complete: hasConnections,
                    required: false,
                    description: `${indicatorConnections.length} connection(s) defined`
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`glass-card p-4 flex items-center justify-between ${
                      item.complete ? 'border-2 border-green-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.complete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-white/20" />
                      )}
                      <div>
                        <div className="text-slate-900 dark:text-white flex items-center gap-2">
                          {item.label}
                          {item.required && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-white/60">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Activation Card */}
            <GlassCard className={`p-8 text-center border-2 ${
              isSetupComplete 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-amber-500/30 bg-amber-500/5'
            }`}>
              {isSetupComplete ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-slate-900 dark:text-white mb-2">Ready to Activate</h3>
                  <p className="text-slate-600 dark:text-white/60 mb-6">
                    Your project is configured and ready to go. Click the Activate button to start the project.
                  </p>
                  <Button
                    onClick={handleActivateProject}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Activate Project Now
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-slate-900 dark:text-white mb-2">Setup Incomplete</h3>
                  <p className="text-slate-600 dark:text-white/60 mb-6">
                    Please complete all required configuration steps before activating the project.
                  </p>
                  <Button
                    onClick={() => setActiveTab('resource-types')}
                    variant="outline"
                  >
                    Complete Setup
                  </Button>
                </>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}