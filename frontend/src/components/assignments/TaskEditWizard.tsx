import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Database, Zap, FileText, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InputPillar } from './task-pillars/InputPillar';
import { TriggerPillar } from './task-pillars/TriggerPillar';
import { FormPillar } from './task-pillars/FormPillar';
import { OutputPillar } from './task-pillars/OutputPillar';
import type { TaskConfiguration } from '../../types/assignment';

// Mock task data for editing (in production, fetch from API)
const MOCK_TASK_DATA: Record<string, TaskConfiguration> = {
  'task-1': {
    inputs: [
      {
        id: 'input-1',
        label: 'Customer Data',
        source: { type: 'table', tableName: 'customers' },
        readOnly: true
      }
    ],
    trigger: {
      type: 'manual',
      assignedTo: { type: 'specific', userIds: ['user-1', 'user-2'] }
    },
    form: {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Task Notes',
          required: true,
          validation: { minLength: 10 }
        }
      ],
      layout: 'vertical',
      submitButton: { label: 'Complete Task', style: 'primary' }
    },
    outputs: [
      {
        id: 'output-1',
        type: 'update-table',
        target: { type: 'specific', tableName: 'tasks' },
        mapping: []
      }
    ]
  }
};

type PillarStep = 1 | 2 | 3 | 4;

interface TaskEditWizardProps {
  assignmentId?: string;
  taskId?: string;
}

export function TaskEditWizard({ assignmentId: propAssignmentId, taskId }: TaskEditWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<PillarStep>(1);
  const [taskConfig, setTaskConfig] = useState<TaskConfiguration | null>(null);

  // Load task data on mount
  useEffect(() => {
    if (taskId && MOCK_TASK_DATA[taskId]) {
      setTaskConfig(MOCK_TASK_DATA[taskId]);
    } else {
      // Default empty config
      setTaskConfig({
        inputs: [],
        trigger: {
          type: 'manual',
          assignedTo: { type: 'specific' }
        },
        form: {
          fields: [],
          layout: 'vertical'
        },
        outputs: []
      });
    }
  }, [taskId]);

  const pillars = [
    {
      step: 1 as PillarStep,
      title: 'Input',
      subtitle: 'Data Ingestion',
      icon: Database,
      color: 'from-purple-500 to-indigo-600',
      description: 'Define what data the contributor sees (read-only)'
    },
    {
      step: 2 as PillarStep,
      title: 'Trigger',
      subtitle: 'Activation & Assignment',
      icon: Zap,
      color: 'from-blue-500 to-cyan-600',
      description: 'Configure when and who can execute this task'
    },
    {
      step: 3 as PillarStep,
      title: 'Form',
      subtitle: 'User Interface',
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      description: 'Design the task form with dynamic fields'
    },
    {
      step: 4 as PillarStep,
      title: 'Output',
      subtitle: 'Action & Effect',
      icon: Send,
      color: 'from-orange-500 to-red-600',
      description: 'Define what happens after task completion'
    }
  ];

  const currentPillar = pillars.find(p => p.step === currentStep);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as PillarStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as PillarStep);
    }
  };

  const handleSave = () => {
    console.log('Updating task configuration:', taskConfig);
    toast.success('Task updated successfully! 🎉');
    if (propAssignmentId) {
      navigate(`/my-assignments/${propAssignmentId}`);
    }
  };

  const handleBack = () => {
    if (propAssignmentId) {
      navigate(`/my-assignments/${propAssignmentId}`);
    }
  };

  const updateTaskConfig = (updates: Partial<TaskConfiguration>) => {
    if (taskConfig) {
      setTaskConfig({ ...taskConfig, ...updates });
    }
  };

  if (!taskConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-white/60">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={handleBack}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Task
      </Button>

      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl text-slate-900 dark:text-white mb-2">
              Edit Task Configuration
            </h1>
            <p className="text-slate-600 dark:text-white/60">
              Modify task using the 4-Pillar Task Execution Model
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Task #{taskId?.slice(0, 8)}
            </Badge>
            <Badge className="text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
              Edit Mode
            </Badge>
          </div>
        </div>

        {/* Pillar Progress Indicator */}
        <div className="grid grid-cols-4 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = currentStep === pillar.step;
            const isCompleted = currentStep > pillar.step;
            
            return (
              <button
                key={pillar.step}
                onClick={() => setCurrentStep(pillar.step)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : isCompleted
                    ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* Completion Check */}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 dark:text-white/50">
                      Pillar {pillar.step}
                    </div>
                    <div className={`text-sm ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {pillar.title}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-1">
                  {pillar.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Current Pillar Content */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6">
            {/* Pillar Header */}
            {currentPillar && (
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentPillar.color} flex items-center justify-center flex-shrink-0`}>
                    <currentPillar.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl text-slate-900 dark:text-white">
                        Pillar {currentStep}: {currentPillar.title}
                      </h2>
                      <Badge className={`bg-gradient-to-r ${currentPillar.color} text-white border-0`}>
                        {currentPillar.subtitle}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-white/60">
                      {currentPillar.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pillar-Specific Form */}
            <div className="mb-6">
              {currentStep === 1 && (
                <InputPillar
                  inputs={taskConfig.inputs}
                  onChange={(inputs) => updateTaskConfig({ inputs })}
                />
              )}
              
              {currentStep === 2 && (
                <TriggerPillar
                  trigger={taskConfig.trigger}
                  onChange={(trigger) => updateTaskConfig({ trigger })}
                />
              )}
              
              {currentStep === 3 && (
                <FormPillar
                  form={taskConfig.form}
                  onChange={(form) => updateTaskConfig({ form })}
                />
              )}
              
              {currentStep === 4 && (
                <OutputPillar
                  outputs={taskConfig.outputs}
                  onChange={(outputs) => updateTaskConfig({ outputs })}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Pillar
              </Button>

              <div className="text-sm text-slate-600 dark:text-white/60">
                Step {currentStep} of 4
              </div>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Next Pillar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Update Task
                </Button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Help Section */}
      <GlassCard className="p-4 bg-blue-500/5 border-blue-500/20">
        <h4 className="text-sm text-slate-900 dark:text-white mb-2">
          💡 Editing Task - What You Can Change
        </h4>
        <div className="grid grid-cols-4 gap-4 text-xs text-slate-600 dark:text-white/60">
          <div>
            <strong className="text-purple-600 dark:text-purple-400">Input:</strong> Modify data sources shown to contributors
          </div>
          <div>
            <strong className="text-blue-600 dark:text-blue-400">Trigger:</strong> Change activation logic and reassign contributors
          </div>
          <div>
            <strong className="text-emerald-600 dark:text-emerald-400">Form:</strong> Update form fields and layout
          </div>
          <div>
            <strong className="text-amber-600 dark:text-amber-400">Output:</strong> Modify post-completion actions
          </div>
        </div>
      </GlassCard>
    </div>
  );
}