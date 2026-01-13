import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AssignmentManagement } from '../components/assignments/AssignmentManagement';
import { createTestApprovedProject } from '../utils/createTestApprovedProject';
import { useAuthStore } from '../store/authStore';
import type { Project } from '../types/project';

export function AssignmentDemo() {
  const user = useAuthStore((state) => state.user);
  
  // Create test project with real data
  const [demoProject] = useState<Project>(() => {
    if (!user) {
      return createTestApprovedProject('demo-user', 'Demo User');
    }
    return createTestApprovedProject(user.id, user.name);
  });

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 glass-card hover:scale-105 transition-transform group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-white/60 group-hover:text-purple-600 transition-colors" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">Back to Dashboard</span>
        </a>
      </div>

      {/* Main Content */}
      <div className="relative z-0 h-full">
        <AssignmentManagement project={demoProject} />
      </div>
    </div>
  );
}
