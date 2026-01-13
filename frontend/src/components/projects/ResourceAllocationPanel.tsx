import { useState } from 'react';
import { Users, Plus, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useResourceStore } from '../../store/resourceStore';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { 
  allocateResourceToAssignment, 
  autoAssignResourceToTasks,
  canAllocateToAssignment,
  suggestAlternativeResources
} from '../../utils/resourceAllocationHelper';
import type { Assignment } from '../../types/project';
import type { ResourceInstance, ResourceAllocation } from '../../types/resource';

interface ResourceAllocationPanelProps {
  projectId: string;
  projectName: string;
  assignments: Assignment[];
  onAllocationComplete?: () => void;
}

export function ResourceAllocationPanel({
  projectId,
  projectName,
  assignments,
  onAllocationComplete
}: ResourceAllocationPanelProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceInstance | null>(null);
  const [utilizationPercent, setUtilizationPercent] = useState(100);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  // Store hooks
  const resourceInstances = useResourceStore((state) => state.resourceInstances);
  const allocations = useResourceStore((state) => state.allocations);
  const allocateResource = useResourceStore((state) => state.allocateResource);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const project = useProjectStore((state) => state.getProject(projectId));

  // Get existing allocations for this project
  const projectAllocations = allocations.filter(a => a.projectId === projectId);

  // Get assignments that don't have resources allocated yet
  const unallocatedAssignments = assignments.filter(assignment => {
    const hasAllocation = projectAllocations.some(a => a.assignmentId === assignment.id);
    return !hasAllocation;
  });

  const handleAllocateResource = () => {
    if (!selectedAssignment || !selectedResource || !project) return;

    // Check availability
    const availability = canAllocateToAssignment(
      selectedResource.id,
      project.details.expectedStartDate,
      project.details.expectedEndDate,
      allocations,
      utilizationPercent
    );

    if (!availability.canAllocate) {
      toast.error('Resource Conflict', {
        description: availability.reason,
        action: {
          label: 'View Alternatives',
          onClick: () => {
            // Show alternative resources
            console.log('Show alternatives');
          }
        }
      });
      return;
    }

    // Create allocation
    const allocationData = allocateResourceToAssignment(
      selectedResource.id,
      selectedResource.data?.name || selectedResource.id,
      projectId,
      selectedAssignment.id,
      project.details.expectedStartDate,
      project.details.expectedEndDate,
      utilizationPercent
    );

    const newAllocation = allocateResource(allocationData);

    if (!newAllocation) {
      toast.error('Allocation Failed', {
        description: 'Could not allocate resource due to conflicts'
      });
      return;
    }

    // ⚡ PHASE 3: Auto-assign resource to tasks
    const updatedTasks = autoAssignResourceToTasks(
      tasks,
      selectedAssignment.id,
      selectedResource.id,
      updateTask
    );

    // Show success notification
    toast.success('Resource Allocated!', {
      description: `${selectedResource.data?.name || 'Resource'} assigned to ${selectedAssignment.name}. ${updatedTasks.length} tasks updated.`,
      icon: <CheckCircle className="w-5 h-5" />
    });

    // Show warning if high utilization
    if (availability.totalUtilization && availability.totalUtilization > 80) {
      toast.warning('High Utilization', {
        description: `Resource will be ${availability.totalUtilization}% utilized`,
        icon: <AlertCircle className="w-5 h-5" />
      });
    }

    // Reset state
    setShowAllocationModal(false);
    setSelectedAssignment(null);
    setSelectedResource(null);
    setUtilizationPercent(100);

    // Callback
    if (onAllocationComplete) {
      onAllocationComplete();
    }
  };

  const openAllocationModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAllocationModal(true);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-slate-900 dark:text-white mb-1">Resource Allocation</h2>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Allocate resources to project assignments
          </p>
        </div>

        {/* Already Allocated Resources */}
        {projectAllocations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-slate-600 dark:text-white/60 mb-3">Allocated Resources</h3>
            <div className="space-y-2">
              {projectAllocations.map(allocation => {
                const assignment = assignments.find(a => a.assignmentId === allocation.assignmentId);
                return (
                  <div
                    key={allocation.id}
                    className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-900 dark:text-white font-medium">
                            {allocation.resourceName}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Allocated to: {assignment?.name || 'Unknown Assignment'}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {allocation.utilizationPercent}% Utilization
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unallocated Assignments */}
        {unallocatedAssignments.length > 0 ? (
          <div>
            <h3 className="text-sm text-slate-600 dark:text-white/60 mb-3">
              Assignments Needing Resources ({unallocatedAssignments.length})
            </h3>
            <div className="space-y-2">
              {unallocatedAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white font-medium">
                          {assignment.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          Leader: {assignment.leaderName}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openAllocationModal(assignment)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Allocate Resource
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : assignments.length > 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-white/60">
              All assignments have resources allocated!
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-white/60">
              No assignments yet. Create assignments in the Assignments tab first.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Resource Selection Modal */}
      <AnimatePresence>
        {showAllocationModal && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-slate-900 dark:text-white mb-1">
                      Allocate Resource
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-white/60">
                      Assignment: {selectedAssignment.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllocationModal(false)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Resource List */}
                <div className="mb-6">
                  <h3 className="text-sm text-slate-600 dark:text-white/60 mb-3">
                    Select Resource
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {resourceInstances.length > 0 ? (
                      resourceInstances.map(resource => {
                        const isSelected = selectedResource?.id === resource.id;
                        const availability = canAllocateToAssignment(
                          resource.id,
                          project?.details.expectedStartDate || new Date(),
                          project?.details.expectedEndDate || new Date(),
                          allocations,
                          utilizationPercent
                        );

                        return (
                          <button
                            key={resource.id}
                            onClick={() => setSelectedResource(resource)}
                            className={`
                              w-full p-4 rounded-lg text-left transition-all
                              ${isSelected
                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-transparent'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-slate-900 dark:text-white font-medium">
                                  {resource.data?.name || resource.id}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Type: {resource.typeId}
                                </div>
                              </div>
                              {!availability.canAllocate && (
                                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                                  Conflict
                                </Badge>
                              )}
                              {availability.canAllocate && availability.totalUtilization && availability.totalUtilization > 80 && (
                                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                  High Load
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-600 dark:text-white/60">
                        No resources available. Create resources in the Resources module first.
                      </div>
                    )}
                  </div>
                </div>

                {/* Utilization Slider */}
                {selectedResource && (
                  <div className="mb-6">
                    <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                      Utilization Percentage: {utilizationPercent}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={utilizationPercent}
                      onChange={(e) => setUtilizationPercent(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-white/60 mt-1">
                      <span>10% (Part-time)</span>
                      <span>100% (Full-time)</span>
                    </div>
                  </div>
                )}

                {/* Project Timeline Info */}
                {project && (
                  <div className="mb-6 p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {project.details.expectedStartDate.toLocaleDateString()} - {project.details.expectedEndDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllocationModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAllocateResource}
                    disabled={!selectedResource}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Allocate Resource
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}