import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, History, Link as LinkIcon, Play } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import type { ResourceInstance, ResourceType, OperationDefinition } from '../../types/resource';

interface InstanceDetailModalProps {
  instance: ResourceInstance;
  resourceType: ResourceType;
  mode: 'create' | 'edit' | 'view';
  onSave: (instance: ResourceInstance) => void;
  onClose: () => void;
  onExecuteOperation: (instance: ResourceInstance, operation: OperationDefinition) => void;
}

type TabMode = 'details' | 'history' | 'relationships';

export function InstanceDetailModal({ instance, resourceType, mode, onSave, onClose, onExecuteOperation }: InstanceDetailModalProps) {
  const [currentTab, setCurrentTab] = useState<TabMode>('details');
  const [formData, setFormData] = useState(instance.data);
  const [hasChanges, setHasChanges] = useState(false);

  const isReadOnly = mode === 'view';

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({
      ...instance,
      data: formData
    });
  };

  const publicOperations = resourceType.operations.filter(op => op.isPublic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl my-8"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{resourceType.icon}</div>
                <div>
                  <h2 className="text-slate-900 dark:text-white">
                    {mode === 'create' ? 'Create New Instance' : 'Resource Instance'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {resourceType.name} {instance.id && `• ${instance.id}`}
                  </p>
                </div>
              </div>
              {mode === 'view' && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Created: {new Date(instance.createdAt).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Updated: {new Date(instance.updatedAt).toLocaleDateString()}
                  </Badge>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-white/10">
            <button
              onClick={() => setCurrentTab('details')}
              className={`px-4 py-2 transition-all ${
                currentTab === 'details'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Details
            </button>
            {mode !== 'create' && (
              <>
                <button
                  onClick={() => setCurrentTab('history')}
                  className={`px-4 py-2 transition-all flex items-center gap-2 ${
                    currentTab === 'history'
                      ? 'text-purple-500 border-b-2 border-purple-500'
                      : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                  {instance.history.length > 0 && (
                    <Badge variant="outline" className="text-xs">{instance.history.length}</Badge>
                  )}
                </button>
                <button
                  onClick={() => setCurrentTab('relationships')}
                  className={`px-4 py-2 transition-all flex items-center gap-2 ${
                    currentTab === 'relationships'
                      ? 'text-purple-500 border-b-2 border-purple-500'
                      : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Relationships
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {currentTab === 'details' && (
              <div className="space-y-4">
                {resourceType.schema.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                      {field.displayName}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {isReadOnly ? (
                      <div className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-slate-900 dark:text-white">
                          {renderFieldValue(formData[field.internalName], field)}
                        </span>
                      </div>
                    ) : (
                      renderFieldInput(field, formData[field.internalName], handleFieldChange)
                    )}
                    
                    {field.helpText && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentTab === 'history' && (
              <div className="space-y-3">
                {instance.history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-white/60">No history yet</p>
                  </div>
                ) : (
                  instance.history.map(log => (
                    <div key={log.id} className="p-4 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Play className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-slate-900 dark:text-white">{log.operationName}</span>
                            <Badge variant={log.result === 'success' ? 'success' : 'destructive'} className="text-xs">
                              {log.result}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-white/60">
                            Executed by {log.executedBy} • {new Date(log.executedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {log.changes.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Changes:</p>
                          {log.changes.map((change, idx) => (
                            <div key={idx} className="text-xs font-mono bg-white dark:bg-white/10 p-2 rounded">
                              <span className="text-slate-600 dark:text-white/60">{change.field}:</span>{' '}
                              <span className="text-red-400">{String(change.oldValue)}</span>{' '}
                              → <span className="text-green-400">{String(change.newValue)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {log.errorMessage && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                          <p className="text-xs text-red-400">{log.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {currentTab === 'relationships' && (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-white/60">
                  Relationship management - Coming soon
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              {!isReadOnly && publicOperations.length > 0 && mode !== 'create' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-white/60">Operations:</span>
                  {publicOperations.map(op => (
                    <Button
                      key={op.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onExecuteOperation(instance, op);
                        onClose();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Play className="w-3 h-3" />
                      {op.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button onClick={handleSave} disabled={!hasChanges && mode !== 'create'}>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Instance' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

// Helper to render field values in read-only mode
function renderFieldValue(value: any, field: any): string {
  if (value === null || value === undefined) return '-';
  
  switch (field.type) {
    case 'boolean':
      return value ? '✓ Yes' : '✗ No';
    case 'date':
    case 'datetime':
      return new Date(value).toLocaleDateString();
    case 'enum':
      const option = field.enumOptions?.find((opt: any) => opt.value === value);
      return option?.label || value;
    default:
      return String(value);
  }
}

// Helper to render field inputs in edit mode
function renderFieldInput(field: any, value: any, onChange: (fieldName: string, value: any) => void) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(field.internalName, e.target.value)}
          placeholder={`Enter ${field.displayName.toLowerCase()}...`}
        />
      );
    
    case 'number':
      return (
        <Input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(field.internalName, Number(e.target.value))}
          min={field.numberConstraints?.min}
          max={field.numberConstraints?.max}
          step={field.numberConstraints?.step}
        />
      );
    
    case 'boolean':
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(field.internalName, e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-slate-900 dark:text-white">
            {value ? 'Yes' : 'No'}
          </span>
        </label>
      );
    
    case 'date':
    case 'datetime':
      return (
        <Input
          type={field.type === 'datetime' ? 'datetime-local' : 'date'}
          value={value || ''}
          onChange={(e) => onChange(field.internalName, e.target.value)}
        />
      );
    
    case 'enum':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(field.internalName, e.target.value)}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white"
        >
          <option value="">Select an option...</option>
          {field.enumOptions?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    
    default:
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(field.internalName, e.target.value)}
        />
      );
  }
}