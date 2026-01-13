import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  Kanban,
  DollarSign,
  Settings,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Target
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { Project } from '../../types/project';

interface ActiveProjectDashboardProps {
  project: Project;
  onBack: () => void;
  readOnly?: boolean;
}

type DashboardTab = 'overview' | 'timeline' | 'kanban' | 'financials' | 'settings';

export function ActiveProjectDashboard({ project, onBack, readOnly = false }: ActiveProjectDashboardProps) {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const isOwner = project.ownerId === user?.id;
  const canEdit = (isOwner || user?.role === 'Admin') && !readOnly;

  const tabs = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'timeline' as DashboardTab, label: 'Timeline', icon: Calendar },
    { id: 'kanban' as DashboardTab, label: 'Tasks', icon: Kanban },
    { id: 'financials' as DashboardTab, label: 'Financials', icon: DollarSign },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings, visible: canEdit },
  ].filter(tab => tab.visible !== false);

  // Calculate project health metrics
  const totalStages = project.workflow?.length || 0;
  const completedStages = project.workflow?.filter(s => s.status === 'completed').length || 0;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const currentStage = project.workflow?.find(s => s.status === 'active');
  const totalBudget = project.assignments?.reduce((sum, a) => sum + (a.budgetAllocation || 0), 0) || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
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
                <Badge 
                  variant="outline" 
                  className={`${
                    project.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    project.status === 'gate-review-pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    project.status === 'change-pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}
                >
                  {project.status === 'active' ? '🟢 Active' :
                   project.status === 'gate-review-pending' ? '⚠️ Gate Review' :
                   project.status === 'change-pending' ? '🔄 Change Pending' :
                   project.status}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-white/60">
                  {progress}% Complete
                </span>
                {currentStage && (
                  <span className="text-sm text-slate-600 dark:text-white/60">
                    Current: {currentStage.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-white/60">Health</div>
              <div className="text-xl text-green-500">85%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-white/60">Budget</div>
              <div className="text-xl text-slate-900 dark:text-white">
                ${totalBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'glass-card text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-600 dark:text-white/60">Progress</div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl text-slate-900 dark:text-white mb-1">{progress}%</div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-600 dark:text-white/60">Health Score</div>
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl text-green-500 mb-1">85%</div>
                <div className="text-sm text-slate-600 dark:text-white/60">All indicators green</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-600 dark:text-white/60">Team</div>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl text-slate-900 dark:text-white mb-1">
                  {project.assignments?.length || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-white/60">Active assignments</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-600 dark:text-white/60">Timeline</div>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl text-slate-900 dark:text-white mb-1">
                  {Math.ceil((new Date(project.details.expectedEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-slate-600 dark:text-white/60">Days remaining</div>
              </GlassCard>
            </div>

            {/* Project Timeline */}
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">Project Timeline</h2>
              {project.workflow && project.workflow.length > 0 ? (
                <div className="space-y-4">
                  {project.workflow.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stage.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        stage.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60'
                      }`}>
                        {stage.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-slate-900 dark:text-white">{stage.name}</div>
                          <Badge variant={
                            stage.status === 'completed' ? 'default' :
                            stage.status === 'active' ? 'warning' :
                            'secondary'
                          }>
                            {stage.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-white/60">
                          <span>{stage.duration} days</span>
                          {stage.progress !== undefined && (
                            <span>{stage.progress}% complete</span>
                          )}
                          {stage.gate && (
                            <Badge variant="outline" className="text-xs">Quality Gate</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 dark:text-white/60 py-8">
                  No workflow stages defined
                </p>
              )}
            </GlassCard>

            {/* Active Assignments */}
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">Team Assignments</h2>
              {project.assignments && project.assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.assignments.map((assignment) => (
                    <div key={assignment.id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-slate-900 dark:text-white mb-1">{assignment.name}</div>
                          <div className="text-sm text-slate-600 dark:text-white/60">
                            {assignment.leaderName}
                          </div>
                        </div>
                        <Badge variant={
                          assignment.status === 'completed' ? 'default' :
                          assignment.status === 'active' ? 'warning' :
                          'secondary'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                      {assignment.budgetAllocation && (
                        <div className="text-sm text-slate-600 dark:text-white/60">
                          Budget: ${assignment.budgetAllocation.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 dark:text-white/60 py-8">
                  No assignments created yet
                </p>
              )}
            </GlassCard>

            {/* Risks & Alerts */}
            <GlassCard className="p-6 border-2 border-amber-500/30">
              <h2 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Risks & Alerts
              </h2>
              <div className="space-y-3">
                <div className="glass-card p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-slate-900 dark:text-white mb-1">Schedule Risk: Moderate</div>
                    <div className="text-sm text-slate-600 dark:text-white/60">
                      Stage 2 is at risk of delay. Consider resource reallocation.
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
              <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white mb-2">Interactive Kanban Calendar</h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Drag-and-drop timeline with 3D cube stages. Extend deadlines by dragging right edge.
              </p>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                Interactive Timeline Component
              </Badge>
            </GlassCard>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
              <Kanban className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white mb-2">Task Management Board</h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Kanban board showing all tasks from assignments. Drag tasks between columns.
              </p>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Embedded Task Module
              </Badge>
            </GlassCard>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">Budget Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Total Budget</div>
                  <div className="text-2xl text-slate-900 dark:text-white">
                    ${totalBudget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Spent</div>
                  <div className="text-2xl text-blue-500">
                    ${Math.round(totalBudget * 0.42).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-white/60 mb-1">Remaining</div>
                  <div className="text-2xl text-green-500">
                    ${Math.round(totalBudget * 0.58).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-white/60">Budget Chart</p>
                </div>
              </div>
            </GlassCard>

            {/* Budget by Assignment */}
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">Budget by Assignment</h2>
              <div className="space-y-3">
                {project.assignments?.map((assignment) => (
                  <div key={assignment.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 dark:text-white mb-1">{assignment.name}</div>
                      <div className="text-sm text-slate-600 dark:text-white/60">
                        {assignment.leaderName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-900 dark:text-white">
                        ${(assignment.budgetAllocation || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-white/60">
                        42% spent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'settings' && canEdit && (
          <div className="max-w-4xl mx-auto space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">Project Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/60 mb-2 block">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.details.name}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/60 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={project.details.description}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white resize-none"
                    rows={4}
                    readOnly
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-2 border-red-500/30">
              <h2 className="text-red-500 mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10">
                  Archive Project
                </Button>
                <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10">
                  Delete Project
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}