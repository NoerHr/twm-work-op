import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  blocked: number;
}

const mockStats: TaskStats = {
  total: 45,
  completed: 28,
  inProgress: 12,
  overdue: 3,
  blocked: 2
};

export function TaskProgressWidget() {
  const completionRate = Math.round((mockStats.completed / mockStats.total) * 100);
  const activeRate = Math.round((mockStats.inProgress / mockStats.total) * 100);
  const issueRate = Math.round(((mockStats.overdue + mockStats.blocked) / mockStats.total) * 100);

  const statCards = [
    {
      label: 'Total Tasks',
      value: mockStats.total,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border border-blue-200 dark:border-blue-500/30'
    },
    {
      label: 'Completed',
      value: mockStats.completed,
      percentage: completionRate,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      borderColor: 'border border-emerald-200 dark:border-emerald-500/30'
    },
    {
      label: 'In Progress',
      value: mockStats.inProgress,
      percentage: activeRate,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border border-amber-200 dark:border-amber-500/30'
    },
    {
      label: 'Issues',
      value: mockStats.overdue + mockStats.blocked,
      percentage: issueRate,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      borderColor: 'border border-red-200 dark:border-red-500/30'
    }
  ];

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-slate-900 dark:text-white font-semibold">Task Progress</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Overall execution metrics
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {completionRate}%
          </p>
          <p className="text-xs text-slate-600 dark:text-white/60">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-600 dark:text-white/60">Overall Progress</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {mockStats.completed} of {mockStats.total} tasks
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-emerald-500 to-green-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${activeRate}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${issueRate}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-red-500 to-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg ${stat.bgColor} ${stat.borderColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                {stat.percentage !== undefined && (
                  <span className={`text-xs font-medium ${stat.color}`}>
                    {stat.percentage}%
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-600 dark:text-white/60">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Breakdown Details */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-white/60">Overdue</span>
            <span className="text-red-600 dark:text-red-400 font-medium">
              {mockStats.overdue} tasks
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-white/60">Blocked</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {mockStats.blocked} tasks
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}