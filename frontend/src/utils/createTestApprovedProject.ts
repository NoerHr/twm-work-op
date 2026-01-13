import type { Project } from '../types/project';

export function createTestApprovedProject(ownerId: string, ownerName: string): Project {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 14); // Start in 2 weeks
  
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6); // 6 months duration

  const createdAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Created 1 week ago
  const submittedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // Submitted 3 days ago
  const approvedAt = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Approved yesterday

  return {
    id: `proj-approved-${Date.now()}`,
    status: 'approved',
    ownerId,
    ownerName,
    details: {
      name: 'ERP System Upgrade',
      description: 'Comprehensive upgrade of enterprise resource planning system with cloud migration, modern UI/UX redesign, and enhanced reporting capabilities.',
      expectedStartDate: startDate,
      expectedEndDate: endDate,
      priority: 'high',
      tags: ['enterprise', 'cloud', 'transformation'],
      department: 'IT',
      budget: 850000
    },
    workflow: [
      {
        id: 'stage-1',
        name: 'Planning & Requirements',
        description: 'Gather requirements and plan migration strategy',
        order: 0,
        duration: 30,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: true,
        gateApprovers: ['BOD'],
        dependencies: []
      },
      {
        id: 'stage-2',
        name: 'Infrastructure Setup',
        description: 'Setup cloud infrastructure and development environments',
        order: 1,
        duration: 45,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: true,
        gateApprovers: ['IT Manager'],
        dependencies: ['stage-1']
      },
      {
        id: 'stage-3',
        name: 'Data Migration',
        description: 'Migrate existing data to new system',
        order: 2,
        duration: 60,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: true,
        gateApprovers: ['Data Officer'],
        dependencies: ['stage-2']
      },
      {
        id: 'stage-4',
        name: 'UI/UX Redesign',
        description: 'Design and implement new user interface',
        order: 3,
        duration: 90,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: false,
        dependencies: ['stage-2']
      },
      {
        id: 'stage-5',
        name: 'Testing & QA',
        description: 'Comprehensive testing of all modules',
        order: 4,
        duration: 45,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: true,
        gateApprovers: ['QA Lead'],
        dependencies: ['stage-3', 'stage-4']
      },
      {
        id: 'stage-6',
        name: 'Deployment & Training',
        description: 'Deploy to production and train users',
        order: 5,
        duration: 30,
        status: 'pending',
        type: 'standard',
        isMandatory: true,
        hasGate: true,
        gateApprovers: ['BOD', 'IT Manager'],
        dependencies: ['stage-5']
      }
    ],
    assignments: [
      {
        id: 'assign-1',
        name: 'Backend Development',
        description: 'Develop backend APIs and services',
        stageId: 'stage-2',
        leaderId: 'leader-001',
        leaderName: 'John Smith',
        expectedStart: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        expectedEnd: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
        status: 'pending',
        tags: ['development', 'backend']
      },
      {
        id: 'assign-2',
        name: 'Frontend Development',
        description: 'Build user interface components',
        stageId: 'stage-4',
        leaderId: 'leader-002',
        leaderName: 'Sarah Johnson',
        expectedStart: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
        expectedEnd: new Date(startDate.getTime() + 165 * 24 * 60 * 60 * 1000),
        status: 'pending',
        tags: ['development', 'frontend']
      },
      {
        id: 'assign-3',
        name: 'Database Migration',
        description: 'Migrate and optimize database',
        stageId: 'stage-3',
        leaderId: 'leader-003',
        leaderName: 'Michael Chen',
        expectedStart: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
        expectedEnd: new Date(startDate.getTime() + 135 * 24 * 60 * 60 * 1000),
        status: 'pending',
        tags: ['data', 'migration']
      },
      {
        id: 'assign-4',
        name: 'Quality Assurance',
        description: 'Testing and quality control',
        stageId: 'stage-5',
        leaderId: 'leader-004',
        leaderName: 'Emily Davis',
        expectedStart: new Date(startDate.getTime() + 165 * 24 * 60 * 60 * 1000),
        expectedEnd: new Date(startDate.getTime() + 210 * 24 * 60 * 60 * 1000),
        status: 'pending',
        tags: ['qa', 'testing']
      }
    ],
    indicators: [
      {
        id: 'ind-1',
        name: 'Development Progress',
        description: 'Overall development completion percentage',
        type: 'percentage',
        unit: '%',
        target: 100,
        current: 0,
        scope: 'project',
        category: 'progress',
        visualization: {
          type: 'gauge',
          config: {}
        }
      },
      {
        id: 'ind-2',
        name: 'Budget Utilization',
        description: 'Percentage of budget spent',
        type: 'percentage',
        unit: '%',
        target: 100,
        current: 0,
        scope: 'project',
        category: 'financial',
        visualization: {
          type: 'progress-bar',
          config: {}
        }
      },
      {
        id: 'ind-3',
        name: 'Code Quality Score',
        description: 'Average code quality metrics',
        type: 'number',
        unit: 'score',
        target: 85,
        current: 0,
        scope: 'assignment',
        category: 'quality',
        visualization: {
          type: 'gauge',
          config: {}
        }
      },
      {
        id: 'ind-4',
        name: 'Test Coverage',
        description: 'Percentage of code covered by tests',
        type: 'percentage',
        unit: '%',
        target: 80,
        current: 0,
        scope: 'assignment',
        category: 'quality',
        visualization: {
          type: 'progress-bar',
          config: {}
        }
      },
      {
        id: 'ind-5',
        name: 'Migration Success Rate',
        description: 'Percentage of data successfully migrated',
        type: 'percentage',
        unit: '%',
        target: 100,
        current: 0,
        scope: 'assignment',
        category: 'progress',
        visualization: {
          type: 'gauge',
          config: {}
        }
      }
    ],
    discussions: [],
    governanceReviews: [],
    resourceTypes: [],
    indicatorConnections: [],
    changeRequests: [],
    createdAt,
    updatedAt: new Date(),
    version: 1,
    submittedAt,
    approvedAt
  };
}