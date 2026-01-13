import { useNavigate } from 'react-router-dom';
import { useGovernanceStore } from '../../../store/governanceStore';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, FileCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react'; // Fixed: change from framer-motion to motion/react

export function RecentDecisionsWidget() {
  const navigate = useNavigate();
  const decisionHistory = useGovernanceStore((state) => state.decisionHistory);

  // Sort by most recent
  const recentDecisions = [...decisionHistory]
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
    .slice(0, 5);

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return CheckCircle;
      case 'reject': return XCircle;
      case 'rework': return AlertCircle;
      default: return FileCheck;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve': return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        badge: 'success' as const
      };
      case 'reject': return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-500/10',
        badge: 'error' as const
      };
      case 'rework': return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        badge: 'warning' as const
      };
      default: return {
        text: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-500/10',
        badge: 'outline' as const
      };
    }
  };

  // Calculate decision stats
  const approvedCount = decisionHistory.filter(d => d.decision === 'approve').length;
  const rejectedCount = decisionHistory.filter(d => d.decision === 'reject').length;
  const reworkCount = decisionHistory.filter(d => d.decision === 'rework').length;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">Recent Decisions</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Latest governance actions
            </p>
          </div>
        </div>

        <Badge variant="outline">
          {decisionHistory.length} Total
        </Badge>
      </div>

      {/* Decision Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Approved</div>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {rejectedCount}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">Rejected</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {reworkCount}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Rework</div>
        </div>
      </div>

      {/* Recent Decisions List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {recentDecisions.length === 0 ? (
          <div className="text-center py-8">
            <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-600 dark:text-white/60 text-sm">
              No decisions yet
            </p>
            <p className="text-slate-500 dark:text-white/40 text-xs mt-1">
              Decision history will appear here
            </p>
          </div>
        ) : (
          recentDecisions.map((decision, index) => {
            const DecisionIcon = getDecisionIcon(decision.decision);
            const colors = getDecisionColor(decision.decision);

            return (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg p-4 transition-all cursor-pointer border border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-start gap-3">
                  {/* Decision Icon */}
                  <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <DecisionIcon className={`w-4 h-4 ${colors.text}`} strokeWidth={2} />
                  </div>

                  {/* Decision Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                        {decision.projectName}
                      </h4>
                      <Badge variant={colors.badge} size="sm" className="flex-shrink-0">
                        {decision.decision}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60 mb-2">
                      <span>{decision.decidedBy}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(decision.decidedAt), { addSuffix: true })}</span>
                    </div>

                    {decision.comments && (
                      <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2 italic">
                        "{decision.comments}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Button */}
      {decisionHistory.length > 5 && (
        <Button
          variant="outline"
          onClick={() => navigate('/projects')}
          className="w-full flex items-center justify-center gap-2"
        >
          <span>View Decision History</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </GlassCard>
  );
}