import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  Target,
  BarChart3,
  Filter,
  FolderKanban
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useResourceStore } from '../../store/resourceStore';
import { useReviewStore } from '../../store/reviewStore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { Project } from '../../types/project';

interface PMDashboardEnhancedProps {
  onCreateProject?: () => void;
}

export function PMDashboardEnhanced({ onCreateProject }: PMDashboardEnhancedProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const projects = useProjectStore((state) => state.projects);
  const allocations = useResourceStore((state) => state.allocations);
  const reviews = useReviewStore((state) => state.reviews);

  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'active' | 'completed'>('all');

  // Get PM's projects
  const myProjects = useMemo(() => {
    return projects.filter(p => p.ownerId === user?.id);
  }, [projects, user]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return myProjects.filter(p => {
      const matchesPriority = filterPriority === 'all' || p.details.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesPriority && matchesStatus;
    });
  }, [myProjects, filterPriority, filterStatus]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const draft = myProjects.filter(p => p.status === 'draft').length;
    const submitted = myProjects.filter(p => p.status === 'submitted').length;
    const approved = myProjects.filter(p => p.status === 'approved').length;
    const active = myProjects.filter(p => p.status === 'active').length;
    const completed = myProjects.filter(p => p.status === 'completed').length;
    
    // Resource metrics
    const totalAllocations = allocations.filter(a => 
      myProjects.some(p => p.id === a.projectId)
    ).length;
    
    // Timeline metrics
    const overdueProjects = myProjects.filter(p => {
      if (p.status === 'completed' || !p.details.expectedEndDate) return false;
      return new Date(p.details.expectedEndDate) < new Date();
    }).length;

    // Pending approvals
    const pendingApprovals = reviews.filter(r => 
      r.status === 'pending' && 
      myProjects.some(p => p.id === r.projectId)
    ).length;

    return {
      total: myProjects.length,
      draft,
      submitted,
      approved,
      active,
      completed,
      totalAllocations,
      overdueProjects,
      pendingApprovals,
      completionRate: myProjects.length > 0 ? (completed / myProjects.length) * 100 : 0
    };
  }, [myProjects, allocations, reviews]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    return {
      critical: myProjects.filter(p => p.details.priority === 'critical').length,
      high: myProjects.filter(p => p.details.priority === 'high').length,
      medium: myProjects.filter(p => p.details.priority === 'medium').length,
      low: myProjects.filter(p => p.details.priority === 'low').length
    };
  }, [myProjects]);

  // Projects needing attention
  const needsAttention = useMemo(() => {
    return myProjects.filter(p => {
      // Draft projects older than 7 days
      if (p.status === 'draft') {
        const createdAt = typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt;
        const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 7) return true;
      }
      
      // Overdue projects
      if (p.status === 'active' && p.details.expectedEndDate) {
        if (new Date(p.details.expectedEndDate) < new Date()) return true;
      }
      
      // Projects with no assignments
      if ((p.status === 'approved' || p.status === 'active') && (!p.assignments || p.assignments.length === 0)) {
        return true;
      }
      
      return false;
    });
  }, [myProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'submitted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'approved': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'low': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Project Portfolio</h1>
          <p className="text-slate-600 dark:text-white/60">
            Manage your projects and track progress
          </p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-purple-500" />
            </div>
            <Badge variant="outline" className="text-xs">Total</Badge>
          </div>
          <div className="text-2xl text-slate-900 dark:text-white mb-1">
            {metrics.total}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            Total Projects
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
              Active
            </Badge>
          </div>
          <div className="text-2xl text-slate-900 dark:text-white mb-1">
            {metrics.active}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            In Progress
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
              Pending
            </Badge>
          </div>
          <div className="text-2xl text-slate-900 dark:text-white mb-1">
            {metrics.pendingApprovals}
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            Awaiting Approval
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
              Success
            </Badge>
          </div>
          <div className="text-2xl text-slate-900 dark:text-white mb-1">
            {Math.round(metrics.completionRate)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-white/60">
            Completion Rate
          </div>
        </GlassCard>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-lg text-slate-900 dark:text-white">
                {metrics.overdueProjects}
              </div>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Overdue Projects
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-lg text-slate-900 dark:text-white">
                {metrics.totalAllocations}
              </div>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Resource Allocations
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-lg text-slate-900 dark:text-white">
                {needsAttention.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Needs Attention
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Priority Distribution */}
      <GlassCard className="p-6">
        <h3 className="text-sm text-slate-600 dark:text-white/60 mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-900 dark:text-white">Critical</span>
              </div>
              <span className="text-sm text-slate-900 dark:text-white">{priorityDistribution.critical}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${metrics.total > 0 ? (priorityDistribution.critical / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-900 dark:text-white">High</span>
              </div>
              <span className="text-sm text-slate-900 dark:text-white">{priorityDistribution.high}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${metrics.total > 0 ? (priorityDistribution.high / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-900 dark:text-white">Medium</span>
              </div>
              <span className="text-sm text-slate-900 dark:text-white">{priorityDistribution.medium}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${metrics.total > 0 ? (priorityDistribution.medium / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-sm text-slate-900 dark:text-white">Low</span>
              </div>
              <span className="text-sm text-slate-900 dark:text-white">{priorityDistribution.low}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-500 transition-all duration-500"
                style={{ width: `${metrics.total > 0 ? (priorityDistribution.low / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-600 dark:text-white/60" />
          
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <div className="flex-1" />
          
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            View All Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </GlassCard>

      {/* Projects Needing Attention */}
      {needsAttention.length > 0 && (
        <GlassCard className="p-6 border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-slate-900 dark:text-white">Projects Needing Attention</h2>
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              {needsAttention.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {needsAttention.map(project => (
              <div 
                key={project.id}
                className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg cursor-pointer hover:border-yellow-500/40 transition-all"
                onClick={() => navigate('/projects')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-white mb-1">
                      {project.details.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {project.status === 'draft' && 'Draft for more than 7 days'}
                      {project.status === 'active' && project.details.expectedEndDate && new Date(project.details.expectedEndDate) < new Date() && 'Past due date'}
                      {(!project.assignments || project.assignments.length === 0) && 'No assignments defined'}
                    </div>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(project.details.priority)}>
                    {project.details.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Filtered Projects List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-white">
            My Projects
            {(filterPriority !== 'all' || filterStatus !== 'all') && (
              <span className="text-sm text-slate-600 dark:text-white/60 ml-2">
                ({filteredProjects.length} filtered)
              </span>
            )}
          </h2>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="space-y-3">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => navigate('/projects')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-white mb-1">
                      {project.details.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {project.assignments?.length || 0} assignments • {project.workflow?.length || 0} stages
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(project.details.priority)}>
                      {project.details.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress for active projects */}
                {project.status === 'active' && project.assignments && project.assignments.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 dark:text-white/60">Progress</span>
                      <span className="text-xs text-slate-900 dark:text-white">
                        {Math.round((project.assignments.filter((a: any) => a.status === 'completed').length / project.assignments.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ 
                          width: `${(project.assignments.filter((a: any) => a.status === 'completed').length / project.assignments.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-4" />
            <p className="text-sm text-slate-600 dark:text-white/60">
              No projects match your filters
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}