import { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Target, Users, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import type { ReviewRequest } from '../../types/governance';
import { motion } from 'motion/react';

interface ReviewDashboardProps {
  reviews: ReviewRequest[];
  onStartReview: (reviewId: string) => void;
}

export function ReviewDashboard({ reviews, onStartReview }: ReviewDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'gate' | 'urgent'>('all');

  const getTimeRemaining = (deadline: Date | string) => {
    const now = new Date();
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 0) return { text: 'Expired', urgent: true };
    if (hours < 4) return { text: `${hours}h remaining`, urgent: true };
    if (hours < 24) return { text: `${hours}h remaining`, urgent: false };
    return { text: `${days}d remaining`, urgent: false };
  };

  const getConsensusStatus = (review: ReviewRequest) => {
    const approved = review.votes.filter(v => v.decision === 'approve').length;
    const rejected = review.votes.filter(v => v.decision === 'reject').length;
    const total = review.requiredVotes;
    
    if (rejected > 0) return { text: 'Blocked', color: 'red', progress: 0 };
    return { 
      text: `${approved}/${total} Approved`, 
      color: approved === total ? 'green' : 'yellow',
      progress: (approved / total) * 100
    };
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'draft') return review.type === 'draft_approval';
    if (filter === 'gate') return review.type === 'gate_review';
    if (filter === 'urgent') {
      const timeInfo = getTimeRemaining(review.deadline);
      return timeInfo.urgent;
    }
    return true;
  }).sort((a, b) => {
    const dateA = typeof a.deadline === 'string' ? new Date(a.deadline) : a.deadline;
    const dateB = typeof b.deadline === 'string' ? new Date(b.deadline) : b.deadline;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-3">
        {[
          { id: 'all', label: 'All Reviews', count: reviews.length },
          { id: 'draft', label: 'Draft Approvals', count: reviews.filter(r => r.type === 'draft_approval').length },
          { id: 'gate', label: 'Gate Reviews', count: reviews.filter(r => r.type === 'gate_review').length },
          { id: 'urgent', label: 'Urgent', count: reviews.filter(r => getTimeRemaining(r.deadline).urgent).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.id
                ? 'glass-card text-slate-900 dark:text-white border border-indigo-500/20'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bento Grid of Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReviews.map((review, index) => {
          const timeInfo = getTimeRemaining(review.deadline);
          const consensus = getConsensusStatus(review);
          
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard 
                hover 
                className={`p-6 relative overflow-hidden ${
                  timeInfo.urgent ? 'border-red-500/30' : ''
                }`}
              >
                {/* Urgency Indicator */}
                {timeInfo.urgent && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-2 line-clamp-2">
                      {review.projectName}
                    </h3>
                    <Badge variant={review.type === 'draft_approval' ? 'primary' : 'secondary'}>
                      {review.type === 'draft_approval' ? 'Draft Approval' : 'Gate Review'}
                    </Badge>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    review.type === 'draft_approval' 
                      ? 'bg-indigo-500/10' 
                      : 'bg-purple-500/10'
                  }`}>
                    <Target className={`w-5 h-5 ${
                      review.type === 'draft_approval'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      ${review.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {review.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      PM: {review.pmName}
                    </span>
                  </div>
                </div>

                {/* Urgency Warning */}
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
                  timeInfo.urgent 
                    ? 'bg-red-500/10 border border-red-500/20' 
                    : 'bg-slate-500/10 border border-slate-500/20'
                }`}>
                  {timeInfo.urgent ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    timeInfo.urgent 
                      ? 'text-red-400' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {timeInfo.text}
                  </span>
                </div>

                {/* Consensus Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Consensus
                    </span>
                    <span className={`text-xs font-medium ${
                      consensus.color === 'green' ? 'text-green-400' :
                      consensus.color === 'red' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {consensus.text}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        consensus.color === 'green' ? 'bg-green-500' :
                        consensus.color === 'red' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${consensus.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onStartReview(review.id)}
                  className="w-full glass-card hover-glow px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group text-slate-900 dark:text-white"
                >
                  <span>Start Review</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Vote Avatars */}
                {review.votes.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex -space-x-2">
                      {review.votes.map(vote => (
                        <div
                          key={vote.bodId}
                          className="relative"
                        >
                          <img
                            src={vote.bodAvatar}
                            alt={vote.bodName}
                            className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-slate-800"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 dark:border-slate-800 flex items-center justify-center ${
                            vote.decision === 'approve' ? 'bg-green-500' :
                            vote.decision === 'reject' ? 'bg-red-500' :
                            'bg-slate-500'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">
                      {review.votes.length} vote{review.votes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
            No pending reviews
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            All reviews in this category have been processed
          </p>
        </div>
      )}
    </div>
  );
}