import { useState } from 'react';
import { Plus, GripVertical, Edit, Trash2, Type, Hash, ToggleLeft, Calendar, List, Link } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import type { FieldSchema, FieldType } from '../../../types/resource';

interface SchemaBuilderProps {
  schema: FieldSchema[];
  onChange: (schema: FieldSchema[]) => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any; color: string }[] = [
  { type: 'text', label: 'Text', icon: Type, color: 'blue' },
  { type: 'number', label: 'Number', icon: Hash, color: 'green' },
  { type: 'boolean', label: 'Boolean', icon: ToggleLeft, color: 'purple' },
  { type: 'date', label: 'Date', icon: Calendar, color: 'orange' },
  { type: 'datetime', label: 'DateTime', icon: Calendar, color: 'red' },
  { type: 'enum', label: 'Enum', icon: List, color: 'yellow' },
  { type: 'relationship', label: 'Relationship', icon: Link, color: 'pink' }
];

export function SchemaBuilder({ schema, onChange }: SchemaBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<FieldSchema | null>(null);

  const handleAddField = (type: FieldType) => {
    const newField: FieldSchema = {
      id: `field-${Date.now()}`,
      type,
      displayName: `New ${type} Field`,
      internalName: `new_${type}_field`,
      required: false,
      unique: false,
      position: schema.length
    };

    setEditingField(newField);
    setShowFieldModal(true);
  };

  const handleEditField = (field: FieldSchema) => {
    setEditingField({ ...field });
    setShowFieldModal(true);
  };

  const handleSaveField = (field: FieldSchema) => {
    if (schema.find(f => f.id === field.id)) {
      // Update existing
      onChange(schema.map(f => f.id === field.id ? field : f));
    } else {
      // Add new
      onChange([...schema, field]);
    }
    setShowFieldModal(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      onChange(schema.filter(f => f.id !== fieldId));
    }
  };

  const handleReorderField = (fieldId: string, direction: 'up' | 'down') => {
    const index = schema.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= schema.length) return;

    const newSchema = [...schema];
    const [removed] = newSchema.splice(index, 1);
    newSchema.splice(newIndex, 0, removed);

    // Update positions
    newSchema.forEach((field, i) => {
      field.position = i;
    });

    onChange(newSchema);
  };

  const getFieldIcon = (type: FieldType) => {
    return FIELD_TYPES.find(ft => ft.type === type)?.icon || Type;
  };

  const getFieldColor = (type: FieldType) => {
    return FIELD_TYPES.find(ft => ft.type === type)?.color || 'slate';
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Field Type Toolbox */}
      <div className="col-span-12 lg:col-span-3">
        <GlassCard className="p-4 sticky top-4">
          <h3 className="text-sm text-slate-600 dark:text-white/60 mb-4">Field Types</h3>
          <div className="space-y-2">
            {FIELD_TYPES.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.type}
                  onClick={() => handleAddField(fieldType.type)}
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded bg-${fieldType.color}-500/20 group-hover:bg-${fieldType.color}-500/30 transition-colors`}>
                      <Icon className={`w-4 h-4 text-${fieldType.color}-400`} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-900 dark:text-white">{fieldType.label}</div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {fieldType.type}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              Drag field types onto the canvas or click to add
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Center: Schema Canvas */}
      <div className="col-span-12 lg:col-span-9">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 dark:text-white">Schema Definition</h2>
            <Badge variant="outline">
              {schema.length} field{schema.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {schema.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg">
              <Type className="w-16 h-16 text-slate-400 dark:text-white/40 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-white/60 mb-4">
                No fields defined yet. Add your first field to get started.
              </p>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Click a field type from the left panel to add it
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schema.map((field, index) => {
                const Icon = getFieldIcon(field.type);
                const color = getFieldColor(field.type);

                return (
                  <motion.div
                    key={field.id}
                    layout
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer group
                      ${selectedFieldId === field.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-purple-500/50'
                      }
                    `}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderField(field.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4 text-slate-600 dark:text-white/60" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderField(field.id, 'down');
                          }}
                          disabled={index === schema.length - 1}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4 text-slate-600 dark:text-white/60 rotate-180" />
                        </button>
                      </div>

                      {/* Field Icon */}
                      <div className={`p-2 rounded bg-${color}-500/20`}>
                        <Icon className={`w-5 h-5 text-${color}-400`} />
                      </div>

                      {/* Field Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-900 dark:text-white">
                            {field.displayName}
                          </span>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          {field.unique && (
                            <Badge variant="info" className="text-xs">Unique</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          <code>{field.internalName}</code> • {field.type}
                        </div>
                        {field.helpText && (
                          <p className="text-xs text-slate-600 dark:text-white/60 mt-1">
                            {field.helpText}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditField(field);
                          }}
                          className="p-2 hover:bg-blue-500/20 rounded"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Field Configuration Modal */}
      {showFieldModal && editingField && (
        <FieldConfigModal
          field={editingField}
          onSave={handleSaveField}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
}

// Field Configuration Modal
interface FieldConfigModalProps {
  field: FieldSchema;
  onSave: (field: FieldSchema) => void;
  onClose: () => void;
}

function FieldConfigModal({ field, onSave, onClose }: FieldConfigModalProps) {
  const [formData, setFormData] = useState(field);

  const updateField = (updates: Partial<FieldSchema>) => {
    setFormData({ ...formData, ...updates });
  };

  const generateInternalName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleDisplayNameChange = (displayName: string) => {
    updateField({
      displayName,
      internalName: generateInternalName(displayName)
    });
  };

  const handleSave = () => {
    if (!formData.displayName) {
      alert('Display name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <h2 className="text-slate-900 dark:text-white mb-6">
            Configure {FIELD_TYPES.find(ft => ft.type === field.type)?.label} Field
          </h2>

          <div className="space-y-4 mb-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="e.g., Equipment Name"
                className="w-full"
              />
            </div>

            {/* Internal Name (Auto-generated) */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Internal Name (Auto-generated)
              </label>
              <div className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <code className="text-sm text-purple-500">{formData.internalName}</code>
              </div>
            </div>

            {/* Help Text */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Help Text (Optional)
              </label>
              <textarea
                value={formData.helpText || ''}
                onChange={(e) => updateField({ helpText: e.target.value })}
                placeholder="Provide guidance for users..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 resize-none"
              />
            </div>

            {/* Validation Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => updateField({ required: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-900 dark:text-white">Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.unique}
                  onChange={(e) => updateField({ unique: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-900 dark:text-white">Unique</span>
              </label>
            </div>

            {/* Type-specific configurations */}
            {field.type === 'text' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-3">Text Constraints</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">Min Length</label>
                    <Input
                      type="number"
                      value={formData.textConstraints?.minLength || ''}
                      onChange={(e) => updateField({
                        textConstraints: { ...formData.textConstraints, minLength: Number(e.target.value) }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">Max Length</label>
                    <Input
                      type="number"
                      value={formData.textConstraints?.maxLength || ''}
                      onChange={(e) => updateField({
                        textConstraints: { ...formData.textConstraints, maxLength: Number(e.target.value) }
                      })}
                      placeholder="255"
                    />
                  </div>
                </div>
              </div>
            )}

            {field.type === 'enum' && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="text-sm text-yellow-400 mb-3">Enum Options</h4>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Option builder - Coming soon
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Field
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}