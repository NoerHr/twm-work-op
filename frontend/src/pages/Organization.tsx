import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Package, ArrowRight, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Organization() {
  const navigate = useNavigate();

  const hubCards = [
    {
      id: 'resource-types',
      title: 'Resource Types Library',
      description: 'Define reusable resource templates with approval flows and budgets',
      icon: Package,
      path: '/admin/resource-types',
      color: 'from-purple-500 to-pink-500',
      stats: { total: 12, active: 8 }
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage team members, roles, and permissions across the organization',
      icon: Users,
      path: '/admin/users',
      color: 'from-blue-500 to-cyan-500',
      stats: { total: 47, active: 42 }
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 dark:text-white mb-2">Organization</h1>
        <p className="text-slate-600 dark:text-white/60">
          Manage organizational resources, users, and system-wide configurations
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600 dark:text-white/60">Resource Types</div>
            <Package className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {hubCards[0].stats.total}
          </div>
          <div className="text-xs text-slate-500 dark:text-white/40">
            {hubCards[0].stats.active} active
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600 dark:text-white/60">Total Users</div>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {hubCards[1].stats.total}
          </div>
          <div className="text-xs text-slate-500 dark:text-white/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-green-500" />
            <span className="text-green-500">+5%</span> this month
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600 dark:text-white/60">Active Users</div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {hubCards[1].stats.active}
          </div>
          <div className="text-xs text-slate-500 dark:text-white/40">
            5 pending invites
          </div>
        </GlassCard>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hubCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.id} className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                {card.badge && card.badge > 0 && (
                  <Badge variant="destructive">{card.badge}</Badge>
                )}
              </div>

              <h3 className="text-slate-900 dark:text-white font-medium mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                {card.description}
              </p>

              {/* Module Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {card.stats && (
                  <>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {card.stats.total}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/40">
                        Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {card.stats.active}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/40">
                        Active
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate(card.path)}
              >
                Open {card.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </GlassCard>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <GlassCard className="p-6 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-slate-900 dark:text-white font-medium mb-2">
                Resource Type Management
              </h4>
              <p className="text-sm text-slate-700 dark:text-white/70">
                Resource Types are organizational blueprints that define data structures and capabilities. 
                Projects inherit these types to create their own inventory. Use The Creator interface to 
                design, test, and publish new types.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-slate-900 dark:text-white font-medium mb-2">
                Role-Based Access Control
              </h4>
              <p className="text-sm text-slate-700 dark:text-white/70">
                The system supports 5 roles: Admin, BOD, PM, Leader, and Contributor. Each role has 
                specific permissions and access levels. Users can hold multiple roles across different 
                project contexts.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}