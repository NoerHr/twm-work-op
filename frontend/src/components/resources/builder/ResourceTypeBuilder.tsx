import { useState } from 'react';
import { ArrowLeft, Save, CheckCircle, FileText, Database, GitBranch, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { DetailsTab } from './DetailsTab';
import { SchemaBuilder } from './SchemaBuilder';
import { OperationsBuilderComplete } from './OperationsBuilderComplete';
import { VersionsTab } from './VersionsTab';
import type { ResourceType, FieldSchema, OperationDefinition } from '../../../types/resource';

interface ResourceTypeBuilderProps {
  resourceType?: ResourceType;
  onSave: (type: ResourceType) => void;
  onCancel: () => void;
}

type BuilderTab = 'details' | 'schema' | 'operations' | 'versions';

const BUILDER_TABS = [
  { id: 'details' as BuilderTab, label: 'Details', icon: FileText },
  { id: 'schema' as BuilderTab, label: 'Schema', icon: Database },
  { id: 'operations' as BuilderTab, label: 'Operations', icon: GitBranch },
  { id: 'versions' as BuilderTab, label: 'Versions', icon: Clock }
];

export function ResourceTypeBuilder({ resourceType, onSave, onCancel }: ResourceTypeBuilderProps) {
  const [currentTab, setCurrentTab] = useState<BuilderTab>('details');
  const [formData, setFormData] = useState<Partial<ResourceType>>(resourceType || {
    name: '',
    description: '',
    category: 'operations',
    icon: '📦',
    version: '1.0.0',
    status: 'draft',
    schema: [],
    operations: [],
    isOrganizational: true
  });

  const updateFormData = (field: keyof ResourceType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleValidate = () => {
    const errors: any[] = [];

    // Validate basic info
    if (!formData.name) errors.push({ field: 'name', message: 'Name is required' });
    if (!formData.description) errors.push({ field: 'description', message: 'Description is required' });

    // Validate schema
    if (!formData.schema || formData.schema.length === 0) {
      errors.push({ field: 'schema', message: 'At least one field is required' });
    }

    // Validate operations
    formData.operations?.forEach(op => {
      if (op.blocks.length === 0) {
        errors.push({ field: 'operations', message: `Operation "${op.name}" has no blocks`, location: op.id });
      }
    });

    updateFormData('validationErrors', errors);

    if (errors.length === 0) {
      updateFormData('status', 'validated');
      alert('Validation passed! Ready to publish.');
    } else {
      alert(`Validation failed with ${errors.length} error(s). Check the Versions tab for details.`);
    }
  };

  const handlePublish = () => {
    if (formData.status !== 'validated') {
      alert('Please validate the resource type before publishing.');
      return;
    }

    const confirmed = confirm(`Publish version ${formData.version}? This will make it available to projects.`);
    if (confirmed) {
      updateFormData('status', 'published');
      updateFormData('publishedAt', new Date());
      handleSave();
    }
  };

  const handleSave = () => {
    const resourceType: ResourceType = {
      id: formData.id || `rt-${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      category: formData.category || 'operations',
      icon: formData.icon || '📦',
      version: formData.version || '1.0.0',
      status: formData.status || 'draft',
      schema: formData.schema || [],
      operations: formData.operations || [],
      isOrganizational: formData.isOrganizational ?? true,
      createdBy: formData.createdBy || 'current-user',
      createdAt: formData.createdAt || new Date(),
      updatedAt: new Date(),
      publishedAt: formData.publishedAt
    };

    onSave(resourceType);
  };

  const currentTabIndex = BUILDER_TABS.findIndex(t => t.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === BUILDER_TABS.length - 1;

  const handleNext = () => {
    if (!isLastTab) {
      setCurrentTab(BUILDER_TABS[currentTabIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstTab) {
      setCurrentTab(BUILDER_TABS[currentTabIndex - 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-slate-900 dark:text-white mb-1">
              {resourceType ? 'Edit Resource Type' : 'Create Resource Type'}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600 dark:text-white/60">
                {formData.name || 'Untitled Resource Type'}
              </p>
              {formData.status && (
                <Badge variant={formData.status === 'published' ? 'success' : 'warning'} className="text-xs">
                  {formData.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleValidate}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate
          </Button>
          {formData.status === 'validated' && (
            <Button variant="secondary" onClick={handlePublish}>
              Publish v{formData.version}
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          {BUILDER_TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isCompleted = index < currentTabIndex;

            return (
              <div key={tab.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentTab(tab.id)}
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
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm">{tab.label}</div>
                    {isActive && (
                      <div className="text-xs text-slate-600 dark:text-white/60">Current</div>
                    )}
                  </div>
                </button>
                {index < BUILDER_TABS.length - 1 && (
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentTab === 'details' && (
            <DetailsTab
              data={{
                name: formData.name || '',
                description: formData.description || '',
                category: formData.category || 'operations',
                icon: formData.icon || '📦'
              }}
              onChange={(details) => {
                updateFormData('name', details.name);
                updateFormData('description', details.description);
                updateFormData('category', details.category);
                updateFormData('icon', details.icon);
              }}
            />
          )}

          {currentTab === 'schema' && (
            <SchemaBuilder
              schema={formData.schema || []}
              onChange={(schema) => updateFormData('schema', schema)}
            />
          )}

          {currentTab === 'operations' && (
            <OperationsBuilderComplete
              operations={formData.operations || []}
              schema={formData.schema || []}
              onChange={(operations) => updateFormData('operations', operations)}
            />
          )}

          {currentTab === 'versions' && (
            <VersionsTab
              resourceType={formData as ResourceType}
              onPublish={handlePublish}
              onValidate={handleValidate}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstTab}
            className="flex items-center gap-2"
          >
            Previous
          </Button>

          <div className="text-sm text-slate-600 dark:text-white/60">
            Step {currentTabIndex + 1} of {BUILDER_TABS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={isLastTab}
            className="flex items-center gap-2"
          >
            Next
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
