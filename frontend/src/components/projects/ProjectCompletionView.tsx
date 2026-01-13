import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Download,
  Archive,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project } from '../../types/project';

interface ProjectCompletionViewProps {
  project: Project;
  onBack: () => void;
  onComplete: () => void;
}

export function ProjectCompletionView({ project, onBack, onComplete }: ProjectCompletionViewProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checklist, setChecklist] = useState({
    releaseResources: false,
    archiveDocuments: false,
    notifyStakeholders: false,
    reviewDeliverables: false
  });
  const [confirmationText, setConfirmationText] = useState('');

  const allChecked = Object.values(checklist).every(v => v);
  const confirmationMatch = confirmationText.toLowerCase() === 'complete project';

  // Calculate final metrics
  const totalStages = project.workflow?.length || 0;
  const completedStages = project.workflow?.filter(s => s.status === 'completed').length || 0;
  const totalBudget = project.assignments?.reduce((sum, a) => sum + (a.budgetAllocation || 0), 0) || 0;
  const usedBudget = Math.round(totalBudget * 0.87); // Mock: 87% used
  
  const plannedDuration = Math.ceil(
    (new Date(project.details.expectedEndDate).getTime() - new Date(project.details.expectedStartDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const actualDuration = project.actualStartDate && project.actualEndDate
    ? Math.ceil((new Date(project.actualEndDate).getTime() - new Date(project.actualStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : plannedDuration;

  const handleComplete = () => {
    if (!allChecked) {
      toast.error('Complete all checklist items');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmComplete = () => {
    if (!confirmationMatch) {
      toast.error('Type "Complete Project" to confirm');
      return;
    }

    onComplete();
    toast.success('Project Completed!', {
      description: 'Project has been archived and final report generated',
      icon: <Sparkles className="w-5 h-5" />
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="md" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-slate-900 dark:text-white mb-2">
                Complete Project: {project.details.name}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Stages Complete
                </Badge>
                <span className="text-sm text-slate-600 dark:text-white/60">
                  Ready for closure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Success Banner */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <GlassCard className="p-8 text-center border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Sparkles className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-slate-900 dark:text-white mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-slate-600 dark:text-white/60 text-lg">
                All project stages have been successfully completed. Review the final metrics and close the project.
              </p>
            </GlassCard>
          </motion.div>

          {/* Final Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-white/60">Duration</span>
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl text-slate-900 dark:text-white mb-1">
                {actualDuration}
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                days (planned: {plannedDuration})
              </div>
              <div className="mt-2">
                <Badge variant={actualDuration <= plannedDuration ? 'default' : 'warning'}>
                  {actualDuration <= plannedDuration ? 'On Time' : 'Extended'}
                </Badge>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-white/60">Budget</span>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl text-slate-900 dark:text-white mb-1">
                ${(usedBudget / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                of ${(totalBudget / 1000).toFixed(0)}k ({Math.round((usedBudget / totalBudget) * 100)}%)
              </div>
              <div className="mt-2">
                <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Under Budget
                </Badge>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-white/60">Quality</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl text-slate-900 dark:text-white mb-1">
                92%
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                overall quality score
              </div>
              <div className="mt-2">
                <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Excellent
                </Badge>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-white/60">Team</span>
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl text-slate-900 dark:text-white mb-1">
                {project.assignments?.length || 0}
              </div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                assignments completed
              </div>
              <div className="mt-2">
                <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  {completedStages}/{totalStages} Stages
                </Badge>
              </div>
            </GlassCard>
          </div>

          {/* Final Deliverables */}
          <GlassCard className="p-6">
            <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Final Deliverables
            </h3>
            <div className="space-y-3">
              {project.workflow?.map((stage, index) => (
                <div key={stage.id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-slate-900 dark:text-white">{stage.name}</div>
                      <div className="text-sm text-slate-600 dark:text-white/60">
                        {stage.duration} days • Completed {stage.actualEndDate?.toLocaleDateString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Complete
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Closure Checklist */}
          <GlassCard className="p-6">
            <h3 className="text-slate-900 dark:text-white mb-4">Closure Checklist</h3>
            <div className="space-y-3">
              {[
                { 
                  key: 'releaseResources', 
                  label: 'Release Resources', 
                  description: 'All allocated resources have been released back to the pool'
                },
                { 
                  key: 'archiveDocuments', 
                  label: 'Archive Documents', 
                  description: 'Project documents have been archived in the knowledge base'
                },
                { 
                  key: 'notifyStakeholders', 
                  label: 'Notify Stakeholders', 
                  description: 'All stakeholders have been notified of project completion'
                },
                { 
                  key: 'reviewDeliverables', 
                  label: 'Review Deliverables', 
                  description: 'Final deliverables have been reviewed and approved'
                }
              ].map(({ key, label, description }) => (
                <label
                  key={key}
                  className="glass-card p-4 flex items-start gap-3 cursor-pointer hover-glow transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checklist[key as keyof typeof checklist]}
                    onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-white mb-1">{label}</div>
                    <div className="text-sm text-slate-600 dark:text-white/60">
                      {description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast.success('Report Generated', {
                  description: 'Project report has been downloaded',
                  icon: <Download className="w-5 h-5" />
                });
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Final Report
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!allChecked}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Archive className="w-5 h-5 mr-2" />
              Complete & Archive Project
            </Button>
          </div>

          {!allChecked && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
              Complete all checklist items to close the project
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <h3 className="text-slate-900 dark:text-white mb-4">
                Confirm Project Completion
              </h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                This action will mark the project as completed and archive it. 
                The project will become read-only and a final report will be generated.
              </p>
              
              <div className="glass-card p-4 mb-6 border-2 border-amber-500/30">
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                  Type <strong>"Complete Project"</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Complete Project"
                  className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationText('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmComplete}
                  disabled={!confirmationMatch}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Confirm Completion
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}