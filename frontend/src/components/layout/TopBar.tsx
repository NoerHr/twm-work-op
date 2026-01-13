import { ChevronRight, Bell, Search, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { GlassCard } from '../ui/GlassCard';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from '../GlobalSearch';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface TopBarProps {
  breadcrumbs?: { label: string; path: string }[];
}

export function TopBar({ breadcrumbs = [] }: TopBarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setShowUserMenu(false);
  };

  return (
    <header className="glass-surface border-b border-slate-200 dark:border-white/10 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-700 dark:text-slate-400 font-medium">Workspace</span>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
            <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-400 font-medium'}>
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right Section: Search, Theme Toggle, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button 
          onClick={() => setShowGlobalSearch(true)}
          className="glass-hover p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
          title="Search (Ctrl+K)"
        >
          <Search className="w-5 h-5 text-slate-700 dark:text-slate-400" strokeWidth={1.5} />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggle}
          className="glass-hover p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
          )}
        </button>

        {/* Notifications - ⚡ PHASE 4 PART 2: Notification Center */}
        <NotificationCenter onNavigate={navigate} />

        {/* User Profile */}
        <div className="relative">
          <GlassCard 
            variant="frosted" 
            hover 
            className="px-3 py-1.5 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={user?.name}
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30"
              />
              <div className="hidden md:block text-sm">
                <div className="text-slate-900 dark:text-white font-semibold">{user?.name}</div>
                <div className="text-slate-600 dark:text-slate-400 text-xs font-medium">{user?.role}</div>
              </div>
            </div>
          </GlassCard>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-white/10">
                  <div className="text-slate-900 dark:text-white font-semibold">{user?.name}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">{user?.email}</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      {showGlobalSearch && (
        <GlobalSearch
          onNavigate={navigate}
          onClose={() => setShowGlobalSearch(false)}
        />
      )}
    </header>
  );
}