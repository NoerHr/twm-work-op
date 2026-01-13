import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  assignedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  contributorId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'normal' | 'low';
  
  // Scheduling
  scheduledDate: Date;
  dueDate: Date;
  completedAt?: Date;
  
  // Context & Metadata
  projectId: string;
  projectName: string;
  assignmentId: string;
  assignmentName: string;
  
  // Batch Info
  isBatch?: boolean;
  batchTotal?: number;
  batchProcessed?: number;
  
  // Runtime Data
  inputContext: Record<string, any>; // Data fetched from Data Nodes
  formData: Record<string, any>; // User input
  formSchema: TaskFormField[];
  
  // Issue Tracking
  blockedReason?: string;
  blockedAt?: Date;
  
  // Comments
  commentCount: number;
}

export interface TaskFormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'camera' | 'signature' | 'batch';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  // Batch specific
  batchConfig?: {
    columns: Array<{ key: string; label: string; type: string }>;
    items: any[];
    allowBulkActions: boolean;
  };
}

interface TaskStore {
  tasks: TaskExecution[];
  currentTask: TaskExecution | null;
  filter: {
    project?: string;
    priority?: string[];
    type?: string;
  };
  
  // Actions
  setTasks: (tasks: TaskExecution[]) => void;
  setCurrentTask: (task: TaskExecution | null) => void;
  updateTaskStatus: (taskId: string, status: TaskExecution['status']) => void;
  updateFormData: (taskId: string, formData: Record<string, any>) => void;
  submitTask: (taskId: string, formData: Record<string, any>) => void;
  reportIssue: (taskId: string, reason: string, description: string) => void;
  setFilter: (filter: Partial<TaskStore['filter']>) => void;
  
  // Getters
  getTasksByColumn: (column: 'coming_soon' | 'todo' | 'done') => TaskExecution[];
  getOverdueTasks: () => TaskExecution[];
}

// Mock data for demo
const MOCK_TASKS: TaskExecution[] = [
  {
    id: 'task-001',
    workflowId: 'wf-001',
    workflowName: 'Order Verification',
    assignedBy: {
      id: 'leader-001',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'high',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    projectId: 'proj-001',
    projectName: 'E-Commerce Platform',
    assignmentId: 'asg-001',
    assignmentName: 'Order Management',
    isBatch: true,
    batchTotal: 50,
    batchProcessed: 0,
    inputContext: {
      orderId: '#12345',
      customer: 'Acme Corp',
      totalAmount: '$1,250.00'
    },
    formData: {},
    formSchema: [
      {
        id: 'verification_status',
        type: 'select',
        label: 'Verification Status',
        required: true,
        options: [
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'pending_review', label: 'Pending Review' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notes',
        required: false,
        placeholder: 'Add verification notes...'
      }
    ],
    commentCount: 3
  },
  {
    id: 'task-002',
    workflowId: 'wf-002',
    workflowName: 'Design Review',
    assignedBy: {
      id: 'leader-002',
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'critical',
    scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday - OVERDUE
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    projectId: 'proj-002',
    projectName: 'Marketing Campaign',
    assignmentId: 'asg-002',
    assignmentName: 'Creative Design',
    inputContext: {
      designId: 'DSN-001',
      campaignName: 'Spring Sale 2024'
    },
    formData: {},
    formSchema: [
      {
        id: 'approval',
        type: 'select',
        label: 'Approval Status',
        required: true,
        options: [
          { value: 'approved', label: 'Approve' },
          { value: 'rejected', label: 'Reject' },
          { value: 'revisions', label: 'Request Revisions' }
        ]
      },
      {
        id: 'feedback',
        type: 'text',
        label: 'Feedback',
        required: true,
        placeholder: 'Provide detailed feedback...'
      },
      {
        id: 'evidence',
        type: 'camera',
        label: 'Screenshot/Photo',
        required: false
      }
    ],
    commentCount: 5
  },
  {
    id: 'task-003',
    workflowId: 'wf-003',
    workflowName: 'Quality Check',
    assignedBy: {
      id: 'leader-001',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'normal',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow - COMING SOON
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    projectId: 'proj-001',
    projectName: 'E-Commerce Platform',
    assignmentId: 'asg-003',
    assignmentName: 'Product Testing',
    inputContext: {
      productId: 'PRD-789',
      productName: 'Premium Widget'
    },
    formData: {},
    formSchema: [
      {
        id: 'quality_score',
        type: 'number',
        label: 'Quality Score (1-10)',
        required: true,
        validation: {
          min: 1,
          max: 10,
          message: 'Score must be between 1 and 10'
        }
      }
    ],
    commentCount: 0
  },
  {
    id: 'task-004',
    workflowId: 'wf-004',
    workflowName: 'Budget Approval',
    assignedBy: {
      id: 'leader-003',
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    contributorId: 'current-user',
    status: 'completed',
    priority: 'high',
    scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dueDate: new Date(),
    completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    projectId: 'proj-003',
    projectName: 'Infrastructure Upgrade',
    assignmentId: 'asg-004',
    assignmentName: 'Budget Planning',
    inputContext: {
      budgetId: 'BDG-2024-Q1',
      amount: '$50,000'
    },
    formData: {
      approval: 'approved',
      signature: 'data:image/png;base64,iVBORw0KG...'
    },
    formSchema: [
      {
        id: 'approval',
        type: 'select',
        label: 'Decision',
        required: true,
        options: [
          { value: 'approved', label: 'Approve' },
          { value: 'rejected', label: 'Reject' }
        ]
      },
      {
        id: 'signature',
        type: 'signature',
        label: 'Digital Signature',
        required: true
      }
    ],
    commentCount: 2
  }
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: MOCK_TASKS,
      currentTask: null,
      filter: {},
      
      setTasks: (tasks) => set({ tasks }),
      
      setCurrentTask: (task) => set({ currentTask: task }),
      
      updateTaskStatus: (taskId, status) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      })),
      
      updateFormData: (taskId, formData) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, formData: { ...task.formData, ...formData } } : task
        ),
        currentTask: state.currentTask?.id === taskId
          ? { ...state.currentTask, formData: { ...state.currentTask.formData, ...formData } }
          : state.currentTask
      })),
      
      submitTask: (taskId, formData) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'completed' as const,
                formData,
                completedAt: new Date()
              }
            : task
        ),
        currentTask: null
      })),
      
      reportIssue: (taskId, reason, description) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'blocked' as const,
                blockedReason: `${reason}: ${description}`,
                blockedAt: new Date()
              }
            : task
        )
      })),
      
      setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),
      
      getTasksByColumn: (column) => {
        const tasks = get().tasks;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        switch (column) {
          case 'coming_soon':
            return tasks.filter(task => {
              const scheduledDate = task.scheduledDate instanceof Date 
                ? task.scheduledDate 
                : new Date(task.scheduledDate);
              return task.status === 'pending' && scheduledDate >= tomorrow;
            });
          
          case 'todo':
            return tasks.filter(task => {
              const scheduledDate = task.scheduledDate instanceof Date 
                ? task.scheduledDate 
                : new Date(task.scheduledDate);
              return task.status === 'pending' && scheduledDate < tomorrow;
            }).sort((a, b) => {
              // Overdue first
              const aDueDate = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
              const bDueDate = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
              const aOverdue = aDueDate < now;
              const bOverdue = bDueDate < now;
              if (aOverdue && !bOverdue) return -1;
              if (!aOverdue && bOverdue) return 1;
              
              // Then by priority
              const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
          
          case 'done':
            const todayStart = today.getTime();
            const todayEnd = tomorrow.getTime();
            return tasks.filter(task => {
              if (task.status !== 'completed' || !task.completedAt) return false;
              
              // Handle both Date objects and string dates
              const completedAt = task.completedAt instanceof Date 
                ? task.completedAt 
                : new Date(task.completedAt);
              
              const completedTime = completedAt.getTime();
              return completedTime >= todayStart && completedTime < todayEnd;
            });
          
          default:
            return [];
        }
      },
      
      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(task =>
          task.status === 'pending' &&
          task.dueDate < now
        );
      }
    }),
    {
      name: 'task-storage',
      // Serialize/deserialize dates properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          
          // Convert date strings back to Date objects
          if (state.tasks) {
            state.tasks = state.tasks.map((task: any) => ({
              ...task,
              scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : new Date(),
              dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              blockedAt: task.blockedAt ? new Date(task.blockedAt) : undefined,
            }));
          }
          
          return { state };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);