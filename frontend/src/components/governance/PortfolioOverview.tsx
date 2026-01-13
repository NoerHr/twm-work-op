import { TrendingUp, TrendingDown, CheckCircle2, Clock, XCircle, Target, BarChart3, Users, DollarSign } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { ReviewRequest } from '../../types/governance';

interface PortfolioOverviewProps {
  reviews: ReviewRequest[];
}

export function PortfolioOverview({ reviews }: PortfolioOverviewProps) {
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const approvedReviews = reviews.filter(r => r.status === 'approved').length;
  const rejectedReviews = reviews.filter(r => r.status === 'rejected').length;

  const draftApprovals = reviews.filter(r => r.type === 'draft_approval').length;
  const gateReviews = reviews.filter(r => r.type === 'gate_review').length;

  const totalBudget = reviews.reduce((sum, r) => sum + (r.budget || 0), 0);
  const avgQualityScore = reviews
    .filter(r => r.gateData)
    .reduce((sum, r) => sum + (r.gateData?.qualityScore || 0), 0) / 
    (reviews.filter(r => r.gateData).length || 1);

  const stats = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: Target,
      color: 'indigo',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      label: 'Pending Decisions',
      value: pendingReviews,
      icon: Clock,
      color: 'orange',
      trend: '-5%',
      trendDirection: 'down'
    },
    {
      label: 'Approved',
      value: approvedReviews,
      icon: CheckCircle2,
      color: 'green',
      trend: '+18%',
      trendDirection: 'up'
    },
    {
      label: 'Rejected',
      value: rejectedReviews,
      icon: XCircle,
      color: 'red',
      trend: '-8%',
      trendDirection: 'down'
    }
  ];

  const secondaryStats = [
    {
      label: 'Draft Approvals',
      value: draftApprovals,
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Gate Reviews',
      value: gateReviews,
      icon: BarChart3,
      color: 'purple'
    },
    {
      label: 'Total Budget',
      value: `$${(totalBudget / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Avg Quality',
      value: `${avgQualityScore.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendDirection === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <GlassCard key={stat.label} className="p-6 hover-glow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  stat.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <GlassCard key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Review Status Distribution
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {pendingReviews} ({((pendingReviews / totalReviews) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${(pendingReviews / totalReviews) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Approved</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {approvedReviews} ({((approvedReviews / totalReviews) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${(approvedReviews / totalReviews) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Rejected</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {rejectedReviews} ({((rejectedReviews / totalReviews) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                style={{ width: `${(rejectedReviews / totalReviews) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Upcoming Deadlines */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {reviews
            .filter(r => r.status === 'pending')
            .sort((a, b) => {
              const dateA = typeof a.deadline === 'string' ? new Date(a.deadline) : a.deadline;
              const dateB = typeof b.deadline === 'string' ? new Date(b.deadline) : b.deadline;
              return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5)
            .map(review => {
              const deadline = typeof review.deadline === 'string' ? new Date(review.deadline) : review.deadline;
              const hoursRemaining = Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
              const isUrgent = hoursRemaining < 24;
              
              return (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {review.projectName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.type === 'draft_approval' ? 'Draft Approval' : 'Gate Review'}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    isUrgent ? 'text-red-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {hoursRemaining}h remaining
                  </div>
                </div>
              );
            })}
        </div>
      </GlassCard>
    </div>
  );
}