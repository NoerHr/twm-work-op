import {
  FolderKanban,
  CheckSquare,
  Settings,
  Briefcase,
  LayoutGrid,
  Building2,
  CheckCircle // Added for BOD Approvals icon
} from 'lucide-react';
import { NavItem } from '../types/navigation';

// Helper function to get role-specific navigation items
export const getNavigationItems = (userRole: string): NavItem[] => {
  const baseItems: NavItem[] = [
    // === GLOBAL NAVIGATION (FLAT STRUCTURE per IA Section 4.1) ===
    
    // 1. Dashboard (Personal)
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      path: '/dashboard',
      allowedRoles: ['Admin', 'BOD', 'PM', 'Leader', 'Contributor'],
      section: 'main',
      description: 'Personalized view (My Tasks, My Approvals, KPI Summary)'
    },

    // 2. Projects / Approvals (Role-based label)
    {
      id: 'projects',
      label: userRole === 'BOD' ? 'Approvals' : 'Projects', // Dynamic label based on role
      icon: userRole === 'BOD' ? CheckCircle : Briefcase,   // Dynamic icon based on role
      path: '/projects',
      allowedRoles: ['Admin', 'BOD', 'PM'], // Leader REMOVED - Leaders don't need Projects nav
      section: 'main',
      description: userRole === 'BOD' 
        ? 'Review and approve project submissions'
        : 'List View, Create New, Project Workspace'
    },

    // 3. My Assignment (Leader Workspace) - PM removed, only Leader & Admin
    {
      id: 'my-assignment',
      label: 'My Assignment',
      icon: FolderKanban,
      path: '/my-assignments',
      allowedRoles: ['Leader', 'Admin'], // PM REMOVED - PM creates assignments in draft project, but doesn't execute them
      section: 'main',
      description: "Leader's workspace for managing delegated work packages"
    },

    // 4. My Tasks (Contributor Inbox)
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      path: '/my-tasks',
      allowedRoles: ['Admin', 'BOD', 'PM', 'Leader', 'Contributor'],
      section: 'main',
      description: "Universal Task Inbox - Execute assigned work (All Roles)"
    },

    // 5. Organization (Admin Only - Sub-modules: Resource Library, User Management)
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      path: '/organization',
      allowedRoles: ['Admin'],
      section: 'main',
      description: 'Resource Library & User Management'
    },

    // 6. Settings (Profile, Reports, System Config)
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      allowedRoles: ['Admin', 'BOD', 'PM', 'Leader', 'Contributor'],
      section: 'main',
      description: 'Profile, Reports, System Config'
    }
  ];

  // Filter by role permissions
  return baseItems.filter(item => item.allowedRoles.includes(userRole));
};

// Legacy export for backward compatibility (defaults to 'Admin' role)
export const NAV_ITEMS: NavItem[] = getNavigationItems('Admin');