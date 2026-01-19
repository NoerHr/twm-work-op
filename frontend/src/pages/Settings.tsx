import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Save, Edit2, X, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ReportsTab } from '../components/settings/ReportsTab';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const { user, setUser } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    taskReminders: true,
    approvalRequests: true,
    projectUpdates: true,
    weeklyDigest: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const roles = ['Admin', 'BOD', 'PM', 'Leader', 'Contributor'];

  const handleRoleChange = (newRole: string) => {
    if (user) {
      setUser({ ...user, role: newRole as any });
      toast.success(`Role changed to ${newRole}`);
    }
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully! ✨');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.current) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    // Simulate password change
    toast.success('Password changed successfully! 🔒');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences saved');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-white/60">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="text-slate-900 dark:text-white">Profile Settings</h2>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={user?.name}
                className="w-20 h-20 rounded-full ring-4 ring-purple-500/30"
              />
              <div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">{user?.name}</p>
                <p className="text-slate-600 dark:text-white/60 text-sm mb-2">{user?.email}</p>
                <button
                  onClick={() => toast.info('Avatar upload coming soon!')}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Change avatar
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-600 dark:text-white/60 text-sm mb-2 block">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white transition-all ${
                  isEditing ? 'ring-2 ring-purple-500/20' : ''
                }`}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-white/60 text-sm mb-2 block">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white transition-all ${
                  isEditing ? 'ring-2 ring-purple-500/20' : ''
                }`}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-white/60 text-sm mb-2 block">Current Role</label>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg font-semibold">
                  {user?.role}
                </span>
                <span className="text-slate-600 dark:text-white/60 text-sm">
                  (Change role below in Demo section)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Switcher (Demo Only) */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-slate-900 dark:text-white">Role Switcher</h2>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
              Demo Only
            </span>
          </div>
          <p className="text-slate-600 dark:text-white/60 text-sm mb-4">
            Switch roles to test different UI perspectives and permissions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${user?.role === role
                    ? 'border-purple-500 bg-purple-500/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:border-purple-500/50 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold">{role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-green-400" />
            <h2 className="text-slate-900 dark:text-white">Notification Preferences</h2>
          </div>
          <p className="text-slate-600 dark:text-white/60 text-sm mb-4">
            Choose what notifications you want to receive
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div>
                <span className="text-slate-900 dark:text-white block">Email notifications</span>
                <span className="text-slate-600 dark:text-white/60 text-xs">Receive important updates via email</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500" 
                checked={notifications.email}
                onChange={() => handleNotificationToggle('email')}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div>
                <span className="text-slate-900 dark:text-white block">Task reminders</span>
                <span className="text-slate-600 dark:text-white/60 text-xs">Get reminded about upcoming tasks</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500" 
                checked={notifications.taskReminders}
                onChange={() => handleNotificationToggle('taskReminders')}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div>
                <span className="text-slate-900 dark:text-white block">Approval requests</span>
                <span className="text-slate-600 dark:text-white/60 text-xs">Notifications for pending approvals</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500" 
                checked={notifications.approvalRequests}
                onChange={() => handleNotificationToggle('approvalRequests')}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div>
                <span className="text-slate-900 dark:text-white block">Project updates</span>
                <span className="text-slate-600 dark:text-white/60 text-xs">Updates on projects you're involved in</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500" 
                checked={notifications.projectUpdates}
                onChange={() => handleNotificationToggle('projectUpdates')}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div>
                <span className="text-slate-900 dark:text-white block">Weekly digest</span>
                <span className="text-slate-600 dark:text-white/60 text-xs">Summary of your week every Monday</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500" 
                checked={notifications.weeklyDigest}
                onChange={() => handleNotificationToggle('weeklyDigest')}
              />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-pink-400" />
            <h2 className="text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-slate-600 dark:text-white/60 text-sm mb-3 block">
                Theme Preference
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  className="flex-1 p-4 rounded-lg border-2 transition-all hover:border-purple-500/50"
                  style={{
                    borderColor: isDark ? 'rgb(168 85 247 / 0.3)' : 'rgb(226 232 240)',
                    background: isDark ? 'rgb(168 85 247 / 0.1)' : 'rgb(241 245 249)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <span className="text-slate-900 dark:text-white font-semibold">Dark Mode</span>
                    {isDark && <span className="text-purple-500">✓</span>}
                  </div>
                </button>
                <button
                  onClick={toggle}
                  className="flex-1 p-4 rounded-lg border-2 transition-all hover:border-purple-500/50"
                  style={{
                    borderColor: !isDark ? 'rgb(168 85 247 / 0.3)' : 'rgb(226 232 240)',
                    background: !isDark ? 'rgb(168 85 247 / 0.1)' : 'rgb(241 245 249)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">☀️</span>
                    <span className="text-slate-900 dark:text-white font-semibold">Light Mode</span>
                    {!isDark && <span className="text-purple-500">✓</span>}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-red-400" />
            <h2 className="text-slate-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">Password</p>
                <p className="text-slate-600 dark:text-white/60 text-sm">Last changed 30 days ago</p>
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
              >
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">Two-Factor Authentication</p>
                <p className="text-slate-600 dark:text-white/60 text-sm">Add an extra layer of security</p>
              </div>
              <Button
                onClick={() => toast.info('2FA setup coming soon!')}
                variant="outline"
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-slate-900 dark:text-white">Reports</h2>
          </div>
          <ReportsTab />
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4">
            <div className="glass-card p-6 rounded-2xl shadow-2xl">
              <h3 className="text-xl text-slate-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-white/80 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-white/80 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-white/80 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  variant="primary"
                  className="flex-1"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}