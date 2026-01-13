import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { UserRole } from '../../types/user';

interface QuickStartGuideProps {
  role: UserRole;
}

interface QuickStep {
  title: string;
  description: string;
  action: string;
  path: string;
  completed?: boolean;
}

const ROLE_QUICK_STEPS: Record<UserRole, QuickStep[]> = {
  'Admin': [
    {
      title: 'Setup Resource Types',
      description: 'Define resource types and rates',
      action: 'Go to Resources',
      path: '/resources'
    },
    {
      title: 'Add Users',
      description: 'Invite team members and assign roles',
      action: 'Manage Users',
      path: '/admin/users'
    },
    {
      title: 'Configure System',
      description: 'Set up automation and settings',
      action: 'Open Settings',
      path: '/settings'
    }
  ],
  'BOD': [
    {
      title: 'Review Pending Approvals',
      description: 'Approve or reject project drafts',
      action: 'View Approvals',
      path: '/approvals'
    },
    {
      title: 'Conduct Gate Reviews',
      description: 'Review project milestones and decide next steps',
      action: 'Go to Approvals',
      path: '/approvals'
    },
    {
      title: 'Monitor Portfolio',
      description: 'Track all projects and indicators',
      action: 'View Projects',
      path: '/projects'
    }
  ],
  'PM': [
    {
      title: 'Create Your First Project',
      description: 'Start a new project draft',
      action: 'New Project',
      path: '/projects'
    },
    {
      title: 'Define Project Indicators',
      description: 'Create Project & Assignment indicators',
      action: 'Build Indicators',
      path: '/indicators'
    },
    {
      title: 'Submit for Approval',
      description: 'Send project to BOD for review',
      action: 'Go to Projects',
      path: '/projects'
    },
    {
      title: 'Create Assignments',
      description: 'Assign work to team leaders',
      action: 'View Projects',
      path: '/projects'
    }
  ],
  'Leader': [
    {
      title: 'View Your Assignments',
      description: 'Check tasks assigned to you',
      action: 'My Assignments',
      path: '/my-assignments'
    },
    {
      title: 'Create Operational Indicators',
      description: 'Set team performance metrics',
      action: 'Build Indicators',
      path: '/indicators'
    },
    {
      title: 'Manage Team Tasks',
      description: 'Distribute work to contributors',
      action: 'View Tasks',
      path: '/tasks'
    }
  ],
  'Contributor': [
    {
      title: 'View Your Assignments',
      description: 'Check tasks assigned to you',
      action: 'My Assignments',
      path: '/my-assignments'
    },
    {
      title: 'Update Task Progress',
      description: 'Mark tasks as complete',
      action: 'View Tasks',
      path: '/tasks'
    },
    {
      title: 'Update Settings',
      description: 'Customize your profile',
      action: 'Open Settings',
      path: '/settings'
    }
  ]
};

export function QuickStartGuide({ role }: QuickStartGuideProps) {
  const navigate = useNavigate();
  const steps = ROLE_QUICK_STEPS[role] || [];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Quick Start Guide
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Get started with {role} role
          </p>
        </div>
        <button
          onClick={() => navigate('/workflow-guide')}
          className="glass-card px-3 py-2 rounded-lg hover-glow flex items-center gap-2 text-sm text-slate-900 dark:text-white"
        >
          <BookOpen className="w-4 h-4" />
          View Guide
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => navigate(step.path)}
              className="w-full glass-card p-4 rounded-lg hover-glow text-left transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {index + 1}. {step.title}
                    </h4>
                    <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {step.description}
                  </p>
                  <span className="text-xs text-indigo-400 font-medium">
                    {step.action} →
                  </span>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium whitespace-nowrap">
            {steps.filter(s => s.completed).length}/{steps.length} Complete
          </span>
        </div>
      </div>
    </GlassCard>
  );
}