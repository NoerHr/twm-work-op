import { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw, Target, Package, BarChart3, MessageSquare } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { ReviewRequest, Vote, GateReviewData, RoutingOption } from '../../types/governance';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface GateReviewInterfaceProps {
  review: ReviewRequest;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSubmitDecision: (vote: Vote, selectedRoute: RoutingOption) => void;
  onBack: () => void;
}

export function GateReviewInterface({ review, currentUser, onSubmitDecision, onBack }: GateReviewInterfaceProps) {
  const [selectedRoute, setSelectedRoute] = useState<RoutingOption | null>(null);
  const [rationale, setRationale] = useState('');
  const [checkedCriteria, setCheckedCriteria] = useState<string[]>([]);

  const gateData = review.gateData!;
  const hasUserVoted = review.votes.some(v => v.bodId === currentUser.id);

  const getTimeRemaining = (deadline: Date | string) => {
    const now = new Date();
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 0) return { text: 'Expired', urgent: true };
    if (hours < 4) return { text: `${hours}h ${minutes}m`, urgent: true };
    return { text: `${hours}h ${minutes}m`, urgent: false };
  };

  const timeInfo = getTimeRemaining(review.deadline);

  const getRouteIcon = (icon: string) => {
    const icons: Record<string, any> = {
      ArrowRight,
      RefreshCw,
      XCircle,
      CheckCircle2
    };
    return icons[icon] || Target;
  };

  const handleSubmit = () => {
    if (!selectedRoute) {
      toast.error('Please select a routing option');
      return;
    }

    if (!rationale.trim()) {
      toast.error('Please provide a rationale for your decision');
      return;
    }

    const vote: Vote = {
      bodId: currentUser.id,
      bodName: currentUser.name,
      bodAvatar: currentUser.avatar,
      decision: selectedRoute.severity === 'success' ? 'approve' : 'reject',
      comments: `Route: ${selectedRoute.label}\nRationale: ${rationale}`,
      timestamp: new Date()
    };

    onSubmitDecision(vote, selectedRoute);
    toast.success('Gate decision submitted successfully');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Stage Progress */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
              Gate Review: {gateData.stageName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {review.projectName}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stage Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: gateData.totalStages }).map((_, index) => {
              const stageNum = index + 1;
              const isCurrent = stageNum === gateData.stageNumber;
              const isPast = stageNum < gateData.stageNumber;
              
              return (
                <div key={stageNum} className="flex-1 relative">
                  <div className={`h-2 rounded-full transition-all ${
                    isPast ? 'bg-green-500' :
                    isCurrent ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                    'bg-slate-200 dark:bg-slate-700'
                  }`} />
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium ${
                    isCurrent ? 'text-indigo-400' :
                    isPast ? 'text-green-400' :
                    'text-slate-400'
                  }`}>
                    Stage {stageNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decision Timer */}
        <div className={`mt-6 p-3 rounded-lg border inline-flex items-center gap-2 ${
          timeInfo.urgent
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <Clock className={`w-4 h-4 ${
            timeInfo.urgent ? 'text-red-400' : 'text-blue-400'
          }`} />
          <span className={`text-sm font-medium ${
            timeInfo.urgent
              ? 'text-red-400'
              : 'text-blue-900 dark:text-blue-200'
          }`}>
            Time Remaining: {timeInfo.text}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stage Summary */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Stage Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Deliverables
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {gateData.completedDeliverables}/{gateData.totalDeliverables}
              </div>
              <div className="text-sm text-green-400 mt-1">
                {gateData.completedDeliverables === gateData.totalDeliverables ? 'All Complete' : 'In Progress'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Quality Score
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {gateData.qualityScore}%
              </div>
              <div className={`text-sm mt-1 ${
                gateData.qualityScore >= 95 ? 'text-green-400' :
                gateData.qualityScore >= 85 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {gateData.qualityScore >= 95 ? 'Excellent' :
                 gateData.qualityScore >= 85 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Completion Date
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {new Date(gateData.completionDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Stage {gateData.stageNumber} of {gateData.totalStages}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Gate Criteria Table */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Gate Criteria Assessment
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Criterion
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Target
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Actual
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {gateData.criteria.map(criterion => (
                  <tr
                    key={criterion.id}
                    className="border-b border-slate-200 dark:border-white/10 last:border-0"
                  >
                    <td className="py-4 px-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedCriteria.includes(criterion.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCheckedCriteria([...checkedCriteria, criterion.id]);
                            } else {
                              setCheckedCriteria(checkedCriteria.filter(id => id !== criterion.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          disabled={hasUserVoted}
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {criterion.name}
                        </span>
                      </label>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600 dark:text-slate-400">
                      {criterion.target} {criterion.unit}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      {criterion.actual} {criterion.unit}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {criterion.status === 'pass' && (
                        <Badge variant="primary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Pass
                        </Badge>
                      )}
                      {criterion.status === 'warning' && (
                        <Badge variant="warning" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Warning
                        </Badge>
                      )}
                      {criterion.status === 'fail' && (
                        <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                          Fail
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* PM Commentary */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              PM Commentary
            </h3>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {gateData.pmCommentary}
            </p>
          </div>
        </GlassCard>

        {/* Routing Options */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Select Routing Decision
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gateData.routingOptions.map(option => {
              const Icon = getRouteIcon(option.icon);
              const isSelected = selectedRoute?.id === option.id;
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedRoute(option)}
                  disabled={hasUserVoted}
                  whileHover={{ scale: hasUserVoted ? 1 : 1.02 }}
                  whileTap={{ scale: hasUserVoted ? 1 : 0.98 }}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    isSelected
                      ? option.severity === 'success'
                        ? 'bg-green-500/20 border-green-500/50'
                        : option.severity === 'warning'
                        ? 'bg-yellow-500/20 border-yellow-500/50'
                        : 'bg-red-500/20 border-red-500/50'
                      : 'glass-card border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  } ${hasUserVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selectedRoute"
                      className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={`p-3 rounded-lg inline-flex mb-4 ${
                    option.severity === 'success' ? 'bg-green-500/10' :
                    option.severity === 'warning' ? 'bg-yellow-500/10' :
                    'bg-red-500/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      option.severity === 'success' ? 'text-green-400' :
                      option.severity === 'warning' ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                  </div>
                  
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {option.label}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {option.description}
                  </p>
                  <div className="text-xs text-slate-500">
                    Target: Stage {option.targetStage}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Rationale Input */}
        {!hasUserVoted && (
          <GlassCard className="p-6">
            <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
              Decision Rationale *
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain your routing decision and reasoning..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </GlassCard>
        )}
      </div>

      {/* Fixed Footer with Decision Button */}
      {!hasUserVoted && (
        <div className="glass-surface border-t border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {selectedRoute ? (
                <span>
                  Selected: <strong className="text-slate-900 dark:text-white">{selectedRoute.label}</strong>
                </span>
              ) : (
                <span>Please select a routing option</span>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedRoute || !rationale.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Gate Decision
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}