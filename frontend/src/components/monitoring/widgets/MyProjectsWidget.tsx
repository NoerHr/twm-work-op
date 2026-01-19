import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, AlertCircle, Clock, CheckCircle, ChevronRight, Users } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { motion } from 'motion/react';
import { useProjectStore } from '../../../store/projectStore';
import { useAuthStore } from '../../../store/authStore';
import { Project } from '../../../types/project';

export function MyProjectsWidget() {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const user = useAuthStore((state) => state.user);

  // Filter projects where user is PM
  const myProjects = projects.filter(p => p.createdBy === user?.id || p.createdBy === user?.name);

  // Categorize by lifecycle state
  const activeProjects = myProjects.filter(p => 
    p.lifecycleState === 'execution' || p.lifecycleState === 'planning'
  );
  const completedProjects = myProjects.filter(p => p.lifecycleState === 'completed');
  const onHoldProjects = myProjects.filter(p => p.lifecycleState === 'on-hold');

  const getStatusColor = (state: Project['lifecycleState']) => {
    switch (state) {
      case 'draft': return { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', badge: 'outline' as const };
      case 'planning': return { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', badge: 'outline' as const };
      case 'execution': return { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', badge: 'success' as const };
      case 'completed': return { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', badge: 'success' as const };
      case 'on-hold': return { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', badge: 'warning' as const };
      default: return { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', badge: 'outline' as const };
    }
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">My Projects</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {myProjects.length} project{myProjects.length !== 1 ? 's' : ''} under management
            </p>
          </div>
        </div>

        <Badge variant="outline">
          {activeProjects.length} Active
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeProjects.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Active</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {completedProjects.length}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Done</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {onHoldProjects.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">On Hold</div>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {activeProjects.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-600 dark:text-white/60 text-sm">
              No active projects
            </p>
            <p className="text-slate-500 dark:text-white/40 text-xs mt-1">
              Create a new project to get started
            </p>
          </div>
        ) : (
          activeProjects.slice(0, 4).map((project, index) => {
            const colors = getStatusColor(project.lifecycleState);
            // Mock progress - in real app would calculate from tasks
            const progress = Math.round(Math.random() * 100);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg p-4 transition-all cursor-pointer border border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={colors.badge} size="sm">
                        {project.lifecycleState}
                      </Badge>
                      {project.type && (
                        <>
                          <span className="text-slate-500 dark:text-white/50">•</span>
                          <span className="text-slate-500 dark:text-white/50 capitalize">
                            {project.type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-white/60">Progress</span>
                    <span className="font-medium text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{Math.floor(Math.random() * 10) + 3} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(Math.random() * 20) + 5} days left</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {activeProjects.length > 4 && (
          <p className="text-xs text-center text-slate-500 dark:text-white/50 pt-2">
            +{activeProjects.length - 4} more project{activeProjects.length - 4 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* View All Button */}
      <Button
        variant="outline"
        onClick={() => navigate('/projects')}
        className="w-full flex items-center justify-center gap-2"
      >
        <span>View All Projects</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </GlassCard>
  );
}