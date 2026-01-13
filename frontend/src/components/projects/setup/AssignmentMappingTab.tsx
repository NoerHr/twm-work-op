import { useState } from 'react';
import { Check, X, Info, Save } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project, Assignment } from '../../../types/project';
import type { ProjectResourceType, AssignmentResourceMapping } from '../../../types/resource';

interface AssignmentMappingTabProps {
  project: Project;
  resourceTypes: ProjectResourceType[];
  mappings: AssignmentResourceMapping[];
  onUpdate: (mappings: AssignmentResourceMapping[]) => void;
}

export function AssignmentMappingTab({
  project,
  resourceTypes,
  mappings,
  onUpdate
}: AssignmentMappingTabProps) {
  // ✅ FIX: Assignments are at project.assignments, not project.workflow.assignments
  const assignments = project.assignments || [];
  
  // Initialize mapping state from existing mappings or empty
  const [matrixState, setMatrixState] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    assignments.forEach(assignment => {
      const existingMapping = mappings.find(m => m.assignmentId === assignment.id);
      initial[assignment.id] = existingMapping?.resourceTypeIds || [];
    });
    return initial;
  });

  const toggleMapping = (assignmentId: string, resourceTypeId: string) => {
    setMatrixState(prev => {
      const current = prev[assignmentId] || [];
      const isChecked = current.includes(resourceTypeId);
      
      return {
        ...prev,
        [assignmentId]: isChecked
          ? current.filter(id => id !== resourceTypeId)
          : [...current, resourceTypeId]
      };
    });
  };

  const handleSave = () => {
    const newMappings: AssignmentResourceMapping[] = assignments.map(assignment => ({
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      resourceTypeIds: matrixState[assignment.id] || [],
      instances: [] // Will be populated later during execution
    }));

    onUpdate(newMappings);
    toast.success('Assignment mappings saved!', {
      description: `${newMappings.filter(m => m.resourceTypeIds.length > 0).length} assignments configured`
    });
  };

  const getResourceIcon = (typeId: string) => {
    const type = resourceTypes.find(t => t.id === typeId);
    return type?.icon || '📦';
  };

  const getResourceName = (typeId: string) => {
    const type = resourceTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown';
  };

  const getMappingStats = (assignmentId: string) => {
    const count = (matrixState[assignmentId] || []).length;
    const total = resourceTypes.length;
    return { count, total };
  };

  const getTotalMappings = () => {
    return Object.values(matrixState).reduce((sum, ids) => sum + ids.length, 0);
  };

  if (resourceTypes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-slate-600 dark:text-white/60" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-3">No Resources Available</h3>
          <p className="text-slate-600 dark:text-white/60">
            You must inherit at least one resource type before mapping assignments.
            Go back to the Resource Inheritance tab to add resources.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-slate-600 dark:text-white/60" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-3">No Assignments Defined</h3>
          <p className="text-slate-600 dark:text-white/60">
            This project has no assignments. Assignments should have been created during the project creation wizard.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-slate-900 dark:text-white mb-1">Assignment Resource Mapping</h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Control which resources each assignment can access
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-white/60">
              <span className="font-medium text-slate-900 dark:text-white">{getTotalMappings()}</span> total mappings
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Mappings
            </Button>
          </div>
        </div>

        <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-white/80">
              <strong>Scope Control:</strong> Not every leader needs every tool. 
              Check the boxes where assignments meet resources to grant access. 
              This prevents clutter and ensures proper resource usage.
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Matrix View */}
      <div className="flex-1 overflow-auto">
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="sticky left-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      Assignments
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {assignments.length} total
                    </div>
                  </th>
                  {resourceTypes.map((type) => (
                    <th
                      key={type.id}
                      className="p-4 text-center border-l border-slate-200 dark:border-white/10"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl">{type.icon}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {type.name}
                        </div>
                        <Badge variant="outline" size="sm">
                          v{type.version}
                        </Badge>
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-center border-l border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="text-xs font-medium text-slate-600 dark:text-white/60">
                      Total
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {assignments.map((assignment, index) => {
                  const stats = getMappingStats(assignment.id);
                  return (
                    <tr
                      key={assignment.id}
                      className={`border-b border-slate-200 dark:border-white/10 ${
                        index % 2 === 0 ? 'bg-white/50 dark:bg-white/5' : ''
                      }`}
                    >
                      {/* Assignment Name */}
                      <td className="sticky left-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl p-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white mb-1">
                            {assignment.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Stage: {project.workflow?.stages?.find(s => s.id === assignment.stageId)?.name}
                          </div>
                          {assignment.leaders && assignment.leaders.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {assignment.leaders.slice(0, 2).map((leader) => (
                                <img
                                  key={leader.id}
                                  src={leader.avatar}
                                  alt={leader.name}
                                  className="w-5 h-5 rounded-full border border-white/20"
                                  title={leader.name}
                                />
                              ))}
                              {assignment.leaders.length > 2 && (
                                <span className="text-xs text-slate-600 dark:text-white/60">
                                  +{assignment.leaders.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Resource Checkboxes */}
                      {resourceTypes.map((type) => {
                        const isChecked = (matrixState[assignment.id] || []).includes(type.id);
                        return (
                          <td
                            key={type.id}
                            className="p-4 text-center border-l border-slate-200 dark:border-white/10"
                          >
                            <button
                              onClick={() => toggleMapping(assignment.id, type.id)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                                  : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20'
                              }`}
                            >
                              {isChecked ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Count */}
                      <td className="p-4 text-center border-l border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                        <Badge
                          variant={stats.count > 0 ? 'success' : 'outline'}
                          size="sm"
                        >
                          {stats.count}/{stats.total}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer - Resource Totals */}
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                  <td className="sticky left-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl p-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      Total per Resource
                    </div>
                  </td>
                  {resourceTypes.map((type) => {
                    const count = assignments.filter(a =>
                      (matrixState[a.id] || []).includes(type.id)
                    ).length;
                    return (
                      <td
                        key={type.id}
                        className="p-4 text-center border-l border-slate-200 dark:border-white/10"
                      >
                        <Badge
                          variant={count > 0 ? 'success' : 'outline'}
                          size="sm"
                        >
                          {count}/{assignments.length}
                        </Badge>
                      </td>
                    );
                  })}
                  <td className="p-4 text-center border-l border-slate-200 dark:border-white/10">
                    <Badge variant="default" size="sm">
                      {getTotalMappings()}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Legend */}
      <div className="mt-6">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-600 dark:text-white/60">
                  Access Granted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-200 dark:bg-white/10 rounded" />
                <span className="text-slate-600 dark:text-white/60">
                  No Access
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-white/60">
              Click cells to toggle access
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}