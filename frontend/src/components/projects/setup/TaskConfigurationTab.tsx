import { useState } from 'react';
import { CheckCircle2, ListChecks, Info, Wrench, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project } from '../../../types/project';
import type { ProjectResourceType, AssignmentResourceMapping } from '../../../types/resource';

interface TaskConfigurationTabProps {
  project: Project;
  resourceTypes: ProjectResourceType[];
  assignmentMappings: AssignmentResourceMapping[];
  configured: boolean;
  onUpdate: (configured: boolean) => void;
}

export function TaskConfigurationTab({
  project,
  resourceTypes,
  assignmentMappings,
  configured,
  onUpdate
}: TaskConfigurationTabProps) {
  const [showPreview, setShowPreview] = useState(false);

  const assignments = project.workflow?.assignments || [];
  const tasks = project.workflow?.tasks || [];

  // Get mapped resources for each assignment
  const getAssignmentResources = (assignmentId: string) => {
    const mapping = assignmentMappings.find(m => m.assignmentId === assignmentId);
    if (!mapping) return [];
    
    return mapping.resourceTypeIds.map(typeId => 
      resourceTypes.find(rt => rt.id === typeId)
    ).filter(Boolean) as ProjectResourceType[];
  };

  // Get tasks for assignment
  const getAssignmentTasks = (assignmentId: string) => {
    return tasks.filter(t => t.assignmentId === assignmentId);
  };

  const handleMarkConfigured = () => {
    onUpdate(true);
    toast.success('Task configuration completed!', {
      description: 'All assignments have task workflows configured'
    });
  };

  const getTotalTasksWithResources = () => {
    return tasks.filter(task => {
      const resources = getAssignmentResources(task.assignmentId);
      return resources.length > 0;
    }).length;
  };

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-slate-900 dark:text-white mb-1">Task Configuration</h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Review task workflows and resource integrations
            </p>
          </div>
          {!configured && (
            <Button
              onClick={handleMarkConfigured}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Configured
            </Button>
          )}
        </div>

        <GlassCard className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-white/80">
              <strong>The Workflow Engine:</strong> Tasks inherit resource capabilities 
              from the assignment mappings you configured. Leaders can use these resources 
              when creating task outputs and automations.
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Status Overview */}
      {configured ? (
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="max-w-md text-center p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-slate-900 dark:text-white mb-3">
              Tasks Configured Successfully
            </h3>
            <p className="text-slate-600 dark:text-white/60 mb-6">
              All task workflows are configured and ready. Leaders can now start 
              executing tasks once the project is activated.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {tasks.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  Total Tasks
                </div>
              </div>
              <div className="p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {getTotalTasksWithResources()}
                </div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  With Resources
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {/* Assignment Task Preview */}
          <div className="space-y-6">
            {assignments.map((assignment) => {
              const assignmentTasks = getAssignmentTasks(assignment.id);
              const resources = getAssignmentResources(assignment.id);
              
              return (
                <GlassCard key={assignment.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-slate-900 dark:text-white mb-2">
                        {assignment.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          {assignmentTasks.length} task{assignmentTasks.length !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline">
                          {resources.length} resource{resources.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    {assignment.leaders && assignment.leaders.length > 0 && (
                      <div className="flex items-center gap-2">
                        {assignment.leaders.map((leader) => (
                          <img
                            key={leader.id}
                            src={leader.avatar}
                            alt={leader.name}
                            className="w-8 h-8 rounded-full border-2 border-white/20"
                            title={leader.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Resources */}
                  {resources.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Available Resource Functions:
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {resources.flatMap(resource =>
                          resource.functions.map(fn => (
                            <div
                              key={`${resource.id}-${fn.id}`}
                              className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{resource.icon}</span>
                                <span className="font-mono text-purple-600 dark:text-purple-400">
                                  {fn.name}()
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Configured Tasks:
                      </span>
                    </div>
                    {assignmentTasks.length > 0 ? (
                      <div className="space-y-2">
                        {assignmentTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                  {task.title}
                                </div>
                                {task.assignedTo && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                                    <img
                                      src={task.assignedTo.avatar}
                                      alt={task.assignedTo.name}
                                      className="w-4 h-4 rounded-full"
                                    />
                                    {task.assignedTo.name}
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant={resources.length > 0 ? 'success' : 'outline'}
                                size="sm"
                              >
                                {resources.length > 0 ? 'Resources Available' : 'No Resources'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                          <AlertCircle className="w-4 h-4" />
                          No tasks configured for this assignment
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!configured && (
        <div className="mt-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-slate-600 dark:text-white/60">
                    {tasks.length} Total Tasks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-slate-600 dark:text-white/60">
                    {getTotalTasksWithResources()} With Resources
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                Review and mark as configured when ready
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
