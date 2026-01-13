import type { ResourceAllocation } from '../types/resource';
import type { Assignment } from '../types/project';
import type { TaskInstance } from '../types/task';

/**
 * Helper functions for resource allocation integration with projects and tasks
 */

/**
 * Allocate resource to project assignment
 * @returns Allocation ID if successful
 */
export function allocateResourceToAssignment(
  resourceId: string,
  resourceName: string,
  projectId: string,
  assignmentId: string,
  startDate: Date,
  endDate: Date,
  utilizationPercent: number = 100
): Omit<ResourceAllocation, 'id' | 'allocatedAt' | 'status'> {
  return {
    resourceId,
    resourceName,
    projectId,
    assignmentId,
    startDate,
    endDate,
    utilizationPercent,
    allocatedBy: 'current-user', // Would come from auth in real app
    notes: `Allocated to assignment in project`
  };
}

/**
 * Auto-assign resource to all tasks in an assignment
 * @returns Array of task IDs that were updated
 */
export function autoAssignResourceToTasks(
  tasks: TaskInstance[],
  assignmentId: string,
  resourceId: string,
  updateTaskFn: (taskId: string, updates: Partial<TaskInstance>) => void
): string[] {
  const assignmentTasks = tasks.filter(t => t.assignmentId === assignmentId);
  const updatedTaskIds: string[] = [];

  assignmentTasks.forEach(task => {
    // Only assign if task doesn't already have an assignee or is assigned to the same resource
    if (!task.assigneeId || task.assigneeId === resourceId) {
      updateTaskFn(task.id, {
        assigneeId: resourceId,
        // Keep assigneeName if it exists (might be different from resourceId)
        metadata: {
          ...task.metadata,
          resourceAllocated: true,
          resourceAllocationDate: new Date().toISOString()
        }
      });
      updatedTaskIds.push(task.id);
    }
  });

  return updatedTaskIds;
}

/**
 * Calculate resource utilization from task time logs
 */
export function calculateResourceUtilization(
  resourceId: string,
  tasks: TaskInstance[],
  startDate: Date,
  endDate: Date
): {
  totalHoursAllocated: number;
  totalHoursLogged: number;
  utilizationPercentage: number;
  taskCount: number;
} {
  const resourceTasks = tasks.filter(t => 
    t.assigneeId === resourceId &&
    t.scheduledDate >= startDate &&
    t.scheduledDate <= endDate
  );

  const totalHoursAllocated = resourceTasks.reduce((sum, task) => {
    return sum + (task.metadata?.estimatedHours || 0);
  }, 0);

  const totalHoursLogged = resourceTasks.reduce((sum, task) => {
    // In a real app, this would come from time tracking
    // For now, estimate based on task completion
    if (task.status === 'completed') {
      return sum + (task.metadata?.estimatedHours || 0);
    }
    return sum;
  }, 0);

  const utilizationPercentage = totalHoursAllocated > 0 
    ? (totalHoursLogged / totalHoursAllocated) * 100 
    : 0;

  return {
    totalHoursAllocated,
    totalHoursLogged,
    utilizationPercentage,
    taskCount: resourceTasks.length
  };
}

/**
 * Get all resources allocated to a project with their tasks
 */
export function getProjectResourceSummary(
  projectId: string,
  allocations: ResourceAllocation[],
  tasks: TaskInstance[]
) {
  const projectAllocations = allocations.filter(a => 
    a.projectId === projectId && 
    a.status === 'active'
  );

  return projectAllocations.map(allocation => {
    const resourceTasks = tasks.filter(t => 
      t.assigneeId === allocation.resourceId &&
      t.projectId === projectId
    );

    const utilization = calculateResourceUtilization(
      allocation.resourceId,
      tasks,
      allocation.startDate,
      allocation.endDate
    );

    return {
      allocation,
      tasks: resourceTasks,
      utilization
    };
  });
}

/**
 * Check if resource can be allocated to assignment (availability check)
 */
export function canAllocateToAssignment(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  existingAllocations: ResourceAllocation[],
  requestedUtilization: number = 100
): {
  canAllocate: boolean;
  reason?: string;
  conflictingAllocations?: ResourceAllocation[];
  totalUtilization?: number;
} {
  // Find overlapping allocations
  const overlapping = existingAllocations.filter(a => 
    a.resourceId === resourceId &&
    a.status === 'active' &&
    // Check date overlap
    (
      (startDate <= a.endDate && endDate >= a.startDate)
    )
  );

  if (overlapping.length === 0) {
    return { canAllocate: true };
  }

  // Calculate total utilization during overlap period
  const totalUtilization = overlapping.reduce((sum, a) => sum + a.utilizationPercent, 0) + requestedUtilization;

  if (totalUtilization > 100) {
    return {
      canAllocate: false,
      reason: `Resource is already ${overlapping.reduce((sum, a) => sum + a.utilizationPercent, 0)}% allocated during this period. Adding ${requestedUtilization}% would overbook.`,
      conflictingAllocations: overlapping,
      totalUtilization
    };
  }

  // Allow allocation with warning if utilization is high
  if (totalUtilization > 80) {
    return {
      canAllocate: true,
      reason: `Warning: Resource will be ${totalUtilization}% utilized`,
      conflictingAllocations: overlapping,
      totalUtilization
    };
  }

  return { canAllocate: true };
}

/**
 * Suggest alternative resources when primary is unavailable
 */
export function suggestAlternativeResources(
  typeId: string,
  startDate: Date,
  endDate: Date,
  resourceInstances: any[], // ResourceInstance[]
  existingAllocations: ResourceAllocation[]
): Array<{
  resourceId: string;
  resourceName: string;
  availableCapacity: number;
  skills?: string[];
}> {
  const resourcesOfType = resourceInstances.filter(r => r.typeId === typeId);

  return resourcesOfType
    .map(resource => {
      const { canAllocate, totalUtilization } = canAllocateToAssignment(
        resource.id,
        startDate,
        endDate,
        existingAllocations,
        0 // Check current utilization
      );

      const availableCapacity = 100 - (totalUtilization || 0);

      return {
        resourceId: resource.id,
        resourceName: resource.data?.name || resource.id,
        availableCapacity,
        skills: resource.data?.skills || []
      };
    })
    .filter(r => r.availableCapacity > 0)
    .sort((a, b) => b.availableCapacity - a.availableCapacity);
}

/**
 * Generate allocation timeline for project
 */
export function generateAllocationTimeline(
  projectId: string,
  allocations: ResourceAllocation[]
): Array<{
  date: Date;
  allocations: ResourceAllocation[];
  totalUtilization: number;
}> {
  const projectAllocations = allocations.filter(a => a.projectId === projectId);
  
  if (projectAllocations.length === 0) return [];

  // Find date range
  const allDates = projectAllocations.flatMap(a => [a.startDate, a.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  const timeline: Array<{
    date: Date;
    allocations: ResourceAllocation[];
    totalUtilization: number;
  }> = [];

  // Generate weekly timeline
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    const weekAllocations = projectAllocations.filter(a =>
      currentDate >= a.startDate && currentDate <= a.endDate
    );

    const totalUtilization = weekAllocations.reduce((sum, a) => sum + a.utilizationPercent, 0);

    timeline.push({
      date: new Date(currentDate),
      allocations: weekAllocations,
      totalUtilization
    });

    currentDate.setDate(currentDate.getDate() + 7); // Next week
  }

  return timeline;
}

/**
 * Deallocate resource from assignment and update tasks
 */
export function deallocateResourceFromAssignment(
  assignmentId: string,
  resourceId: string,
  tasks: TaskInstance[],
  updateTaskFn: (taskId: string, updates: Partial<TaskInstance>) => void
): string[] {
  const assignmentTasks = tasks.filter(t => 
    t.assignmentId === assignmentId && 
    t.assigneeId === resourceId &&
    t.status !== 'completed' // Don't unassign completed tasks
  );

  const updatedTaskIds: string[] = [];

  assignmentTasks.forEach(task => {
    updateTaskFn(task.id, {
      assigneeId: undefined,
      assigneeName: undefined,
      metadata: {
        ...task.metadata,
        resourceAllocated: false,
        resourceDeallocationDate: new Date().toISOString()
      }
    });
    updatedTaskIds.push(task.id);
  });

  return updatedTaskIds;
}
