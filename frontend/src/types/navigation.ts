import { LucideIcon } from 'lucide-react';
import { UserRole } from '../store/authStore';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  allowedRoles: UserRole[];
  section: 'my-zone' | 'management' | 'system';
  badge?: number;
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}