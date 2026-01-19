import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/badge';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  activeTasks: number;
  completedToday: number;
  workloadPercentage: number;
  status: 'available' | 'busy' | 'overloaded';
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    activeTasks: 3,
    completedToday: 5,
    workloadPercentage: 60,
    status: 'available'
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    activeTasks: 7,
    completedToday: 2,
    workloadPercentage: 85,
    status: 'busy'
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    activeTasks: 12,
    completedToday: 1,
    workloadPercentage: 120,
    status: 'overloaded'
  },
  {
    id: '4',
    name: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    activeTasks: 5,
    completedToday: 4,
    workloadPercentage: 75,
    status: 'busy'
  }
];

export function TeamWorkloadWidget() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'busy':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'overloaded':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30';
      default:
        return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30';
    }
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500 dark:bg-red-500';
    if (percentage >= 80) return 'bg-amber-500 dark:bg-amber-500';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const overloadedCount = mockTeamMembers.filter(m => m.status === 'overloaded').length;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold">Team Workload</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Real-time capacity monitoring
            </p>
          </div>
        </div>

        {overloadedCount > 0 && (
          <Badge variant="error" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {overloadedCount} Overloaded
          </Badge>
        )}
      </div>

      {/* Team Members */}
      <div className="space-y-3 flex-1">
        {mockTeamMembers.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white truncate">
                  {member.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                  <span>{member.activeTasks} active</span>
                  <span>•</span>
                  <span className="text-green-600 dark:text-green-400">
                    +{member.completedToday} today
                  </span>
                </div>
              </div>
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
            </div>

            {/* Workload Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/60">Capacity</span>
                <span className={`font-medium ${
                  member.workloadPercentage >= 100 
                    ? 'text-red-600 dark:text-red-400' 
                    : member.workloadPercentage >= 80
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {member.workloadPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(member.workloadPercentage, 100)}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`${getWorkloadColor(member.workloadPercentage)} h-2 rounded-full`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Available</p>
            <p className="text-lg text-green-600 dark:text-green-400">
              {mockTeamMembers.filter(m => m.status === 'available').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Busy</p>
            <p className="text-lg text-yellow-600 dark:text-yellow-400">
              {mockTeamMembers.filter(m => m.status === 'busy').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Overloaded</p>
            <p className="text-lg text-red-600 dark:text-red-400">
              {overloadedCount}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}