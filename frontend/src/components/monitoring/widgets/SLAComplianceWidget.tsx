import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/Badge';

interface SLAMetrics {
  onTime: number;
  atRisk: number;
  breached: number;
  avgCompletionTime: string;
  complianceRate: number;
}

const mockMetrics: SLAMetrics = {
  onTime: 35,
  atRisk: 7,
  breached: 3,
  avgCompletionTime: '2.5 hours',
  complianceRate: 78
};

export function SLAComplianceWidget() {
  const total = mockMetrics.onTime + mockMetrics.atRisk + mockMetrics.breached;

  const segments = [
    {
      label: 'On Time',
      value: mockMetrics.onTime,
      percentage: Math.round((mockMetrics.onTime / total) * 100),
      color: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'At Risk',
      value: mockMetrics.atRisk,
      percentage: Math.round((mockMetrics.atRisk / total) * 100),
      color: 'bg-yellow-500',
      icon: Clock,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Breached',
      value: mockMetrics.breached,
      percentage: Math.round((mockMetrics.breached / total) * 100),
      color: 'bg-red-500',
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ];

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-slate-900 dark:text-white font-semibold">SLA Compliance</h3>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Service level tracking
          </p>
        </div>
        <Badge variant={
          mockMetrics.complianceRate >= 90 ? 'success' :
          mockMetrics.complianceRate >= 75 ? 'warning' : 'error'
        }>
          {getComplianceStatus(mockMetrics.complianceRate)}
        </Badge>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          {/* Background Circle */}
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-slate-200 dark:text-white/10"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 440" }}
              animate={{ 
                strokeDasharray: `${(mockMetrics.complianceRate / 100) * 440} 440` 
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-3xl font-bold ${getComplianceColor(mockMetrics.complianceRate)}`}>
              {mockMetrics.complianceRate}%
            </p>
            <p className="text-xs text-slate-600 dark:text-white/60 mt-1">
              Compliance Rate
            </p>
          </div>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-3 mb-6 flex-1">
        {segments.map((segment, idx) => {
          const Icon = segment.icon;
          return (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <Icon className={`w-5 h-5 ${segment.iconColor} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-900 dark:text-white font-medium">
                    {segment.label}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-white/60">
                    {segment.value} ({segment.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`${segment.color} h-2 rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
              Avg. Completion Time
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              {mockMetrics.avgCompletionTime}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
              Total Tracked
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              {total} tasks
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}