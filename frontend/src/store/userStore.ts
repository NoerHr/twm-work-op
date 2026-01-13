import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from './authStore';

export interface UserProfile extends User {
  department?: string;
  position?: string;
  phone?: string;
  location?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

interface UserStore {
  users: UserProfile[];
  
  // CRUD Operations
  createUser: (user: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => UserProfile;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => UserProfile | undefined;
  getUsersByRole: (role: UserRole) => UserProfile[];
  
  // User Actions
  activateUser: (id: string) => void;
  deactivateUser: (id: string) => void;
  updateLastLogin: (id: string) => void;
}

// Seed users for testing
const SEED_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Alex Administrator',
    email: 'alex.admin@swiz.com',
    role: 'Admin',
    department: 'IT',
    position: 'System Administrator',
    phone: '+1-555-0101',
    location: 'New York',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-02')
  },
  {
    id: 'user-bod-1',
    name: 'Barbara Director',
    email: 'barbara.director@swiz.com',
    role: 'BOD',
    department: 'Executive',
    position: 'Board Member',
    phone: '+1-555-0201',
    location: 'New York',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-01')
  },
  {
    id: 'user-pm-1',
    name: 'Peter Manager',
    email: 'peter.manager@swiz.com',
    role: 'PM',
    department: 'Projects',
    position: 'Senior Project Manager',
    phone: '+1-555-0301',
    location: 'San Francisco',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-02')
  },
  {
    id: 'user-pm-2',
    name: 'Paula Martinez',
    email: 'paula.martinez@swiz.com',
    role: 'PM',
    department: 'Projects',
    position: 'Project Manager',
    phone: '+1-555-0302',
    location: 'Austin',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-11-30')
  },
  {
    id: 'user-leader-1',
    name: 'Laura Leader',
    email: 'laura.leader@swiz.com',
    role: 'Leader',
    department: 'Engineering',
    position: 'Team Lead',
    phone: '+1-555-0401',
    location: 'Seattle',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-02')
  },
  {
    id: 'user-leader-2',
    name: 'Leonard Chen',
    email: 'leonard.chen@swiz.com',
    role: 'Leader',
    department: 'Design',
    position: 'Design Lead',
    phone: '+1-555-0402',
    location: 'Los Angeles',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-12-01')
  },
  {
    id: 'user-contributor-1',
    name: 'Chris Developer',
    email: 'chris.dev@swiz.com',
    role: 'Contributor',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1-555-0501',
    location: 'Seattle',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-02')
  },
  {
    id: 'user-contributor-2',
    name: 'Carla Designer',
    email: 'carla.designer@swiz.com',
    role: 'Contributor',
    department: 'Design',
    position: 'UX Designer',
    phone: '+1-555-0502',
    location: 'Los Angeles',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-12-02')
  },
  {
    id: 'user-contributor-3',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@swiz.com',
    role: 'Contributor',
    department: 'Engineering',
    position: 'Frontend Developer',
    phone: '+1-555-0503',
    location: 'Austin',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    lastLogin: new Date('2024-11-29')
  },
  {
    id: 'user-contributor-4',
    name: 'Catherine Wong',
    email: 'catherine.wong@swiz.com',
    role: 'Contributor',
    department: 'Engineering',
    position: 'Backend Developer',
    phone: '+1-555-0504',
    location: 'San Francisco',
    status: 'active',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      
      createUser: (userData) => {
        const newUser: UserProfile = {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          users: [...state.users, newUser]
        }));
        
        return newUser;
      },
      
      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? { ...user, ...updates, updatedAt: new Date() }
              : user
          )
        }));
      },
      
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id)
        }));
      },
      
      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },
      
      getUsersByRole: (role) => {
        return get().users.filter((user) => user.role === role && user.status === 'active');
      },
      
      activateUser: (id) => {
        get().updateUser(id, { status: 'active' });
      },
      
      deactivateUser: (id) => {
        get().updateUser(id, { status: 'inactive' });
      },
      
      updateLastLogin: (id) => {
        get().updateUser(id, { lastLogin: new Date() });
      }
    }),
    {
      name: 'user-storage'
    }
  )
);
