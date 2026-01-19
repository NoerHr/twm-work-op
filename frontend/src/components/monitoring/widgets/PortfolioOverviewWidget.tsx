import { Briefcase, TrendingUp, AlertCircle, Clock, DollarSign, Users, Activity } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';
import { motion } from 'motion/react';
import { useProjectStore } from '../../../store/projectStore';

export function PortfolioOverviewWidget() {
  const projects = useProjectStore((state) => state.projects);

  // Calculate portfolio metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
    p.lifecycleState === 'execution' || p.lifecycleState === 'planning'
  ).length;
  const completedProjects = projects.filter(p => p.lifecycleState === 'completed').length;
  const onHoldProjects = projects.filter(p => p.lifecycleState === 'on-hold').length;
  
  // Mock budget data (in real app, would come from project budgets)
  const totalBudget = totalProjects * 125000; // Average $125k per project
  const spentBudget = Math.round(totalBudget * 0.68);
  const budgetUtilization = Math.round((spentBudget / totalBudget) * 100);

  // Project health distribution
  const healthyProjects = Math.round(activeProjects * 0.7);
  const atRiskProjects = Math.round(activeProjects * 0.2);
  const criticalProjects = activeProjects - healthyProjects - atRiskProjects;

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: Briefcase,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      trend: '+3',
      trendUp: true
    },
    {
      label: 'Active',
      value: activeProjects,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      trend: `${Math.round((activeProjects / totalProjects) * 100)}%`,
      trendUp: true
    },
    {
      label: 'Completed',
      value: completedProjects,
      icon: Clock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      trend: '+2',
      trendUp: true
    },
    {
      label: 'On Hold',
      value: onHoldProjects,
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      trend: '-1',
      trendUp: false
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">Portfolio Overview</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Enterprise project landscape
            </p>
          </div>
        </div>

        <Badge variant="outline" className="flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.trend}
              </div>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-600 dark:text-white/60">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget Overview */}
      <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Budget Utilization
          </span>
        </div>
        
        {/* Budget Progress Bar */}
        <div className="relative h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${budgetUtilization}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-white/60">
            {formatCurrency(spentBudget)} spent
          </span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {budgetUtilization}%
          </span>
          <span className="text-slate-600 dark:text-white/60">
            of {formatCurrency(totalBudget)}
          </span>
        </div>
      </div>

      {/* Health Distribution */}
      <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Project Health
          </span>
        </div>

        <div className="space-y-2">
          {/* Healthy */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-slate-600 dark:text-white/60">Healthy</span>
            </div>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {healthyProjects} ({Math.round((healthyProjects / activeProjects) * 100)}%)
            </span>
          </div>

          {/* At Risk */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-slate-600 dark:text-white/60">At Risk</span>
            </div>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {atRiskProjects} ({Math.round((atRiskProjects / activeProjects) * 100)}%)
            </span>
          </div>

          {/* Critical */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-slate-600 dark:text-white/60">Critical</span>
            </div>
            <span className="font-medium text-red-600 dark:text-red-400">
              {criticalProjects} ({Math.round((criticalProjects / activeProjects) * 100)}%)
            </span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="relative h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-3 flex">
          <div 
            className="bg-emerald-500" 
            style={{ width: `${(healthyProjects / activeProjects) * 100}%` }}
          />
          <div 
            className="bg-amber-500" 
            style={{ width: `${(atRiskProjects / activeProjects) * 100}%` }}
          />
          <div 
            className="bg-red-500" 
            style={{ width: `${(criticalProjects / activeProjects) * 100}%` }}
          />
        </div>
      </div>

      {/* Resource Allocation */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-slate-600 dark:text-white/60">Resources Allocated</span>
          </div>
          <span className="font-medium text-slate-900 dark:text-white">
            {activeProjects * 8} members
          </span>
        </div>
      </div>
    </GlassCard>
  );
}