import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assignment, AssignmentWorkflow, AssignmentState } from '../types/assignment';

// Mock data for development
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    projectId: 'proj-001',
    projectName: 'SWIZ Platform Redesign',
    stageId: 'stage-1',
    stageName: 'Phase 1: Discovery & Research',
    
    title: 'User Research & Persona Development',
    description: 'Conduct user interviews and create detailed personas for the SWIZ platform targeting enterprise project managers.',
    
    pmId: 'pm-001',
    pmName: 'Sarah Johnson',
    leaderId: 'leader-001',
    leaderName: 'John Doe',
    
    allowedResourceTypes: ['interview-kit', 'survey-tool', 'design-software'],
    budgetCap: 15000,
    startDate: '2025-01-15',
    dueDate: '2025-02-28',
    
    status: 'PENDING',
    progress: 0,
    
    hasWorkflow: false,
    taskCount: 0,
    completedTaskCount: 0,
    
    assignmentIndicators: [
      {
        id: 'ind-1',
        name: 'Personas Completed',
        description: 'Number of validated user personas',
        targetValue: 5,
        currentValue: 0,
        unit: 'personas',
        sourceTaskIds: []
      },
      {
        id: 'ind-2',
        name: 'Interview Coverage',
        description: 'Percentage of target user segments interviewed',
        targetValue: 100,
        currentValue: 0,
        unit: '%',
        sourceTaskIds: []
      }
    ],
    
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'assign-2',
    projectId: 'proj-001',
    projectName: 'SWIZ Platform Redesign',
    stageId: 'stage-2',
    stageName: 'Phase 2: Design & Prototyping',
    
    title: 'UI Component Library Development',
    description: 'Create a comprehensive design system with reusable components following Glass Aura visual language.',
    
    pmId: 'pm-001',
    pmName: 'Sarah Johnson',
    leaderId: 'leader-001',
    leaderName: 'John Doe',
    
    allowedResourceTypes: ['figma-license', 'design-tokens', 'icon-library'],
    budgetCap: 25000,
    startDate: '2025-03-01',
    dueDate: '2025-04-15',
    
    status: 'ACTIVE',
    progress: 35,
    
    hasWorkflow: true,
    taskCount: 12,
    completedTaskCount: 4,
    
    assignmentIndicators: [
      {
        id: 'ind-3',
        name: 'Components Created',
        description: 'Number of production-ready components',
        targetValue: 50,
        currentValue: 18,
        unit: 'components',
        sourceTaskIds: ['task-1', 'task-2']
      }
    ],
    
    createdAt: '2025-02-20T10:00:00Z',
    updatedAt: '2025-03-15T14:30:00Z',
    acceptedAt: '2025-02-25T09:00:00Z'
  },
  {
    id: 'assign-3',
    projectId: 'proj-002',
    projectName: 'Mobile App Launch',
    stageId: 'stage-1',
    stageName: 'Phase 1: MVP Development',
    
    title: 'Backend API Infrastructure',
    description: 'Build scalable RESTful API with authentication, real-time sync, and offline support.',
    
    pmId: 'pm-002',
    pmName: 'Michael Chen',
    leaderId: 'leader-001',
    leaderName: 'John Doe',
    
    allowedResourceTypes: ['cloud-hosting', 'database', 'monitoring-tool'],
    budgetCap: 50000,
    startDate: '2025-01-20',
    dueDate: '2025-03-30',
    
    status: 'ACTIVE',
    progress: 62,
    
    hasWorkflow: true,
    taskCount: 18,
    completedTaskCount: 11,
    
    assignmentIndicators: [
      {
        id: 'ind-4',
        name: 'API Endpoints',
        description: 'Number of documented and tested endpoints',
        targetValue: 45,
        currentValue: 28,
        unit: 'endpoints',
        sourceTaskIds: ['task-3', 'task-4', 'task-5']
      },
      {
        id: 'ind-5',
        name: 'Test Coverage',
        description: 'Unit test coverage percentage',
        targetValue: 85,
        currentValue: 72,
        unit: '%',
        sourceTaskIds: ['task-6']
      }
    ],
    
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-03-20T16:45:00Z',
    acceptedAt: '2025-01-22T10:00:00Z'
  },
  {
    id: 'assign-4',
    projectId: 'proj-001',
    projectName: 'SWIZ Platform Redesign',
    stageId: 'stage-3',
    stageName: 'Phase 3: Testing & QA',
    
    title: 'Comprehensive QA & Performance Testing',
    description: 'Execute end-to-end testing, performance benchmarking, and security audit.',
    
    pmId: 'pm-001',
    pmName: 'Sarah Johnson',
    leaderId: 'leader-001',
    leaderName: 'John Doe',
    
    allowedResourceTypes: ['testing-framework', 'performance-tool', 'security-scanner'],
    budgetCap: 18000,
    startDate: '2025-04-16',
    dueDate: '2025-05-15',
    
    status: 'COMPLETED',
    progress: 100,
    
    hasWorkflow: true,
    taskCount: 15,
    completedTaskCount: 15,
    
    assignmentIndicators: [
      {
        id: 'ind-6',
        name: 'Bugs Resolved',
        description: 'Critical and high-priority bugs fixed',
        targetValue: 100,
        currentValue: 100,
        unit: '%',
        sourceTaskIds: ['task-7', 'task-8']
      }
    ],
    
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-05-15T17:00:00Z',
    acceptedAt: '2025-04-05T11:00:00Z',
    completedAt: '2025-05-15T17:00:00Z'
  }
];

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set, get) => ({
      assignments: MOCK_ASSIGNMENTS,
      activeAssignment: null,
      activeWorkflow: null,

      fetchAssignments: async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In production, replace with actual API call
        set({ assignments: MOCK_ASSIGNMENTS });
      },

      setActiveAssignment: (id: string) => {
        const assignment = get().assignments.find(a => a.id === id);
        set({ activeAssignment: assignment || null });
        
        // Load workflow if exists
        if (assignment?.hasWorkflow) {
          // TODO: Load workflow from backend
          set({
            activeWorkflow: {
              assignmentId: id,
              nodes: [],
              edges: [],
              isPublished: true,
              version: 1
            }
          });
        }
      },

      acceptAssignment: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set((state) => ({
          assignments: state.assignments.map(a =>
            a.id === id
              ? {
                  ...a,
                  status: 'ACTIVE',
                  acceptedAt: new Date().toISOString()
                }
              : a
          )
        }));
      },

      updateProgress: (id: string, progress: number) => {
        set((state) => ({
          assignments: state.assignments.map(a =>
            a.id === id
              ? {
                  ...a,
                  progress: Math.min(100, Math.max(0, progress)),
                  updatedAt: new Date().toISOString()
                }
              : a
          )
        }));
      },

      saveWorkflow: async (workflow: AssignmentWorkflow) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ activeWorkflow: workflow });
      },

      publishWorkflow: async (assignmentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const workflow = get().activeWorkflow;
        if (!workflow) return;
        
        set({
          activeWorkflow: {
            ...workflow,
            isPublished: true,
            publishedAt: new Date().toISOString()
          },
          assignments: get().assignments.map(a =>
            a.id === assignmentId
              ? {
                  ...a,
                  hasWorkflow: true,
                  taskCount: workflow.nodes.filter(n => n.type === 'task').length,
                  updatedAt: new Date().toISOString()
                }
              : a
          )
        });
      },

      // Helper to get assignment by ID
      getAssignmentById: (id: string) => {
        return get().assignments.find(a => a.id === id) || null;
      }
    }),
    {
      name: 'assignment-storage',
      partialize: (state) => ({
        assignments: state.assignments
      })
    }
  )
);