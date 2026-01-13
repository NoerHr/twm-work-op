/**
 * SWIZ Workspace - Task Management Type Definitions
 * 4-Pillar Task Model: Input + Trigger + Form + Output
 */

// ============================================================================
// Core Enums & Types
// ============================================================================

export type TaskStatus = 'coming-soon' | 'todo' | 'in-progress' | 'completed' | 'overdue' | 'skipped' | 'rejected';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
export type ExecutionType = 'online' | 'offline-sync';
export type ConfigMode = 'individual' | 'batch';

// ============================================================================
// 4-Pillar Task Model
// ============================================================================

/**
 * PILLAR 1: INPUT
 * Defines what resources and indicators are required before task can start
 */
export interface TaskInputPillar {
  // Required Resources
  requiredResources: {
    resourceTypeId: string;
    resourceTypeName: string;
    quantity: number;
    optional: boolean;
    validationRule?: string; // Expression like "resource.status == 'available'"
  }[];
  
  // Required Indicators (Pre-conditions)
  requiredIndicators: {
    indicatorId: string;
    indicatorName: string;
    condition: {
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
      value: number;
      value2?: number; // For 'between'
    };
    optional: boolean;
  }[];
  
  // Pre-execution Checklist
  checklist?: {
    id: string;
    label: string;
    required: boolean;
    helpText?: string;
  }[];
}

/**
 * PILLAR 2: TRIGGER
 * Defines when and how the task is triggered
 */
export interface TaskTriggerPillar {
  type: 'manual' | 'schedule' | 'event' | 'workflow';
  
  // For 'manual' trigger
  manualConfig?: {
    initiatorRoles: string[]; // Who can manually start this task
    requiresApproval?: boolean;
    approverRoles?: string[];
  };
  
  // For 'schedule' trigger
  scheduleConfig?: {
    cronExpression: string; // e.g., "0 9 * * MON" (Every Monday at 9 AM)
    timezone: string; // e.g., "Asia/Jakarta"
    startDate?: Date;
    endDate?: Date;
    maxOccurrences?: number;
  };
  
  // For 'event' trigger
  eventConfig?: {
    eventType: 'indicator_change' | 'resource_update' | 'stage_complete' | 'gate_approve' | 'webhook';
    eventSource?: string; // Indicator ID, Resource ID, etc.
    condition?: string; // Expression like "newValue > oldValue * 1.5"
    debounceMs?: number; // Milliseconds to wait before triggering
  };
  
  // For 'workflow' trigger
  workflowConfig?: {
    dependsOn: string[]; // IDs of tasks that must complete first
    waitForAll: boolean; // true = AND logic, false = OR logic
    inheritContext: boolean; // Inherit data from upstream tasks
  };
  
  // Advanced Conditions
  condition?: string; // Global condition expression (optional additional check)
}

/**
 * PILLAR 3: FORM
 * Defines the mobile-first UI for task execution
 */
export interface TaskFormPillar {
  // Form Schema
  schema: FormSchema;
  
  // Layout Configuration (Mobile-first)
  layout: FormLayout;
  
  // Form Behavior
  behavior?: {
    allowSave: boolean; // Can user save as draft?
    allowSkip: boolean; // Can user skip this task?
    requiresRejectionReason: boolean; // Must provide reason if rejected/skipped
    autoCalculateFields?: string[]; // Field IDs that auto-calculate
    validationMode: 'on-blur' | 'on-submit' | 'on-change';
  };
  
  // Pre-fill Configuration
  prefillConfig?: {
    fromContext: Record<string, string>; // Map field IDs to context keys
    fromPreviousTask?: string; // Task ID to inherit data from
    fromIndicator?: Record<string, string>; // Map field IDs to indicator local pools
  };
}

/**
 * Form Schema Definition
 */
export interface FormSchema {
  id: string;
  name: string;
  version: string;
  fields: FormField[];
}

/**
 * Form Field Definition
 */
export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'time' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'image' | 'signature' | 'location' | 'barcode' | 'qrcode';
  label: string;
  placeholder?: string;
  required: boolean;
  
  // Validation Rules
  validation?: {
    pattern?: string; // Regex pattern
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    allowedFileTypes?: string[]; // For 'file' type
    maxFileSize?: number; // In bytes
    customRule?: string; // Custom validation expression
  };
  
  // Options (for select, multiselect, radio)
  options?: {
    label: string;
    value: string;
    disabled?: boolean;
    icon?: string;
  }[];
  
  // Dynamic Options (fetch from resource)
  dynamicOptions?: {
    resourceTypeId: string;
    labelField: string;
    valueField: string;
    filters?: Record<string, any>;
  };
  
  // Default Value
  defaultValue?: any;
  
  // Help Text
  helpText?: string;
  
  // Conditional Display
  conditional?: {
    field: string; // Field ID
    operator: '==' | '!=' | '>' | '<' | 'contains' | 'not-contains';
    value: any;
  };
  
  // Calculation Formula (for auto-calculated fields)
  formula?: string; // Expression like "{{field1}} + {{field2}}"
  
  // Offline Support
  offlineConfig?: {
    syncPriority: 'high' | 'medium' | 'low';
    cacheStrategy: 'always' | 'wifi-only' | 'never';
  };
}

/**
 * Form Layout (Mobile-first)
 */
export interface FormLayout {
  type: 'single-column' | 'two-column' | 'accordion' | 'tabs' | 'wizard';
  
  // For 'accordion' and 'tabs'
  sections?: {
    id: string;
    title: string;
    icon?: string;
    fields: string[]; // Field IDs
    collapsed?: boolean; // For accordion
  }[];
  
  // For 'wizard'
  steps?: {
    id: string;
    title: string;
    description?: string;
    fields: string[]; // Field IDs
    validation?: 'on-next' | 'on-submit';
  }[];
  
  // Mobile-specific
  mobileConfig?: {
    compactMode: boolean; // Smaller spacing for mobile
    showProgressBar: boolean;
    stickySubmitButton: boolean;
    hapticFeedback: boolean; // Vibration on interaction
  };
}

/**
 * PILLAR 4: OUTPUT
 * Defines what happens after task completion
 */
export interface TaskOutputPillar {
  // Actions to Execute
  actions: ActionDefinition[];
  
  // Update Rules for Resources and Indicators
  updates: UpdateRule[];
  
  // Notification Rules
  notifications?: NotificationRule[];
  
  // Next Task Triggers
  nextTasks?: {
    taskId: string;
    taskName: string;
    triggerCondition?: string; // Expression like "{{formData.quality}} == 'pass'"
    delay?: number; // Delay in seconds before triggering
  }[];
}

/**
 * Action Definition
 */
export interface ActionDefinition {
  id: string;
  type: 'update_resource' | 'update_indicator' | 'send_notification' | 'webhook' | 'create_task' | 'send_email' | 'log_audit';
  
  // For 'update_resource'
  resourceConfig?: {
    resourceTypeId: string;
    resourceInstanceId?: string; // Specific instance, or use template
    operation: 'create' | 'update' | 'delete';
    fieldMapping: Record<string, string>; // Map form fields to resource fields
  };
  
  // For 'update_indicator'
  indicatorConfig?: {
    indicatorId: string;
    inputPoolId: string;
    valueMapping: string; // Expression like "{{formData.defects}} / {{formData.total}}"
    metadata?: Record<string, string>;
  };
  
  // For 'send_notification'
  notificationConfig?: {
    recipients: string[]; // User IDs or role names
    title: string;
    message: string; // Can use template variables like "{{formData.field1}}"
    priority: 'low' | 'medium' | 'high';
    channels: ('in-app' | 'email' | 'sms' | 'push')[];
  };
  
  // For 'webhook'
  webhookConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: string; // JSON template
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'api-key';
      credentials?: Record<string, string>;
    };
    retryPolicy?: {
      maxRetries: number;
      retryDelayMs: number;
      exponentialBackoff: boolean;
    };
  };
  
  // For 'create_task'
  taskConfig?: {
    workflowId: string;
    assigneeId?: string;
    assigneeRole?: string;
    contextMapping: Record<string, string>; // Pass data to new task
  };
  
  // Condition for execution
  condition?: string; // Expression like "{{formData.approved}} == true"
}

/**
 * Update Rule
 */
export interface UpdateRule {
  id: string;
  targetType: 'resource' | 'indicator' | 'task' | 'assignment' | 'project';
  targetId: string;
  field: string; // Field or property to update
  value: string; // Expression or literal value
  condition?: string; // Optional condition
}

/**
 * Notification Rule
 */
export interface NotificationRule {
  id: string;
  recipients: {
    type: 'user' | 'role' | 'email';
    value: string;
  }[];
  trigger: 'on-start' | 'on-complete' | 'on-skip' | 'on-reject' | 'on-overdue';
  template: {
    subject: string;
    body: string;
  };
  channels: ('in-app' | 'email' | 'sms' | 'push')[];
}

// ============================================================================
// Task Definition (Composes the 4 Pillars)
// ============================================================================

/**
 * Task Definition
 * Complete task configuration using the 4-Pillar Model
 */
export interface Task {
  id: string;
  name: string;
  description: string;
  
  // 4-Pillar Model
  pillars: {
    input: TaskInputPillar;
    trigger: TaskTriggerPillar;
    form: TaskFormPillar;
    output: TaskOutputPillar;
  };
  
  // Configuration Mode
  configMode: ConfigMode; // 'individual' | 'batch'
  
  // Batch Configuration (if configMode = 'batch')
  batchConfig?: {
    dataSource: {
      type: 'resource_query' | 'indicator_history' | 'external_api' | 'csv_upload';
      resourceTypeId?: string;
      filters?: Record<string, any>;
      indicatorId?: string;
      apiEndpoint?: string;
    };
    batchSize?: number; // Number of items per batch (0 = all at once)
    lockDuration?: number; // Seconds to lock an item while processing
    allowSkipItems: boolean;
    progressTracking: boolean;
  };
  
  // Execution Type
  executionType: ExecutionType; // 'online' | 'offline-sync'
  
  // Offline Configuration (if executionType = 'offline-sync')
  offlineConfig?: {
    allowOfflineExecution: boolean;
    syncStrategy: 'immediate' | 'wifi-only' | 'manual' | 'scheduled';
    conflictResolution: 'server-wins' | 'client-wins' | 'manual-review';
    localStorageQuota?: number; // MB
  };
  
  // Scope & Context
  projectId?: string;
  assignmentId?: string;
  workflowId?: string; // Parent workflow (if part of a larger process)
  
  // Permissions
  permissions: {
    canExecute: string[]; // Role names or user IDs
    canEdit: string[]; // Who can modify task definition
    canView: string[]; // Who can view task instances
  };
  
  // Estimated Timing
  estimatedDuration?: number; // seconds
  estimatedDurationPerItem?: number; // For batch tasks
  
  // Status & Lifecycle
  status: 'draft' | 'active' | 'paused' | 'archived';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
}

// ============================================================================
// Task Instance (Runtime)
// ============================================================================

/**
 * Task Instance
 * Represents a specific execution of a task
 */
export interface TaskInstance {
  id: string;
  taskId: string;
  taskName: string;
  
  // Assignment
  assigneeId: string;
  assigneeName: string;
  assigneeRole: string;
  
  // Status
  status: TaskStatus;
  priority: TaskPriority;
  
  // Context
  projectId?: string;
  projectName?: string;
  assignmentId?: string;
  assignmentName?: string;
  
  // Scheduling
  scheduledDate: Date;
  dueDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Batch Info (if applicable)
  isBatch: boolean;
  batchId?: string;
  batchSize?: number;
  processedCount?: number;
  
  // Context Data (from trigger/workflow)
  inputContext: Record<string, any>;
  
  // Form Data
  formSchema: FormSchema;
  formData?: Record<string, any>;
  draftData?: Record<string, any>; // Saved draft
  
  // Execution Result
  executionResult?: {
    outcome: 'success' | 'rejected' | 'skipped';
    notes?: string;
    rejectionReason?: string;
    outputData?: Record<string, any>;
  };
  
  // Offline Sync (if applicable)
  offlineMetadata?: {
    createdOffline: boolean;
    syncStatus: 'pending' | 'synced' | 'conflict';
    lastSyncAttempt?: Date;
    syncError?: string;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Batch Queue Item
 */
export interface BatchQueueItem {
  id: string;
  batchId: string;
  taskInstanceId: string;
  itemData: Record<string, any>;
  status: 'available' | 'locked' | 'processing' | 'completed' | 'skipped';
  
  // Lock Management
  lockedBy?: string; // User ID
  lockedAt?: Date;
  lockExpiresAt?: Date;
  lockExtensionCount?: number;
  
  // Processing
  processedAt?: Date;
  processingDuration?: number; // seconds
  outcome?: 'success' | 'skipped';
  outputData?: Record<string, any>;
  
  // Queue Position
  position: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Monitoring & Analytics
// ============================================================================

/**
 * Task Metrics
 */
export interface TaskMetrics {
  // Overview
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  skippedTasks: number;
  
  // Performance
  averageCompletionTime: number; // seconds
  averageTasksPerUser: number;
  completionRate: number; // percentage
  skipRate: number; // percentage
  rejectionRate: number; // percentage
  
  // Velocity
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  
  // Bottlenecks
  slowestTasks: {
    taskId: string;
    taskName: string;
    averageTime: number;
    executionCount: number;
  }[];
  
  // User Performance
  topPerformers: {
    userId: string;
    userName: string;
    tasksCompleted: number;
    averageTime: number;
  }[];
}

/**
 * Heatmap Data (for activity visualization)
 */
export interface HeatmapData {
  day: string; // 'Monday', 'Tuesday', etc.
  hour: number; // 0-23
  value: number; // completion count
  color: string;
}

/**
 * User Velocity
 */
export interface UserVelocity {
  userId: string;
  userName: string;
  tasksCompleted: number;
  averageTime: number;
  skipRate: number;
  rejectionRate: number;
  lastActive: Date;
  currentLoad: number; // Number of active tasks
}

// ============================================================================
// Audit & History
// ============================================================================

/**
 * Task Audit Log
 */
export interface TaskAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'created' | 'started' | 'completed' | 'skipped' | 'rejected' | 'escalated' | 'lock_extended' | 'draft_saved' | 'modified';
  taskInstanceId: string;
  taskId: string;
  details: Record<string, any>;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

// ============================================================================
// Workflow Integration (Legacy Support)
// ============================================================================

/**
 * Workflow Definition (for multi-task processes)
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  assignmentId?: string;
  status: 'draft' | 'active' | 'archived';
  tasks: Task[];
  taskOrder: string[]; // Task IDs in execution order
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
