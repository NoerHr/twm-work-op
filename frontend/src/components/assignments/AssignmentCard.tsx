import { Calendar, DollarSign, Target, TrendingUp, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Assignment } from '../../types/assignment';

interface AssignmentCardProps {
  assignment: Assignment;
  onClick?: () => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const getStatusColor = (status: Assignment['status']) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      ACTIVE: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      IN_REVIEW: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      COMPLETED: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACTIVE': return <TrendingUp className="w-4 h-4" />;
      case 'IN_REVIEW': return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <GlassCard
        onClick={onClick}
        className="p-6 cursor-pointer hover:border-purple-500/50 transition-all h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`text-xs border-2 ${getStatusColor(assignment.status)}`}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(assignment.status)}
                  {assignment.status}
                </span>
              </Badge>
              
              {assignment.hasWorkflow && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Workflow Ready
                </Badge>
              )}
            </div>
            
            <h3 className="text-slate-900 dark:text-white mb-1">
              {assignment.title}
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-white/60 line-clamp-2">
              {assignment.description}
            </p>
          </div>
        </div>

        {/* Project & Stage Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-900 dark:text-white">{assignment.projectName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-white/60">{assignment.stageName}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {assignment.status === 'ACTIVE' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-white/60">Progress</span>
              <span className="text-slate-900 dark:text-white">{assignment.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
            {assignment.taskCount > 0 && (
              <div className="text-xs text-slate-500 dark:text-white/50 mt-1">
                {assignment.completedTaskCount} / {assignment.taskCount} tasks completed
              </div>
            )}
          </div>
        )}

        {/* Indicators Summary */}
        {assignment.assignmentIndicators.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-600 dark:text-white/60">Indicators</span>
            </div>
            <div className="space-y-1">
              {assignment.assignmentIndicators.slice(0, 2).map((indicator) => (
                <div key={indicator.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-white/60">{indicator.name}</span>
                  <span className="text-slate-900 dark:text-white">
                    {indicator.currentValue} / {indicator.targetValue} {indicator.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-white/40" />
            <div>
              <div className="text-slate-500 dark:text-white/50">Due Date</div>
              <div className={`${
                isOverdue ? 'text-red-500' : isUrgent ? 'text-yellow-500' : 'text-slate-900 dark:text-white'
              }`}>
                {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="w-4 h-4 text-slate-400 dark:text-white/40" />
            <div>
              <div className="text-slate-500 dark:text-white/50">Budget Cap</div>
              <div className="text-slate-900 dark:text-white">
                ${(assignment.budgetCap / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </div>

        {/* Time Warning */}
        {isOverdue && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600 dark:text-red-400">
              Overdue by {Math.abs(daysRemaining)} days
            </span>
          </div>
        )}
        {isUrgent && !isOverdue && (
          <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              {daysRemaining} days remaining
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {assignment.status === 'PENDING' ? 'Review Assignment' : 'Open Workflow'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </GlassCard>
    </motion.div>
  );
}
