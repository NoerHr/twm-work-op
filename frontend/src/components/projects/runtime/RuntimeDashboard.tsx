import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Flag
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { GateReviewModal } from './GateReviewModal';
import { ChangeManagementModal } from './ChangeManagementModal';
import { ProjectCompletionModal } from './ProjectCompletionModal';
import { toast } from 'sonner@2.0.3';
import type { Project, Stage, Task } from '../../../types/project';

interface RuntimeDashboardProps {
  project: Project;
  onProjectUpdate: (updates: Partial<Project>) => void;
}

export function RuntimeDashboard({ project, onProjectUpdate }: RuntimeDashboardProps) {
  const [showGateReview, setShowGateReview] = useState(false);
  const [showChangeManagement, setShowChangeManagement] = useState(false);
  const [changeType, setChangeType] = useState<'stage' | 'assignment'>('stage');
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stages = project.workflow?.stages || [];
  const tasks = project.workflow?.tasks || [];
  const currentStage = stages.find(s => s.id === project.currentStageId) || stages[0];

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const totalBudget = project.details?.budget || 0;
  const usedBudget = Math.round(totalBudget * 0.75); // Mock
  const budgetRate = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  const stageProgress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  // Check if project is ready for completion
  const isReadyForCompletion = completionRate === 100 && stageProgress === 100;

  // Check if current stage needs gate review
  const needsGateReview = currentStage && 
    tasks.filter(t => t.assignmentId === currentStage.id && t.status === 'done').length ===
    tasks.filter(t => t.assignmentId === currentStage.id).length;

  const handleGateApprove = async (comments: string) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Gate Approved!', {
        description: 'Project proceeding to next stage'
      });
      
      setShowGateReview(false);
      
      // Update project to next stage
      const currentIndex = stages.findIndex(s => s.id === currentStage?.id);
      if (currentIndex < stages.length - 1) {
        onProjectUpdate({
          currentStageId: stages[currentIndex + 1].id
        });
      }
    } catch (error) {
      toast.error('Failed to approve gate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGateReject = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.warning('Gate Rejected', {
        description: 'Stage sent back for revision'
      });
      
      setShowGateReview(false);
    } catch (error) {
      toast.error('Failed to reject gate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRequest = async (changeRequest: any) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Change Request Submitted!', {
        description: 'BOD has been notified for review'
      });
      
      setShowChangeManagement(false);
    } catch (error) {
      toast.error('Failed to submit change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectCompletion = async (notes: string) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onProjectUpdate({
        status: 'completed',
        actualEndDate: new Date()
      });
      
      toast.success('Project Completed!', {
        description: 'Final report has been generated and archived'
      });
      
      setShowCompletion(false);
    } catch (error) {
      toast.error('Failed to complete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        {/* Overall Progress */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Overall Progress
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {completionRate.toFixed(0)}%
          </div>
          <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </GlassCard>

        {/* Stages */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Stages
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {completedStages}/{totalStages}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            {stageProgress.toFixed(0)}% complete
          </div>
        </GlassCard>

        {/* Budget */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Budget
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {budgetRate.toFixed(0)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            ${usedBudget.toLocaleString()} used
          </div>
        </GlassCard>

        {/* Timeline */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Timeline
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            On Track
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            23 days remaining
          </div>
        </GlassCard>
      </div>

      {/* Current Stage Status */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white mb-1">
              Current Stage: {currentStage?.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Track progress and manage changes
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setChangeType('stage');
                setShowChangeManagement(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setChangeType('assignment');
                setShowChangeManagement(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          </div>
        </div>

        {/* Gate Review Alert */}
        {needsGateReview && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Gate Review Required
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Stage "{currentStage?.name}" is complete and ready for BOD review
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowGateReview(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  Review Now
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Completion Alert */}
        {isReadyForCompletion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-4 bg-green-500/10 border-green-500/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-300 mb-1">
                      Project Ready for Completion
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      All stages and tasks are complete. You can now finalize the project.
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCompletion(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Project
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Stage Timeline Preview */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`p-3 rounded-lg transition-all ${
                stage.id === currentStage?.id
                  ? 'bg-purple-500/20 border-2 border-purple-500/50'
                  : stage.status === 'completed'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10'
              }`}
            >
              <div className="text-xs font-medium text-slate-900 dark:text-white mb-1">
                Stage {index + 1}
              </div>
              <div className="text-xs text-slate-600 dark:text-white/60 truncate">
                {stage.name}
              </div>
              {stage.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Modals */}
      {showGateReview && currentStage && (
        <GateReviewModal
          stage={currentStage}
          tasks={tasks.filter(t => t.assignmentId === currentStage.id)}
          completedTasks={tasks.filter(t => t.assignmentId === currentStage.id && t.status === 'done').length}
          totalTasks={tasks.filter(t => t.assignmentId === currentStage.id).length}
          budgetUsed={Math.round((totalBudget / totalStages) * 0.9)}
          budgetAllocated={Math.round(totalBudget / totalStages)}
          deliverables={['Design Mockups', 'Technical Specification', 'Test Plan']}
          onApprove={handleGateApprove}
          onReject={handleGateReject}
          onClose={() => setShowGateReview(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {showChangeManagement && (
        <ChangeManagementModal
          type={changeType}
          existingStages={stages}
          onSubmit={handleChangeRequest}
          onClose={() => setShowChangeManagement(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {showCompletion && (
        <ProjectCompletionModal
          project={project}
          onConfirm={handleProjectCompletion}
          onClose={() => setShowCompletion(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
