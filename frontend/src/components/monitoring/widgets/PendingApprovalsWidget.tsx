import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGovernanceStore } from '../../../store/governanceStore';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Clock, CheckCircle, AlertCircle, ChevronRight, FileCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PendingApprovalsWidget() {
  const navigate = useNavigate();
  const getPendingReviews = useGovernanceStore((state) => state.getPendingReviews);
  const pendingReviews = getPendingReviews();

  // Sort by deadline (most urgent first)
  const sortedReviews = [...pendingReviews].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const urgentCount = sortedReviews.filter(review => {
    const hoursLeft = (new Date(review.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft < 24;
  }).length;

  const getUrgencyLevel = (deadline: Date): 'critical' | 'warning' | 'normal' => {
    const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 24) return 'critical';
    if (hoursLeft < 72) return 'warning';
    return 'normal';
  };

  const getUrgencyColor = (urgency: 'critical' | 'warning' | 'normal'): string => {
    switch (urgency) {
      case 'critical': return 'text-red-500 dark:text-red-400';
      case 'warning': return 'text-amber-500 dark:text-amber-400';
      case 'normal': return 'text-emerald-500 dark:text-emerald-400';
    }
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">Pending Approvals</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {pendingReviews.length} project{pendingReviews.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>

        {urgentCount > 0 && (
          <Badge variant="error" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {urgentCount} Urgent
          </Badge>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingReviews.length}
          </div>
          <div className="text-xs text-slate-600 dark:text-white/60 mt-1">Total</div>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {urgentCount}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">Urgent</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {pendingReviews.length - urgentCount}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Normal</div>
        </div>
      </div>

      {/* Pending Reviews List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
            <p className="text-slate-600 dark:text-white/60 text-sm">
              No pending approvals
            </p>
            <p className="text-slate-500 dark:text-white/40 text-xs mt-1">
              All projects have been reviewed
            </p>
          </div>
        ) : (
          sortedReviews.slice(0, 4).map((review, index) => {
            const urgency = getUrgencyLevel(review.deadline);
            const urgencyColor = getUrgencyColor(urgency);

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg p-4 transition-all cursor-pointer border border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {review.projectName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" size="sm">
                        {review.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-slate-500 dark:text-white/50">•</span>
                      <span className="text-slate-500 dark:text-white/50">
                        {review.submittedBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-xs ${urgencyColor}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(review.deadline), { addSuffix: true })}
                    </span>
                  </div>

                  {urgency === 'critical' && (
                    <Badge variant="error" size="sm">
                      Critical
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {sortedReviews.length > 4 && (
          <p className="text-xs text-center text-slate-500 dark:text-white/50 pt-2">
            +{sortedReviews.length - 4} more approval{sortedReviews.length - 4 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* View All Button */}
      {pendingReviews.length > 0 && (
        <Button
          variant="outline"
          onClick={() => navigate('/projects')}
          className="w-full flex items-center justify-center gap-2"
        >
          <span>View All Approvals</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </GlassCard>
  );
}