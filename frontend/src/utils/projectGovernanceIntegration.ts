import type { Project } from '../types/project';
import type { ReviewRequest } from '../types/governance';

/**
 * Integration utilities for Project → Governance workflow
 * Connects projectStore and governanceStore for approval process
 */

/**
 * Submit project for BOD approval
 * Creates governance review and updates project status
 */
export function submitProjectForApproval(
  project: Project,
  submittedBy: string,
  createReviewFn: (project: Project, submittedBy: string) => ReviewRequest,
  updateProjectFn: (id: string, status: 'submitted') => void
): ReviewRequest {
  // Update project status to 'submitted'
  updateProjectFn(project.id, 'submitted');
  
  // Create governance review
  const review = createReviewFn(project, submittedBy);
  
  return review;
}

/**
 * Handle BOD approval of project
 * Updates project status and activates if ready
 */
export function handleProjectApproval(
  projectId: string,
  reviewId: string,
  bodId: string,
  bodName: string,
  comments: string,
  approveReviewFn: (reviewId: string, bodId: string, bodName: string, comments: string) => void,
  approveProjectFn: (projectId: string) => void,
  getReviewFn: (reviewId: string) => ReviewRequest | undefined
): { success: boolean; approved: boolean; message: string } {
  // Add BOD vote to review
  approveReviewFn(reviewId, bodId, bodName, comments);
  
  // Check if review is now fully approved
  const review = getReviewFn(reviewId);
  if (!review) {
    return {
      success: false,
      approved: false,
      message: 'Review not found'
    };
  }
  
  const approvalCount = review.votes.filter(v => v.decision === 'approve').length;
  const isFullyApproved = approvalCount >= review.requiredVotes;
  
  if (isFullyApproved) {
    // Update project status to 'approved'
    approveProjectFn(projectId);
    
    return {
      success: true,
      approved: true,
      message: `Project approved! (${approvalCount}/${review.requiredVotes} votes)`
    };
  }
  
  return {
    success: true,
    approved: false,
    message: `Vote recorded (${approvalCount}/${review.requiredVotes} votes needed)`
  };
}

/**
 * Handle BOD rejection of project
 * Returns project to draft status with rejection reason
 */
export function handleProjectRejection(
  projectId: string,
  reviewId: string,
  bodId: string,
  bodName: string,
  comments: string,
  rejectReviewFn: (reviewId: string, bodId: string, bodName: string, comments: string) => void,
  rejectProjectFn: (projectId: string, reason: string) => void
): { success: boolean; message: string } {
  // Add BOD rejection vote to review
  rejectReviewFn(reviewId, bodId, bodName, comments);
  
  // Return project to draft status
  rejectProjectFn(projectId, comments);
  
  return {
    success: true,
    message: 'Project rejected. PM has been notified to revise and resubmit.'
  };
}

/**
 * Check if project is ready for submission
 */
export function canSubmitProject(project: Project): {
  canSubmit: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  // Check required fields
  if (!project.details?.name || project.details.name.trim() === '') {
    reasons.push('Project name is required');
  }
  
  if (!project.details?.description || project.details.description.trim() === '') {
    reasons.push('Project description is required');
  }
  
  if (!project.details?.expectedStartDate) {
    reasons.push('Expected start date is required');
  }
  
  if (!project.details?.expectedEndDate) {
    reasons.push('Expected end date is required');
  }
  
  if (!project.workflow || project.workflow.length === 0) {
    reasons.push('At least one workflow stage is required');
  }
  
  // Warnings (not blocking, but should be considered)
  const warnings: string[] = [];
  
  if (!project.assignments || project.assignments.length === 0) {
    warnings.push('No assignments defined (recommended)');
  }
  
  if (!project.indicators || project.indicators.length === 0) {
    warnings.push('No indicators defined (recommended)');
  }
  
  return {
    canSubmit: reasons.length === 0,
    reasons: [...reasons, ...warnings]
  };
}

/**
 * Get project approval status summary
 */
export function getProjectApprovalSummary(
  project: Project,
  review: ReviewRequest | undefined
): {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  message: string;
  canAllocateResources: boolean;
  canActivate: boolean;
  votingProgress?: {
    current: number;
    required: number;
    percentage: number;
  };
} {
  if (!review && project.status === 'draft') {
    return {
      status: 'not_submitted',
      message: 'Project not yet submitted for approval',
      canAllocateResources: false,
      canActivate: false
    };
  }
  
  if (review && review.status === 'pending') {
    const approvalCount = review.votes.filter(v => v.decision === 'approve').length;
    const percentage = (approvalCount / review.requiredVotes) * 100;
    
    return {
      status: 'pending',
      message: `Awaiting BOD approval (${approvalCount}/${review.requiredVotes} votes)`,
      canAllocateResources: false,
      canActivate: false,
      votingProgress: {
        current: approvalCount,
        required: review.requiredVotes,
        percentage
      }
    };
  }
  
  if (project.status === 'approved') {
    return {
      status: 'approved',
      message: 'Project approved by BOD',
      canAllocateResources: true,
      canActivate: true
    };
  }
  
  if (review && review.status === 'rejected') {
    return {
      status: 'rejected',
      message: 'Project rejected by BOD. Revisions needed.',
      canAllocateResources: false,
      canActivate: false
    };
  }
  
  // Default
  return {
    status: 'not_submitted',
    message: 'Status unknown',
    canAllocateResources: false,
    canActivate: false
  };
}

/**
 * Notify PM of approval decision
 * (Would integrate with notification system in real app)
 */
export function notifyPMOfDecision(
  projectId: string,
  projectName: string,
  pmName: string,
  decision: 'approved' | 'rejected',
  comments: string
): void {
  // In a real app, this would send email/push notification
  console.log(`[NOTIFICATION] PM: ${pmName}`);
  console.log(`Project: ${projectName} (${projectId})`);
  console.log(`Decision: ${decision.toUpperCase()}`);
  console.log(`Comments: ${comments}`);
  
  // Could dispatch custom event for notification center
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('project-decision', {
      detail: {
        projectId,
        projectName,
        pmName,
        decision,
        comments,
        timestamp: new Date()
      }
    }));
  }
}

/**
 * Notify BOD members that new project needs review
 * (Would integrate with notification system in real app)
 */
export function notifyBODOfSubmission(
  projectId: string,
  projectName: string,
  pmName: string,
  review: ReviewRequest
): void {
  // In a real app, this would send email/push notification to all BOD members
  console.log(`[NOTIFICATION] BOD Members: New project submission`);
  console.log(`Project: ${projectName} (${projectId})`);
  console.log(`Submitted by: ${pmName}`);
  console.log(`Deadline: ${review.deadline.toLocaleString()}`);
  console.log(`Required votes: ${review.requiredVotes}`);
  
  // Could dispatch custom event for notification center
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('project-submitted', {
      detail: {
        projectId,
        projectName,
        pmName,
        reviewId: review.id,
        deadline: review.deadline,
        timestamp: new Date()
      }
    }));
  }
}
