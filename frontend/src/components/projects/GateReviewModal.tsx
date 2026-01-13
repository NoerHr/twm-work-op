import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Stage, QualityGate, GateDecision } from '../../types/project';

interface GateReviewModalProps {
  stage: Stage;
  gate: QualityGate;
  onDecision: (decision: GateDecision, comments: string) => void;
  onClose: () => void;
}

export function GateReviewModal({ stage, gate, onDecision, onClose }: GateReviewModalProps) {
  const [decision, setDecision] = useState<GateDecision | null>(null);
  const [comments, setComments] = useState('');
  const [checklist, setChecklist] = useState({
    deliverables: false,
    quality: false,
    budget: false,
    timeline: false
  });

  const allChecked = Object.values(checklist).every(v => v);
  const canApprove = allChecked;

  // Mock data - would come from actual stage completion
  const stageMetrics = {
    tasksCompleted: 12,
    totalTasks: 12,
    budgetUsed: 45000,
    budgetAllocated: 50000,
    daysUsed: 14,
    daysPlanned: 14,
    qualityScore: 88
  };

  const handleConfirmDecision = () => {
    if (!decision) return;

    if (decision === 'reject' && !comments.trim()) {
      toast.error('Comments required for rejection or rework');
      return;
    }

    if (decision === 'approve' && !canApprove) {
      toast.error('Complete all checklist items to approve');
      return;
    }

    onDecision(decision, comments);
    toast.success(
      decision === 'approve' 
        ? 'Gate approved - Project advancing to next stage'
        : decision === 'reject'
        ? 'Stage rejected - PM will be notified'
        : 'Rework requested - Stage will be reopened',
      { icon: decision === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" /> }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">
                Gate Review: {gate.name}
              </h2>
              <p className="text-slate-600 dark:text-white/60">
                Stage: {stage.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Gate Description */}
          {gate.description && (
            <div className="glass-card p-4 mb-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-1">Gate Criteria</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {gate.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stage Completion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-white/60">Tasks</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl text-slate-900 dark:text-white mb-1">
                {stageMetrics.tasksCompleted}/{stageMetrics.totalTasks}
              </div>
              <div className="text-sm text-green-500">100% Complete</div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-white/60">Budget</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl text-slate-900 dark:text-white mb-1">
                ${(stageMetrics.budgetUsed / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-green-500">
                {Math.round((stageMetrics.budgetUsed / stageMetrics.budgetAllocated) * 100)}% of budget
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-white/60">Timeline</span>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl text-slate-900 dark:text-white mb-1">
                {stageMetrics.daysUsed} days
              </div>
              <div className="text-sm text-green-500">On schedule</div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-white/60">Quality</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl text-slate-900 dark:text-white mb-1">
                {stageMetrics.qualityScore}%
              </div>
              <div className="text-sm text-green-500">Above target</div>
            </GlassCard>
          </div>

          {/* Gate Conditions */}
          {gate.conditions && gate.conditions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-slate-900 dark:text-white mb-3">Gate Conditions</h3>
              <div className="space-y-2">
                {gate.conditions.map((condition, index) => {
                  // Mock: assume all conditions are met
                  const isMet = true;
                  return (
                    <div
                      key={index}
                      className={`glass-card p-4 flex items-center justify-between border-2 ${
                        isMet ? 'border-green-500/30' : 'border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isMet ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-slate-900 dark:text-white">
                          Indicator {condition.operator} {condition.value}
                        </span>
                      </div>
                      <Badge variant={isMet ? 'default' : 'destructive'}>
                        {isMet ? 'Met' : 'Not Met'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deliverables Section */}
          <div className="mb-6">
            <h3 className="text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stage Deliverables
            </h3>
            <div className="glass-card p-4 space-y-3">
              {[
                { name: 'Design Mockups', status: 'delivered', reviewer: 'Design Lead' },
                { name: 'Technical Specification', status: 'delivered', reviewer: 'Tech Lead' },
                { name: 'Test Results', status: 'delivered', reviewer: 'QA Lead' }
              ].map((deliverable, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-slate-900 dark:text-white">{deliverable.name}</div>
                      <div className="text-sm text-slate-600 dark:text-white/60">
                        Reviewed by {deliverable.reviewer}
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Approved
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Review Checklist */}
          <div className="mb-6">
            <h3 className="text-slate-900 dark:text-white mb-3">Review Checklist</h3>
            <div className="space-y-3">
              {[
                { key: 'deliverables', label: 'All deliverables submitted and approved', icon: FileText },
                { key: 'quality', label: 'Quality standards met', icon: TrendingUp },
                { key: 'budget', label: 'Budget within acceptable variance', icon: DollarSign },
                { key: 'timeline', label: 'Timeline compliance verified', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className="glass-card p-4 flex items-center gap-3 cursor-pointer hover-glow transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checklist[key as keyof typeof checklist]}
                    onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500"
                  />
                  <Icon className="w-5 h-5 text-slate-600 dark:text-white/60" />
                  <span className="text-slate-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="text-slate-900 dark:text-white mb-2 block">
              Review Comments
              {decision !== 'approve' && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your review comments and feedback..."
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
          </div>

          {/* Decision Buttons */}
          {!decision ? (
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setDecision('approve')}
                disabled={!canApprove}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setDecision('rework')}
                variant="outline"
                className="border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Request Rework
              </Button>
              <Button
                onClick={() => setDecision('reject')}
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`glass-card p-4 border-2 ${
                decision === 'approve' ? 'border-green-500/30' :
                decision === 'rework' ? 'border-amber-500/30' :
                'border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {decision === 'approve' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {decision === 'rework' && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                  {decision === 'reject' && <XCircle className="w-6 h-6 text-red-500" />}
                  <span className="text-slate-900 dark:text-white">
                    {decision === 'approve' && 'Approve and advance to next stage'}
                    {decision === 'rework' && 'Request rework - Stage will be reopened'}
                    {decision === 'reject' && 'Reject stage completion'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  {decision === 'approve' && 'Project will automatically move to the next stage.'}
                  {decision === 'rework' && 'PM and team will be notified to address issues.'}
                  {decision === 'reject' && 'PM will need to reassess this stage.'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDecision(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Change Decision
                </Button>
                <Button
                  onClick={handleConfirmDecision}
                  className={
                    decision === 'approve' 
                      ? 'flex-1 bg-gradient-to-r from-green-500 to-emerald-600'
                      : decision === 'rework'
                      ? 'flex-1 bg-gradient-to-r from-amber-500 to-orange-600'
                      : 'flex-1 bg-gradient-to-r from-red-500 to-red-600'
                  }
                >
                  Confirm Decision
                </Button>
              </div>
            </div>
          )}

          {!canApprove && !decision && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-4">
              Complete all checklist items to approve this gate
            </p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}