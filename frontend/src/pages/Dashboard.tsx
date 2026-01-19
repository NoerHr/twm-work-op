import { useAuthStore } from '../store/authStore';
import { motion } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { DashboardView } from '../components/projects/dashboard';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'Admin':
        return 'System Health Dashboard';
      case 'BOD':
        return 'Strategic Overview';
      case 'PM':
        return 'Portfolio Status';
      case 'Leader':
        return 'Team Operations';
      case 'Contributor':
        return 'My Tasks Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardDescription = () => {
    switch (user?.role) {
      case 'BOD':
        return 'Monitor governance health, pending approvals, and portfolio performance';
      case 'PM':
        return 'Manage projects, assignments, and team resources';
      case 'Leader':
        return 'Track assignments, team workload, and task progress';
      case 'Contributor':
        return 'View and execute your assigned tasks';
      default:
        return 'Welcome to your personalized dashboard';
    }
  };

  // Map user roles to lowercase for DashboardView
  const userRole = user?.role?.toLowerCase() as 'admin' | 'bod' | 'pm' | 'leader' | 'contributor';

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">{getDashboardTitle()}</h1>
            <p className="text-slate-600 dark:text-slate-400">{getDashboardDescription()}</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {user?.role}
          </Badge>
        </div>
      </motion.div>

      {/* Dashboard with Role-Based Widgets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DashboardView userRole={userRole} />
      </motion.div>
    </div>
  );
}