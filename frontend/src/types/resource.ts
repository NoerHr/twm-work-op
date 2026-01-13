/**
 * SWIZ Workspace - Resource Type Definitions
 * Resource Schemas & Visual Operation Builders
 */

// ============================================================================
// Core Enums & Types
// ============================================================================

export type ResourceCategory = 'equipment' | 'software' | 'human' | 'facility' | 'material' | 'budget' | 'data';
export type ResourceStatus = 'available' | 'in-use' | 'maintenance' | 'reserved' | 'retired' | 'unavailable';
export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'time' | 'datetime' | 'email' | 'url' | 'phone' | 'currency' | 'percentage' | 'file' | 'image' | 'enum' | 'multi-enum' | 'json' | 'reference';
export type OperationType = 'void' | 'return';
export type AggregationType = 'sum' | 'average' | 'max' | 'min' | 'count' | 'weighted';

// ============================================================================
// Resource Schema Definition
// ============================================================================

/**
 * Field Validation Rules
 */
export interface FieldValidation {
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
  customRule?: string; // Expression for custom validation
  errorMessage?: string;
}

/**
 * Field Definition in Resource Schema
 */
export interface ResourceSchemaField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  
  // Validation
  validation?: FieldValidation;
  
  // For 'enum' and 'multi-enum' types
  enumValues?: {
    value: string;
    label: string;
    color?: string;
    icon?: string;
  }[];
  
  // For 'reference' type (links to another resource type)
  referenceConfig?: {
    targetResourceTypeId: string;
    displayField: string; // Which field to show in UI
    cascadeDelete?: boolean;
  };
  
  // Default Value
  defaultValue?: any;
  
  // Computed Field (auto-calculated)
  computed?: {
    formula: string; // Expression like "{{price}} * {{quantity}}"
    dependencies: string[]; // Field IDs that this depends on
  };
  
  // Display Configuration
  displayConfig?: {
    order: number; // Display order in forms
    groupId?: string; // For grouping fields in sections
    showInList: boolean; // Show in list views
    showInDetail: boolean; // Show in detail views
    readOnly?: boolean;
    hidden?: boolean;
  };
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Field Group (for organizing fields in UI)
 */
export interface ResourceSchemaFieldGroup {
  id: string;
  name: string;
  label: string;
  icon?: string;
  order: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Resource Schema
 * Defines the structure and fields of a resource type
 */
export interface ResourceSchema {
  version: string; // e.g., "1.0.0"
  fields: ResourceSchemaField[];
  fieldGroups?: ResourceSchemaFieldGroup[];
  
  // Indexes (for performance)
  indexes?: {
    fields: string[]; // Field IDs
    unique: boolean;
    name?: string;
  }[];
  
  // Validation Rules (cross-field)
  validationRules?: {
    id: string;
    name: string;
    condition: string; // Expression like "{{startDate}} < {{endDate}}"
    errorMessage: string;
  }[];
  
  // Lifecycle Hooks
  hooks?: {
    beforeCreate?: string; // Operation ID to run before creating instance
    afterCreate?: string; // Operation ID to run after creating instance
    beforeUpdate?: string;
    afterUpdate?: string;
    beforeDelete?: string;
    afterDelete?: string;
  };
}

// ============================================================================
// Resource Operations (Visual Builder)
// ============================================================================

/**
 * Operation Parameter
 */
export interface OperationParameter {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: FieldValidation;
}

/**
 * Operation Step (for multi-step operations)
 */
export interface OperationStep {
  id: string;
  type: 'query' | 'transform' | 'validate' | 'calculate' | 'condition' | 'loop' | 'api-call' | 'notification';
  name: string;
  description?: string;
  
  // For 'query' step
  queryConfig?: {
    filters: {
      field: string;
      operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'not-in';
      value: any;
    }[];
    sort?: { field: string; direction: 'asc' | 'desc' }[];
    limit?: number;
    offset?: number;
  };
  
  // For 'transform' step
  transformConfig?: {
    mapping: Record<string, string>; // Map input fields to output fields
    script?: string; // Custom transformation script
  };
  
  // For 'validate' step
  validateConfig?: {
    rules: {
      field: string;
      condition: string;
      errorMessage: string;
    }[];
    stopOnError: boolean;
  };
  
  // For 'calculate' step
  calculateConfig?: {
    formula: string; // Expression
    outputVariable: string;
  };
  
  // For 'condition' step
  conditionConfig?: {
    condition: string; // Boolean expression
    trueBranch: string[]; // Step IDs to execute if true
    falseBranch?: string[]; // Step IDs to execute if false
  };
  
  // For 'loop' step
  loopConfig?: {
    iterateOver: string; // Variable name (array)
    itemVariable: string; // Variable name for current item
    steps: string[]; // Step IDs to execute in loop
    maxIterations?: number;
  };
  
  // For 'api-call' step
  apiCallConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: string; // JSON template
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'api-key';
      credentials?: Record<string, string>;
    };
    timeout?: number; // milliseconds
    retryPolicy?: {
      maxRetries: number;
      retryDelayMs: number;
    };
    outputVariable: string;
  };
  
  // For 'notification' step
  notificationConfig?: {
    recipients: string[]; // User IDs or roles
    template: {
      subject: string;
      body: string;
    };
    channels: ('in-app' | 'email' | 'sms' | 'push')[];
  };
  
  // Error Handling
  errorHandling?: {
    onError: 'continue' | 'stop' | 'retry';
    maxRetries?: number;
    fallbackValue?: any;
  };
  
  // Execution Order
  order: number;
}

/**
 * Simulation Configuration
 */
export interface SimulationConfig {
  enabled: boolean;
  mockData: any; // Mock return data for testing
  delay?: number; // Simulated delay in milliseconds
  successRate?: number; // Percentage (0-100) for simulating failures
  scenarios?: {
    name: string;
    condition?: string; // When to use this scenario
    mockData: any;
    delay?: number;
  }[];
}

/**
 * Resource Operation
 * Defines a custom operation/function that can be performed on resources
 */
export interface ResourceOperation {
  id: string;
  name: string;
  label: string;
  description?: string;
  
  // Operation Type
  type: OperationType; // 'void' = no return value, 'return' = returns data
  
  // Return Type (if type = 'return')
  returnType?: FieldType;
  returnSchema?: ResourceSchemaField; // Detailed return schema
  
  // Parameters
  parameters: OperationParameter[];
  
  // Operation Logic (Visual Builder Steps)
  steps: OperationStep[];
  
  // Simulation Configuration (for testing without real implementation)
  simulationConfig: SimulationConfig;
  
  // Permissions
  permissions?: {
    canExecute: string[]; // Role names or user IDs
  };
  
  // UI Configuration
  uiConfig?: {
    icon?: string;
    color?: string;
    confirmationRequired?: boolean;
    confirmationMessage?: string;
    showInActions: boolean; // Show as action button in UI
    showInBulkActions: boolean; // Available for bulk operations
  };
  
  // Performance
  performanceConfig?: {
    timeout?: number; // milliseconds
    cacheable?: boolean;
    cacheTTL?: number; // seconds
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

// ============================================================================
// Resource Type Definition
// ============================================================================

/**
 * Resource Metric Definition
 */
export interface ResourceMetric {
  id: string;
  name: string;
  label: string;
  description?: string;
  unit?: string; // e.g., '%', 'hours', 'count'
  type: 'percentage' | 'count' | 'currency' | 'duration' | 'ratio' | 'custom';
  aggregation: AggregationType;
  
  // Calculation
  calculation?: {
    formula: string; // Expression using resource fields
    dependencies: string[]; // Field IDs
  };
  
  // Thresholds (for monitoring)
  thresholds?: {
    warning?: number;
    critical?: number;
    target?: number;
  };
  
  // Display
  displayConfig?: {
    showInList: boolean;
    showInDashboard: boolean;
    format?: string; // Number format
  };
}

/**
 * Organizational Resource Type
 * Global resource type template available across organization
 */
export interface OrganizationalResourceType {
  id: string;
  name: string;
  version: string;
  description: string;
  category: ResourceCategory;
  icon: string;
  
  // Schema Definition
  schema: ResourceSchema;
  
  // Operations (Custom Functions)
  operations: ResourceOperation[];
  
  // Metrics
  metrics: ResourceMetric[];
  
  // Lifecycle Configuration
  lifecycleConfig?: {
    statusField?: string; // Which field represents status
    statusTransitions?: {
      from: string;
      to: string;
      operation?: string; // Operation ID to execute on transition
      roles?: string[]; // Who can perform this transition
    }[];
  };
  
  // Access Control
  permissions?: {
    canView: string[]; // Roles
    canCreate: string[]; // Roles
    canEdit: string[]; // Roles
    canDelete: string[]; // Roles
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Versioning
  previousVersionId?: string;
  changeLog?: string;
  isDeprecated?: boolean;
  deprecationMessage?: string;
}

/**
 * Project Resource Type
 * Resource type inherited/customized for specific project
 */
export interface ProjectResourceType extends OrganizationalResourceType {
  projectId: string;
  inheritedFrom?: string; // ID of organizational type (if inherited)
  inheritedAt?: Date;
  
  // Inheritance Configuration
  inheritanceConfig?: {
    syncEnabled: boolean; // Auto-sync with parent type
    syncMode: 'manual' | 'automatic';
    lastSyncedAt?: Date;
    customizationsAllowed: boolean;
  };
  
  // Project-specific Customizations
  customFields?: ResourceSchemaField[]; // Additional fields
  customOperations?: ResourceOperation[]; // Additional operations
  customMetrics?: ResourceMetric[]; // Additional metrics
  
  // Overrides (if customizationsAllowed)
  overrides?: {
    fields?: Record<string, Partial<ResourceSchemaField>>; // Override field configs
    operations?: Record<string, Partial<ResourceOperation>>; // Override operation configs
  };
}

// ============================================================================
// Resource Instance (Runtime)
// ============================================================================

/**
 * Resource Instance
 * Actual resource instance created from a resource type
 */
export interface ResourceInstance {
  id: string;
  typeId: string; // ResourceType ID
  projectId: string;
  name: string;
  status: ResourceStatus;
  
  // Field Values (based on schema)
  fieldValues: Record<string, any>; // Key = field ID, Value = field value
  
  // Computed Metrics (cached values)
  metrics: Record<string, number>; // Key = metric ID, Value = metric value
  
  // Assignment Info
  assignedTo?: {
    assignmentId: string;
    assignmentName: string;
    assignedAt: Date;
    assignedBy: string;
  };
  
  // Reservation Info
  reservedBy?: {
    userId: string;
    userName: string;
    reservedAt: Date;
    reservedUntil?: Date;
  };
  
  // Location Info
  location?: {
    facilityId?: string;
    facilityName?: string;
    zone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Lifecycle History
  statusHistory?: {
    status: ResourceStatus;
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }[];
  
  // Attachments
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

// ============================================================================
// Resource Allocation & Mapping
// ============================================================================

/**
 * Assignment Resource Mapping
 * Maps resources to assignments
 */
export interface AssignmentResourceMapping {
  id: string;
  assignmentId: string;
  assignmentName: string;
  
  // Resource Type Allocations
  resourceTypeAllocations: {
    resourceTypeId: string;
    resourceTypeName: string;
    requiredQuantity: number;
    allocatedQuantity: number;
    instances: string[]; // ResourceInstance IDs
  }[];
  
  // Resource Pool
  instances: ResourceInstance[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resource Allocation Conflict
 */
export interface ResourceAllocationConflict {
  id: string;
  resourceInstanceId: string;
  resourceName: string;
  
  // Conflicting Assignments
  assignments: {
    assignmentId: string;
    assignmentName: string;
    requestedAt: Date;
    requestedBy: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  // Resolution
  resolution?: {
    resolvedAt: Date;
    resolvedBy: string;
    action: 'reassign' | 'duplicate' | 'schedule' | 'cancel';
    notes?: string;
  };
  
  // Status
  status: 'pending' | 'resolved' | 'escalated';
  
  // Metadata
  detectedAt: Date;
}

// ============================================================================
// Indicator Connection (Resource → Indicator)
// ============================================================================

/**
 * Indicator Connection
 * Links resource metrics to indicators
 */
export interface IndicatorConnection {
  id: string;
  
  // Source (Resource or Assignment)
  sourceId: string;
  sourceType: 'assignment' | 'resource';
  sourceMetricId?: string; // If source is resource
  
  // Target (Indicator)
  targetId: string; // Indicator ID
  targetType: 'project' | 'kpi' | 'assignment';
  targetInputPoolId?: string; // Which InputPool in the indicator
  
  // Aggregation Logic
  aggregationType: AggregationType;
  weight?: number; // For weighted aggregation
  formula?: string; // Custom aggregation formula
  
  // Filters
  filters?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | 'contains';
    value: any;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Resource Analytics
// ============================================================================

/**
 * Resource Utilization Metrics
 */
export interface ResourceUtilizationMetrics {
  resourceTypeId: string;
  resourceTypeName: string;
  
  // Overall Stats
  totalInstances: number;
  availableInstances: number;
  inUseInstances: number;
  maintenanceInstances: number;
  retiredInstances: number;
  
  // Utilization
  utilizationRate: number; // Percentage
  averageUsageDuration: number; // hours
  
  // Cost
  totalCost?: number;
  costPerInstance?: number;
  
  // Time Range
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Resource Demand Forecast
 */
export interface ResourceDemandForecast {
  resourceTypeId: string;
  resourceTypeName: string;
  
  // Forecast Data
  forecasts: {
    date: Date;
    predictedDemand: number;
    confidence: number; // 0-1
    currentSupply: number;
    gap: number; // demand - supply
  }[];
  
  // Recommendations
  recommendations?: {
    action: 'acquire' | 'retire' | 'maintain' | 'reallocate';
    quantity: number;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  // Metadata
  generatedAt: Date;
  modelVersion: string;
}

// ============================================================================
// Legacy Support (UC-PM-008 Compatibility)
// ============================================================================

/**
 * Resource Function (Legacy)
 * @deprecated Use ResourceOperation instead
 */
export interface ResourceFunction {
  id: string;
  name: string;
  description: string;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'file';
    required: boolean;
  }[];
  returnType: string;
}

/**
 * Assignment Resource (Legacy)
 * @deprecated Use ResourceInstance with assignedTo instead
 */
export interface AssignmentResource {
  id: string;
  type: 'human' | 'equipment' | 'material' | 'budget' | 'facility';
  name: string;
  description?: string;
  link?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  notes?: string;
}
