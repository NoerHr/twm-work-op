import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Flag, CheckCircle, FileText, Target, ListTodo, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAssignmentStore } from '../../store/assignmentStore';
import { OverviewTab } from './tabs/OverviewTab';
import { TaskTab } from './tabs/TaskTab';
import { OperationalTab } from './tabs/OperationalTab';

type TabKey = 'overview' | 'tasks' | 'operational';

interface AssignmentDetailProps {
  assignmentId?: string;
}

export function AssignmentDetail({ assignmentId }: AssignmentDetailProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  
  // In real app, fetch assignment by ID
  const assignment = useAssignmentStore((state) => state.getAssignmentById(assignmentId || 'assign-1'));

  const handleBack = () => {
    navigate('/my-assignments');
  };

  const tabs = [
    { key: 'overview' as TabKey, label: 'Overview', icon: Target },
    { key: 'tasks' as TabKey, label: 'Tasks', icon: ListTodo },
    { key: 'operational' as TabKey, label: 'Operational Indicators', icon: TrendingUp },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      COMPLETED: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
      IN_REVIEW: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      CANCELLED: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  // If assignment not found, show error
  if (!assignment) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Assignments
        </Button>
        <GlassCard className="p-12 text-center">
          <h2 className="text-2xl text-slate-900 dark:text-white mb-2">Assignment Not Found</h2>
          <p className="text-slate-600 dark:text-white/60 mb-6">
            The assignment you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>
            Return to My Assignments
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={handleBack}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Assignments
      </Button>

      {/* Assignment Header */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl text-slate-900 dark:text-white">
                {assignment.title}
              </h1>
              <Badge className={`border-2 ${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-white/60 mb-4">
              {assignment.description}
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-white/60">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Project: <strong className="text-slate-900 dark:text-white">{assignment.projectName}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Leader: <strong className="text-slate-900 dark:text-white">{assignment.leaderName}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due: <strong className="text-slate-900 dark:text-white">{new Date(assignment.dueDate).toLocaleDateString()}</strong>
              </span>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-200 dark:text-white/10"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - assignment.progress / 100)}`}
                  className="text-purple-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl text-slate-900 dark:text-white">
                  {assignment.progress}%
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-600 dark:text-white/60 mt-2">Progress</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-4 py-2 rounded-lg transition-all flex items-center gap-2
                    ${isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-purple-500 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab assignment={assignment} />}
        {activeTab === 'tasks' && <TaskTab assignment={assignment} />}
        {activeTab === 'operational' && <OperationalTab assignment={assignment} />}
      </motion.div>
    </div>
  );
}