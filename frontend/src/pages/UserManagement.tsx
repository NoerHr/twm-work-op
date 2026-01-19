import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import type { UserProfile, UserRole } from '../types/auth';

// Role and Status Colors
const ROLE_COLORS: Record<UserRole, string> = {
  Admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  BOD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Leader: 'bg-green-500/20 text-green-400 border-green-500/30',
  Contributor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const STATUS_COLORS: Record<'active' | 'inactive' | 'pending', string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export function UserManagement() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const users = useUserStore((state) => state.users);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const activateUser = useUserStore((state) => state.activateUser);
  const deactivateUser = useUserStore((state) => state.deactivateUser);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Check permissions
  const canManageUsers = currentUser?.role === 'Admin' || currentUser?.role === 'BOD';

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    pending: users.filter((u) => u.status === 'pending').length,
    byRole: {
      Admin: users.filter((u) => u.role === 'Admin').length,
      BOD: users.filter((u) => u.role === 'BOD').length,
      PM: users.filter((u) => u.role === 'PM').length,
      Leader: users.filter((u) => u.role === 'Leader').length,
      Contributor: users.filter((u) => u.role === 'Contributor').length
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
  };

  const handleDelete = (user: UserProfile) => {
    setDeletingUser(user);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const handleToggleStatus = (user: UserProfile) => {
    if (user.status === 'active') {
      deactivateUser(user.id);
    } else {
      activateUser(user.id);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="p-8">
        <GlassCard className="p-12 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-white/60">
            You don't have permission to manage users. Only Admins and BOD members can access this page.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate('/organization')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organization
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            User Management
          </h1>
          <p className="text-slate-600 dark:text-white/60">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <GlassCard className="p-4">
          <div className="text-2xl text-purple-400 mb-1">{stats.total}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">Total Users</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-2xl text-green-400 mb-1">{stats.active}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">Active</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-2xl text-red-400 mb-1">{stats.byRole.Admin}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">Admins</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-2xl text-blue-400 mb-1">{stats.byRole.PM}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">PMs</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-2xl text-green-400 mb-1">{stats.byRole.Leader}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">Leaders</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-2xl text-amber-400 mb-1">{stats.byRole.Contributor}</div>
          <div className="text-sm text-slate-600 dark:text-white/60">Contributors</div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="BOD">BOD</option>
            <option value="PM">PM</option>
            <option value="Leader">Leader</option>
            <option value="Contributor">Contributor</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'pending')}
            className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </GlassCard>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-slate-900 dark:text-white mb-2">No Users Found</h3>
            <p className="text-slate-600 dark:text-white/60">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Click "Add User" to create your first user'
              }
            </p>
          </GlassCard>
        ) : (
          filteredUsers.map((user) => (
            <GlassCard key={user.id} className="p-6 hover:border-purple-500/30 transition-all">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-slate-900 dark:text-white truncate">{user.name}</h3>
                    <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                    <Badge className={STATUS_COLORS[user.status]}>{user.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                    )}
                    {user.lastLogin && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                        <Calendar className="w-4 h-4" />
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {user.department && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-white/60">
                      {user.department} • {user.position}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user)}
                    disabled={user.id === currentUser?.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserFormModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          userName={deletingUser.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}

// User Form Modal Component
interface UserFormModalProps {
  user?: UserProfile;
  onClose: () => void;
}

function UserFormModal({ user, onClose }: UserFormModalProps) {
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Contributor' as UserRole,
    department: user?.department || '',
    position: user?.position || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      updateUser(user.id, formData);
    } else {
      addUser({
        ...formData,
        status: 'pending',
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-slate-900 dark:text-white mb-6">
          {user ? 'Edit User' : 'Add New User'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Admin">Admin</option>
                <option value="BOD">BOD</option>
                <option value="PM">PM</option>
                <option value="Leader">Leader</option>
                <option value="Contributor">Contributor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

// Delete Confirm Modal Component
interface DeleteConfirmModalProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ userName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl p-4">
      <GlassCard className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-slate-900 dark:text-white mb-2">
            Delete User
          </h2>
          
          <p className="text-slate-600 dark:text-white/60 mb-6">
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete User
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}