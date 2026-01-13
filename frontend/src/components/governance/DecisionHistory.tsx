import { useState } from 'react';
import { CheckCircle2, XCircle, X, Calendar, User, FileText, Filter } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { DecisionHistory as DecisionHistoryType } from '../../types/governance';

interface DecisionHistoryProps {
  history: DecisionHistoryType[];
}

export function DecisionHistory({ history }: DecisionHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'draft_approval' | 'gate_review'>('all');

  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-400" />
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Decisions' },
            { id: 'draft_approval', label: 'Draft Approvals' },
            { id: 'gate_review', label: 'Gate Reviews' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === filter.id
                  ? 'glass-card text-slate-900 dark:text-white border border-indigo-500/20'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredHistory.map((item, index) => (
          <GlassCard key={item.id} className="p-6 hover-glow">
            <div className="flex gap-6">
              {/* Timeline Indicator */}
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${
                  item.decision === 'approve' 
                    ? 'bg-green-500/10 border-2 border-green-500/30' 
                    : item.decision === 'reject'
                    ? 'bg-red-500/10 border-2 border-red-500/30'
                    : 'bg-slate-500/10 border-2 border-slate-500/30'
                }`}>
                  {item.decision === 'approve' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : item.decision === 'reject' ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <X className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                {index < filteredHistory.length - 1 && (
                  <div className="w-0.5 h-full mt-2 bg-gradient-to-b from-slate-200 dark:from-slate-700 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {item.projectName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'draft_approval' ? 'primary' : 'secondary'}>
                        {item.type === 'draft_approval' ? 'Draft Approval' : 'Gate Review'}
                      </Badge>
                      <Badge 
                        variant={item.decision === 'approve' ? 'primary' : 'secondary'}
                        className={
                          item.decision === 'approve' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : item.decision === 'reject'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }
                      >
                        {item.decision === 'approve' ? 'Approved' : 
                         item.decision === 'reject' ? 'Rejected' : 'Dismissed'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>Decided by: <strong className="text-slate-900 dark:text-white">{item.decidedBy}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {typeof item.decidedAt === 'string' 
                        ? `${new Date(item.decidedAt).toLocaleDateString()} at ${new Date(item.decidedAt).toLocaleTimeString()}`
                        : `${item.decidedAt.toLocaleDateString()} at ${item.decidedAt.toLocaleTimeString()}`
                      }
                    </span>
                  </div>
                </div>

                {item.comments && (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Decision Notes
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.comments}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
            No decision history
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Decisions will appear here once they are made
          </p>
        </div>
      )}
    </div>
  );
}