import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Not authenticated - redirect to login (should not happen as App.tsx handles this)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check role-based access
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <GlassCard className="p-12 rounded-2xl text-center max-w-md">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          {/* Content */}
          <h1 className="text-slate-900 dark:text-white mb-3">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-white/60 mb-6">
            You don't have permission to access this page.
          </p>

          {/* Role Info */}
          <div className="mb-6 p-4 bg-slate-100 dark:bg-white/5 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-white/40 mb-1">Your current role:</p>
            <p className="text-slate-900 dark:text-white font-semibold">{user.role}</p>
          </div>

          {/* Actions */}
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="primary"
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
