import type { Project, Stage, Assignment, Task } from '../types/project';

/**
 * 🎯 END-TO-END WORKFLOW DEMO
 * 
 * Complete workflow dari PM membuat project hingga Contributor menyelesaikan task:
 * 
 * PHASE 1: DRAFTING (PM)
 * - PM creates project proposal with 5-step wizard
 * - Define project details, stages, assignments, indicators
 * - Submit for BOD approval
 * 
 * PHASE 2: GOVERNANCE (BOD)
 * - BOD reviews project proposal
 * - Multiple BOD members vote (approve/reject/request changes)
 * - Majority approval triggers next phase
 * 
 * PHASE 3: SETUP (PM + Leaders)
 * - PM configures technical setup
 * - Allocate resources (budget, team members)
 * - Leaders plan task breakdown
 * 
 * PHASE 4: EXECUTION (Contributors)
 * - Contributors receive assigned tasks
 * - Work on tasks and update progress
 * - Complete tasks and move to next stage
 */

export function createCompleteWorkflowDemo(): Project {
  const projectId = `demo-workflow-${Date.now()}`;
  const now = new Date();
  
  // Stage 1: Design Phase
  const stage1: Stage = {
    id: 'stage-design',
    name: 'Design & Planning',
    description: 'UI/UX design and technical planning',
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
    duration: 14,
    status: 'pending',
    order: 1,
    dependencies: [],
    gates: [
      {
        id: 'gate-design-1',
        name: 'Design Review',
        type: 'approval',
        required: true,
        criteria: ['Design mockups completed', 'Stakeholder approval'],
        status: 'pending'
      }
    ],
    progress: 0
  };

  // Stage 2: Development Phase
  const stage2: Stage = {
    id: 'stage-development',
    name: 'Development',
    description: 'Frontend and backend development',
    startDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 52 * 24 * 60 * 60 * 1000),
    duration: 30,
    status: 'pending',
    order: 2,
    dependencies: ['stage-design'],
    gates: [
      {
        id: 'gate-dev-1',
        name: 'Code Review',
        type: 'quality',
        required: true,
        criteria: ['All tests passing', 'Code coverage >80%'],
        status: 'pending'
      }
    ],
    progress: 0
  };

  // Stage 3: Testing Phase
  const stage3: Stage = {
    id: 'stage-testing',
    name: 'Testing & QA',
    description: 'Quality assurance and bug fixes',
    startDate: new Date(now.getTime() + 53 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000),
    duration: 14,
    status: 'pending',
    order: 3,
    dependencies: ['stage-development'],
    gates: [
      {
        id: 'gate-qa-1',
        name: 'QA Sign-off',
        type: 'approval',
        required: true,
        criteria: ['No critical bugs', 'UAT completed'],
        status: 'pending'
      }
    ],
    progress: 0
  };

  // Assignment 1: UI/UX Design (Stage 1)
  const assignment1: Assignment = {
    id: 'assignment-design-ui',
    projectId: projectId,
    stageId: 'stage-design',
    name: 'UI/UX Design',
    description: 'Create user interface mockups and prototypes',
    leaders: [
      {
        id: 'leader-sarah',
        name: 'Sarah Chen',
        email: 'sarah.chen@swiz.com',
        role: 'Design Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        allocation: 100
      }
    ],
    budget: 15000,
    priority: 'high',
    status: 'pending',
    progress: 0,
    startDate: stage1.startDate,
    endDate: stage1.endDate,
    indicators: [
      {
        id: 'ind-design-1',
        name: 'Design Completion',
        type: 'percentage',
        target: 100,
        current: 0,
        unit: '%',
        level: 'assignment'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Assignment 2: Technical Planning (Stage 1)
  const assignment2: Assignment = {
    id: 'assignment-design-tech',
    projectId: projectId,
    stageId: 'stage-design',
    name: 'Technical Planning',
    description: 'Architecture design and technical specifications',
    leaders: [
      {
        id: 'leader-dian',
        name: 'Dian Pratama',
        email: 'dian.pratama@swiz.com',
        role: 'Tech Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dian',
        allocation: 100
      }
    ],
    budget: 10000,
    priority: 'high',
    status: 'pending',
    progress: 0,
    startDate: stage1.startDate,
    endDate: stage1.endDate,
    indicators: [
      {
        id: 'ind-tech-1',
        name: 'Architecture Docs',
        type: 'percentage',
        target: 100,
        current: 0,
        unit: '%',
        level: 'assignment'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Assignment 3: Frontend Development (Stage 2)
  const assignment3: Assignment = {
    id: 'assignment-dev-frontend',
    projectId: projectId,
    stageId: 'stage-development',
    name: 'Frontend Development',
    description: 'Build React components and user interfaces',
    leaders: [
      {
        id: 'leader-dian',
        name: 'Dian Pratama',
        email: 'dian.pratama@swiz.com',
        role: 'Tech Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dian',
        allocation: 60
      }
    ],
    budget: 30000,
    priority: 'high',
    status: 'pending',
    progress: 0,
    startDate: stage2.startDate,
    endDate: stage2.endDate,
    indicators: [
      {
        id: 'ind-frontend-1',
        name: 'Component Completion',
        type: 'percentage',
        target: 100,
        current: 0,
        unit: '%',
        level: 'assignment'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Assignment 4: Backend Development (Stage 2)
  const assignment4: Assignment = {
    id: 'assignment-dev-backend',
    projectId: projectId,
    stageId: 'stage-development',
    name: 'Backend Development',
    description: 'Build API endpoints and database schema',
    leaders: [
      {
        id: 'leader-mike',
        name: 'Mike Johnson',
        email: 'mike.johnson@swiz.com',
        role: 'Backend Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        allocation: 100
      }
    ],
    budget: 35000,
    priority: 'high',
    status: 'pending',
    progress: 0,
    startDate: stage2.startDate,
    endDate: stage2.endDate,
    indicators: [
      {
        id: 'ind-backend-1',
        name: 'API Endpoints',
        type: 'count',
        target: 25,
        current: 0,
        unit: 'endpoints',
        level: 'assignment'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Assignment 5: QA Testing (Stage 3)
  const assignment5: Assignment = {
    id: 'assignment-qa-testing',
    projectId: projectId,
    stageId: 'stage-testing',
    name: 'Quality Assurance',
    description: 'Test all features and report bugs',
    leaders: [
      {
        id: 'leader-lisa',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@swiz.com',
        role: 'QA Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        allocation: 100
      }
    ],
    budget: 20000,
    priority: 'high',
    status: 'pending',
    progress: 0,
    startDate: stage3.startDate,
    endDate: stage3.endDate,
    indicators: [
      {
        id: 'ind-qa-1',
        name: 'Test Coverage',
        type: 'percentage',
        target: 90,
        current: 0,
        unit: '%',
        level: 'assignment'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Tasks for Assignment 1 (UI/UX Design) - Contributors akan kerjakan ini
  const tasks: Task[] = [
    {
      id: 'task-wireframe',
      assignmentId: 'assignment-design-ui',
      stageId: 'stage-design',
      projectId: projectId,
      title: 'Create Wireframes',
      description: 'Design low-fidelity wireframes for all main pages',
      assignedTo: {
        id: 'contrib-alex',
        name: 'Alex Rivera',
        email: 'alex.rivera@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        role: 'UI Designer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 40,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      tags: ['design', 'wireframe'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-mockup',
      assignmentId: 'assignment-design-ui',
      stageId: 'stage-design',
      projectId: projectId,
      title: 'High-Fidelity Mockups',
      description: 'Create detailed mockups with colors, typography, and branding',
      assignedTo: {
        id: 'contrib-jessica',
        name: 'Jessica Wong',
        email: 'jessica.wong@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
        role: 'Visual Designer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 60,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      dependencies: ['task-wireframe'],
      tags: ['design', 'mockup', 'visual'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-prototype',
      assignmentId: 'assignment-design-ui',
      stageId: 'stage-design',
      projectId: projectId,
      title: 'Interactive Prototype',
      description: 'Build clickable prototype in Figma',
      assignedTo: {
        id: 'contrib-alex',
        name: 'Alex Rivera',
        email: 'alex.rivera@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        role: 'UI Designer'
      },
      priority: 'medium',
      status: 'pending',
      progress: 0,
      estimatedHours: 30,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      dependencies: ['task-mockup'],
      tags: ['design', 'prototype'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-tech-spec',
      assignmentId: 'assignment-design-tech',
      stageId: 'stage-design',
      projectId: projectId,
      title: 'Write Technical Specifications',
      description: 'Document system architecture and technology stack',
      assignedTo: {
        id: 'contrib-david',
        name: 'David Kim',
        email: 'david.kim@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        role: 'Solutions Architect'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 40,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      tags: ['technical', 'documentation'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-db-schema',
      assignmentId: 'assignment-design-tech',
      stageId: 'stage-design',
      projectId: projectId,
      title: 'Design Database Schema',
      description: 'Create ER diagrams and database structure',
      assignedTo: {
        id: 'contrib-maria',
        name: 'Maria Garcia',
        email: 'maria.garcia@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        role: 'Database Architect'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 30,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      tags: ['technical', 'database'],
      createdAt: now,
      updatedAt: now
    },
    // Frontend Development Tasks
    {
      id: 'task-component-lib',
      assignmentId: 'assignment-dev-frontend',
      stageId: 'stage-development',
      projectId: projectId,
      title: 'Build Component Library',
      description: 'Create reusable React components (buttons, inputs, cards)',
      assignedTo: {
        id: 'contrib-tom',
        name: 'Tom Anderson',
        email: 'tom.anderson@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
        role: 'Frontend Developer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 80,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      tags: ['frontend', 'react', 'components'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-dashboard',
      assignmentId: 'assignment-dev-frontend',
      stageId: 'stage-development',
      projectId: projectId,
      title: 'Implement Dashboard',
      description: 'Build main dashboard with charts and KPIs',
      assignedTo: {
        id: 'contrib-emma',
        name: 'Emma Wilson',
        email: 'emma.wilson@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        role: 'Frontend Developer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 60,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
      dependencies: ['task-component-lib'],
      tags: ['frontend', 'dashboard'],
      createdAt: now,
      updatedAt: now
    },
    // Backend Development Tasks
    {
      id: 'task-api-auth',
      assignmentId: 'assignment-dev-backend',
      stageId: 'stage-development',
      projectId: projectId,
      title: 'Authentication API',
      description: 'Implement login, register, and JWT authentication',
      assignedTo: {
        id: 'contrib-james',
        name: 'James Brown',
        email: 'james.brown@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        role: 'Backend Developer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 50,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      tags: ['backend', 'api', 'auth'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-api-projects',
      assignmentId: 'assignment-dev-backend',
      stageId: 'stage-development',
      projectId: projectId,
      title: 'Projects API',
      description: 'CRUD operations for projects, stages, and assignments',
      assignedTo: {
        id: 'contrib-sophia',
        name: 'Sophia Lee',
        email: 'sophia.lee@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
        role: 'Backend Developer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 70,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      tags: ['backend', 'api', 'projects'],
      createdAt: now,
      updatedAt: now
    },
    // QA Testing Tasks
    {
      id: 'task-test-plan',
      assignmentId: 'assignment-qa-testing',
      stageId: 'stage-testing',
      projectId: projectId,
      title: 'Create Test Plan',
      description: 'Write comprehensive test cases for all features',
      assignedTo: {
        id: 'contrib-nina',
        name: 'Nina Patel',
        email: 'nina.patel@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
        role: 'QA Engineer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 40,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
      tags: ['qa', 'testing', 'planning'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-regression',
      assignmentId: 'assignment-qa-testing',
      stageId: 'stage-testing',
      projectId: projectId,
      title: 'Regression Testing',
      description: 'Run all test cases and report bugs',
      assignedTo: {
        id: 'contrib-carlos',
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@swiz.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        role: 'QA Engineer'
      },
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedHours: 60,
      actualHours: 0,
      dueDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000),
      dependencies: ['task-test-plan'],
      tags: ['qa', 'testing', 'regression'],
      createdAt: now,
      updatedAt: now
    }
  ];

  // Create the complete project
  const project: Project = {
    id: projectId,
    details: {
      name: 'SWIZ Customer Portal',
      description: 'Next-generation customer portal with AI-powered analytics and real-time collaboration features. This project will revolutionize how our customers interact with our platform.',
      category: 'Product Development',
      expectedStartDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      expectedEndDate: new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000),
      actualStartDate: undefined,
      actualEndDate: undefined,
      businessCase: 'Increase customer engagement by 300% and reduce support tickets by 50% through self-service capabilities.',
      successCriteria: [
        'User satisfaction score >4.5/5',
        'Page load time <2 seconds',
        '99.9% uptime SLA',
        '50% reduction in support tickets'
      ],
      budget: 150000,
      estimatedRevenue: 500000,
      sponsor: {
        id: 'sponsor-ceo',
        name: 'Robert Chen',
        role: 'CEO',
        email: 'robert.chen@swiz.com'
      }
    },
    team: {
      projectManager: {
        id: 'pm-john',
        name: 'John Smith',
        email: 'john.smith@swiz.com',
        role: 'Project Manager',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      },
      members: [
        {
          id: 'leader-sarah',
          name: 'Sarah Chen',
          email: 'sarah.chen@swiz.com',
          role: 'Design Lead',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        {
          id: 'leader-dian',
          name: 'Dian Pratama',
          email: 'dian.pratama@swiz.com',
          role: 'Tech Lead',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dian'
        },
        {
          id: 'leader-mike',
          name: 'Mike Johnson',
          email: 'mike.johnson@swiz.com',
          role: 'Backend Lead',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
        },
        {
          id: 'leader-lisa',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@swiz.com',
          role: 'QA Lead',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
        },
        // Contributors
        {
          id: 'contrib-alex',
          name: 'Alex Rivera',
          email: 'alex.rivera@swiz.com',
          role: 'UI Designer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
        },
        {
          id: 'contrib-jessica',
          name: 'Jessica Wong',
          email: 'jessica.wong@swiz.com',
          role: 'Visual Designer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'
        },
        {
          id: 'contrib-david',
          name: 'David Kim',
          email: 'david.kim@swiz.com',
          role: 'Solutions Architect',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
        },
        {
          id: 'contrib-maria',
          name: 'Maria Garcia',
          email: 'maria.garcia@swiz.com',
          role: 'Database Architect',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
        },
        {
          id: 'contrib-tom',
          name: 'Tom Anderson',
          email: 'tom.anderson@swiz.com',
          role: 'Frontend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom'
        },
        {
          id: 'contrib-emma',
          name: 'Emma Wilson',
          email: 'emma.wilson@swiz.com',
          role: 'Frontend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
        },
        {
          id: 'contrib-james',
          name: 'James Brown',
          email: 'james.brown@swiz.com',
          role: 'Backend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
        },
        {
          id: 'contrib-sophia',
          name: 'Sophia Lee',
          email: 'sophia.lee@swiz.com',
          role: 'Backend Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia'
        },
        {
          id: 'contrib-nina',
          name: 'Nina Patel',
          email: 'nina.patel@swiz.com',
          role: 'QA Engineer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
        },
        {
          id: 'contrib-carlos',
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@swiz.com',
          role: 'QA Engineer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
        }
      ],
      collaborators: []
    },
    workflow: {
      stages: [stage1, stage2, stage3],
      assignments: [assignment1, assignment2, assignment3, assignment4, assignment5],
      tasks: tasks
    },
    indicators: [
      {
        id: 'ind-project-1',
        name: 'Overall Progress',
        type: 'percentage',
        target: 100,
        current: 0,
        unit: '%',
        level: 'project'
      },
      {
        id: 'ind-project-2',
        name: 'Budget Utilization',
        type: 'currency',
        target: 150000,
        current: 0,
        unit: 'USD',
        level: 'project'
      },
      {
        id: 'ind-project-3',
        name: 'Team Velocity',
        type: 'count',
        target: 50,
        current: 0,
        unit: 'story points',
        level: 'project'
      }
    ],
    status: 'draft',
    phase: 'drafting',
    progress: 0,
    health: 'on-track',
    priority: 'high',
    createdAt: now,
    updatedAt: now,
    createdBy: 'pm-john'
  };

  return project;
}

/**
 * Get step-by-step guide for testing the complete workflow
 */
export function getWorkflowGuide() {
  return {
    title: '🎯 Complete Workflow Guide',
    description: 'End-to-end testing dari pembuatan project hingga task completion',
    phases: [
      {
        phase: 'PHASE 1: DRAFTING',
        role: 'Project Manager',
        steps: [
          {
            step: 1,
            title: 'Login sebagai PM',
            action: 'Login dengan role = PM',
            detail: 'Email: john.smith@swiz.com'
          },
          {
            step: 2,
            title: 'Buka Projects Page',
            action: 'Navigate ke Projects dari sidebar',
            detail: 'Klik menu Projects'
          },
          {
            step: 3,
            title: 'Add Complete Demo Project',
            action: 'Klik "Add Complete Workflow Demo" button',
            detail: 'Project akan muncul dengan status "Draft"'
          },
          {
            step: 4,
            title: 'Review Project Details',
            action: 'Klik project card untuk melihat detail',
            detail: 'Lihat stages, assignments, dan tasks yang sudah dikonfigurasi'
          },
          {
            step: 5,
            title: 'Submit for BOD Approval',
            action: 'Klik "Submit for Approval" button',
            detail: 'Status berubah menjadi "Under Review"'
          }
        ]
      },
      {
        phase: 'PHASE 2: GOVERNANCE',
        role: 'Board of Directors',
        steps: [
          {
            step: 1,
            title: 'Login sebagai BOD',
            action: 'Logout, login dengan role = BOD',
            detail: 'Email: robert.johnson@swiz.com'
          },
          {
            step: 2,
            title: 'Buka Governance Page',
            action: 'Navigate ke Governance dari sidebar',
            detail: 'Lihat pending reviews'
          },
          {
            step: 3,
            title: 'Review Project Proposal',
            action: 'Klik "Review" pada project',
            detail: 'Baca detail proposal, budget, timeline'
          },
          {
            step: 4,
            title: 'Vote Approve',
            action: 'Pilih "Approve" dan beri komentar',
            detail: 'Klik "Submit Vote" button'
          },
          {
            step: 5,
            title: 'Majority Approval',
            action: 'Ulangi dengan BOD lain sampai majority',
            detail: 'Status project berubah menjadi "Approved"'
          }
        ]
      },
      {
        phase: 'PHASE 3: SETUP',
        role: 'PM & Leaders',
        steps: [
          {
            step: 1,
            title: 'Login kembali sebagai PM',
            action: 'Login dengan role = PM',
            detail: 'Email: john.smith@swiz.com'
          },
          {
            step: 2,
            title: 'Open Project Setup',
            action: 'Di Projects page, klik "Setup" button',
            detail: 'Project status = "Approved, Awaiting Setup"'
          },
          {
            step: 3,
            title: 'Configure Resources',
            action: 'Alokasi budget, team members, tools',
            detail: 'Isi semua required fields'
          },
          {
            step: 4,
            title: 'Complete Setup',
            action: 'Klik "Complete Setup" button',
            detail: 'System auto-activate project'
          },
          {
            step: 5,
            title: 'Project Activated',
            action: 'Status berubah menjadi "Active"',
            detail: 'Contributors bisa mulai bekerja'
          }
        ]
      },
      {
        phase: 'PHASE 4: EXECUTION',
        role: 'Contributors',
        steps: [
          {
            step: 1,
            title: 'Login sebagai Contributor',
            action: 'Login dengan role = Contributor',
            detail: 'Email: alex.rivera@swiz.com'
          },
          {
            step: 2,
            title: 'View My Tasks',
            action: 'Navigate ke Tasks atau Dashboard',
            detail: 'Lihat tasks yang assigned ke user'
          },
          {
            step: 3,
            title: 'Start Working on Task',
            action: 'Klik task "Create Wireframes"',
            detail: 'Update status menjadi "In Progress"'
          },
          {
            step: 4,
            title: 'Update Progress',
            action: 'Set progress slider ke 50%',
            detail: 'Tambahkan comments atau attach files'
          },
          {
            step: 5,
            title: 'Complete Task',
            action: 'Set progress 100%, status = "Completed"',
            detail: 'Task completion triggers assignment & stage progress update'
          },
          {
            step: 6,
            title: 'View Project Progress',
            action: 'Lihat project dashboard',
            detail: 'Overall project progress updated automatically'
          }
        ]
      }
    ],
    keyFeatures: [
      '✅ Multi-phase workflow (Drafting → Governance → Setup → Execution)',
      '✅ Role-based access control (PM, BOD, Leader, Contributor)',
      '✅ Voting system untuk BOD approval',
      '✅ Resource allocation dan setup management',
      '✅ Task assignment dengan dependency tracking',
      '✅ Real-time progress tracking',
      '✅ Automatic status updates',
      '✅ Gate controls untuk quality assurance'
    ]
  };
}
