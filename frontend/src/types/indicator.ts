/**
 * SWIZ Workspace - Indicator Type Definitions
 * Two-Pool Model v2.1: InputPool (Memory) + LocalPool (Calculator)
 */

// ============================================================================
// Core Enums & Types
// ============================================================================

export type IndicatorLevel = 'operational' | 'assignment' | 'project';
export type IndicatorLifecycle = 'draft' | 'active' | 'archived';
export type ValueSourceType = 'task' | 'manual' | 'sensor';
export type ValueType = 'number' | 'string' | 'boolean' | 'percentage' | 'currency' | 'duration';
export type WidgetType = 'kpi' | 'gauge' | 'timeseries' | 'badge' | 'chart' | 'alert';
export type IndicatorStatus = 'normal' | 'warning' | 'critical' | 'error';
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';

// ============================================================================
// Visual Logic AST (Abstract Syntax Tree for Calculations)
// ============================================================================

export type ASTNodeType = 
  | 'literal'           // Raw value: 42, "hello", true
  | 'reference'         // Reference to InputPool: @inputPool.taskData
  | 'operator'          // Math/Logic operator: +, -, *, /, &&, ||
  | 'function'          // Built-in function: sum(), avg(), max(), min()
  | 'conditional';      // If-then-else logic

export type OperatorType =
  // Arithmetic
  | 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power'
  // Comparison
  | 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'lessOrEqual'
  // Logical
  | 'and' | 'or' | 'not'
  // Aggregation
  | 'sum' | 'average' | 'count' | 'min' | 'max' | 'median' | 'stddev';

export type FunctionType =
  | 'sum' | 'avg' | 'max' | 'min' | 'count' | 'median' | 'stddev'
  | 'abs' | 'round' | 'floor' | 'ceil' | 'sqrt' | 'pow'
  | 'concat' | 'substring' | 'length' | 'toUpper' | 'toLower'
  | 'date' | 'now' | 'daysBetween' | 'formatDate';

/**
 * Visual Logic AST Node
 * Represents a single node in the calculation tree
 */
export interface VisualLogicASTNode {
  id: string;
  type: ASTNodeType;
  
  // For 'literal' nodes
  value?: any;
  
  // For 'reference' nodes
  inputPoolRef?: string; // e.g., "taskData", "manualEntry", "sensorStream"
  
  // For 'operator' nodes
  operator?: OperatorType;
  operands?: VisualLogicASTNode[];
  
  // For 'function' nodes
  function?: FunctionType;
  arguments?: VisualLogicASTNode[];
  
  // For 'conditional' nodes
  condition?: VisualLogicASTNode;
  thenBranch?: VisualLogicASTNode;
  elseBranch?: VisualLogicASTNode;
  
  // Metadata for visual builder
  position?: { x: number; y: number };
  color?: string;
  label?: string;
}

/**
 * Complete Visual Logic AST
 */
export interface VisualLogicAST {
  version: string; // e.g., "2.1.0"
  rootNode: VisualLogicASTNode;
  metadata?: {
    description?: string;
    lastModified?: Date;
    modifiedBy?: string;
  };
}

// ============================================================================
// Two-Pool Model v2.1 - InputPool (Memory)
// ============================================================================

/**
 * Source Configuration for InputPool
 */
export interface InputPoolSourceConfig {
  type: 'task' | 'manual' | 'sensor';
  
  // For 'task' type
  taskId?: string;
  taskFieldPath?: string; // e.g., "output.quality.defectCount"
  
  // For 'manual' type
  allowedRoles?: string[]; // Who can enter data manually
  
  // For 'sensor' type
  sensorEndpoint?: string;
  sensorProtocol?: 'http' | 'mqtt' | 'websocket';
  pollInterval?: number; // in milliseconds
}

/**
 * History Entry in InputPool
 * The CRITICAL storage for all incoming data
 */
export interface InputPoolHistoryEntry {
  timestamp: number; // Unix timestamp in milliseconds
  value: any; // The actual value (number, string, boolean, object, etc.)
  metadata: {
    source: 'task' | 'manual' | 'sensor';
    sourceId?: string; // Task ID, User ID, or Sensor ID
    sourceName?: string; // Human-readable source name
    quality?: 'verified' | 'unverified' | 'estimated'; // Data quality flag
    comment?: string; // Optional comment from manual entry
    tags?: string[]; // Categorical tags for filtering
  };
}

/**
 * InputPool - The "Memory" of the Indicator
 * Stores all historical data points from various sources
 */
export interface InputPool {
  id: string;
  name: string; // Human-readable name, e.g., "Task Completion Data"
  description?: string;
  
  // Data Source Configuration
  sourceConfig: InputPoolSourceConfig;
  
  // The CRITICAL History Storage
  history: InputPoolHistoryEntry[];
  
  // Consumer Independence Flag
  // When true, this InputPool is a LOCAL COPY that won't sync with upstream changes
  // When false, this InputPool syncs with the original source
  consumerIndependence: boolean;
  
  // Retention Policy
  retentionPolicy?: {
    maxAge?: number; // Maximum age in days (0 = unlimited)
    maxCount?: number; // Maximum number of entries (0 = unlimited)
    aggregationStrategy?: 'keep-latest' | 'keep-oldest' | 'keep-average'; // What to do when limit is reached
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Two-Pool Model v2.1 - LocalPool (Calculator)
// ============================================================================

/**
 * LocalPool - The "Calculator" of the Indicator
 * Computes values on-demand using data from InputPools
 * NO HISTORY STORAGE - it calculates fresh every time
 */
export interface LocalPool {
  id: string;
  name: string; // Human-readable name, e.g., "Defect Rate Calculator"
  description?: string;
  
  // Calculation Logic (Visual Block-based AST)
  formula: VisualLogicAST;
  
  // Publication Status
  // When true, this LocalPool's output can be used by other indicators
  // When false, it's private to this indicator only
  isPublished: boolean;
  
  // Input Dependencies
  // List of InputPool IDs that this LocalPool reads from
  inputPoolDependencies: string[];
  
  // Output Configuration
  outputConfig?: {
    type: ValueType;
    unit?: string; // e.g., "%", "$", "days", "count"
    decimals?: number; // Number of decimal places
    prefix?: string; // e.g., "$", "€"
    suffix?: string; // e.g., "%", " kg", " hrs"
  };
  
  // Caching Strategy (for performance)
  cachingConfig?: {
    enabled: boolean;
    ttl?: number; // Time-to-live in seconds (0 = no cache)
    invalidateOn?: 'input-change' | 'time-based' | 'manual';
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastCalculatedAt?: Date;
  lastCalculatedValue?: any;
}

// ============================================================================
// Indicator - Main Definition (Composes the Two Pools)
// ============================================================================

/**
 * Indicator Definition
 * Combines InputPool (Memory) and LocalPool (Calculator)
 */
export interface Indicator {
  id: string;
  name: string;
  description?: string;
  
  // Hierarchy Level
  level: IndicatorLevel; // 'operational' | 'assignment' | 'project'
  
  // Lifecycle State
  lifecycle: IndicatorLifecycle; // 'draft' | 'active' | 'archived'
  
  // Two-Pool Model Composition
  inputPools: InputPool[];  // Multiple InputPools for different data sources
  localPools: LocalPool[];  // Multiple LocalPools for different calculations
  
  // Primary Output
  // Which LocalPool is the "main" output of this indicator
  primaryLocalPoolId: string;
  
  // Scope & Context
  projectId?: string;
  assignmentId?: string;
  ownerId: string; // User who created this indicator
  
  // Access Control
  visibility: {
    showOnDashboard: boolean;
    roles: string[]; // Which roles can see this indicator
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
}

// ============================================================================
// Threshold & Visualization
// ============================================================================

/**
 * Threshold Configuration for Visual Indicators
 */
export interface Threshold {
  id: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  min?: number;
  max?: number;
  label: string;
  action?: 'notify' | 'alert' | 'none';
  notifyRoles?: string[];
}

/**
 * Widget Configuration for Dashboard Display
 */
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  indicatorId: string;
  title: string;
  
  // Which LocalPool to display
  localPoolId: string;
  
  // Grid Layout
  size: { w: number; h: number }; // Grid units (e.g., 2x1, 4x2)
  position: { x: number; y: number }; // Grid position
  
  // Visualization Config
  config: {
    chartType?: ChartType;
    showTrend?: boolean;
    showSparkline?: boolean;
    thresholds?: Threshold[];
    timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | 'ytd' | 'all';
    decimals?: number;
    prefix?: string;
    suffix?: string;
    targetValue?: number;
    comparisonMode?: 'none' | 'vs-target' | 'vs-previous' | 'vs-average';
  };
  
  // Access Control
  audienceRoles?: string[]; // Who can see this widget
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Indicator Connections (Cross-Indicator Dependencies)
// ============================================================================

/**
 * Connection between indicators
 * Allows one indicator to read from another's published LocalPools
 */
export interface IndicatorConnection {
  id: string;
  
  // Source (Publishing Indicator)
  sourceIndicatorId: string;
  sourceLocalPoolId: string; // Which LocalPool is being read
  
  // Target (Consuming Indicator)
  targetIndicatorId: string;
  targetInputPoolId: string; // Where the data goes in the consumer
  
  // Connection Type
  connectionType: 'direct' | 'aggregated' | 'filtered';
  
  // Aggregation Config (if connectionType = 'aggregated')
  aggregation?: {
    type: 'sum' | 'average' | 'weighted' | 'min' | 'max';
    weight?: number;
    filter?: string; // Expression like "value > 0"
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Runtime Data & Monitoring
// ============================================================================

/**
 * Real-time Indicator Value
 * Snapshot of current state
 */
export interface IndicatorSnapshot {
  indicatorId: string;
  timestamp: Date;
  values: {
    localPoolId: string;
    localPoolName: string;
    value: any;
    status: IndicatorStatus;
    metadata?: {
      calculationTime?: number; // milliseconds
      cacheHit?: boolean;
      inputPoolsUsed?: string[];
    };
  }[];
  error?: string;
}

/**
 * Alert Definition
 */
export interface IndicatorAlert {
  id: string;
  indicatorId: string;
  localPoolId: string;
  name: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number;
    value2?: number; // For 'between' operator
  };
  severity: 'info' | 'warning' | 'critical';
  message: string;
  notifyRoles?: string[];
  notifyEmails?: string[];
  isActive: boolean;
  cooldown?: number; // Minimum seconds between alerts
  lastTriggeredAt?: Date;
  createdAt: Date;
}

// ============================================================================
// Dashboard & Layout
// ============================================================================

/**
 * Dashboard Layout
 */
export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  role?: string;
  scope: 'personal' | 'team' | 'project' | 'organization';
  widgets: WidgetConfig[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Analytics Scope (Context for viewing indicators)
 */
export interface AnalyticsScope {
  projectId?: string;
  assignmentId?: string;
  level?: IndicatorLevel;
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, any>;
}

// ============================================================================
// Visual Canvas (for Indicator Builder UI)
// ============================================================================

/**
 * Indicator Node for React Flow Canvas
 */
export interface IndicatorNode {
  id: string;
  type: 'indicator';
  position: { x: number; y: number };
  data: {
    indicator: Indicator;
    isReadOnly?: boolean;
    isGhost?: boolean; // For role-based restrictions
    isTarget?: boolean; // For Leader view (PM-defined targets)
    expanded?: boolean; // Show internal pools
  };
}

/**
 * Edge for Canvas Connections
 */
export interface IndicatorEdge {
  id: string;
  source: string; // Source Indicator ID
  target: string; // Target Indicator ID
  sourceHandle?: string; // Source LocalPool ID
  targetHandle?: string; // Target InputPool ID
  type?: 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  data?: {
    connectionType: 'direct' | 'aggregated' | 'filtered';
    label?: string;
  };
}

// ============================================================================
// Export & Import
// ============================================================================

/**
 * Export Request
 */
export interface ExportRequest {
  scope: AnalyticsScope;
  indicatorIds: string[];
  format: 'csv' | 'json' | 'pdf' | 'excel';
  includeHistory: boolean;
  includeFormulas: boolean;
  dateRange: { start: Date; end: Date };
}

/**
 * Import Template
 */
export interface ImportTemplate {
  indicators: Indicator[];
  connections: IndicatorConnection[];
  widgets: WidgetConfig[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    version: string;
  };
}
