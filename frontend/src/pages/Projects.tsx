import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useGovernanceStore } from '../store/governanceStore';
import { PortfolioDashboardEnhanced } from '../components/projects/PortfolioDashboardEnhanced';
import { ProjectCreationWizard } from '../components/projects/ProjectCreationWizard';
import { ProjectWorkspace } from '../components/projects/ProjectWorkspace';
import { WorkflowGuideModal } from '../components/projects/WorkflowGuideModal';
import { Clock, BookOpen, Sparkles, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { submitProjectForApproval, canSubmitProject, notifyBODOfSubmission } from '../utils/projectGovernanceIntegration';
import { createCompleteWorkflowDemo, getWorkflowGuide } from '../utils/createCompleteWorkflowDemo';
import type { Project } from '../types/project';

type ViewMode = 'dashboard' | 'create' | 'workspace'; // ✅ REMOVED 'setup'

export function Projects() {
  const user = useAuthStore((state) => state.user);
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [demoProject, setDemoProject] = useState<Project | null>(null);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const canCreateProjects = user?.role === 'PM' || user?.role === 'Admin';

  const handleCreateProject = () => {
    setViewMode('create');
    setSelectedProjectId(null);
    setDemoProject(null);
  };

  const handleAddCompleteDemo = () => {
    const demoProject = createCompleteWorkflowDemo();
    createProject(demoProject);
    toast.success('Complete Workflow Demo Added!', {
      description: '12 tasks across 3 stages with 14 contributors ready to test',
      icon: <Sparkles className="w-5 h-5" />
    });
    setShowDemoBanner(false);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDemoProject(null);
    setViewMode('workspace');
  };

  // ✅ REMOVED: handleOpenSetup - No longer needed
  // ✅ REMOVED: handleCompleteSetup - No longer needed

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (selectedProjectId) {
      // Update existing project using Zustand store
      updateProject(selectedProjectId, projectData);
      toast.success('Project updated successfully');
    } else {
      // Create new project using Zustand store
      const newProject = createProject(projectData);
      toast.success('Project created successfully');
    }

    setViewMode('dashboard');
  };

  const handleSubmitProject = (projectData: Partial<Project>) => {
    // ⚡ PHASE 3B: Governance Integration
    const user = useAuthStore.getState().user;
    const createProjectReview = useGovernanceStore.getState().createProjectReview;
    const submitProject = useProjectStore.getState().submitProject;
    
    // ✅ FIXED: Save project first to ensure it has an ID
    let projectId = selectedProjectId;
    
    if (selectedProjectId) {
      // Update existing project
      updateProject(selectedProjectId, projectData);
    } else {
      // Create new project
      const newProject = createProject(projectData);
      projectId = newProject.id;
      setSelectedProjectId(newProject.id);
    }
    
    // Get the saved project from store
    const savedProject = useProjectStore.getState().getProject(projectId!);
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
      
      setViewMode('dashboard');
    } catch (error) {
      console.error('Failed to submit project:', error);
      toast.error('Submission failed. Please try again.');
    }
  };

  const handleRescheduleProject = (projectId: string, newStartDate: Date, newEndDate: Date) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    updateProject(projectId, {
      details: {
        ...project.details,
        expectedStartDate: newStartDate,
        expectedEndDate: newEndDate
      }
    });
    toast.success('Project rescheduled successfully');
  };

  const handleCancelWizard = () => {
    setViewMode('dashboard');
    setSelectedProjectId(null);
    setDemoProject(null);
  };

  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : undefined;

  const userRole = user?.role || 'Contributor';

  return (
    <>
      {viewMode === 'dashboard' && (
        <div className="h-full flex flex-col">
          {/* Demo Banner */}
          {showDemoBanner && (userRole === 'PM' || userRole === 'Admin') && (
            <div className="glass-surface border-b border-slate-200 dark:border-white/10">
              <GlassCard className="m-4 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-slate-900 dark:text-white">🎯 Complete End-to-End Workflow Demo</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                        Test lengkap workflow dari PM membuat project → BOD approve → PM setup → Contributor complete tasks. 
                        Includes 3 stages, 5 assignments, 12 tasks, dan 14 team members (PM, Leaders, Contributors).
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleAddCompleteDemo}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                          size="sm"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Add Complete Demo
                        </Button>
                        <Button
                          onClick={() => setShowWorkflowGuide(true)}
                          variant="outline"
                          size="sm"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Workflow Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDemoBanner(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
                  </button>
                </div>
              </GlassCard>
            </div>
          )}

          <PortfolioDashboardEnhanced
            projects={projects}
            userRole={user?.role || 'Contributor'}
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
            onRescheduleProject={handleRescheduleProject}
          />
        </div>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <ProjectCreationWizard
          project={viewMode === 'edit' ? selectedProject : demoProject}
          onSave={handleSaveProject}
          onSubmit={handleSubmitProject}
          onCancel={handleCancelWizard}
        />
      )}

      {viewMode === 'workspace' && selectedProjectId && (
        <ProjectWorkspace
          projectId={selectedProjectId}
          onBack={() => setViewMode('dashboard')}
        />
      )}

      {showWorkflowGuide && (
        <WorkflowGuideModal
          onClose={() => setShowWorkflowGuide(false)}
          onAddDemo={handleAddCompleteDemo}
        />
      )}
    </>
  );
}