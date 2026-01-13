import { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'motion/react';

export function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useAuthStore();

  const roles: { role: UserRole; description: string; color: string }[] = [
    { role: 'Admin', description: 'System Architect - Machinery View', color: 'red' },
    { role: 'BOD', description: 'Executive - Results View', color: 'purple' },
    { role: 'PM', description: 'Project Manager - Plan View', color: 'blue' },
    { role: 'Leader', description: 'Team Lead - Execution View', color: 'emerald' },
    { role: 'Contributor', description: 'Worker - Task View', color: 'amber' }
  ];

  const handleRoleChange = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 glass-card px-4 py-3 rounded-xl hover:shadow-glass-lg flex items-center gap-2 z-50"
      >
        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
        <span className="text-sm font-medium text-slate-900 dark:text-white">Role: {user?.role}</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-6"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <GlassCard variant="frosted" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Switch Role</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 font-medium">
              Switch roles to test different UI perspectives and permissions
            </p>

            <div className="space-y-3">
              {roles.map(({ role, description, color }) => (
                <motion.button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${user?.role === role
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-indigo-500/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 dark:text-white font-semibold mb-1">{role}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{description}</div>
                    </div>
                    {user?.role === role && (
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                <strong>Demo Mode:</strong> This role switcher is for testing purposes only. 
                In production, roles are assigned by administrators and cannot be changed by users.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}