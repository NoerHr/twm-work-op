import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { MyAssignments } from './pages/MyAssignments';
import { MyTasks } from './pages/MyTasks';
import { Organization } from './pages/Organization';
import { ResourceTypes } from './pages/ResourceTypes';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import WorkflowGuide from './pages/WorkflowGuide';
import { AssignmentDemo } from './pages/AssignmentDemo';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isDark } = useThemeStore();

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes (within authenticated app) */}
          <Route element={<Layout />}>
            {/* Dashboard - All roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader', 'Contributor']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Projects - Admin, BOD, PM, Leader */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader']}>
                  <Projects />
                </ProtectedRoute>
              }
            />

            {/* My Assignments - Leader, Admin ONLY (PM does not execute assignments) */}
            <Route
              path="/my-assignments"
              element={
                <ProtectedRoute allowedRoles={['Leader', 'Admin']}>
                  <MyAssignments />
                </ProtectedRoute>
              }
            />
            
            {/* Assignment Detail Routes */}
            <Route
              path="/my-assignments/:assignmentId"
              element={
                <ProtectedRoute allowedRoles={['Leader', 'Admin']}>
                  <MyAssignments />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-assignments/:assignmentId/create-task"
              element={
                <ProtectedRoute allowedRoles={['Leader', 'Admin']}>
                  <MyAssignments />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-assignments/:assignmentId/tasks/:taskId"
              element={
                <ProtectedRoute allowedRoles={['Leader', 'Admin']}>
                  <MyAssignments />
                </ProtectedRoute>
              }
            />
            
            {/* My Tasks - Universal Access */}
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader', 'Contributor']}>
                  <MyTasks />
                </ProtectedRoute>
              }
            />

            {/* Organization Hub - Admin ONLY */}
            <Route
              path="/organization"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Organization />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Admin ONLY */}
            <Route
              path="/admin/resource-types"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <ResourceTypes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Settings - All roles */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader', 'Contributor']}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Workflow Guide - All roles */}
            <Route
              path="/workflow-guide"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader', 'Contributor']}>
                  <WorkflowGuide />
                </ProtectedRoute>
              }
            />

            {/* Assignment Demo - Dev/Testing */}
            <Route
              path="/assignment-demo"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'BOD', 'PM', 'Leader', 'Contributor']}>
                  <AssignmentDemo />
                </ProtectedRoute>
              }
            />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: isDark ? 'dark-toast' : 'light-toast',
            style: {
              background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              color: isDark ? '#fff' : '#0f172a',
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}