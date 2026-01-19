import { AlertOctagon, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';

interface BlockedTask {
  id: string;
  name: string;
  assignee: {
    name: string;
    avatar: string;
  };
  reason: string;
  blockedSince: string;
  severity: 'low' | 'medium' | 'high';
  projectName: string;
}

const mockBlockedTasks: BlockedTask[] = [
  {
    id: '1',
    name: 'Customer Data Verification',
    assignee: {
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    reason: 'Missing API credentials',
    blockedSince: '2 hours ago',
    severity: 'high',
    projectName: 'Digital Transformation'
  },
  {
    id: '2',
    name: 'Invoice Approval Process',
    assignee: {
      name: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    },
    reason: 'Unclear instructions',
    blockedSince: '5 hours ago',
    severity: 'medium',
    projectName: 'Finance Automation'
  },
  {
    id: '3',
    name: 'Report Generation',
    assignee: {
      name: 'Emily Davis',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
    },
    reason: 'Data source unavailable',
    blockedSince: '1 day ago',
    severity: 'high',
    projectName: 'Analytics Platform'
  }
];

export function BlockedTasksWidget() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30';
      case 'medium':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'low':
        return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30';
      default:
        return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30';
    }
  };

  const highSeverityCount = mockBlockedTasks.filter(t => t.severity === 'high').length;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
          <AlertOctagon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-slate-900 dark:text-white font-semibold">Blocked Tasks</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Requires immediate attention
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {mockBlockedTasks.length}
          </p>
          <p className="text-xs text-slate-600 dark:text-white/60">Active</p>
        </div>
      </div>

      {/* Blocked Tasks List */}
      {mockBlockedTasks.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {mockBlockedTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
                    {task.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {task.projectName}
                  </Badge>
                </div>
                <Badge className={getSeverityColor(task.severity)}>
                  {task.severity}
                </Badge>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-slate-600 dark:text-white/60">
                  {task.assignee.name}
                </span>
              </div>

              {/* Reason */}
              <div className="p-2 bg-white/50 dark:bg-white/5 rounded border border-red-200 dark:border-red-500/30 mb-3">
                <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
                  Issue:
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {task.reason}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-white/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Blocked {task.blockedSince}</span>
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Resolve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <AlertOctagon className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-slate-900 dark:text-white font-medium mb-1">No Blocked Tasks</p>
          <p className="text-xs text-slate-600 dark:text-white/60">
            All tasks are running smoothly
          </p>
        </div>
      )}

      {/* Footer Stats */}
      {mockBlockedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
                High Severity
              </p>
              <p className="text-red-600 dark:text-red-400 font-medium">
                {highSeverityCount} tasks
              </p>
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View All Blocked →
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}