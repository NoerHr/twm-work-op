import { Calendar, Users, Target, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';
import type { Assignment } from '../../../types/assignment';

interface OverviewTabProps {
  assignment: Assignment;
}

export function OverviewTab({ assignment }: OverviewTabProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const daysRemaining = Math.ceil(
    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60">Timeline</p>
              <p className="text-slate-900 dark:text-white">
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-white/60">
            <div className="flex justify-between">
              <span>Start:</span>
              <span>{formatDate(assignment.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>End:</span>
              <span>{formatDate(assignment.dueDate)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60">Progress</p>
              <p className="text-2xl text-slate-900 dark:text-white">{assignment.progress}%</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${assignment.progress}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60">Tasks</p>
              <p className="text-2xl text-slate-900 dark:text-white">
                {assignment.taskCount}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {assignment.completedTaskCount} completed of {assignment.taskCount} tasks
          </p>
        </GlassCard>
      </div>

      {/* Assignment Details */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="text-slate-900 dark:text-white">Assignment Details</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-white/60 mb-2">Description</p>
            <p className="text-slate-900 dark:text-white">{assignment.description}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white/60 mb-2">Project Stage</p>
            <Badge variant="outline" className="text-sm">
              {assignment.stageName}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white/60 mb-2">Budget Cap</p>
            <p className="text-lg text-slate-900 dark:text-white">
              ${assignment.budgetCap.toLocaleString()}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Team Information */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="text-slate-900 dark:text-white">Team Information</h3>
        </div>

        <div className="space-y-4">
          {/* Project Manager */}
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Project Manager</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                {assignment.pmName.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white">{assignment.pmName}</p>
                <Badge className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                  PM
                </Badge>
              </div>
            </div>
          </div>

          {/* Team Leader */}
          <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Team Leader</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                {assignment.leaderName.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white">{assignment.leaderName}</p>
                <Badge className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">
                  Leader
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Operational Indicators */}
      {assignment.assignmentIndicators && assignment.assignmentIndicators.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-slate-900 dark:text-white">Key Indicators</h3>
          </div>
          <div className="space-y-3">
            {assignment.assignmentIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {indicator.name}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {indicator.currentValue} / {indicator.targetValue} {indicator.unit}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                  {indicator.description}
                </p>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (indicator.currentValue / indicator.targetValue) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}