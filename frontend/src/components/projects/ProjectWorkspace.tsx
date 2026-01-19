import { useState, useEffect } from 'react';
import { Clock, AlertCircle, ArrowLeft, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useGovernanceStore } from '../../store/governanceStore';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import type { Project, ProjectStatus } from '../../types/project';
import { canSubmitProject, submitProjectForApproval, notifyBODOfSubmission } from '../../utils/projectGovernanceIntegration';

// View Components (will be built separately)
import { ProjectCreationWizard } from './ProjectCreationWizard';
import { GovernanceReviewView } from './GovernanceReviewView';
import { ProjectSetupWorkspace } from './ProjectSetupWorkspace';
import { ActiveProjectDashboard } from './ActiveProjectDashboard';
import { ProjectUnifiedDashboard } from './ProjectUnifiedDashboard';

interface ProjectWorkspaceProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectWorkspace({ projectId, onBack }: ProjectWorkspaceProps) {
  const user = useAuthStore((state) => state.user);
  const project = useProjectStore((state) => state.getProject(projectId));
  const updateProject = useProjectStore((state) => state.updateProject);
  const submitProject = useProjectStore((state) => state.submitProject);
  const createProjectReview = useGovernanceStore((state) => state.createProjectReview);
  
  // Handler functions for ProjectCreationWizard
  const handleSaveProject = (projectData: Partial<Project>) => {
    updateProject(projectId, projectData);
    toast.success('Project saved successfully');
  };
  
  // ✅ FIXED: Proper governance integration for project submission
  const handleSubmitProject = (projectData: Partial<Project>) => {
    // Save the project first
    updateProject(projectId, projectData);
    
    // Get the updated project from store
    const savedProject = useProjectStore.getState().getProject(projectId);
    if (!savedProject) {
      toast.error('Project not found after save');
      return;
    }
    
    // Check if project can be submitted
    const validation = canSubmitProject(savedProject);
    
    if (!validation.canSubmit) {
      toast.error('Cannot Submit Project', {
        description: validation.reasons.join('. ')
      });
      return;
    }
    
    // Submit for approval (integrates with governance)
    try {
      const review = submitProjectForApproval(
        savedProject,
        user?.name || 'Unknown PM',
        createProjectReview,
        (id) => submitProject(id)
      );
      
      // Notify BOD members
      notifyBODOfSubmission(
        savedProject.id,
        savedProject.details.name,
        user?.name || 'Unknown PM',
        review
      );
      
      toast.success('Project Submitted for Approval!', {
        description: `${review.requiredVotes} BOD approvals required. Deadline: ${review.deadline.toLocaleDateString()}`,
        icon: <Clock className="w-5 h-5" />
      });
      
      // Show validation warnings if any
      if (validation.reasons.length > 0) {
        toast.info('Recommendations', {
          description: validation.reasons.join('. ')
        });
      }
      
      // Don't navigate back - let the component re-render with new status
      // The workspace will automatically show the governance review view
    } catch (error) {
      console.error('Failed to submit project:', error);
      toast.error('Submission failed. Please try again.');
    }
  };
  
  const handleCancelWizard = () => {
    onBack();
  };
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-slate-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-slate-600 dark:text-white/60 mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="secondary" size="md" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Determine which view to render based on project status and user role
  const getViewComponent = () => {
    const status = project.status;
    const isOwner = project.ownerId === user?.id;
    const isBOD = user?.role === 'BOD';
    const isAdmin = user?.role === 'Admin';

    switch (status) {
      case 'draft':
        // Only owner can edit drafts
        if (isOwner || isAdmin) {
          return (
            <ProjectCreationWizard 
              project={project} 
              onSave={handleSaveProject} 
              onSubmit={handleSubmitProject} 
              onCancel={handleCancelWizard} 
            />
          );
        }
        // ✅ FIXED: Others get read-only view (still need onSubmit for button to work)
        return (
          <ProjectCreationWizard 
            project={project} 
            onSave={handleSaveProject}
            onSubmit={handleSubmitProject}
            onCancel={handleCancelWizard} 
            readOnly 
          />
        );

      case 'submitted':
        // BOD sees governance review interface
        if (isBOD || isAdmin) {
          return <GovernanceReviewView project={project} onBack={onBack} />;
        }
        // PM sees locked wizard with status
        return <GovernanceReviewView project={project} onBack={onBack} pmView />;

      case 'approved':
      case 'active':
      case 'gate-review-pending':
      case 'change-pending':
        // ✅ NEW: Use ProjectUnifiedDashboard (mirrors wizard with read-only tabs)
        // Exception: Stage tab remains interactive for timeline management
        return <ProjectUnifiedDashboard project={project} onBack={onBack} />;

      case 'completed':
      case 'archived':
        // Read-only unified dashboard for completed projects
        return <ProjectUnifiedDashboard project={project} onBack={onBack} />;

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={project.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {getViewComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}