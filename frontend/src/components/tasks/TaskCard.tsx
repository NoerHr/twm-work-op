import { Lock, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { TaskExecution } from '../../store/taskStore';

interface TaskCardProps {
  task: TaskExecution;
  locked?: boolean;
  overdue?: boolean;
  completed?: boolean;
  onStart: (task: TaskExecution) => void;
}

export function TaskCard({ task, locked = false, overdue = false, completed = false, onStart }: TaskCardProps) {
  const getPriorityColor = (priority: TaskExecution['priority']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-amber-500',
      normal: 'bg-blue-500',
      low: 'bg-slate-400'
    };
    return colors[priority];
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = task.dueDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (diff < 0) {
      const overdueDays = Math.abs(days);
      return {
        text: `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`,
        color: 'text-red-600 dark:text-red-400',
        urgent: true
      };
    }
    
    if (hours < 4) {
      return {
        text: `Due in ${hours}h`,
        color: 'text-red-600 dark:text-red-400',
        urgent: true
      };
    }
    
    if (hours < 24) {
      return {
        text: `Due in ${hours}h`,
        color: 'text-amber-600 dark:text-amber-400',
        urgent: false
      };
    }
    
    return {
      text: `Due in ${days} day${days !== 1 ? 's' : ''}`,
      color: 'text-slate-600 dark:text-white/60',
      urgent: false
    };
  };

  const timeInfo = getTimeRemaining();

  return (
    <motion.div
      whileHover={!locked ? { scale: 1.02 } : {}}
      className={locked ? 'opacity-60' : ''}
    >
      <GlassCard
        className={`p-4 transition-all ${
          locked ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
        } ${
          overdue ? 'border-2 border-red-500 shadow-lg shadow-red-500/20' : ''
        } ${
          completed ? 'bg-green-50 dark:bg-green-500/10 border-green-500/30' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Priority Dot */}
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
            
            {/* Task Name */}
            <h4 className="text-sm text-slate-900 dark:text-white line-clamp-2 flex-1">
              {task.workflowName}
            </h4>
          </div>

          {/* Locked Icon */}
          {locked && (
            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}

          {/* Completed Icon */}
          {completed && (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Due Date */}
        <div className={`text-xs mb-3 font-medium ${timeInfo.color}`}>
          {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
          {timeInfo.text}
        </div>

        {/* Context Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {task.projectName}
          </Badge>
          <Badge variant="outline" className="text-xs text-slate-600 dark:text-white/60">
            {task.assignmentName}
          </Badge>
        </div>

        {/* Assigned By */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={task.assignedBy.avatar}
            alt={task.assignedBy.name}
            className="w-6 h-6 rounded-full"
            title={`Assigned by ${task.assignedBy.name}`}
          />
          <span className="text-xs text-slate-600 dark:text-white/60">
            {task.assignedBy.name}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {task.priority === 'critical' && (
            <Badge className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
              Critical
            </Badge>
          )}
          
          {task.priority === 'high' && (
            <Badge className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
              High Priority
            </Badge>
          )}

          {task.isBatch && (
            <Badge className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
              Batch: {task.batchTotal} items
            </Badge>
          )}

          {overdue && (
            <Badge className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Late
            </Badge>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
          {/* Start Button */}
          {!completed && (
            <Button
              onClick={() => onStart(task)}
              disabled={locked}
              className={`
                flex-1 mr-2
                ${locked
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  : overdue
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                }
              `}
            >
              {locked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </>
              ) : (
                'Start Task'
              )}
            </Button>
          )}

          {completed && (
            <div className="flex-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          )}

          {/* Comment Count */}
          {task.commentCount > 0 && (
            <button className="flex items-center gap-1 text-xs text-slate-600 dark:text-white/60 hover:text-blue-500">
              <MessageCircle className="w-4 h-4" />
              <span>{task.commentCount}</span>
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}