import { useState } from 'react';
import { useAuthStore, UserRole } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { Eye, EyeOff, Mail, Lock, Chrome, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner@2.0.3';

type AuthView = 'login' | 'signup' | 'forgot-password';

export function Login() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const users = useUserStore((state) => state.users);
  const updateLastLogin = useUserStore((state) => state.updateLastLogin);

  // Demo password (same for all users for testing)
  const DEMO_PASSWORD = 'demo123';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check against real user database
    const userProfile = users.find(u => u.email === email && u.status === 'active');

    if (userProfile && password === DEMO_PASSWORD) {
      // Update last login
      updateLastLogin(userProfile.id);
      
      setUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        department: userProfile.department,
        position: userProfile.position,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`
      });
      toast.success(`Welcome back, ${userProfile.name}! 🎉`);
    } else {
      toast.error('Invalid email or password. Use demo123 as password!');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    // Find first active user with this role
    const userProfile = users.find(u => u.role === role && u.status === 'active');
    if (userProfile) {
      setEmail(userProfile.email);
      setPassword(DEMO_PASSWORD);
      // Auto-submit after a brief moment
      setTimeout(() => {
        updateLastLogin(userProfile.id);
        setUser({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          department: userProfile.department,
          position: userProfile.position,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`
        });
        toast.success(`Logged in as ${userProfile.name}! 🚀`);
      }, 300);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.success(`${provider} login initiated! Signing you in...`, {
      duration: 2000,
    });
    
    // Simulate OAuth flow
    setTimeout(() => {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        role: 'Contributor',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
      });
      toast.success(`Logged in with ${provider}! 🚀`);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* Background Aura Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/30 dark:bg-pink-500/20 rounded-full blur-3xl animate-float-delay-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delay-4" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 glass-card p-3 rounded-lg hover-glow transition-all duration-300 z-10"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <span className="text-2xl">☀️</span>
        ) : (
          <span className="text-2xl">🌙</span>
        )}
      </button>

      {/* Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl text-slate-900 dark:text-white">SWIZ Workspace</h1>
                  <p className="text-slate-600 dark:text-white/60">Enterprise Project Management</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl space-y-6">
              <h2 className="text-2xl text-slate-900 dark:text-white">Welcome Back! 👋</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400">✓</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-1">Role-Based Access</h3>
                    <p className="text-slate-600 dark:text-white/60 text-sm">5 distinct user experiences tailored to your role</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-1">Real-Time Automation</h3>
                    <p className="text-slate-600 dark:text-white/60 text-sm">Intelligent indicators that update automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-1">Beautiful Design</h3>
                    <p className="text-slate-600 dark:text-white/60 text-sm">Glass Aura aesthetic with full dark mode support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <p className="text-slate-600 dark:text-white/60 text-sm italic">
                "SWIZ Workspace transformed how we manage projects. The automation alone saves us 30+ hours per month!"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                <div>
                  <p className="text-slate-900 dark:text-white text-sm">Sarah Johnson</p>
                  <p className="text-slate-600 dark:text-white/60 text-xs">Project Manager, TechCorp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="glass-card p-8 rounded-2xl shadow-2xl">
              {/* Logo for Mobile */}
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl text-slate-900 dark:text-white">SWIZ Workspace</h1>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-slate-900 dark:text-white text-2xl mb-2">Sign in to your account</h2>
                <p className="text-slate-600 dark:text-white/60">Enter your credentials to continue</p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full glass-card p-3 rounded-lg hover-glow transition-all duration-300 flex items-center justify-center gap-3 text-slate-900 dark:text-white"
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSocialLogin('Microsoft')}
                  className="w-full glass-card p-3 rounded-lg hover-glow transition-all duration-300 flex items-center justify-center gap-3 text-slate-900 dark:text-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
                    <rect x="1" y="1" width="9" height="9" fill="currentColor" />
                    <rect x="1" y="11" width="9" height="9" fill="currentColor" />
                    <rect x="11" y="1" width="9" height="9" fill="currentColor" />
                    <rect x="11" y="11" width="9" height="9" fill="currentColor" />
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-white/60">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm text-slate-700 dark:text-white/80 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm text-slate-700 dark:text-white/80 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="text-sm text-slate-700 dark:text-white/80">Remember me</span>
                  </label>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6 pt-6 border-t border-slate-300 dark:border-white/10">
                <p className="text-sm text-slate-600 dark:text-white/60 mb-3 text-center">Quick demo login:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDemoLogin('Admin')}
                    className="px-3 py-2 text-xs bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 dark:hover:bg-purple-500/30 transition-colors"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleDemoLogin('BOD')}
                    className="px-3 py-2 text-xs bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors"
                  >
                    BOD
                  </button>
                  <button
                    onClick={() => handleDemoLogin('PM')}
                    className="px-3 py-2 text-xs bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-colors"
                  >
                    PM
                  </button>
                  <button
                    onClick={() => handleDemoLogin('Leader')}
                    className="px-3 py-2 text-xs bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500/20 dark:hover:bg-amber-500/30 transition-colors"
                  >
                    Leader
                  </button>
                  <button
                    onClick={() => handleDemoLogin('Contributor')}
                    className="px-3 py-2 text-xs bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 dark:hover:bg-purple-500/30 transition-colors col-span-2"
                  >
                    Contributor
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-4 glass-card p-4 rounded-xl">
              <p className="text-xs text-slate-600 dark:text-white/60 text-center mb-2">
                💡 Demo credentials:
              </p>
              <div className="text-xs text-slate-500 dark:text-white/50 space-y-1">
                <p>• admin@swiz.com / admin123</p>
                <p>• pm@swiz.com / pm123</p>
                <p>• leader@swiz.com / leader123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delay-2 {
          animation: float 15s ease-in-out infinite;
          animation-delay: -5s;
        }
        
        .animate-float-delay-4 {
          animation: float 25s ease-in-out infinite;
          animation-delay: -10s;
        }
      `}</style>
    </div>
  );
}