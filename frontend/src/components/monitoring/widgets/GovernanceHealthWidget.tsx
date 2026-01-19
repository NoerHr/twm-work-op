import { Shield, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';
import { motion } from 'motion/react';
import { useGovernanceStore } from '../../../store/governanceStore';

export function GovernanceHealthWidget() {
  const getPendingReviews = useGovernanceStore((state) => state.getPendingReviews);
  const decisionHistory = useGovernanceStore((state) => state.decisionHistory);
  
  const pendingReviews = getPendingReviews();

  // Calculate metrics
  const totalDecisions = decisionHistory.length;
  const approvedCount = decisionHistory.filter(d => d.decision === 'approve').length;
  const rejectedCount = decisionHistory.filter(d => d.decision === 'reject').length;
  const approvalRate = totalDecisions > 0 ? Math.round((approvedCount / totalDecisions) * 100) : 0;
  
  // Average response time (mock - in real app would calculate from timestamps)
  const avgResponseTime = '18 hrs';
  
  // Overdues
  const overdueCount = pendingReviews.filter(review => 
    new Date(review.deadline).getTime() < Date.now()
  ).length;

  const getHealthScore = (): { score: number; status: 'excellent' | 'good' | 'warning' | 'critical' } => {
    const score = overdueCount === 0 ? 95 : overdueCount <= 2 ? 75 : 50;
    
    if (score >= 90) return { score, status: 'excellent' };
    if (score >= 70) return { score, status: 'good' };
    if (score >= 50) return { score, status: 'warning' };
    return { score, status: 'critical' };
  };

  const health = getHealthScore();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-emerald-500 to-green-500';
      case 'good': return 'from-blue-500 to-cyan-500';
      case 'warning': return 'from-amber-500 to-orange-500';
      case 'critical': return 'from-red-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const metrics = [
    {
      label: 'Approval Rate',
      value: `${approvalRate}%`,
      icon: TrendingUp,
      color: approvalRate >= 70 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: approvalRate >= 70 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
      label: 'Avg Response',
      value: avgResponseTime,
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      label: 'Overdue',
      value: overdueCount.toString(),
      icon: AlertTriangle,
      color: overdueCount === 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: overdueCount === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'
    },
    {
      label: 'Total Decisions',
      value: totalDecisions.toString(),
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10'
    }
  ];

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">Governance Health</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Overall governance performance
            </p>
          </div>
        </div>

        <Badge 
          variant={health.status === 'excellent' || health.status === 'good' ? 'success' : 'warning'}
          className="capitalize"
        >
          {health.status}
        </Badge>
      </div>

      {/* Health Score Gauge */}
      <div className="mb-6">
        <div className="relative">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                className="stroke-slate-200 dark:stroke-white/10"
                strokeWidth="8"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                className={`stroke-current bg-gradient-to-br ${getHealthColor(health.status)}`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - health.score / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - health.score / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  stroke: health.status === 'excellent' ? '#10b981' :
                          health.status === 'good' ? '#3b82f6' :
                          health.status === 'warning' ? '#f59e0b' : '#ef4444'
                }}
              />
            </svg>
            
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                className="text-3xl font-bold text-slate-900 dark:text-white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {health.score}
              </motion.div>
              <div className="text-xs text-slate-600 dark:text-white/60">Health Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bgColor} rounded-lg p-4 flex flex-col items-center justify-center text-center`}
          >
            <metric.icon className={`w-5 h-5 ${metric.color} mb-2`} />
            <div className={`text-xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-xs text-slate-600 dark:text-white/60 mt-1">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="text-emerald-500 dark:text-emerald-400 font-semibold">
              {approvedCount}
            </div>
            <div className="text-slate-600 dark:text-white/60 mt-0.5">Approved</div>
          </div>
          <div>
            <div className="text-red-500 dark:text-red-400 font-semibold">
              {rejectedCount}
            </div>
            <div className="text-slate-600 dark:text-white/60 mt-0.5">Rejected</div>
          </div>
          <div>
            <div className="text-amber-500 dark:text-amber-400 font-semibold">
              {pendingReviews.length}
            </div>
            <div className="text-slate-600 dark:text-white/60 mt-0.5">Pending</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
