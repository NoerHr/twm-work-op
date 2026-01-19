import { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useGovernanceStore } from '../../store/governanceStore';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  DollarSign,
  Target,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import type { Project, GateDecision } from '../../types/project';

interface GovernanceReviewViewProps {
  project: Project;
  onBack: () => void;
  pmView?: boolean; // If true, PM sees read-only version
}

export function GovernanceReviewView({ project, onBack, pmView = false }: GovernanceReviewViewProps) {
  const user = useAuthStore((state) => state.user);
  const approveProject = useProjectStore((state) => state.approveProject);
  const rejectProject = useProjectStore((state) => state.rejectProject);
  
  // ✅ FIX 1: Cache selector result with useMemo to prevent infinite loop
  const allReviews = useGovernanceStore((state) => state.reviews || []);
  const projectReviews = useMemo(
    () => allReviews.filter(r => r.projectId === project.id),
    [allReviews, project.id]
  );
  
  const [checklist, setChecklist] = useState({
    budgetAlignment: false,
    strategicFit: false,
    resourceAvailability: false,
    riskAssessment: false
  });
  const [comments, setComments] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'approve' | 'reject' | null>(null);

  const isBOD = user?.role === 'BOD' || user?.role === 'Admin';
  const canDecide = isBOD && !pmView;
  
  // Get current review if exists
  const currentReview = projectReviews[0];
  
  // Calculate review deadline
  const submittedDate = project.details.expectedStartDate; // Use as proxy for submission date
  const reviewDeadline = new Date(submittedDate);
  reviewDeadline.setDate(reviewDeadline.getDate() + 5); // 5 day review period
  
  const daysRemaining = Math.max(0, Math.ceil((reviewDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const allChecked = Object.values(checklist).every(v => v);

  const handleDecision = (decision: 'approve' | 'reject') => {
    if (decision === 'reject' && !comments.trim()) {
      toast.error('Comments required for rejection');
      return;
    }
    setPendingDecision(decision);
    setShowDecisionModal(true);
  };

  const confirmDecision = () => {
    if (!pendingDecision) return;

    if (pendingDecision === 'approve') {
      approveProject(project.id);
      toast.success('Project Approved!', {
        description: 'Project is now Active and ready for execution.',
        icon: <CheckCircle2 className="w-5 h-5" />
      });
    } else {
      rejectProject(project.id, comments);
      toast.error('Project Rejected', {
        description: 'PM has been notified and can revise the project.',
        icon: <XCircle className="w-5 h-5" />
      });
    }

    setShowDecisionModal(false);
    onBack();
  };

  return (
    <div className="h-full flex">
      {/* Main Content - Project Details (Read-Only) */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="md" onClick={onBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-slate-900 dark:text-white mb-2">
                  {project.details.name}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Lock className="w-3 h-3 mr-1" />
                    Under Review
                  </Badge>
                  <span className="text-sm text-slate-600 dark:text-white/60">
                    Submitted by {project.ownerName}
                  </span>
                </div>
              </div>
            </div>
            {pmView && (
              <div className="flex items-center gap-2 text-blue-500">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Review in Progress</span>
              </div>
            )}
          </div>

          {/* Status Banner for PM */}
          {pmView && (
            <GlassCard className="p-4 border-2 border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-white mb-1">
                    Governance Review in Progress
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    Your project is being reviewed by the Board of Directors. 
                    You'll be notified once a decision is made.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Project Overview */}
          <GlassCard className="p-6">
            <h2 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Priority</div>
                <Badge variant={
                  project.details.priority === 'critical' ? 'destructive' :
                  project.details.priority === 'high' ? 'warning' :
                  project.details.priority === 'medium' ? 'default' : 'secondary'
                }>
                  {project.details.priority}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Duration</div>
                <div className="text-slate-900 dark:text-white">
                  {Math.ceil((new Date(project.details.expectedEndDate).getTime() - new Date(project.details.expectedStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Stages</div>
                <div className="text-slate-900 dark:text-white">
                  {project.workflow?.length || 0} stages
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Assignments</div>
                <div className="text-slate-900 dark:text-white">
                  {project.assignments?.length || 0} assignments
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-white/60 mb-2">Description</div>
              <p className="text-slate-900 dark:text-white leading-relaxed">
                {project.details.description}
              </p>
            </div>
          </GlassCard>

          {/* Timeline */}
          <GlassCard className="p-6">
            <h2 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Start Date</div>
                <div className="text-slate-900 dark:text-white">
                  {/* ✅ FIX 2: Convert to Date if string */}
                  {new Date(project.details.expectedStartDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              <div className="flex-1 mx-8">
                <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full" />
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-1">End Date</div>
                <div className="text-slate-900 dark:text-white">
                  {/* ✅ FIX 2: Convert to Date if string */}
                  {new Date(project.details.expectedEndDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Workflow Stages */}
          {project.workflow && project.workflow.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Stages
              </h2>
              <div className="space-y-3">
                {project.workflow.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white">{stage.name}</div>
                        <div className="text-sm text-slate-600 dark:text-white/60">
                          {stage.duration} days
                        </div>
                      </div>
                    </div>
                    {stage.gate && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Quality Gate
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Assignments */}
          {project.assignments && project.assignments.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Assignments
              </h2>
              <div className="space-y-3">
                {project.assignments.map((assignment) => (
                  <div key={assignment.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 dark:text-white">{assignment.name}</div>
                      <div className="text-sm text-slate-600 dark:text-white/60">
                        Leader: {assignment.leaderName}
                      </div>
                    </div>
                    {assignment.budgetAllocation && (
                      <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-white/60">Budget</div>
                        <div className="text-slate-900 dark:text-white">
                          ${assignment.budgetAllocation.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Right Sidebar - Governance Review Panel */}
      {canDecide && (
        <div className="w-96 border-l border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Timer */}
            <GlassCard className="p-4 border-2 border-amber-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-slate-900 dark:text-white">Review Deadline</span>
              </div>
              <div className="text-2xl text-amber-500 mb-1">
                {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                Due: {reviewDeadline.toLocaleDateString()}
              </div>
            </GlassCard>

            {/* Review Checklist */}
            <div>
              <h3 className="text-slate-900 dark:text-white mb-3">Review Criteria</h3>
              <div className="space-y-3">
                {[
                  { key: 'budgetAlignment', label: 'Budget Alignment', icon: DollarSign },
                  { key: 'strategicFit', label: 'Strategic Fit', icon: Target },
                  { key: 'resourceAvailability', label: 'Resource Availability', icon: Users },
                  { key: 'riskAssessment', label: 'Risk Assessment', icon: AlertCircle }
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
            <div>
              <label className="text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your review comments..."
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
            </div>

            {/* Decision Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleDecision('approve')}
                disabled={!allChecked}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve Project
              </Button>
              <Button
                onClick={() => handleDecision('reject')}
                variant="outline"
                className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Project
              </Button>
            </div>

            {!allChecked && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                Complete all checklist items to approve
              </p>
            )}
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md mx-4"
          >
            <GlassCard className="p-6">
              <h3 className="text-slate-900 dark:text-white mb-4">
                Confirm {pendingDecision === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                {pendingDecision === 'approve' 
                  ? 'Are you sure you want to approve this project? It will become Active immediately.'
                  : 'Are you sure you want to reject this project? The PM will be notified and can revise.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDecisionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDecision}
                  className={pendingDecision === 'approve' 
                    ? 'flex-1 bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'flex-1 bg-gradient-to-r from-red-500 to-red-600'}
                >
                  Confirm
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}