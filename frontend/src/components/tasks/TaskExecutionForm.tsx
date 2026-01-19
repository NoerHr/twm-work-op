import { useState } from 'react';
import { ArrowLeft, Save, AlertTriangle, Send, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useTaskStore } from '../../store/taskStore';
import { ContextPanel } from './ContextPanel';
import { BatchFieldWidget } from './BatchFieldWidget';
import { CameraModal } from './modals/CameraModal';
import { IssueReportModal } from './modals/IssueReportModal';
import { SubmitConfirmationModal } from './modals/SubmitConfirmationModal';

export function TaskExecutionForm() {
  const currentTask = useTaskStore((state) => state.currentTask);
  const setCurrentTask = useTaskStore((state) => state.setCurrentTask);
  const updateFormData = useTaskStore((state) => state.updateFormData);
  const submitTask = useTaskStore((state) => state.submitTask);
  const reportIssue = useTaskStore((state) => state.reportIssue);
  
  const [formData, setFormData] = useState<Record<string, any>>(currentTask?.formData || {});
  const [showRawData, setShowRawData] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraFieldId, setCameraFieldId] = useState<string | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentTask) {
    return null;
  }

  const handleBack = () => {
    if (confirm('Exit task execution? Unsaved changes will be lost.')) {
      setCurrentTask(null);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    
    // Clear error for this field
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const handleSaveDraft = () => {
    if (currentTask) {
      updateFormData(currentTask.id, formData);
      toast.success('Draft saved successfully');
    }
  };

  const handleReportIssue = (reason: string, description: string, severity: string) => {
    if (currentTask) {
      reportIssue(currentTask.id, reason, description);
      setCurrentTask(null);
      toast.success('Issue reported. Task paused.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    currentTask.formSchema.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Validation rules
      if (field.validation && formData[field.id]) {
        const value = formData[field.id];
        
        if (field.validation.min !== undefined && value < field.validation.min) {
          newErrors[field.id] = field.validation.message || `Minimum value is ${field.validation.min}`;
        }
        
        if (field.validation.max !== undefined && value > field.validation.max) {
          newErrors[field.id] = field.validation.message || `Maximum value is ${field.validation.max}`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowSubmitModal(true);
    } else {
      toast.error('Please fix validation errors before submitting');
    }
  };

  const handleConfirmSubmit = () => {
    if (currentTask) {
      submitTask(currentTask.id, formData);
      setShowSubmitModal(false);
      toast.success('Task completed successfully! 🎉');
    }
  };

  const handleCameraCapture = (fieldId: string, imageData: string) => {
    handleFieldChange(fieldId, imageData);
    setShowCameraModal(false);
    setCameraFieldId(null);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border ${
                error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'
              } text-slate-900 dark:text-white text-sm`}
            >
              <option value="">Select...</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'camera':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Button
              variant="outline"
              onClick={() => {
                setCameraFieldId(field.id);
                setShowCameraModal(true);
              }}
              className="w-full"
            >
              {value ? 'Change Photo' : 'Capture Photo'}
            </Button>
            {value && (
              <div className="mt-2">
                <img src={value} alt="Captured" className="w-full rounded-lg border border-slate-200 dark:border-white/10" />
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'signature':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Digital Signature</p>
              {value ? (
                <div className="space-y-2">
                  <img src={value} alt="Signature" className="w-full h-24 object-contain bg-white rounded" />
                  <Button variant="outline" onClick={() => handleFieldChange(field.id, '')} className="w-full">
                    Clear Signature
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => handleFieldChange(field.id, 'data:image/png;base64,signature-placeholder')} className="w-full">
                  Sign Here
                </Button>
              )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'batch':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm text-slate-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <BatchFieldWidget
              config={field.batchConfig!}
              value={value}
              onChange={(val) => handleFieldChange(field.id, val)}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="secondary" size="md" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Task Board
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-slate-900 dark:text-white mb-2">
              {currentTask.workflowName}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{currentTask.projectName}</Badge>
              <Badge variant="outline">{currentTask.assignmentName}</Badge>
              {currentTask.isBatch && (
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                  Batch: {currentTask.batchTotal} items
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={currentTask.assignedBy.avatar}
              alt={currentTask.assignedBy.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="text-sm">
              <p className="text-xs text-slate-600 dark:text-white/60">Assigned by</p>
              <p className="text-slate-900 dark:text-white">{currentTask.assignedBy.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Context (1/3) */}
        <div className="col-span-4">
          <ContextPanel
            inputContext={currentTask.inputContext}
            showRawData={showRawData}
            onToggleRawData={() => setShowRawData(!showRawData)}
          />
        </div>

        {/* Right Panel - Form (2/3) */}
        <div className="col-span-8">
          <GlassCard className="p-6">
            <h2 className="text-xl text-slate-900 dark:text-white mb-6">Task Form</h2>

            {/* Form Fields */}
            <div className="space-y-6">
              {currentTask.formSchema.map((field) => renderField(field))}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>

                  <Button variant="outline" onClick={() => setShowIssueModal(true)} className="text-amber-600 border-amber-500/30">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>

                <Button onClick={handleSubmit} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Task
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      {showCameraModal && cameraFieldId && (
        <CameraModal
          onCapture={(imageData) => handleCameraCapture(cameraFieldId, imageData)}
          onClose={() => {
            setShowCameraModal(false);
            setCameraFieldId(null);
          }}
        />
      )}

      {showIssueModal && (
        <IssueReportModal
          onSubmit={handleReportIssue}
          onClose={() => setShowIssueModal(false)}
        />
      )}

      {showSubmitModal && (
        <SubmitConfirmationModal
          task={currentTask}
          formData={formData}
          onConfirm={handleConfirmSubmit}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}