import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  ProjectStatus,
  Stage,
  Assignment,
  Indicator,
  IndicatorConnection,
  ProjectResourceType,
  ChangeRequest,
  DiscussionMessage,
  GovernanceReview
} from '../types/project';

interface ProjectStore {
  // State
  projects: Project[];
  selectedProjectId: string | null;
  
  // CRUD Operations
  createProject: (projectData: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  
  // Project Status Management
  submitProject: (id: string) => void;
  approveProject: (id: string) => void;
  rejectProject: (id: string, reason: string) => void;
  activateProject: (id: string) => void;
  completeProject: (id: string) => void;
  archiveProject: (id: string) => void;
  
  // Workflow Management
  addStage: (projectId: string, stage: Stage) => void;
  updateStage: (projectId: string, stageId: string, updates: Partial<Stage>) => void;
  deleteStage: (projectId: string, stageId: string) => void;
  moveToNextStage: (projectId: string) => void;
  completeStage: (projectId: string, stageId: string) => void;
  
  // Assignment Management
  addAssignment: (projectId: string, assignment: Assignment) => void;
  updateAssignment: (projectId: string, assignmentId: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (projectId: string, assignmentId: string) => void;
  assignLeader: (projectId: string, assignmentId: string, leaderId: string, leaderName: string) => void;
  
  // Indicator Management
  attachIndicator: (projectId: string, indicatorId: string) => void;
  detachIndicator: (projectId: string, indicatorId: string) => void;
  connectIndicators: (projectId: string, connection: IndicatorConnection) => void;
  
  // Resource Type Management
  addResourceType: (projectId: string, resourceType: ProjectResourceType) => void;
  syncResourceType: (projectId: string, resourceTypeId: string) => void;
  
  // Discussion Management
  addDiscussion: (projectId: string, message: DiscussionMessage) => void;
  
  // Change Request Management
  createChangeRequest: (projectId: string, changeRequest: Omit<ChangeRequest, 'id' | 'requestedAt' | 'status'>) => void;
  approveChangeRequest: (projectId: string, requestId: string, approverId: string) => void;
  rejectChangeRequest: (projectId: string, requestId: string, reason: string) => void;
  
  // Governance Management
  addGovernanceReview: (projectId: string, review: GovernanceReview) => void;
  updateGovernanceReview: (projectId: string, reviewId: string, updates: Partial<GovernanceReview>) => void;
  
  // Query Methods
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getProjectsByOwner: (ownerId: string) => Project[];
  getActiveProjects: () => Project[];
  getProjectStages: (projectId: string) => Stage[];
  getProjectAssignments: (projectId: string) => Assignment[];
  getAssignmentsByLeader: (leaderId: string) => Assignment[];
  getCurrentStage: (projectId: string) => Stage | undefined;
  
  // UI State
  setSelectedProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial State
      projects: [],
      selectedProjectId: null,
      
      // CRUD Operations
      createProject: (projectData) => {
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          status: 'draft',
          ownerId: projectData.ownerId || 'unknown',
          ownerName: projectData.ownerName || 'Unknown',
          details: projectData.details || {
            name: '',
            description: '',
            expectedStartDate: new Date(),
            expectedEndDate: new Date(),
            priority: 'medium',
            tags: []
          },
          indicators: [],
          workflow: [],
          assignments: [],
          discussions: [],
          governanceReviews: [],
          resourceTypes: [],
          indicatorConnections: [],
          changeRequests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          ...projectData
        };
        
        set((state) => ({
          projects: [...state.projects, newProject]
        }));
        
        return newProject;
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            
            const updatedProject = { ...p, ...updates, updatedAt: new Date(), version: p.version + 1 };
            
            // ✅ AUTO-ASSIGN: If indicators or assignments changed, auto-link assignment-level indicators
            if (updates.indicators || updates.assignments) {
              const assignmentLevelIndicatorIds = updatedProject.indicators
                .filter(ind => ind.scope === 'assignment')
                .map(ind => ind.id);
              
              // Assign all assignment-level indicators to all assignments
              updatedProject.assignments = updatedProject.assignments.map(assignment => ({
                ...assignment,
                assignmentIndicators: assignmentLevelIndicatorIds
              }));
            }
            
            return updatedProject;
          })
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
        }));
      },
      
      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },
      
      // Project Status Management
      submitProject: (id) => {
        get().updateProject(id, { status: 'submitted' });
      },
      
      approveProject: (id) => {
        // ✅ NEW: Skip 'approved' status, go directly to 'active'
        get().updateProject(id, { status: 'active' });
      },
      
      rejectProject: (id, reason) => {
        get().updateProject(id, { 
          status: 'draft',
          // Store rejection reason in a change request or governance review
        });
      },
      
      activateProject: (id) => {
        get().updateProject(id, { 
          status: 'active',
          actualStartDate: new Date()
        });
      },
      
      completeProject: (id) => {
        get().updateProject(id, { 
          status: 'completed',
          actualEndDate: new Date()
        });
      },
      
      archiveProject: (id) => {
        get().updateProject(id, { status: 'archived' });
      },
      
      // Workflow Management
      addStage: (projectId, stage) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        const newStage: Stage = {
          ...stage,
          id: stage.id || `stage-${Date.now()}`,
          status: stage.status || 'pending',
          position: stage.position || project.workflow.length,
          dependencies: stage.dependencies || [],
          assignmentIds: stage.assignmentIds || []
        };
        
        get().updateProject(projectId, {
          workflow: [...project.workflow, newStage]
        });
      },
      
      updateStage: (projectId, stageId, updates) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          workflow: project.workflow.map((s) =>
            s.id === stageId ? { ...s, ...updates } : s
          )
        });
      },
      
      deleteStage: (projectId, stageId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          workflow: project.workflow.filter((s) => s.id !== stageId)
        });
      },
      
      moveToNextStage: (projectId) => {
        const project = get().getProject(projectId);
        if (!project || !project.currentStageId) return;
        
        const currentStage = project.workflow.find((s) => s.id === project.currentStageId);
        if (!currentStage) return;
        
        // Complete current stage
        get().updateStage(projectId, currentStage.id, { 
          status: 'completed',
          actualEndDate: new Date()
        });
        
        // Find next stage
        const nextStage = project.workflow
          .sort((a, b) => a.position - b.position)
          .find((s) => s.position > currentStage.position && s.status === 'pending');
        
        if (nextStage) {
          get().updateProject(projectId, {
            currentStageId: nextStage.id
          });
          get().updateStage(projectId, nextStage.id, { 
            status: 'active',
            actualStartDate: new Date()
          });
        }
      },
      
      completeStage: (projectId, stageId) => {
        get().updateStage(projectId, stageId, { 
          status: 'completed',
          actualEndDate: new Date(),
          progress: 100
        });
      },
      
      // Assignment Management
      addAssignment: (projectId, assignment) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        const newAssignment: Assignment = {
          ...assignment,
          id: assignment.id || `assign-${Date.now()}`,
          status: assignment.status || 'pending',
          createdAt: new Date()
        };
        
        get().updateProject(projectId, {
          assignments: [...project.assignments, newAssignment]
        });
        
        // Add assignment to stage if stageId is provided
        if (assignment.stageId) {
          const stage = project.workflow.find((s) => s.id === assignment.stageId);
          if (stage) {
            get().updateStage(projectId, assignment.stageId, {
              assignmentIds: [...stage.assignmentIds, newAssignment.id]
            });
          }
        }
      },
      
      updateAssignment: (projectId, assignmentId, updates) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          assignments: project.assignments.map((a) =>
            a.id === assignmentId ? { ...a, ...updates } : a
          )
        });
      },
      
      deleteAssignment: (projectId, assignmentId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          assignments: project.assignments.filter((a) => a.id !== assignmentId)
        });
        
        // Remove from stages
        project.workflow.forEach((stage) => {
          if (stage.assignmentIds.includes(assignmentId)) {
            get().updateStage(projectId, stage.id, {
              assignmentIds: stage.assignmentIds.filter((id) => id !== assignmentId)
            });
          }
        });
      },
      
      assignLeader: (projectId, assignmentId, leaderId, leaderName) => {
        get().updateAssignment(projectId, assignmentId, {
          leaderId,
          leaderName
        });
      },
      
      // Indicator Management
      attachIndicator: (projectId, indicatorId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        // Check if already attached
        if (project.indicators.some((ind) => ind.id === indicatorId)) {
          return;
        }
        
        // Note: This stores indicator IDs. The actual indicator data is in indicatorStore
        get().updateProject(projectId, {
          indicators: [...project.indicators, { id: indicatorId } as any]
        });
      },
      
      detachIndicator: (projectId, indicatorId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          indicators: project.indicators.filter((ind) => ind.id !== indicatorId)
        });
      },
      
      connectIndicators: (projectId, connection) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        const newConnection: IndicatorConnection = {
          ...connection,
          id: connection.id || `conn-${Date.now()}`
        };
        
        get().updateProject(projectId, {
          indicatorConnections: [...project.indicatorConnections, newConnection]
        });
      },
      
      // Resource Type Management
      addResourceType: (projectId, resourceType) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          resourceTypes: [...project.resourceTypes, resourceType]
        });
      },
      
      syncResourceType: (projectId, resourceTypeId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          resourceTypes: project.resourceTypes.map((rt) =>
            rt.id === resourceTypeId
              ? { ...rt, isSynced: true, lastSyncedAt: new Date() }
              : rt
          )
        });
      },
      
      // Discussion Management
      addDiscussion: (projectId, message) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        const newMessage: DiscussionMessage = {
          ...message,
          id: message.id || `msg-${Date.now()}`,
          projectId,
          timestamp: new Date()
        };
        
        get().updateProject(projectId, {
          discussions: [...project.discussions, newMessage]
        });
      },
      
      // Change Request Management
      createChangeRequest: (projectId, changeRequest) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        const newRequest: ChangeRequest = {
          ...changeRequest,
          id: `cr-${Date.now()}`,
          projectId,
          requestedAt: new Date(),
          status: 'pending'
        };
        
        get().updateProject(projectId, {
          changeRequests: [...project.changeRequests, newRequest]
        });
      },
      
      approveChangeRequest: (projectId, requestId, approverId) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          changeRequests: project.changeRequests.map((cr) =>
            cr.id === requestId
              ? { ...cr, status: 'approved', approvedBy: approverId, approvedAt: new Date() }
              : cr
          )
        });
      },
      
      rejectChangeRequest: (projectId, requestId, reason) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          changeRequests: project.changeRequests.map((cr) =>
            cr.id === requestId
              ? { ...cr, status: 'rejected', rejectionReason: reason }
              : cr
          )
        });
      },
      
      // Governance Management
      addGovernanceReview: (projectId, review) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          governanceReviews: [...project.governanceReviews, review]
        });
      },
      
      updateGovernanceReview: (projectId, reviewId, updates) => {
        const project = get().getProject(projectId);
        if (!project) return;
        
        get().updateProject(projectId, {
          governanceReviews: project.governanceReviews.map((gr) =>
            gr.id === reviewId ? { ...gr, ...updates } : gr
          )
        });
      },
      
      // Query Methods
      getProjectsByStatus: (status) => {
        return get().projects.filter((p) => p.status === status);
      },
      
      getProjectsByOwner: (ownerId) => {
        return get().projects.filter((p) => p.ownerId === ownerId);
      },
      
      getActiveProjects: () => {
        return get().projects.filter((p) => p.status === 'active');
      },
      
      getProjectStages: (projectId) => {
        const project = get().getProject(projectId);
        return project?.workflow || [];
      },
      
      getProjectAssignments: (projectId) => {
        const project = get().getProject(projectId);
        return project?.assignments || [];
      },
      
      getAssignmentsByLeader: (leaderId) => {
        const assignments: Assignment[] = [];
        get().projects.forEach((project) => {
          project.assignments.forEach((assignment) => {
            if (assignment.leaderId === leaderId) {
              assignments.push(assignment);
            }
          });
        });
        return assignments;
      },
      
      getCurrentStage: (projectId) => {
        const project = get().getProject(projectId);
        if (!project || !project.currentStageId) return undefined;
        return project.workflow.find((s) => s.id === project.currentStageId);
      },
      
      // UI State
      setSelectedProject: (id) => {
        set({ selectedProjectId: id });
      }
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projects: state.projects,
        selectedProjectId: state.selectedProjectId
      })
    }
  )
);

// ⚡ PHASE 5: Export store instance to window for cross-store access
if (typeof window !== 'undefined') {
  (window as any).__projectStore = useProjectStore;
}