export type ReviewType = 'draft_approval' | 'gate_review';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'dismissed';
export type DecisionType = 'approve' | 'reject' | 'dismiss';
export type GateOutcome = 'proceed' | 'rework' | 'fail';

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  category?: string;
}

export interface Vote {
  bodId: string;
  bodName: string;
  bodAvatar?: string;
  decision: DecisionType;
  comments: string;
  timestamp: Date;
}

export interface RejectionFeedback {
  categories: string[];
  instructions: string;
  timestamp: Date;
}

export interface ReviewRequest {
  id: string;
  projectId: string;
  projectName: string;
  type: ReviewType;
  deadline: Date;
  status: ReviewStatus;
  checklist: ChecklistItem[];
  votes: Vote[];
  requiredVotes: number;
  pmName: string;
  pmAvatar?: string;
  budget?: number;
  duration?: string;
  createdAt: Date;
  gateData?: GateReviewData;
}

export interface GateReviewData {
  stageName: string;
  stageNumber: number;
  totalStages: number;
  completedDeliverables: number;
  totalDeliverables: number;
  qualityScore: number;
  completionDate: Date;
  pmCommentary: string;
  criteria: GateCriterion[];
  routingOptions: RoutingOption[];
}

export interface GateCriterion {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
}

export interface RoutingOption {
  id: string;
  label: string;
  description: string;
  targetStage: number;
  severity: 'success' | 'warning' | 'danger';
  icon: string;
}

export interface DecisionHistory {
  id: string;
  projectId: string;
  projectName: string;
  type: ReviewType;
  decision: DecisionType;
  decidedBy: string;
  decidedAt: Date;
  comments: string;
}
