import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BackgroundAura } from './BackgroundAura';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

export function Layout() {
  const { isDark, setDark } = useThemeStore();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark, setDark]);

  // Generate breadcrumbs from current location
  const getBreadcrumbs = () => {
    const pathname = location.pathname;
    
    // Role-based breadcrumb labels
    const projectsLabel = user?.role === 'BOD' ? 'Approvals' : 'Projects';
    
    const breadcrumbMap: Record<string, { label: string; path: string }[]> = {
      '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
      '/projects': [{ label: projectsLabel, path: '/projects' }],
      '/my-assignments': [{ label: 'My Assignment', path: '/my-assignments' }],
      '/my-tasks': [{ label: 'My Tasks', path: '/my-tasks' }],
      '/organization': [{ label: 'Organization', path: '/organization' }],
      '/admin/resource-types': [
        { label: 'Organization', path: '/organization' },
        { label: 'Resource Types', path: '/admin/resource-types' }
      ],
      '/admin/users': [
        { label: 'Organization', path: '/organization' },
        { label: 'User Management', path: '/admin/users' }
      ],
      '/settings': [{ label: 'Settings', path: '/settings' }],
      '/workflow-guide': [{ label: 'Workflow Guide', path: '/workflow-guide' }],
      '/assignment-demo': [{ label: 'Assignment Demo', path: '/assignment-demo' }]
    };

    return breadcrumbMap[pathname] || [{ label: 'Dashboard', path: '/dashboard' }];
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950">
      {/* Floating Background Aura */}
      <BackgroundAura />

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar breadcrumbs={getBreadcrumbs()} />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
