// Assignment Management System - Type Definitions
// Bridge between Project Strategy (PM) and Task Execution (Contributor)

export type AssignmentStatus = 'PENDING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';

export type TaskFlowNodeType = 'start' | 'task' | 'decision' | 'parallel' | 'end';

// The Assignment Entity (Work Package within a Project Stage)
export interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  stageId: string;
  stageName: string;
  
  // Core Info
  title: string;
  description: string;
  
  // Roles
  pmId: string; // Project Manager (Delegator)
  pmName: string;
  leaderId: string; // Team Leader (Assignee)
  leaderName: string;
  
  // Constraints (The "Sandbox" - Defined by PM)
  allowedResourceTypes: string[]; // Resource Type IDs available for use
  budgetCap: number;
  startDate: string;
  dueDate: string;
  
  // State
  status: AssignmentStatus;
  progress: number; // 0-100, aggregated from task completion
  
  // Workflow
  hasWorkflow: boolean; // Has Leader designed the task flow?
  taskCount: number; // Total tasks in workflow
  completedTaskCount: number;
  
  // Indicators
  assignmentIndicators: AssignmentIndicator[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string; // When Leader accepted
  completedAt?: string;
}

// Assignment-level KPIs (Operational Indicators)
export interface AssignmentIndicator {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  sourceTaskIds: string[]; // Tasks that feed this indicator
}

// Task Flow Node (Visual representation in Canvas)
export interface TaskFlowNode {
  id: string;
  type: TaskFlowNodeType;
  
  // Position in Canvas
  position: { x: number; y: number };
  
  // Task Configuration (if type === 'task')
  taskConfig?: TaskConfiguration;
  
  // Visual
  label: string;
  description?: string;
}

// Task Flow Edge (Connection between nodes)
export interface TaskFlowEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  label?: string;
  condition?: string; // For decision nodes
}

// Task Configuration (4 Pillars)
export interface TaskConfiguration {
  // Pillar 1: Input (What data does Contributor see?)
  inputs: TaskInput[];
  
  // Pillar 2: Trigger (When and who?)
  trigger: TaskTrigger;
  
  // Pillar 3: Form (How to interact?)
  form: TaskForm;
  
  // Pillar 4: Output (What happens after?)
  outputs: TaskOutput[];
}

// Pillar 1: Input
export interface TaskInput {
  id: string;
  label: string;
  source: 'indicator' | 'resource' | 'previous_task';
  sourceId: string;
  readonly: boolean;
}

// Pillar 2: Trigger
export interface TaskTrigger {
  type: 'manual' | 'scheduled' | 'event';
  
  // For scheduled
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    time?: string;
  };
  
  // For event
  eventSource?: string;
  
  // Assignment
  assignedTo: TaskAssignment;
}

export interface TaskAssignment {
  type: 'specific' | 'role' | 'pool';
  contributorIds?: string[]; // For 'specific'
  roleId?: string; // For 'role'
}

// Pillar 3: Form (Dynamic Form Builder)
export interface TaskForm {
  fields: FormField[];
  layout: 'vertical' | 'horizontal' | 'grid';
}

export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'camera' 
  | 'file' 
  | 'batch';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FormFieldValidation;
  
  // For select
  options?: { label: string; value: string }[];
  
  // For batch processing
  batchConfig?: BatchConfig;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

// Batch Processing Configuration
export interface BatchConfig {
  itemName: string; // e.g., "Room", "Product"
  quantityType: 'fixed' | 'manual';
  fixedQuantity?: number;
  subFields: FormField[]; // Fields repeated per item
}

// Pillar 4: Output
export interface TaskOutput {
  id: string;
  action: 'update_resource' | 'feed_indicator' | 'trigger_next' | 'notify';
  targetId: string;
  mapping: Record<string, string>; // Field ID -> Target Property
}

// Assignment Workflow (Complete flow definition)
export interface AssignmentWorkflow {
  assignmentId: string;
  nodes: TaskFlowNode[];
  edges: TaskFlowEdge[];
  isPublished: boolean;
  publishedAt?: string;
  version: number;
}

// Store State
export interface AssignmentState {
  assignments: Assignment[];
  activeAssignment: Assignment | null;
  activeWorkflow: AssignmentWorkflow | null;
  
  // Actions
  fetchAssignments: () => Promise<void>;
  setActiveAssignment: (id: string) => void;
  acceptAssignment: (id: string) => Promise<void>;
  updateProgress: (id: string, progress: number) => void;
  getAssignmentById: (id: string) => Assignment | null;
  
  // Workflow Actions
  saveWorkflow: (workflow: AssignmentWorkflow) => Promise<void>;
  publishWorkflow: (assignmentId: string) => Promise<void>;
}