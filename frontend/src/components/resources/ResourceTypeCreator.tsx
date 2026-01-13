import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Info, 
  Database, 
  Workflow, 
  Play, 
  History,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Calculator,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  CheckCircle2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { FieldSchemaDesigner, Field } from './FieldSchemaDesigner';
import { ValidationEngine, ValidationResult } from './ValidationEngine';
import { OperationBuilder } from './OperationBuilder';
import { SimulationEngine } from './SimulationEngine';
import { BreakingChangeDialog } from './BreakingChangeDialog';
import { Node, Edge } from '@xyflow/react';
import { 
  saveResourceType, 
  getResourceTypeById, 
  saveVersionSnapshot,
  ResourceTypeDefinition 
} from '../../lib/resourceTypeStorage';
import { detectBreakingChanges, ChangeAnalysis } from '../../lib/breakingChangeDetector';
import { toast } from 'sonner';

interface ResourceTypeCreatorProps {
  resourceType?: any; // Existing resource for editing
  onBack: () => void;
  onSave?: (data: any) => void;
}

type TabType = 'basic' | 'fields' | 'operations' | 'simulation' | 'validation' | 'versioning';

interface Operation {
  id: string;
  name: string;
  type: 'create' | 'update' | 'delete' | 'custom';
  description?: string;
  fields: string[]; // Field IDs affected
  logic?: string;
}

export function ResourceTypeCreator({ resourceType, onBack, onSave }: ResourceTypeCreatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const isEditMode = !!resourceType;

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: resourceType?.name || '',
    icon: resourceType?.icon || '📦',
    category: resourceType?.category || '',
    description: resourceType?.description || '',
    status: resourceType?.status || 'draft'
  });

  // Fields State
  const [fields, setFields] = useState<Field[]>(resourceType?.fields || [
    {
      id: 'field-1',
      name: 'Name',
      type: 'text',
      required: true,
      description: 'Resource name'
    }
  ]);

  // Operations State
  const [operations, setOperations] = useState<Operation[]>(resourceType?.operations || []);

  // Simulation State
  const [simulationData, setSimulationData] = useState<any>({});
  const [simulationResults, setSimulationResults] = useState<ValidationResult>(null);

  // Version State
  const [versionInfo, setVersionInfo] = useState({
    version: resourceType?.version || '1.0',
    changelog: '',
    publishNotes: ''
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'fields', label: 'Fields', icon: Database },
    { id: 'operations', label: 'Operations', icon: Workflow },
    { id: 'simulation', label: 'Simulation', icon: Play },
    { id: 'validation', label: 'Validation', icon: CheckCircle2 },
    { id: 'versioning', label: 'Versioning', icon: History }
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Boolean', icon: ToggleLeft },
    { value: 'select', label: 'Select', icon: List },
    { value: 'formula', label: 'Formula', icon: Calculator }
  ];

  const emojiOptions = ['📦', '🚜', '💻', '🏭', '⚡', '🔧', '📊', '🎯', '🌟', '🔑', '📱', '🚀'];

  // Field Management
  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `New Field ${fields.length + 1}`,
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  // Operation Management
  const addOperation = () => {
    const newOperation: Operation = {
      id: `op-${Date.now()}`,
      name: `Operation ${operations.length + 1}`,
      type: 'custom',
      fields: []
    };
    setOperations([...operations, newOperation]);
  };

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(operations.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOperation = (id: string) => {
    setOperations(operations.filter(o => o.id !== id));
  };

  // Simulation
  const runSimulation = () => {
    const validationResults = ValidationEngine.validate(fields, simulationData);
    setSimulationResults(validationResults);
  };

  // Save Handler
  const handleSave = () => {
    const resourceData = {
      ...basicInfo,
      fields,
      operations,
      version: versionInfo.version,
      lastModified: new Date().toISOString()
    };
    
    onSave?.(resourceData);
    console.log('Saving Resource Type:', resourceData);
  };

  // Breaking Change Detection
  const [changeAnalysis, setChangeAnalysis] = useState<ChangeAnalysis | null>(null);
  const [showBreakingChangeDialog, setShowBreakingChangeDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previousSnapshot, setPreviousSnapshot] = useState<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load previous snapshot if editing
  useEffect(() => {
    if (resourceType?.id) {
      const existing = getResourceTypeById(resourceType.id);
      if (existing?.snapshot) {
        try {
          setPreviousSnapshot(JSON.parse(existing.snapshot));
        } catch (e) {
          console.error('Failed to parse previous snapshot', e);
        }
      }
    }
  }, [resourceType]);

  // Auto-save draft (every 30 seconds)
  useEffect(() => {
    if (basicInfo.status === 'draft') {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [basicInfo, fields, operations]);

  const handleAutoSave = () => {
    if (basicInfo.status !== 'draft') return;
    
    const draftData: ResourceTypeDefinition = {
      id: resourceType?.id || `res-${Date.now()}`,
      ...basicInfo,
      fields,
      operations,
      version: versionInfo.version,
      createdAt: resourceType?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: resourceType?.createdBy || 'Admin',
      changelog: versionInfo.changelog
    };
    
    try {
      saveResourceType(draftData);
      console.log('Draft auto-saved');
    } catch (error) {
      console.error('Auto-save failed', error);
    }
  };

  const handlePublish = () => {
    const currentSnapshot = {
      fields,
      operations
    };

    // Detect breaking changes
    const analysis = detectBreakingChanges(previousSnapshot, currentSnapshot, versionInfo.version);
    setChangeAnalysis(analysis);
    setShowBreakingChangeDialog(true);
  };

  const confirmPublish = (newVersion: string, changelog: string) => {
    const publishedData: ResourceTypeDefinition = {
      id: resourceType?.id || `res-${Date.now()}`,
      ...basicInfo,
      status: 'published',
      fields,
      operations,
      version: newVersion,
      createdAt: resourceType?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      createdBy: resourceType?.createdBy || 'Admin',
      changelog,
      previousVersion: resourceType?.version,
      breakingChanges: changeAnalysis?.breakingChanges.map(c => c.description) || []
    };

    setIsSaving(true);
    try {
      saveResourceType(publishedData);
      
      // Save version snapshot
      saveVersionSnapshot(
        publishedData.id,
        newVersion,
        JSON.stringify({ fields, operations }),
        changelog,
        changeAnalysis?.breakingChanges.map(c => c.description) || []
      );
      
      toast.success(`Resource Type published as v${newVersion}!`);
      setShowBreakingChangeDialog(false);
      setPreviousSnapshot({ fields, operations });
      
      // Call parent save callback
      onSave?.(publishedData);
    } catch (error) {
      toast.error('Failed to publish Resource Type.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData: ResourceTypeDefinition = {
      id: resourceType?.id || `res-${Date.now()}`,
      ...basicInfo,
      status: 'draft',
      fields,
      operations,
      version: versionInfo.version,
      createdAt: resourceType?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: resourceType?.createdBy || 'Admin',
      changelog: versionInfo.changelog
    };

    setIsSaving(true);
    try {
      saveResourceType(draftData);
      toast.success('Draft saved successfully!');
      onSave?.(draftData);
    } catch (error) {
      toast.error('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSave = () => {
    if (basicInfo.status === 'published') {
      handlePublish();
    } else {
      handleSaveDraft();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="md" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Resource Type' : 'Create Resource Type'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Define schema, fields, operations, and versioning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={basicInfo.status === 'published' ? 'success' : 'warning'}>
            {basicInfo.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          <Button onClick={handleFinalSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <GlassCard className="p-2">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* BASIC INFO TAB */}
          {activeTab === 'basic' && (
            <GlassCard className="p-6">
              <h2 className="text-lg text-slate-900 dark:text-white mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Icon
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setBasicInfo({ ...basicInfo, icon: emoji })}
                        className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                          basicInfo.icon === emoji
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Resource Type Name *
                  </label>
                  <input
                    type="text"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    placeholder="e.g., Heavy Machinery, Software Licenses"
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Category *
                  </label>
                  <select
                    value={basicInfo.category}
                    onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select category...</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Digital">Digital</option>
                    <option value="Materials">Materials</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Financial">Financial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Description
                  </label>
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                    placeholder="Describe this resource type and its purpose..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* FIELDS TAB */}
          {activeTab === 'fields' && (
            <FieldSchemaDesigner
              fields={fields}
              onChange={setFields}
              resourceTypes={[
                { id: 'rt-heavy-machinery', name: 'Heavy Machinery' },
                { id: 'rt-software-licenses', name: 'Software Licenses' },
                { id: 'rt-raw-materials', name: 'Raw Materials' }
              ]}
            />
          )}

          {/* OPERATIONS TAB */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              {/* Operations List & Builder */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg text-slate-900 dark:text-white">Operations</h2>
                    <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                      Define executable workflows with visual logic builder
                    </p>
                  </div>
                  <Button onClick={addOperation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Operation
                  </Button>
                </div>

                {operations.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-white/40">
                    <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No operations defined yet. Click "Add Operation" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {operations.map((op) => (
                      <div
                        key={op.id}
                        className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={op.name}
                              onChange={(e) => updateOperation(op.id, { name: e.target.value })}
                              placeholder="Operation name..."
                              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white mb-2"
                            />
                            <textarea
                              value={op.description || ''}
                              onChange={(e) => updateOperation(op.id, { description: e.target.value })}
                              placeholder="Describe what this operation does..."
                              rows={2}
                              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                            />
                          </div>
                          <button
                            onClick={() => deleteOperation(op.id)}
                            className="text-red-500 hover:text-red-600 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Visual Operation Builder */}
                        <OperationBuilder
                          operation={{
                            id: op.id,
                            name: op.name,
                            type: 'void',
                            parameters: [],
                            description: op.description
                          }}
                          fields={fields.map(f => ({
                            id: f.id,
                            name: f.name,
                            internalName: f.internalName || f.name.toLowerCase().replace(/\s+/g, '_'),
                            type: f.type
                          }))}
                          onChange={(nodes: Node[], edges: Edge[]) => {
                            updateOperation(op.id, { 
                              logic: JSON.stringify({ nodes, edges }) 
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {/* SIMULATION TAB */}
          {activeTab === 'simulation' && (
            <SimulationEngine
              fields={fields}
              operations={operations}
              onResultsChange={(results) => {
                console.log('Simulation completed:', results);
              }}
            />
          )}

          {/* VALIDATION TAB */}
          {activeTab === 'validation' && (
            <ValidationEngine
              basicInfo={basicInfo}
              fields={fields}
              operations={operations}
              onNavigate={(location) => {
                // Handle navigation to error location
                if (location.startsWith('tab:')) {
                  const tab = location.split(':')[1];
                  setActiveTab(tab as TabType);
                } else if (location.startsWith('field:')) {
                  setActiveTab('fields');
                } else if (location.startsWith('operation:')) {
                  setActiveTab('operations');
                }
              }}
            />
          )}

          {/* VERSIONING TAB */}
          {activeTab === 'versioning' && (
            <GlassCard className="p-6">
              <div className="mb-6">
                <h2 className="text-lg text-slate-900 dark:text-white mb-2">Version Control</h2>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  Manage versions and publish this resource type
                </p>
              </div>

              <div className="space-y-6">
                {/* Current Version */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Version Number
                  </label>
                  <input
                    type="text"
                    value={versionInfo.version}
                    onChange={(e) => setVersionInfo({ ...versionInfo, version: e.target.value })}
                    placeholder="e.g., 1.0, 2.1"
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Changelog */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Changelog
                  </label>
                  <textarea
                    value={versionInfo.changelog}
                    onChange={(e) => setVersionInfo({ ...versionInfo, changelog: e.target.value })}
                    placeholder="What's new in this version?"
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Publish Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                    Publish Notes
                  </label>
                  <textarea
                    value={versionInfo.publishNotes}
                    onChange={(e) => setVersionInfo({ ...versionInfo, publishNotes: e.target.value })}
                    placeholder="Additional notes for this publication..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Status Control */}
                <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Publication Status
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {basicInfo.status === 'published' 
                        ? 'This resource type is live and available for projects' 
                        : 'This resource type is in draft mode'}
                    </div>
                  </div>
                  <Button
                    variant={basicInfo.status === 'published' ? 'outline' : 'default'}
                    onClick={() => setBasicInfo({ 
                      ...basicInfo, 
                      status: basicInfo.status === 'published' ? 'draft' : 'published' 
                    })}
                  >
                    {basicInfo.status === 'published' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                </div>

                {/* Version History (Mock) */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-white/70 mb-3">
                    Version History
                  </h3>
                  <div className="space-y-2">
                    {isEditMode ? (
                      <>
                        <div className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              v{resourceType?.version || '1.0'}
                            </div>
                            <Badge variant="success">Current</Badge>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Last modified: {resourceType?.lastModified || 'Unknown'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-white/40 text-sm">
                        No version history yet. Save to create first version.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Breaking Change Dialog */}
      {showBreakingChangeDialog && changeAnalysis && (
        <BreakingChangeDialog
          analysis={changeAnalysis}
          currentVersion={versionInfo.version}
          usedInProjects={resourceType?.usedInProjects || []}
          onConfirm={confirmPublish}
          onCancel={() => setShowBreakingChangeDialog(false)}
        />
      )}
    </div>
  );
}