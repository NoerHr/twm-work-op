/**
 * SWIZ Workspace - Project Management Type Definitions
 * Project Lifecycle: Draft → Submitted → Approved → Setup → Active → Completed → Archived
 */

// ============================================================================
// Core Enums & Types
// ============================================================================

/**
 * Project Status (Lifecycle States)
 * Matches IA workflow:
 * 1. Draft - PM creates project proposal
 * 2. Submitted - PM submits for governance review
 * 3. Approved - BOD approves project
 * 4. Setup - PM/Leaders configure technical details
 * 5. Active - Project is running
 * 6. Gate-Review-Pending - Waiting for gate approval (during Active)
 * 7. Change-Pending - Change request pending approval (during Active)
 * 8. Completed - All stages finished
 * 9. Archived - Project closed and archived
 */
export type ProjectStatus = 
  | 'draft'               // PM drafting (Drafting Phase)
  | 'submitted'           // Waiting BOD review (Governance Phase - Pending)
  | 'approved'            // BOD approved, ready for setup (Governance Phase - Approved)
  | 'setup'               // PM/Leaders configuring (Setup Phase)
  | 'active'              // Project running (Activation Phase)
  | 'gate-review-pending' // Gate review in progress (Runtime sub-state)
  | 'change-pending'      // Change request pending (Runtime sub-state)
  | 'completed'           // All stages done (Final state)
  | 'archived';           // Closed and archived (Final state)

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Stage Status
 */
export type StageStatus = 
  | 'pending'    // Not started yet
  | 'active'     // Currently in progress
  | 'completed'  // Finished successfully
  | 'blocked';   // Blocked by dependencies or issues

/**
 * Gate Decision
 */
export type GateDecision = 
  | 'approve'  // Continue to next stage
  | 'reject'   // Stop project or stage
  | 'rework';  // Return for improvements

/**
 * Assignment Status
 */
export type AssignmentStatus = 
  | 'pending'   // Not started
  | 'active'    // In progress
  | 'completed' // Finished
  | 'on-hold'   // Temporarily paused
  | 'cancelled'; // Cancelled

// ============================================================================
// Project Details
// ============================================================================

/**
 * Attachment (Files, Documents, etc.)
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  category?: 'proposal' | 'technical' | 'financial' | 'other';
}

/**
 * Project Details
 * Basic information about the project
 */
export interface ProjectDetails {
  name: string;
  description: string;
  expectedStartDate: Date;
  expectedEndDate: Date;
  priority: ProjectPriority;
  
  // Organization Structure
  portfolioId?: string;
  programId?: string;
  
  // Documentation
  attachments?: Attachment[];
  
  // Categorization
  tags?: string[];
  category?: string; // e.g., 'infrastructure', 'software', 'research'
  
  // Strategic Alignment
  strategicObjectives?: string[]; // Organization's strategic goals
  businessValue?: {
    description: string;
    estimatedROI?: number; // Percentage
    estimatedCost?: number;
    estimatedRevenue?: number;
  };
}

// ============================================================================
// Indicators
// ============================================================================

/**
 * Indicator (Simplified for Project Definition)
 * Full definition is in types/indicator.ts
 */
export interface Indicator {
  id: string;
  name: string;
  description: string;
  strategicPurpose?: string;
  
  // Scope
  scope: 'project' | 'assignment'; // Which level this indicator belongs to
  
  // Type
  type: 'aggregation' | 'formula' | 'manual' | 'hybrid';
  
  // Unit
  unit?: string; // e.g., '%', '$', 'days', 'count'
  
  // Visibility
  visibility: {
    showOnDashboard: boolean;
    useInGates: boolean; // Used for gate condition evaluation
  };
  
  // Visualization
  visualization: {
    widget: 'gauge' | 'line-chart' | 'bar-chart' | 'big-number' | 'table';
    thresholds: {
      red: number;    // Below this = critical
      yellow: number; // Below this = warning
      green: number;  // Above this = good
    };
  };
  
  // Calculation (for aggregation/formula types)
  calculation?: {
    aggregationType?: 'sum' | 'average' | 'min' | 'max' | 'weighted' | 'custom';
    sourceIndicators?: string[]; // IDs of assignment indicators (for project-level)
    formula?: string; // JSON representation of VisualLogicAST
    weights?: Record<string, number>; // Weights for weighted aggregation
  };
  
  // Current State
  currentValue?: number;
  targetValue?: number;
  target?: number; // Alias for targetValue (UI compatibility)
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Workflow (Stages, Gates, Assignments)
// ============================================================================

/**
 * Quality Gate
 * Governance checkpoint at the end of a stage
 */
export interface QualityGate {
  id: string;
  name: string;
  description: string;
  
  // Trigger Type
  triggerType: 'automatic' | 'manual';
  
  // Conditions (for automatic gates)
  conditions: GateCondition[];
  
  // Approvers (typically BOD members)
  approvers: string[]; // User IDs
  
  // Review Logs
  reviews?: GateReviewLog[];
  
  // Configuration
  config?: {
    requireAllApprovers: boolean; // true = unanimous, false = majority
    autoApproveIfConditionsMet: boolean; // For automatic gates
    escalationTimeoutHours?: number; // Escalate if not reviewed within X hours
  };
}

/**
 * Gate Condition
 * Conditions that must be met for automatic gate approval
 */
export interface GateCondition {
  indicatorId: string;
  indicatorName?: string; // For display purposes
  operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
  value: number;
  weight?: number; // For weighted conditions (optional)
}

/**
 * Gate Review Log
 * Record of gate review decision
 */
export interface GateReviewLog {
  id: string;
  gateId: string;
  reviewerId: string;
  reviewerName: string;
  decision: GateDecision;
  comments: string;
  timestamp: Date;
  
  // Indicator Values at Review Time
  indicatorSnapshots?: {
    indicatorId: string;
    indicatorName: string;
    value: number;
    conditionMet: boolean;
  }[];
}

/**
 * Stage
 * Major phase in project workflow
 */
export interface Stage {
  id: string;
  name: string;
  description: string;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  
  // Status
  status: StageStatus;
  
  // Sequence
  position: number; // order in workflow (0-indexed)
  
  // Dependencies
  dependencies: string[]; // IDs of stages that must complete first
  
  // Quality Gate
  gate?: QualityGate;
  
  // Assignments
  assignmentIds: string[]; // IDs of assignments in this stage
  
  // Actual Dates (runtime)
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Progress
  progress?: number; // 0-100 percentage
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Assignment Leader
 * Leader assigned to an assignment
 */
export interface AssignmentLeader {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  allocation: number; // percentage of time (0-100)
  responsibilities?: string[];
}

/**
 * Assignment
 * Work package within a stage
 */
export interface Assignment {
  id: string;
  name: string;
  description: string;
  
  // Parent Stage
  stageId: string;
  stageName?: string; // For display
  
  // Timeline
  startDate: Date;
  endDate: Date;
  
  // Status
  status: AssignmentStatus;
  
  // Priority
  priority?: 'low' | 'medium' | 'high';
  
  // Budget
  budgetAllocation?: number;
  actualCost?: number;
  
  // Leaders (Multiple leaders support)
  leaders: AssignmentLeader[];
  
  // Indicators
  assignmentIndicators?: string[]; // IDs of assignment-level indicators
  
  // Resources
  resources?: AssignmentResource[]; // Legacy - resources that can be used
  resourceMappingId?: string; // ID in AssignmentResourceMapping
  
  // Notes
  notes?: string;
  
  // Progress
  progress?: number; // 0-100 percentage
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Assignment Resource (Legacy)
 * @deprecated - Use Resource Management Module instead
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

// ============================================================================
// Setup Phase (Resource Types & Indicator Connections)
// ============================================================================

/**
 * Project Resource Type
 * Resource type inherited or customized for this project
 */
export interface ProjectResourceType {
  id: string;
  organizationalTypeId?: string; // If inherited from organizational library
  name: string;
  schema: any; // JSON Schema (full definition in types/resource.ts)
  version: string;
  
  // Inheritance
  isInherited: boolean;
  isSynced: boolean;
  lastSyncedAt?: Date;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Indicator Connection
 * Links assignment-level indicators to project-level indicators
 */
export interface IndicatorConnection {
  id: string;
  
  // Source (Assignment Indicator)
  sourceIndicatorId: string;
  sourceAssignmentId: string;
  sourceIndicatorName?: string; // For display
  
  // Target (Project Indicator)
  targetIndicatorId: string;
  targetIndicatorName?: string; // For display
  
  // Aggregation
  aggregationType: 'sum' | 'average' | 'weighted' | 'min' | 'max' | 'custom';
  weight?: number; // For weighted aggregation
  formula?: string; // For custom aggregation
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Governance
// ============================================================================

/**
 * Governance Review
 * BOD's review of project proposal
 */
export interface GovernanceReview {
  id: string;
  projectId: string;
  
  // Reviewer
  reviewerId: string;
  reviewerName: string;
  reviewerRole?: string; // e.g., 'BOD', 'CFO', 'CTO'
  
  // Status
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  
  // Checklist
  checklist: {
    item: string;
    checked: boolean;
    comments?: string;
  }[];
  
  // Decision
  comments?: string;
  decision?: 'approve' | 'reject' | 'request-changes';
  decidedAt?: Date;
  
  // Attachments
  attachments?: Attachment[];
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// Change Management (Runtime)
// ============================================================================

/**
 * Change Request Type
 */
export type ChangeRequestType = 
  | 'stage-addition'      // Add new stage
  | 'assignment-addition' // Add new assignment
  | 'timeline-change'     // Modify dates
  | 'budget-change'       // Modify budget
  | 'scope-change'        // Change scope/objectives
  | 'resource-change'     // Add/remove resources
  | 'indicator-change'    // Modify indicators
  | 'other';              // Other changes

/**
 * Change Request
 * Request to modify project during runtime
 */
export interface ChangeRequest {
  id: string;
  projectId: string;
  
  // Type
  type: ChangeRequestType;
  
  // Description
  title: string;
  description: string;
  justification?: string;
  
  // Requester
  requestedBy: string;
  requestedByName?: string;
  requestedAt: Date;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  
  // Approval
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Change Data (type-specific)
  changes: any; // Actual change data (varies by type)
  
  // Impact Assessment
  impact?: {
    timeline?: { days: number; description: string };
    budget?: { amount: number; description: string };
    resources?: { description: string };
    risks?: string[];
  };
  
  // Implementation
  implementedAt?: Date;
  implementedBy?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collaboration & Discussion
// ============================================================================

/**
 * Discussion Message
 * Team communication within project
 */
export interface DiscussionMessage {
  id: string;
  projectId: string;
  
  // Author
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  
  // Content
  message: string;
  
  // Threading
  parentMessageId?: string; // For replies
  threadId?: string; // Group related messages
  
  // Mentions
  mentions?: string[]; // User IDs mentioned in message
  
  // Reactions
  reactions?: {
    emoji: string;
    userIds: string[];
    count: number;
  }[];
  
  // Attachments
  attachments?: Attachment[];
  
  // Metadata
  timestamp: Date;
  editedAt?: Date;
  isEdited?: boolean;
  isPinned?: boolean;
}

// ============================================================================
// Main Project Definition
// ============================================================================

/**
 * Project
 * Complete project definition including all phases
 */
export interface Project {
  id: string;
  
  // Status & Lifecycle
  status: ProjectStatus;
  currentStageId?: string; // Active stage ID (during Active phase)
  
  // Ownership
  ownerId: string; // PM user ID
  ownerName: string;
  ownerEmail?: string;
  
  // Basic Details (from Drafting Phase)
  details: ProjectDetails;
  
  // Indicators (from Drafting Phase)
  indicators: Indicator[];
  
  // Workflow (from Drafting Phase)
  workflow: Stage[];
  
  // Assignments (from Drafting Phase)
  assignments: Assignment[];
  
  // Governance (from Governance Phase)
  governanceReviews: GovernanceReview[];
  governanceMappingId?: string; // BOD supervisor ID
  governanceSubmittedAt?: Date;
  governanceDecidedAt?: Date;
  
  // Setup Phase Data
  resourceTypes: ProjectResourceType[];
  indicatorConnections: IndicatorConnection[];
  setupCompletedAt?: Date;
  setupCompletedBy?: string;
  
  // Runtime Data (Active Phase)
  actualStartDate?: Date;
  actualEndDate?: Date;
  changeRequests: ChangeRequest[];
  
  // Collaboration
  discussions: DiscussionMessage[];
  
  // Financials
  budget?: number;
  actualCost?: number;
  costVariance?: number; // budget - actualCost
  
  // Progress
  overallProgress?: number; // 0-100 percentage
  
  // Risk & Issues
  risks?: {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: 'low' | 'medium' | 'high';
    mitigation?: string;
    status: 'open' | 'mitigated' | 'closed';
    owner?: string;
    createdAt: Date;
  }[];
  
  issues?: {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    assignee?: string;
    createdAt: Date;
    resolvedAt?: Date;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
  
  // Audit Trail
  auditLog?: {
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    details?: any;
  }[];
}

// ============================================================================
// Portfolio & Program Management
// ============================================================================

/**
 * Portfolio
 * Collection of related projects
 */
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  
  // Projects
  projects: string[]; // Project IDs
  
  // Strategy
  strategicObjectives?: string[];
  
  // Ownership
  ownerId?: string;
  ownerName?: string;
  
  // Financials
  totalBudget?: number;
  totalActualCost?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Program
 * Group of projects within a portfolio
 */
export interface Program {
  id: string;
  name: string;
  description: string;
  
  // Parent Portfolio
  portfolioId: string;
  
  // Projects
  projects: string[]; // Project IDs
  
  // Ownership
  managerId?: string;
  managerName?: string;
  
  // Timeline
  startDate?: Date;
  endDate?: Date;
  
  // Financials
  totalBudget?: number;
  totalActualCost?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Project Templates
// ============================================================================

/**
 * Project Template
 * Reusable project structure
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  
  // Template Data (everything except IDs and dates)
  template: {
    details: Partial<ProjectDetails>;
    indicators: Omit<Indicator, 'id'>[];
    workflow: Omit<Stage, 'id' | 'startDate' | 'endDate'>[];
    assignments: Omit<Assignment, 'id' | 'stageId' | 'startDate' | 'endDate'>[];
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean; // Available to all PMs
  usageCount?: number;
}

// ============================================================================
// Project Analytics & Reporting
// ============================================================================

/**
 * Project Metrics
 * Key performance metrics for a project
 */
export interface ProjectMetrics {
  projectId: string;
  
  // Schedule Performance
  schedulePerformanceIndex: number; // SPI = EV / PV
  scheduleVariance: number; // SV = EV - PV (days)
  
  // Cost Performance
  costPerformanceIndex: number; // CPI = EV / AC
  costVariance: number; // CV = EV - AC
  
  // Completion
  percentComplete: number; // 0-100
  estimatedCompletionDate: Date;
  
  // Quality
  gateApprovalRate: number; // Percentage of gates passed
  indicatorHealthScore: number; // Average indicator health (0-100)
  
  // Team
  teamSize: number;
  teamUtilization: number; // Percentage
  
  // Risks & Issues
  openRisks: number;
  openIssues: number;
  
  // Metadata
  calculatedAt: Date;
}

/**
 * Project Dashboard Summary
 * High-level overview for dashboards
 */
export interface ProjectDashboardSummary {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    owner: { id: string; name: string };
  };
  
  timeline: {
    startDate: Date;
    endDate: Date;
    actualStartDate?: Date;
    daysRemaining: number;
    percentComplete: number;
  };
  
  financials: {
    budget: number;
    actualCost: number;
    variance: number;
    variancePercentage: number;
  };
  
  health: {
    overall: 'healthy' | 'at-risk' | 'critical';
    schedule: 'on-track' | 'at-risk' | 'delayed';
    budget: 'on-budget' | 'at-risk' | 'over-budget';
    quality: 'good' | 'acceptable' | 'poor';
  };
  
  progress: {
    stagesCompleted: number;
    totalStages: number;
    currentStageName?: string;
    assignmentsCompleted: number;
    totalAssignments: number;
  };
  
  alerts: {
    critical: number;
    warnings: number;
    info: number;
  };
}
