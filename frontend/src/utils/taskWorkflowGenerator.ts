import type { Assignment } from '../types/project';
import type { WorkflowDefinition, WorkflowNode, WorkflowEdge, TaskInstance } from '../types/task';

/**
 * Generates a task workflow from a project assignment
 * This creates a default workflow with standard project tasks
 */
export function generateWorkflowFromAssignment(
  assignment: Assignment,
  projectId: string,
  projectName: string
): { workflow: WorkflowDefinition; tasks: TaskInstance[] } {
  const workflowId = `wf-${assignment.id}-${Date.now()}`;
  const now = new Date();

  // Create workflow nodes based on assignment
  const nodes: WorkflowNode[] = [
    // Start Node
    {
      id: 'node-start',
      type: 'start',
      position: { x: 100, y: 200 },
      data: {
        label: 'Start Assignment',
        type: 'start'
      }
    },
    // Task 1: Planning
    {
      id: 'node-planning',
      type: 'task',
      position: { x: 300, y: 200 },
      data: {
        label: `${assignment.name} - Planning`,
        type: 'task',
        taskId: `task-planning-${assignment.id}`,
        config: {
          assigneeType: 'leader',
          priority: 'high',
          estimatedHours: 4,
          isBatch: false,
          requiresApproval: false,
          formSchema: {
            id: 'form-planning',
            name: 'Planning Checklist',
            fields: [
              {
                id: 'objectives',
                type: 'textarea',
                label: 'Assignment Objectives',
                placeholder: 'Define clear objectives...',
                required: true
              },
              {
                id: 'milestones',
                type: 'textarea',
                label: 'Key Milestones',
                placeholder: 'List major milestones...',
                required: true
              },
              {
                id: 'risks',
                type: 'textarea',
                label: 'Risk Assessment',
                placeholder: 'Identify potential risks...',
                required: false
              }
            ]
          }
        }
      }
    },
    // Task 2: Execution
    {
      id: 'node-execution',
      type: 'task',
      position: { x: 550, y: 200 },
      data: {
        label: `${assignment.name} - Execution`,
        type: 'task',
        taskId: `task-execution-${assignment.id}`,
        config: {
          assigneeType: 'team',
          priority: 'medium',
          estimatedHours: 40,
          isBatch: false,
          requiresApproval: false,
          formSchema: {
            id: 'form-execution',
            name: 'Execution Progress',
            fields: [
              {
                id: 'completed_work',
                type: 'textarea',
                label: 'Work Completed',
                placeholder: 'Describe completed work...',
                required: true
              },
              {
                id: 'hours_spent',
                type: 'number',
                label: 'Hours Spent',
                placeholder: 'Enter hours...',
                required: true
              },
              {
                id: 'blockers',
                type: 'textarea',
                label: 'Blockers/Issues',
                placeholder: 'Any blockers?',
                required: false
              }
            ]
          }
        }
      }
    },
    // Task 3: Review
    {
      id: 'node-review',
      type: 'task',
      position: { x: 800, y: 200 },
      data: {
        label: `${assignment.name} - Review`,
        type: 'task',
        taskId: `task-review-${assignment.id}`,
        config: {
          assigneeType: 'leader',
          priority: 'high',
          estimatedHours: 2,
          isBatch: false,
          requiresApproval: true,
          formSchema: {
            id: 'form-review',
            name: 'Quality Review',
            fields: [
              {
                id: 'quality_score',
                type: 'select',
                label: 'Quality Score',
                placeholder: 'Rate quality...',
                required: true,
                options: [
                  { label: 'Excellent', value: 'excellent' },
                  { label: 'Good', value: 'good' },
                  { label: 'Needs Improvement', value: 'needs_improvement' },
                  { label: 'Rejected', value: 'rejected' }
                ]
              },
              {
                id: 'review_notes',
                type: 'textarea',
                label: 'Review Notes',
                placeholder: 'Provide feedback...',
                required: true
              },
              {
                id: 'approved',
                type: 'checkbox',
                label: 'Approve for Completion',
                required: true
              }
            ]
          }
        }
      }
    },
    // End Node
    {
      id: 'node-end',
      type: 'end',
      position: { x: 1050, y: 200 },
      data: {
        label: 'Complete Assignment',
        type: 'end'
      }
    }
  ];

  // Create workflow edges (connections)
  const edges: WorkflowEdge[] = [
    {
      id: 'edge-1',
      source: 'node-start',
      target: 'node-planning',
      type: 'default'
    },
    {
      id: 'edge-2',
      source: 'node-planning',
      target: 'node-execution',
      type: 'default'
    },
    {
      id: 'edge-3',
      source: 'node-execution',
      target: 'node-review',
      type: 'default'
    },
    {
      id: 'edge-4',
      source: 'node-review',
      target: 'node-end',
      type: 'default'
    }
  ];

  // Create the workflow definition
  const workflow: WorkflowDefinition = {
    id: workflowId,
    name: `${assignment.name} Workflow`,
    description: `Auto-generated workflow for ${assignment.name} assignment`,
    category: 'project',
    version: '1.0',
    status: 'active',
    nodes,
    edges,
    metadata: {
      projectId,
      projectName,
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      stageId: assignment.stageId,
      leaderId: assignment.leaderId,
      leaderName: assignment.leaderName,
      autoGenerated: true,
      generatedAt: now.toISOString()
    },
    createdBy: assignment.leaderId,
    createdAt: now,
    updatedAt: now
  };

  // Create task instances from task nodes
  const taskNodes = nodes.filter(n => n.type === 'task');
  const tasks: TaskInstance[] = taskNodes.map((node, index) => ({
    id: node.data.config?.taskId || `task-${workflowId}-${index}`,
    workflowId,
    workflowName: workflow.name,
    nodeId: node.id,
    status: index === 0 ? 'todo' : 'pending', // First task is ready, others wait
    priority: node.data.config?.priority || 'medium',
    assigneeId: assignment.leaderId,
    assigneeName: assignment.leaderName,
    projectId,
    projectName,
    assignmentId: assignment.id,
    assignmentName: assignment.name,
    scheduledDate: now,
    dueDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
    isBatch: node.data.config?.isBatch || false,
    formSchema: node.data.config?.formSchema,
    metadata: {
      estimatedHours: node.data.config?.estimatedHours,
      taskSequence: index + 1,
      totalTasks: taskNodes.length
    }
  }));

  return { workflow, tasks };
}

/**
 * Links existing tasks to an assignment
 */
export function linkTasksToAssignment(
  taskIds: string[],
  assignmentId: string,
  assignmentName: string
): void {
  // This will be used to update existing tasks with assignment info
  // Implementation depends on how you want to handle this
  console.log(`Linking tasks ${taskIds} to assignment ${assignmentId}: ${assignmentName}`);
}

/**
 * Creates a minimal task for quick assignment setup
 */
export function createMinimalTask(
  assignmentId: string,
  assignmentName: string,
  leaderId: string,
  leaderName: string,
  projectId: string,
  projectName: string
): TaskInstance {
  return {
    id: `task-${assignmentId}-${Date.now()}`,
    workflowId: `wf-quick-${assignmentId}`,
    workflowName: `Quick Task - ${assignmentName}`,
    nodeId: 'node-quick-task',
    status: 'todo',
    priority: 'medium',
    assigneeId: leaderId,
    assigneeName: leaderName,
    projectId,
    projectName,
    assignmentId,
    assignmentName,
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isBatch: false,
    formSchema: {
      id: 'form-quick',
      name: 'Task Completion Form',
      fields: [
        {
          id: 'completion_notes',
          type: 'textarea',
          label: 'Completion Notes',
          placeholder: 'Describe what was done...',
          required: true
        },
        {
          id: 'hours_worked',
          type: 'number',
          label: 'Hours Worked',
          placeholder: 'Enter hours...',
          required: true
        }
      ]
    },
    metadata: {
      quickTask: true,
      estimatedHours: 8
    }
  };
}
