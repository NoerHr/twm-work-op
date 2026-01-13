import { useState } from 'react';
import { Calendar, Filter, RefreshCw, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTaskStore, type TaskExecution } from '../../store/taskStore';
import { TaskCard } from './TaskCard';
import { TaskExecutionForm } from './TaskExecutionForm';

export function TaskBoard() {
  const tasks = useTaskStore((state) => state.tasks);
  const getTasksByColumn = useTaskStore((state) => state.getTasksByColumn);
  const getOverdueTasks = useTaskStore((state) => state.getOverdueTasks);
  const setCurrentTask = useTaskStore((state) => state.setCurrentTask);
  const currentTask = useTaskStore((state) => state.currentTask);
  
  const [showFilter, setShowFilter] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get tasks by columns
  const comingSoonTasks = getTasksByColumn('coming_soon');
  const todoTasks = getTasksByColumn('todo');
  const doneTasks = getTasksByColumn('done');
  const overdueTasks = getOverdueTasks();

  // Get unique projects for filter
  const projects = Array.from(new Set(tasks.map(t => t.projectName)));

  const handleStartTask = (task: TaskExecution) => {
    setCurrentTask(task);
  };

  const handleRefresh = () => {
    // In real app: fetch latest tasks from API
    console.log('Refreshing tasks...');
  };

  if (currentTask) {
    return <TaskExecutionForm />;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 dark:text-white mb-2">My Tasks</h1>
          <p className="text-slate-600 dark:text-white/60">
            Universal task inbox - Execute work assigned to you
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Scope Selector */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          {/* Actions */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowFilter(!showFilter)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Total Tasks</p>
              <p className="text-2xl text-slate-900 dark:text-white">{tasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Overdue</p>
              <p className="text-2xl text-red-600 dark:text-red-400">{overdueTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">To Do Today</p>
              <p className="text-2xl text-amber-600 dark:text-amber-400">{todoTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Completed Today</p>
              <p className="text-2xl text-green-600 dark:text-green-400">{doneTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Kanban Board - 3 Columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1: Coming Soon (Locked) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <h2 className="text-slate-900 dark:text-white">Coming Soon</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {comingSoonTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {comingSoonTasks.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-white/60">
                  No upcoming tasks
                </p>
              </GlassCard>
            ) : (
              comingSoonTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  locked={true}
                  onStart={handleStartTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: To Do (Active) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-slate-900 dark:text-white">To Do</h2>
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              {todoTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {todoTasks.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-2">All caught up!</h3>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  Enjoy your day 🎉
                </p>
              </GlassCard>
            ) : (
              <>
                {/* Overdue Tasks - Pinned to Top */}
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    overdue={true}
                    onStart={handleStartTask}
                  />
                ))}

                {/* Regular Tasks */}
                {todoTasks
                  .filter(task => !overdueTasks.some(ot => ot.id === task.id))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStart={handleStartTask}
                    />
                  ))}
              </>
            )}
          </div>
        </div>

        {/* Column 3: Done (Completed) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h2 className="text-slate-900 dark:text-white">Done</h2>
            </div>
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
              {doneTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-white/60">
                  No completed tasks today
                </p>
              </GlassCard>
            ) : (
              doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={true}
                  onStart={handleStartTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl"
          onClick={() => setShowFilter(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-6 w-full max-w-md">
              <h3 className="text-slate-900 dark:text-white mb-4">Filter Tasks</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                    Priority
                  </label>
                  <div className="space-y-2">
                    {['critical', 'high', 'normal', 'low'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-slate-900 dark:text-white capitalize">
                          {priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowFilter(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowFilter(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}