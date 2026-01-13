import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  ChevronDown,
  Eye,
  Settings,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { toast } from 'sonner';
import { createCompleteWorkflowDemo, getWorkflowGuide } from '../../utils/createCompleteWorkflowDemo';
import type { Project, ProjectStatus } from '../../types/project';

interface PortfolioDashboardProps {
  projects: Project[];
  userRole: string;
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onSetupProject?: (projectId: string) => void;
  onRescheduleProject: (projectId: string, newStartDate: Date, newEndDate: Date) => void;
}

type FilterMode = 'all' | 'drafts' | 'pending-approval' | 'active' | 'completed';
type SortMode = 'last-modified' | 'start-date' | 'priority';

export function PortfolioDashboardEnhanced({
  projects,
  userRole,
  onCreateProject,
  onSelectProject,
  onSetupProject,
  onRescheduleProject
}: PortfolioDashboardProps) {
  const user = useAuthStore((state) => state.user);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('last-modified');
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  // ✅ TASK 3: Auto-set filter based on role
  useEffect(() => {
    if (userRole === 'BOD') {
      setFilterMode('pending-approval'); // BOD sees pending approvals by default
    } else {
      setFilterMode('all'); // Other roles see all projects
    }
  }, [userRole]);

  // Filter projects
  const filteredProjects = projects
    .filter(project => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = project.details.name.toLowerCase().includes(query);
        const matchesDescription = project.details.description?.toLowerCase().includes(query);
        const matchesTags = project.details.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Status filter
      if (filterMode !== 'all') {
        const statusMap: Record<FilterMode, ProjectStatus | ProjectStatus[]> = {
          'all': [],
          'drafts': 'draft',
          'pending-approval': ['submitted', 'in-review'],
          'active': 'active',
          'completed': 'completed'
        };
        
        const expectedStatus = statusMap[filterMode];
        if (Array.isArray(expectedStatus)) {
          if (!expectedStatus.includes(project.status)) return false;
        } else if (expectedStatus && project.status !== expectedStatus) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortMode === 'start-date') {
        const dateA = new Date(a.details.expectedStartDate).getTime();
        const dateB = new Date(b.details.expectedStartDate).getTime();
        return dateA - dateB;
      }
      if (sortMode === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.details.priority] - priorityOrder[a.details.priority];
      }
      // Default: last-modified (most recent first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  const getStatusConfig = (status: ProjectStatus) => {
    const configs = {
      draft: {
        label: 'Draft',
        color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        icon: '📝'
      },
      submitted: {
        label: 'Pending Approval',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20',
        borderColor: 'border-blue-500/30',
        icon: '⏳'
      },
      approved: {
        label: 'Approved',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20',
        borderColor: 'border-purple-500/30',
        icon: '✅'
      },
      setup: {
        label: 'Setup',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20',
        borderColor: 'border-purple-500/30',
        icon: '⚙️'
      },
      active: {
        label: 'Active',
        color: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
        borderColor: 'border-green-500/30',
        icon: '🚀'
      },
      'gate-review-pending': {
        label: 'Gate Review',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
        borderColor: 'border-amber-500/30',
        icon: '🚧'
      },
      completed: {
        label: 'Completed',
        color: 'bg-slate-500/10 text-slate-600 dark:text-slate-500 border-slate-500/20',
        borderColor: 'border-slate-500/30',
        icon: '✨'
      },
      archived: {
        label: 'Archived',
        color: 'bg-slate-400/10 text-slate-500 dark:text-slate-600 border-slate-400/20',
        borderColor: 'border-slate-400/30',
        icon: '📦'
      }
    };
    return configs[status] || configs.draft;
  };

  const calculateProgress = (project: Project) => {
    if (project.status === 'draft') {
      // Show wizard step progress
      const steps = [
        project.details.name ? 1 : 0,
        project.indicators && project.indicators.length > 0 ? 1 : 0,
        project.workflow && project.workflow.length > 0 ? 1 : 0,
        project.assignments && project.assignments.length > 0 ? 1 : 0
      ];
      const completed = steps.filter(s => s === 1).length;
      return { completed, total: 4, percentage: (completed / 4) * 100 };
    }

    if (project.status === 'active') {
      const totalStages = project.workflow?.length || 0;
      const completedStages = project.workflow?.filter(s => s.status === 'completed').length || 0;
      return { 
        completed: completedStages, 
        total: totalStages, 
        percentage: totalStages > 0 ? (completedStages / totalStages) * 100 : 0 
      };
    }

    return { completed: 0, total: 0, percentage: 0 };
  };

  const filterButtons = [
    { id: 'all' as FilterMode, label: 'All', color: 'text-slate-600 dark:text-white/60' },
    { id: 'drafts' as FilterMode, label: 'Drafts', color: 'text-yellow-600 dark:text-yellow-500' },
    { id: 'pending-approval' as FilterMode, label: 'Pending Approval', color: 'text-blue-600 dark:text-blue-500' },
    { id: 'active' as FilterMode, label: 'Active', color: 'text-green-600 dark:text-green-500' },
    { id: 'completed' as FilterMode, label: 'Completed', color: 'text-slate-500' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">
              {userRole === 'BOD' ? 'Approvals' : 'Projects'}
            </h1>
            <p className="text-slate-600 dark:text-white/60">
              {userRole === 'BOD' 
                ? 'Review and approve pending project submissions'
                : 'Manage your project portfolio and lifecycle'
              }
            </p>
          </div>
          {(userRole === 'PM' || userRole === 'Admin') && (
            <Button 
              onClick={onCreateProject} 
              variant="primary"
              size="md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterMode(filter.id)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterMode === filter.id
                  ? 'glass-card text-slate-900 dark:text-white'
                  : `${filter.color} hover:glass-card`
              }`}
            >
              {filter.label}
              {filter.id !== 'all' && (
                <span className="ml-2 text-xs opacity-60">
                  ({projects.filter(p => {
                    if (filter.id === 'drafts') return p.status === 'draft';
                    if (filter.id === 'pending-approval') return p.status === 'submitted';
                    if (filter.id === 'active') return p.status === 'active';
                    if (filter.id === 'completed') return p.status === 'completed';
                    return false;
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-4 py-2 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
            >
              <option value="last-modified">Last Modified</option>
              <option value="start-date">Start Date</option>
              <option value="priority">Priority</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredProjects.length === 0 ? (
          <GlassCard className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-900 dark:text-white mb-2">No Projects Found</h3>
            <p className="text-slate-600 dark:text-white/60 mb-6">
              {filterMode === 'all' 
                ? "Create your first project to get started"
                : `No ${filterMode.replace('-', ' ')} projects`}
            </p>
            {(userRole === 'PM' || userRole === 'Admin') && filterMode === 'all' && (
              <Button onClick={onCreateProject}>
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </Button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => {
                const statusConfig = getStatusConfig(project.status);
                const progress = calculateProgress(project);
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <GlassCard 
                      className={`p-6 cursor-pointer hover-glow transition-all border-2 ${statusConfig.borderColor} relative group`}
                      onClick={() => onSelectProject(project.id)}
                    >
                      {/* Context Menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowContextMenu(showContextMenu === project.id ? null : project.id);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600 dark:text-white/60" />
                      </button>

                      {/* Context Menu Dropdown */}
                      {showContextMenu === project.id && (
                        <div className="absolute top-14 right-4 glass-card p-2 z-10 min-w-[150px]">
                          <button className="w-full px-3 py-2 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                          {(userRole === 'Admin' || project.ownerId === user?.id) && (
                            <button className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                          {statusConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-slate-900 dark:text-white mb-1 truncate pr-8">
                            {project.details.name}
                          </h3>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress */}
                      {project.status === 'draft' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-600 dark:text-white/60">
                              Setup Progress
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              {progress.completed}/{progress.total} steps
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.percentage}%` }}
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-600"
                            />
                          </div>
                        </div>
                      )}

                      {project.status === 'active' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-600 dark:text-white/60">Progress</span>
                            <span className="text-slate-900 dark:text-white">
                              {Math.round(progress.percentage)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.percentage}%` }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(project.details.expectedStartDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            {' - '}
                            {new Date(project.details.expectedEndDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>

                        {project.assignments && project.assignments.length > 0 && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                            <Users className="w-4 h-4" />
                            <span>{project.assignments.length} assignments</span>
                          </div>
                        )}

                        {project.details.priority && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-white/60" />
                            <Badge 
                              variant={
                                project.details.priority === 'critical' ? 'destructive' :
                                project.details.priority === 'high' ? 'warning' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {project.details.priority}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Owner */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                              {project.ownerName?.charAt(0) || 'P'}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-white/60">
                              {project.ownerName}
                            </span>
                          </div>

                          {/* ✅ REMOVED: Setup Button - No longer needed (Setup done in wizard) */}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}