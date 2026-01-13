import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X, FileText, TrendingUp, GitBranch, Users, MessageSquare, Database } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DetailsTab } from './wizard/DetailsTab';
import { ResourcesTab } from './wizard/ResourcesTab';
import { WorkflowBuilderTab } from './wizard/WorkflowBuilderTab';
import { AssignmentsTab } from './wizard/AssignmentsTab';
import { IndicatorsTab } from './wizard/IndicatorsTab';
import { ReviewDiscussTab } from './wizard/ReviewDiscussTab';
import type { Project } from '../../types/project';

interface ProjectCreationWizardProps {
  project?: Project; // Optional for editing existing draft
  onSave?: (project: Partial<Project>) => void;
  onSubmit?: (project: Partial<Project>) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

type WizardStep = 'details' | 'resources' | 'workflow' | 'assignments' | 'indicators' | 'review';

const WIZARD_STEPS: { id: WizardStep; label: string; icon: any; description: string }[] = [
  { id: 'details', label: 'Details & Collaboration', icon: FileText, description: 'Define project identity and scope' },
  { id: 'resources', label: 'Resources', icon: Database, description: 'Import organizational resources' },
  { id: 'workflow', label: 'Workflow Builder', icon: GitBranch, description: 'Design stages and gates' },
  { id: 'assignments', label: 'Assignments', icon: Users, description: 'Map resources and leaders' },
  { id: 'indicators', label: 'Indicators', icon: TrendingUp, description: 'Define success metrics' },
  { id: 'review', label: 'Review & Discuss', icon: MessageSquare, description: 'Final review and team discussion' }
];

export function ProjectCreationWizard({
  project,
  onSave,
  onSubmit,
  onCancel,
  readOnly
}: ProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [formData, setFormData] = useState<Partial<Project>>(project || {
    details: {
      name: '',
      description: '',
      expectedStartDate: new Date(),
      expectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: 'medium',
      tags: []
    },
    indicators: [],
    workflow: [],
    assignments: [],
    discussions: []
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const updateFormData = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ FIXED: Accept step parameter for validation without changing current state
  const validateStep = (step: WizardStep): boolean => {
    const errors: Record<string, string> = {};

    if (step === 'details') {
      if (!formData.details?.name) {
        errors.name = 'Project name is required';
      }
      if (!formData.details?.description) {
        errors.description = 'Project description is required';
      }
      if (!formData.details?.expectedStartDate) {
        errors.startDate = 'Start date is required';
      }
      if (!formData.details?.expectedEndDate) {
        errors.endDate = 'End date is required';
      }
      // UC-PM-001: Check governance mapping
      // In a real app, this would check if PM has a BOD supervisor mapped
      // For now, we'll simulate this check
    }

    if (step === 'workflow') {
      if (!formData.workflow || formData.workflow.length === 0) {
        errors.workflow = 'At least one stage is required';
      }
      // UC-PM-003: Check that all stages have gates
      const stagesWithoutGates = formData.workflow?.filter(stage => !stage.gate);
      if (stagesWithoutGates && stagesWithoutGates.length > 0) {
        errors.gates = 'All stages must have review gates configured';
      }
    }

    // ✅ FIXED: Assignments are now OPTIONAL - user can skip and configure later
    // if (step === 'assignments') {
    //   if (!formData.assignments || formData.assignments.length === 0) {
    //     errors.assignments = 'At least one assignment is required';
    //   }
    // }

    // ✅ FIXED: Indicators are now OPTIONAL - user can skip and configure later  
    // if (step === 'indicators') {
    //   if (!formData.indicators || formData.indicators.length === 0) {
    //     errors.indicators = 'At least one indicator is required for tracking progress';
    //   }
    // }

    // Only set validation errors if validating current step
    if (step === currentStep) {
      setValidationErrors(errors);
    }
    return Object.keys(errors).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    return validateStep(currentStep);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (!isLastStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStep(WIZARD_STEPS[nextIndex].id);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(WIZARD_STEPS[prevIndex].id);
    }
  };

  const handleSaveDraft = () => {
    onSave?.(formData);
  };

  // ✅ FIXED: Validate all steps without changing currentStep state
  const handleSubmitForReview = () => {
    // Validate all required steps without changing state
    const requiredSteps: WizardStep[] = ['details', 'workflow'];
    const validationResults = requiredSteps.map(step => ({
      step,
      valid: validateStep(step)
    }));

    const allStepsValid = validationResults.every(result => result.valid);

    if (allStepsValid) {
      onSubmit?.(formData);
    } else {
      // Find first invalid step and navigate to it
      const firstInvalidStep = validationResults.find(result => !result.valid);
      if (firstInvalidStep) {
        setCurrentStep(firstInvalidStep.step);
        // Re-validate to show errors
        setTimeout(() => validateStep(firstInvalidStep.step), 0);
      }
      alert('Please complete all required fields before submitting for review.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="md" onClick={onCancel}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-slate-900 dark:text-white mb-1">
                {project ? 'Edit Project Draft' : 'Create New Project'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Follow the wizard to define your project scope and requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button onClick={handleSubmitForReview} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Submit for Review
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-3 transition-all ${
                      isActive
                        ? 'text-purple-500'
                        : isCompleted
                        ? 'text-green-500'
                        : 'text-slate-600 dark:text-white/60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-purple-500/20 ring-2 ring-purple-500'
                          : isCompleted
                          ? 'bg-green-500/20'
                          : 'bg-slate-200 dark:bg-white/5'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-sm">{step.label}</div>
                      {isActive && (
                        <div className="text-xs text-slate-600 dark:text-white/60">Current step</div>
                      )}
                    </div>
                  </button>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'details' && (
            <DetailsTab
              data={formData.details!}
              errors={validationErrors}
              onChange={(details) => updateFormData('details', details)}
            />
          )}

          {currentStep === 'resources' && (
            <ResourcesTab
              project={formData}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === 'indicators' && (
            <IndicatorsTab
              projectId={formData.id || project?.id}
              projectName={formData.details?.name || project?.details?.name}
              indicators={formData.indicators || []}
              onChange={(indicators) => updateFormData('indicators', indicators)}
            />
          )}

          {currentStep === 'workflow' && (
            <WorkflowBuilderTab
              stages={formData.workflow || []}
              indicators={formData.indicators || []}
              errors={validationErrors}
              onChange={(stages) => updateFormData('workflow', stages)}
            />
          )}

          {currentStep === 'assignments' && (
            <AssignmentsTab
              projectId={formData.id || project?.id}
              projectName={formData.details?.name || project?.details?.name}
              assignments={formData.assignments || []}
              stages={formData.workflow || []}
              inheritedResources={formData.resourceTypes || []}
              onChange={(assignments) => updateFormData('assignments', assignments)}
            />
          )}

          {currentStep === 'review' && (
            <ReviewDiscussTab
              project={formData}
              onChange={(project) => setFormData(project)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <GlassCard className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-slate-600 dark:text-white/60">
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={isLastStep}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}