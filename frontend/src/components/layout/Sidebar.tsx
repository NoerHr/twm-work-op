import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getNavigationItems } from '../../config/navigation';
import { NavItem } from '../../types/navigation';
import { motion, AnimatePresence } from 'motion/react';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get role-specific navigation items (already filtered by role)
  const allowedItems = user ? getNavigationItems(user.role) : [];

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <motion.button
        key={item.id}
        onClick={() => {
          navigate(item.path);
          setIsMobileOpen(false);
        }}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
            : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-semibold text-white">
                {item.badge}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-purple-blue rounded-xl shadow-lg" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">SWIZ</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
          ) : (
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
          )}
        </button>
        
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {/* FLAT NAVIGATION (No Grouping per IA Section 4.1) */}
        <div className="space-y-1">
          {allowedItems.map(renderNavItem)}
        </div>
      </nav>

      {/* User Role Indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <div className="glass-card p-3 rounded-xl">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Role</div>
            <div className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {user?.role}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-lg"
      >
        <Menu className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col
          glass-surface border-r border-slate-200 dark:border-white/10 h-screen transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xl z-40"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 glass-frosted dark:glass-frosted flex flex-col z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}