import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Sparkles,
  TrendingUp,
  UserPlus,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Project, Assignment, WorkflowStage } from '../../types/project';

interface AssignmentManagementProps {
  project: Project;
  onUpdate?: (assignments: Assignment[]) => void;
}

type ViewMode = 'by-stage' | 'by-leader' | 'by-priority';
type SortMode = 'name' | 'date' | 'priority';

export function AssignmentManagement({ project, onUpdate }: AssignmentManagementProps) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    project.workflow[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('by-stage');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  // Get assignments for selected stage
  const selectedStage = project.workflow.find(s => s.id === selectedStageId);
  const stageAssignments = useMemo(() => {
    if (!selectedStageId) return [];
    return project.assignments.filter(a => a.workflowStageId === selectedStageId);
  }, [project.assignments, selectedStageId]);

  // Filter and sort
  const filteredAssignments = useMemo(() => {
    let filtered = stageAssignments;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.assignedLeaders.some(l => l.name.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortMode) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
          return new Date(a.expectedStartDate).getTime() - new Date(b.expectedStartDate).getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [stageAssignments, searchQuery, sortMode]);

  // Calculate stage statistics
  const stageStats = useMemo(() => {
    return project.workflow.map(stage => {
      const assignments = project.assignments.filter(a => a.workflowStageId === stage.id);
      const totalLeaders = new Set(assignments.flatMap(a => a.assignedLeaders.map(l => l.id))).size;
      
      return {
        stageId: stage.id,
        assignmentCount: assignments.length,
        leaderCount: totalLeaders,
        hasGate: stage.gateConfig !== undefined
      };
    });
  }, [project.workflow, project.assignments]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900/10">
      {/* Premium Header */}
      <div className="glass-surface border-b border-slate-200/50 dark:border-white/5 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-[30px] font-bold text-slate-900 dark:text-white leading-tight tracking-[-0.75px]">
                Assignment Management
              </h1>
            </div>
            <p className="text-[14px] font-medium text-[#45556c] dark:text-white/60 ml-[52px]">
              Configure assignments for each stage. One stage can have multiple assignments, and each assignment can have multiple leaders.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 backdrop-blur-xl">
            {(['by-stage', 'by-leader', 'by-priority'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${viewMode === mode
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-slate-600 dark:text-white/60 hover:bg-white/50 dark:hover:bg-white/10'
                  }
                `}
              >
                {mode === 'by-stage' && 'By Stage'}
                {mode === 'by-leader' && 'By Leader'}
                {mode === 'by-priority' && 'By Priority'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Stages', value: project.workflow.length, icon: Calendar, color: 'purple' },
            { label: 'Assignments', value: project.assignments.length, icon: Users, color: 'blue' },
            { label: 'Unique Leaders', value: new Set(project.assignments.flatMap(a => a.assignedLeaders.map(l => l.id))).size, icon: UserPlus, color: 'green' },
            { label: 'Avg. per Stage', value: (project.assignments.length / project.workflow.length || 0).toFixed(1), icon: TrendingUp, color: 'orange' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-xs text-slate-600 dark:text-white/60">{stat.label}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        {/* Left Panel - Stage List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[420px] flex flex-col gap-4"
        >
          <GlassCard className="p-5 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
            <h3 className="text-sm font-semibold text-[#45556c] dark:text-white/60 mb-4 tracking-wide uppercase">
              All Stages
            </h3>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {/* Stage List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {project.workflow.map((stage, idx) => {
                  const stats = stageStats.find(s => s.stageId === stage.id);
                  const isSelected = selectedStageId === stage.id;
                  const startDate = new Date(stage.startDate);
                  const endDate = new Date(stage.endDate);
                  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <motion.button
                      key={stage.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedStageId(stage.id)}
                      className={`
                        w-full p-5 rounded-2xl text-left transition-all group relative overflow-hidden
                        ${isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0px_10px_30px_-5px_rgba(99,102,241,0.4)]'
                          : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-[1.02]'
                        }
                      `}
                    >
                      {/* Animated Background Gradient for Selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-shimmer" />
                      )}

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'} opacity-50`} />
                          <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {stage.name}
                          </h4>
                          {stats?.hasGate && (
                            <div className={`ml-auto p-1 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-purple-500/10'}`}>
                              <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                            </div>
                          )}
                        </div>

                        <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-[#45556c] dark:text-white/60'}`}>
                          {duration} days • {startDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-white/80' : 'text-slate-600 dark:text-white/60'}`}>
                            <Users className="w-3.5 h-3.5" />
                            {stats?.assignmentCount || 0} assignments
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-white/80' : 'text-slate-600 dark:text-white/60'}`}>
                            <UserPlus className="w-3.5 h-3.5" />
                            {stats?.leaderCount || 0} leaders
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="selectedStage"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right Panel - Assignment Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col gap-4"
        >
          <GlassCard className="flex-1 p-6 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
            {/* Header - Enhanced with Glass Effect */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedStage?.name || 'Select a Stage'}
                  </h3>
                  {filteredAssignments.length > 0 && (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                      {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <button
                    onClick={() => {
                      const modes: SortMode[] = ['name', 'date', 'priority'];
                      const currentIdx = modes.indexOf(sortMode);
                      setSortMode(modes[(currentIdx + 1) % modes.length]);
                    }}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all group"
                    title="Sort by"
                  >
                    <ArrowUpDown className="w-4 h-4 text-slate-600 dark:text-white/60 group-hover:text-purple-600" />
                  </button>

                  {/* Add Assignment Button */}
                  <Button
                    onClick={() => setShowAddAssignment(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0px_10px_15px_-3px_rgba(99,102,241,0.3)] hover:shadow-[0px_10px_20px_-3px_rgba(99,102,241,0.4)]"
                  >
                    <Plus className="w-4 h-4" />
                    Add Assignment
                  </Button>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              <AnimatePresence mode="popLayout">
                {filteredAssignments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4">
                      <Users className="w-12 h-12 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Assignments Yet
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                      Get started by adding your first assignment to this stage
                    </p>
                    <Button
                      onClick={() => setShowAddAssignment(true)}
                      variant="outline"
                      className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Assignment
                    </Button>
                  </motion.div>
                ) : (
                  filteredAssignments.map((assignment, idx) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      index={idx}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// Assignment Card Component
function AssignmentCard({ assignment, index }: { assignment: Assignment; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityConfig = {
    critical: {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
      label: 'Critical'
    },
    high: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      label: 'High'
    },
    medium: {
      bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      text: 'text-[#e17100]',
      border: 'border-yellow-500/20',
      label: 'Medium'
    },
    low: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
      label: 'Low'
    }
  };

  const config = priorityConfig[assignment.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl p-5 transition-all hover:shadow-lg hover:scale-[1.01]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {assignment.title}
            </h4>
            {assignment.description && (
              <p className="text-sm text-slate-600 dark:text-white/60 line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Priority Badge */}
            <div className={`px-3 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
              <span className={`text-xs font-medium ${config.text}`}>
                {config.label.toLowerCase()}
              </span>
            </div>

            {/* Action Buttons */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1"
                >
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-600 dark:text-white/60" />
                  </button>
                  <button className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Assigned Leaders */}
        <div>
          <div className="text-xs text-slate-600 dark:text-white/60 mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Assigned Leaders ({assignment.assignedLeaders.length})
          </div>

          <div className="space-y-2">
            {assignment.assignedLeaders.map((leader, idx) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group/leader"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {leader.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                    {leader.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-white/60">
                    {leader.role} • {leader.allocation}% allocation
                  </div>
                </div>

                {/* Quick Actions */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  className="opacity-0 group-hover/leader:opacity-100 p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-white/60" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer - Dates & Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-white/60">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(assignment.expectedStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(assignment.expectedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-white/60">
            <Clock className="w-3.5 h-3.5" />
            {Math.ceil((new Date(assignment.expectedEndDate).getTime() - new Date(assignment.expectedStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </div>
        </div>
      </div>
    </motion.div>
  );
}