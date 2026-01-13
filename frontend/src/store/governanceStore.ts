import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReviewRequest, Vote, DecisionHistory, DecisionType } from '../types/governance';
import type { Project } from '../types/project';

interface GovernanceState {
  reviews: ReviewRequest[];
  decisionHistory: DecisionHistory[];
  
  // Review Management
  addVote: (reviewId: string, vote: Vote) => void;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected' | 'dismissed') => void;
  addDecisionToHistory: (decision: DecisionHistory) => void;
  
  // ⚡ PHASE 3B: Project Approval Workflow
  createProjectReview: (project: Project, submittedBy: string) => ReviewRequest;
  approveProjectReview: (reviewId: string, bodId: string, bodName: string, comments: string) => void;
  rejectProjectReview: (reviewId: string, bodId: string, bodName: string, comments: string) => void;
  getReviewByProjectId: (projectId: string) => ReviewRequest | undefined;
  getPendingReviews: () => ReviewRequest[];
  getReviewsRequiringMyVote: (bodId: string) => ReviewRequest[];
}

// Mock data for demonstration
const mockReviews: ReviewRequest[] = [
  {
    id: 'rev-001',
    projectId: 'proj-alpha',
    projectName: 'Project Alpha - Mobile App Redesign',
    type: 'draft_approval',
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    status: 'pending',
    checklist: [
      { id: 'c1', text: 'Budget is under $50,000', isChecked: true, category: 'Budget' },
      { id: 'c2', text: 'Timeline is realistic (< 6 months)', isChecked: true, category: 'Timeline' },
      { id: 'c3', text: 'Team has required expertise', isChecked: false, category: 'Team' },
      { id: 'c4', text: 'Strategic alignment verified', isChecked: true, category: 'Vision' }
    ],
    votes: [
      {
        bodId: 'bod-001',
        bodName: 'Jennifer Williams',
        bodAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
        decision: 'approve',
        comments: 'Strategic fit is excellent. Team looks strong.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        bodId: 'bod-002',
        bodName: 'Robert Chen',
        bodAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
        decision: 'approve',
        comments: 'Budget is tight but acceptable given the ROI projections.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],
    requiredVotes: 3,
    pmName: 'Sarah Mitchell',
    pmAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    budget: 48500,
    duration: '3 months',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 'rev-002',
    projectId: 'proj-beta',
    projectName: 'Project Beta - E-commerce Platform',
    type: 'gate_review',
    deadline: new Date(Date.now() + 14.5 * 60 * 60 * 1000), // 14.5 hours from now
    status: 'pending',
    checklist: [
      { id: 'g1', text: 'All deliverables completed', isChecked: true },
      { id: 'g2', text: 'Quality score meets threshold (>95%)', isChecked: true },
      { id: 'g3', text: 'Stakeholder feedback incorporated', isChecked: true },
      { id: 'g4', text: 'Technical debt documented', isChecked: false }
    ],
    votes: [],
    requiredVotes: 2,
    pmName: 'Michael Torres',
    pmAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    budget: 125000,
    duration: '6 months',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    gateData: {
      stageName: 'Design Development',
      stageNumber: 2,
      totalStages: 5,
      completedDeliverables: 5,
      totalDeliverables: 5,
      qualityScore: 98,
      completionDate: new Date('2025-02-14'),
      pmCommentary: 'Design phase completed ahead of schedule with exceptional quality. All stakeholder feedback has been incorporated. Team is ready to proceed to production phase. Minor technical debt documented and will be addressed in next sprint.',
      criteria: [
        {
          id: 'cr1',
          name: 'Design Mockups',
          target: 40,
          actual: 45,
          unit: 'sketches',
          status: 'pass'
        },
        {
          id: 'cr2',
          name: 'Prototypes',
          target: 5,
          actual: 5,
          unit: 'samples',
          status: 'pass'
        },
        {
          id: 'cr3',
          name: 'User Testing Score',
          target: 85,
          actual: 92,
          unit: '%',
          status: 'pass'
        },
        {
          id: 'cr4',
          name: 'Brand Alignment',
          target: 90,
          actual: 88,
          unit: '%',
          status: 'warning'
        }
      ],
      routingOptions: [
        {
          id: 'route-1',
          label: 'Proceed to Production',
          description: 'Move to Stage 3: Production Development',
          targetStage: 3,
          severity: 'success',
          icon: 'ArrowRight'
        },
        {
          id: 'route-2',
          label: 'Minor Rework Required',
          description: 'Return to Stage 2 for revisions',
          targetStage: 2,
          severity: 'warning',
          icon: 'RefreshCw'
        },
        {
          id: 'route-3',
          label: 'Fail Gate / Restart',
          description: 'Significant issues - return to Stage 1',
          targetStage: 1,
          severity: 'danger',
          icon: 'XCircle'
        }
      ]
    }
  },
  {
    id: 'rev-003',
    projectId: 'proj-gamma',
    projectName: 'Project Gamma - CRM Integration',
    type: 'draft_approval',
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    status: 'pending',
    checklist: [
      { id: 'c5', text: 'Budget approved by finance', isChecked: true, category: 'Budget' },
      { id: 'c6', text: 'Resource availability confirmed', isChecked: true, category: 'Resources' },
      { id: 'c7', text: 'Risk assessment completed', isChecked: false, category: 'Risk' }
    ],
    votes: [],
    requiredVotes: 3,
    pmName: 'Emily Rodriguez',
    pmAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    budget: 75000,
    duration: '4 months',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];

const mockHistory: DecisionHistory[] = [
  {
    id: 'hist-001',
    projectId: 'proj-delta',
    projectName: 'Project Delta - Cloud Migration',
    type: 'draft_approval',
    decision: 'approve',
    decidedBy: 'Jennifer Williams',
    decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    comments: 'Approved with confidence. Strong technical plan and experienced team.'
  },
  {
    id: 'hist-002',
    projectId: 'proj-epsilon',
    projectName: 'Project Epsilon - Analytics Dashboard',
    type: 'gate_review',
    decision: 'approve',
    decidedBy: 'Robert Chen',
    decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    comments: 'Gate criteria exceeded. Approved to proceed to deployment.'
  },
  {
    id: 'hist-003',
    projectId: 'proj-zeta',
    projectName: 'Project Zeta - Marketing Automation',
    type: 'draft_approval',
    decision: 'reject',
    decidedBy: 'Jennifer Williams',
    decidedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    comments: 'Scope too broad. Needs refinement on deliverables and timeline.'
  }
];

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      reviews: mockReviews,
      decisionHistory: mockHistory,
      
      addVote: (reviewId, vote) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId
              ? { ...review, votes: [...review.votes, vote] }
              : review
          )
        })),
      
      updateReviewStatus: (reviewId, status) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId ? { ...review, status } : review
          )
        })),
      
      addDecisionToHistory: (decision) =>
        set((state) => ({
          decisionHistory: [decision, ...state.decisionHistory]
        })),
      
      // ⚡ PHASE 3B: Create project approval review
      createProjectReview: (project, submittedBy) => {
        const reviewId = `rev-${Date.now()}`;
        
        // Calculate duration in months
        const startDate = new Date(project.details.expectedStartDate);
        const endDate = new Date(project.details.expectedEndDate);
        const durationMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        // Create checklist based on project details
        const checklist = [
          { 
            id: 'c1', 
            text: 'Strategic alignment verified', 
            isChecked: false, 
            category: 'Vision' 
          },
          { 
            id: 'c2', 
            text: 'Timeline is realistic', 
            isChecked: false, 
            category: 'Timeline' 
          },
          { 
            id: 'c3', 
            text: 'Resources available', 
            isChecked: project.assignments && project.assignments.length > 0, 
            category: 'Resources' 
          },
          { 
            id: 'c4', 
            text: 'Workflow stages defined', 
            isChecked: project.workflow && project.workflow.length > 0, 
            category: 'Planning' 
          }
        ];
        
        const newReview: ReviewRequest = {
          id: reviewId,
          projectId: project.id,
          projectName: project.details.name,
          type: 'draft_approval',
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          status: 'pending',
          checklist,
          votes: [],
          requiredVotes: 2, // Minimum 2 BOD approvals
          pmName: submittedBy,
          pmAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${submittedBy}`,
          duration: `${durationMonths} months`,
          createdAt: new Date()
        };
        
        set((state) => ({
          reviews: [newReview, ...state.reviews]
        }));
        
        return newReview;
      },
      
      // ⚡ PHASE 3B: BOD approves project
      approveProjectReview: (reviewId, bodId, bodName, comments) => {
        const vote: Vote = {
          bodId,
          bodName,
          bodAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${bodName}`,
          decision: 'approve',
          comments,
          timestamp: new Date()
        };
        
        set((state) => {
          const review = state.reviews.find(r => r.id === reviewId);
          if (!review) return state;
          
          const updatedVotes = [...review.votes, vote];
          const approvalCount = updatedVotes.filter(v => v.decision === 'approve').length;
          const newStatus = approvalCount >= review.requiredVotes ? 'approved' : 'pending';
          
          // Add to decision history if approved
          let newHistory = state.decisionHistory;
          if (newStatus === 'approved') {
            const decision: DecisionHistory = {
              id: `hist-${Date.now()}`,
              projectId: review.projectId,
              projectName: review.projectName,
              type: review.type,
              decision: 'approve',
              decidedBy: bodName,
              decidedAt: new Date(),
              comments: `Approved by BOD with ${approvalCount} votes`
            };
            newHistory = [decision, ...state.decisionHistory];
          }
          
          return {
            reviews: state.reviews.map((r) =>
              r.id === reviewId
                ? { ...r, votes: updatedVotes, status: newStatus }
                : r
            ),
            decisionHistory: newHistory
          };
        });
      },
      
      // ⚡ PHASE 3B: BOD rejects project
      rejectProjectReview: (reviewId, bodId, bodName, comments) => {
        const vote: Vote = {
          bodId,
          bodName,
          bodAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${bodName}`,
          decision: 'reject',
          comments,
          timestamp: new Date()
        };
        
        set((state) => {
          const review = state.reviews.find(r => r.id === reviewId);
          if (!review) return state;
          
          const updatedVotes = [...review.votes, vote];
          const rejectionCount = updatedVotes.filter(v => v.decision === 'reject').length;
          
          // If any rejection, mark as rejected (strict governance)
          const newStatus = rejectionCount > 0 ? 'rejected' : 'pending';
          
          // Add to decision history
          let newHistory = state.decisionHistory;
          if (newStatus === 'rejected') {
            const decision: DecisionHistory = {
              id: `hist-${Date.now()}`,
              projectId: review.projectId,
              projectName: review.projectName,
              type: review.type,
              decision: 'reject',
              decidedBy: bodName,
              decidedAt: new Date(),
              comments
            };
            newHistory = [decision, ...state.decisionHistory];
          }
          
          return {
            reviews: state.reviews.map((r) =>
              r.id === reviewId
                ? { ...r, votes: updatedVotes, status: newStatus }
                : r
            ),
            decisionHistory: newHistory
          };
        });
      },
      
      // Query methods
      getReviewByProjectId: (projectId) => {
        return get().reviews.find(r => r.projectId === projectId);
      },
      
      getPendingReviews: () => {
        return get().reviews.filter(r => r.status === 'pending');
      },
      
      getReviewsRequiringMyVote: (bodId) => {
        return get().reviews.filter(r => 
          r.status === 'pending' && 
          !r.votes.some(v => v.bodId === bodId)
        );
      }
    }),
    {
      name: 'governance-store',
      partialize: (state) => ({
        reviews: state.reviews,
        decisionHistory: state.decisionHistory
      })
    }
  )
);
