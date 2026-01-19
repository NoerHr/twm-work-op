import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  User,
  Users,
  Briefcase,
  Target,
  Boxes,
  ClipboardCheck,
  GitBranch,
  BarChart3,
  Settings,
  FileText,
  Clock
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import type { UserRole } from '../../types/user';

interface WorkflowGuideProps {
  currentRole: UserRole;
}

interface WorkflowStep {
  id: string;
  role: UserRole;
  title: string;
  description: string;
  icon: any;
  actions: string[];
  nextStep?: string;
  module: string;
}

const COMPLETE_WORKFLOW: WorkflowStep[] = [
  {
    id: 'setup',
    role: 'Admin',
    title: '1. System Setup (One-Time)',
    description: 'Configure resource types and system settings',
    icon: Settings,
    actions: [
      'Go to Resources module',
      'Click "Resource Types" tab',
      'Create resource types (e.g., Developer, Designer, PM)',
      'Define custom fields and operations for each type',
      'Set up automation workflows if needed'
    ],
    nextStep: 'project-draft',
    module: 'Resources'
  },
  {
    id: 'project-draft',
    role: 'PM',
    title: '2. Create Project Draft',
    description: 'PM creates new project with details',
    icon: FileText,
    actions: [
      'Go to Projects module',
      'Click "New Project" button',
      'Fill in project details (name, description, budget, timeline)',
      'Define project workflow stages',
      'Add team members',
      'Save as draft'
    ],
    nextStep: 'project-indicators',
    module: 'Projects'
  },
  {
    id: 'project-indicators',
    role: 'PM',
    title: '3. Define Project Indicators',
    description: 'PM creates project-level success metrics',
    icon: BarChart3,
    actions: [
      'Go to Indicators module',
      'Click "Builder" tab',
      'Create Project indicators (overall project KPIs)',
      'Create Assignment indicators (task-level metrics)',
      'Build calculation logic using Logic Studio',
      'Set target values and thresholds'
    ],
    nextStep: 'draft-approval',
    module: 'Indicators'
  },
  {
    id: 'draft-approval',
    role: 'PM',
    title: '4. Submit for Draft Approval',
    description: 'PM submits project to BOD for approval',
    icon: ClipboardCheck,
    actions: [
      'Go to Projects module',
      'Find your draft project',
      'Click "Submit for Approval"',
      'Add justification and business case',
      'BOD receives notification'
    ],
    nextStep: 'bod-review',
    module: 'Projects'
  },
  {
    id: 'bod-review',
    role: 'BOD',
    title: '5. BOD Reviews Draft',
    description: 'BOD approves or rejects project draft',
    icon: CheckCircle2,
    actions: [
      'Go to Approvals module',
      'Review pending draft approvals',
      'Click "Start Review" on project',
      'Review project details, budget, timeline, indicators',
      'Cast vote: Approve, Reject, or Request Changes',
      'PM receives decision notification'
    ],
    nextStep: 'project-execution',
    module: 'Approvals'
  },
  {
    id: 'project-execution',
    role: 'PM',
    title: '6. Execute Project',
    description: 'PM manages approved project execution',
    icon: Briefcase,
    actions: [
      'Go to Projects module',
      'Start working on approved project',
      'Monitor project indicators in Indicators module',
      'Update project status regularly',
      'Prepare for gate reviews at milestones'
    ],
    nextStep: 'create-assignments',
    module: 'Projects'
  },
  {
    id: 'create-assignments',
    role: 'PM',
    title: '7. Create Team Assignments',
    description: 'PM creates assignments for team leaders',
    icon: Users,
    actions: [
      'Go to Projects module',
      'Open your active project',
      'Navigate to Assignments section',
      'Click "New Assignment"',
      'Assign work to Leaders',
      'Set deadlines and deliverables',
      'Allocate resources from Resources module'
    ],
    nextStep: 'leader-work',
    module: 'Projects'
  },
  {
    id: 'leader-work',
    role: 'Leader',
    title: '8. View Assignments & Create Indicators',
    description: 'Leaders receive and plan their work',
    icon: Target,
    actions: [
      'Go to My Assignments module',
      'View assignments assigned to you',
      'Go to Indicators module',
      'Click "Builder" tab',
      'Create Operational indicators for your team',
      'Set daily/weekly performance targets',
      'Build logic to track team metrics'
    ],
    nextStep: 'leader-execution',
    module: 'My Assignments'
  },
  {
    id: 'leader-execution',
    role: 'Leader',
    title: '9. Manage Team Execution',
    description: 'Leaders manage contributors and tasks',
    icon: Users,
    actions: [
      'Go to Tasks module',
      'Break down assignments into tasks',
      'Distribute work to Contributors',
      'Monitor operational indicators',
      'Update assignment progress',
      'Report status to PM'
    ],
    nextStep: 'gate-review',
    module: 'Tasks'
  },
  {
    id: 'gate-review',
    role: 'PM',
    title: '10. Submit Gate Review',
    description: 'At key milestones, PM requests gate review',
    icon: GitBranch,
    actions: [
      'Go to Projects module',
      'Reach a project milestone/gate',
      'Click "Request Gate Review"',
      'Provide progress update and metrics',
      'Submit deliverables',
      'Wait for BOD decision'
    ],
    nextStep: 'bod-gate',
    module: 'Projects'
  },
  {
    id: 'bod-gate',
    role: 'BOD',
    title: '11. BOD Gate Decision',
    description: 'BOD decides project continuation',
    icon: GitBranch,
    actions: [
      'Go to Approvals module',
      'Review gate review request',
      'Evaluate progress vs plan',
      'Check project and assignment indicators',
      'Decision: Continue / Pivot / Stop / Hold',
      'Provide feedback and next steps'
    ],
    nextStep: 'monitoring',
    module: 'Approvals'
  },
  {
    id: 'monitoring',
    role: 'Admin',
    title: '12. Continuous Monitoring',
    description: 'All roles monitor their relevant indicators',
    icon: BarChart3,
    actions: [
      'Go to Indicators module',
      'Click "Monitoring" tab',
      'BOD: View all indicators across portfolio',
      'PM: View project and assignment indicators',
      'Leader: View operational indicators',
      'Track progress and take corrective actions'
    ],
    module: 'Indicators'
  }
];

export function WorkflowGuide({ currentRole }: WorkflowGuideProps) {
  // Filter steps relevant to current role
  const roleSteps = COMPLETE_WORKFLOW.filter(step => 
    step.role === currentRole || step.role === 'Admin'
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'BOD': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PM': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Leader': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Contributor': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Complete Workflow Guide
        </h1>
        <p className="text-slate-600 dark:text-white/60">
          End-to-end process from project creation to execution
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-3 flex-wrap">
        {(['BOD', 'PM', 'Leader'] as UserRole[]).map((role) => (
          <Badge
            key={role}
            variant="secondary"
            className={currentRole === role ? getRoleBadgeColor(role) : ''}
          >
            {role} ({COMPLETE_WORKFLOW.filter(s => s.role === role).length} steps)
          </Badge>
        ))}
      </div>

      {/* Complete Workflow Timeline */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Complete End-to-End Flow
        </h2>
        <div className="space-y-4">
          {COMPLETE_WORKFLOW.map((step, index) => {
            const Icon = step.icon;
            const isRelevantToRole = step.role === currentRole;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  className={`p-6 ${
                    isRelevantToRole 
                      ? 'ring-2 ring-indigo-500/30 bg-indigo-500/5' 
                      : 'opacity-70'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon & Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`p-3 rounded-full ${
                        isRelevantToRole
                          ? 'bg-indigo-500/20 border-2 border-indigo-500/50'
                          : 'bg-slate-500/10 border-2 border-slate-500/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isRelevantToRole ? 'text-indigo-400' : 'text-slate-400'
                        }`} />
                      </div>
                      {index < COMPLETE_WORKFLOW.length - 1 && (
                        <div className="w-0.5 h-full mt-2 bg-gradient-to-b from-slate-300 dark:from-slate-600 to-transparent" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className={getRoleBadgeColor(step.role)}
                          >
                            {step.role}
                          </Badge>
                          <Badge variant="secondary">
                            {step.module}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions Checklist */}
                      <div className="space-y-2 mt-4">
                        {step.actions.map((action, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Circle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Next Step Arrow */}
                      {step.nextStep && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-indigo-400">
                          <ArrowRight className="w-4 h-4" />
                          <span>Then: {COMPLETE_WORKFLOW.find(s => s.id === step.nextStep)?.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Your Role Summary */}
      <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Your Role: {currentRole}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You are responsible for {roleSteps.length} steps in the workflow:
        </p>
        <div className="space-y-2">
          {roleSteps.map((step) => (
            <div 
              key={step.id}
              className="flex items-center gap-3 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-slate-900 dark:text-white font-medium">
                {step.title}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                → {step.module}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            BOD Role
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Strategic planning, project approvals, gate reviews, portfolio oversight
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-400" />
            PM Role
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create projects, submit approvals, manage execution, create assignments
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Leader Role
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage teams, create operational indicators, execute assignments
          </p>
        </GlassCard>
      </div>
    </div>
  );
}