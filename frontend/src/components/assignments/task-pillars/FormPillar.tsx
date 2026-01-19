import { useState } from 'react';
import { LayoutGrid, Plus, Trash2, GripVertical, Camera, FileText, Calendar, CheckSquare, List, Hash, Upload, Grid3x3, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import type { TaskForm, FormField, FormFieldType, BatchConfig } from '../../../types/assignment';

interface FormPillarProps {
  form: TaskForm;
  onChange: (form: TaskForm) => void;
}

// Field Type Templates
const FIELD_TYPES: Array<{ type: FormFieldType; label: string; icon: any; description: string }> = [
  { type: 'text', label: 'Text Input', icon: FileText, description: 'Single line text' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Select from options' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Yes/No toggle' },
  { type: 'camera', label: 'Camera', icon: Camera, description: 'Take photo' },
  { type: 'file', label: 'File Upload', icon: Upload, description: 'Upload files' },
  { type: 'batch', label: 'Batch Processing', icon: Grid3x3, description: 'Repeat fields per item' }
];

export function FormPillar({ form, onChange }: FormPillarProps) {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleAddField = (type: FormFieldType) => {
    if (type === 'batch') {
      setShowBatchModal(true);
      return;
    }

    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${FIELD_TYPES.find(f => f.type === type)?.label}`,
      required: false,
      ...(type === 'select' && { options: [{ label: 'Option 1', value: 'opt1' }] })
    };

    onChange({
      ...form,
      fields: [...form.fields, newField]
    });
  };

  const handleAddBatchField = (batchConfig: BatchConfig) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'batch',
      label: `Batch: ${batchConfig.itemName}`,
      required: false,
      batchConfig
    };

    onChange({
      ...form,
      fields: [...form.fields, newField]
    });
    setShowBatchModal(false);
  };

  const handleRemoveField = (id: string) => {
    onChange({
      ...form,
      fields: form.fields.filter(f => f.id !== id)
    });
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    onChange({
      ...form,
      fields: form.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = form.fields.findIndex(f => f.id === active.id);
      const newIndex = form.fields.findIndex(f => f.id === over.id);

      onChange({
        ...form,
        fields: arrayMove(form.fields, oldIndex, newIndex)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
        <p className="text-sm text-slate-600 dark:text-white/60">
          <strong className="text-emerald-600 dark:text-emerald-400">Form Pillar</strong> defines the user interface that contributors interact with. Build a dynamic form by dragging field types from the left panel to the canvas.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel: Field Types */}
        <div className="col-span-3">
          <GlassCard className="p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-5 h-5 text-emerald-500" />
              <h3 className="text-slate-900 dark:text-white">Field Types</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-white/60 mb-4">
              Click to add field to form
            </p>

            <div className="space-y-2">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    onClick={() => handleAddField(fieldType.type)}
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-900 dark:text-white">
                        {fieldType.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-white/60">
                      {fieldType.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Form Canvas */}
        <div className="col-span-9">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-500" />
                <h3 className="text-slate-900 dark:text-white">Form Builder</h3>
                <Badge variant="outline">{form.fields.length} fields</Badge>
              </div>

              {/* Layout Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-white/60">Layout:</span>
                <select
                  value={form.layout}
                  onChange={(e) => onChange({ ...form, layout: e.target.value as TaskForm['layout'] })}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            </div>

            {form.fields.length === 0 ? (
              // Empty State
              <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-lg">
                <LayoutGrid className="w-16 h-16 text-slate-300 dark:text-white/20 mx-auto mb-4" />
                <h4 className="text-slate-900 dark:text-white mb-2">No Fields Yet</h4>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  Click on field types from the left panel to add them
                </p>
              </div>
            ) : (
              // Form Fields (Sortable)
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {form.fields.map((field, index) => (
                      <SortableFormField
                        key={field.id}
                        field={field}
                        index={index}
                        onRemove={() => handleRemoveField(field.id)}
                        onUpdate={(updates) => handleUpdateField(field.id, updates)}
                        isEditing={editingFieldId === field.id}
                        onEdit={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Batch Configuration Modal */}
      {showBatchModal && (
        <BatchConfigModal
          onClose={() => setShowBatchModal(false)}
          onSave={handleAddBatchField}
        />
      )}
    </div>
  );
}

// Sortable Form Field Component
interface SortableFormFieldProps {
  field: FormField;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  isEditing: boolean;
  onEdit: () => void;
}

function SortableFormField({ field, index, onRemove, onUpdate, isEditing, onEdit }: SortableFormFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const fieldTypeMeta = FIELD_TYPES.find(f => f.type === field.type);
  const Icon = fieldTypeMeta?.icon || FileText;

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className="p-4 hover:border-emerald-500/50 transition-all">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Field Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                <Icon className="w-3 h-3 mr-1" />
                {fieldTypeMeta?.label}
              </Badge>
              {field.required && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {!isEditing ? (
              <div>
                <h4 className="text-sm text-slate-900 dark:text-white mb-1">
                  {field.label}
                </h4>
                {field.placeholder && (
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    Placeholder: {field.placeholder}
                  </p>
                )}
                {field.type === 'batch' && field.batchConfig && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-white/5 rounded text-xs">
                    <div>Item: {field.batchConfig.itemName}</div>
                    <div>Quantity: {field.batchConfig.quantityType === 'fixed' ? `Fixed (${field.batchConfig.fixedQuantity})` : 'Manual'}</div>
                    <div>Sub-fields: {field.batchConfig.subFields.length}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Field label"
                  className="text-sm"
                />
                {field.type !== 'checkbox' && field.type !== 'batch' && (
                  <Input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                    placeholder="Placeholder text"
                    className="text-sm"
                  />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`req-${field.id}`}
                    checked={field.required}
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor={`req-${field.id}`} className="text-xs text-slate-900 dark:text-white">
                    Required field
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all text-xs"
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Batch Config Modal
interface BatchConfigModalProps {
  onClose: () => void;
  onSave: (config: BatchConfig) => void;
}

function BatchConfigModal({ onClose, onSave }: BatchConfigModalProps) {
  const [config, setConfig] = useState<BatchConfig>({
    itemName: '',
    quantityType: 'manual',
    subFields: []
  });

  const handleAddSubField = (type: FormFieldType) => {
    if (type === 'batch') return; // Prevent nested batch

    const newField: FormField = {
      id: `subfield-${Date.now()}`,
      type,
      label: `${FIELD_TYPES.find(f => f.type === type)?.label}`,
      required: false
    };

    setConfig({
      ...config,
      subFields: [...config.subFields, newField]
    });
  };

  const handleRemoveSubField = (id: string) => {
    setConfig({
      ...config,
      subFields: config.subFields.filter(f => f.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.itemName || config.subFields.length === 0) {
      alert('Please provide item name and at least one sub-field');
      return;
    }
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-slate-900 dark:text-white">Batch Processing Configuration</h3>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Create repeating form fields for batch data entry
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm text-slate-900 dark:text-white">Item Configuration</h4>
              
              <div>
                <label className="block text-sm text-slate-900 dark:text-white mb-2">
                  Item Name *
                </label>
                <Input
                  type="text"
                  value={config.itemName}
                  onChange={(e) => setConfig({ ...config, itemName: e.target.value })}
                  placeholder="e.g., Room, Product, Task"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                  What are you collecting data for?
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-900 dark:text-white mb-2">
                  Quantity Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, quantityType: 'manual' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.quantityType === 'manual'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="text-sm text-slate-900 dark:text-white mb-1">Manual</div>
                    <div className="text-xs text-slate-600 dark:text-white/60">User decides quantity</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, quantityType: 'fixed', fixedQuantity: 1 })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.quantityType === 'fixed'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="text-sm text-slate-900 dark:text-white mb-1">Fixed</div>
                    <div className="text-xs text-slate-600 dark:text-white/60">Predetermined count</div>
                  </button>
                </div>
              </div>

              {config.quantityType === 'fixed' && (
                <div>
                  <label className="block text-sm text-slate-900 dark:text-white mb-2">
                    Fixed Quantity
                  </label>
                  <Input
                    type="number"
                    value={config.fixedQuantity || 1}
                    onChange={(e) => setConfig({ ...config, fixedQuantity: Number(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
              )}
            </div>

            {/* Sub-Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-slate-900 dark:text-white">Per-Item Fields *</h4>
                <Badge variant="outline">{config.subFields.length} fields</Badge>
              </div>

              {/* Add Sub-Field Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {FIELD_TYPES.filter(f => f.type !== 'batch').slice(0, 6).map((fieldType) => {
                  const Icon = fieldType.icon;
                  return (
                    <button
                      key={fieldType.type}
                      type="button"
                      onClick={() => handleAddSubField(fieldType.type)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-900 dark:text-white">
                          {fieldType.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Fields List */}
              {config.subFields.length > 0 && (
                <div className="space-y-2">
                  {config.subFields.map((field) => {
                    const fieldTypeMeta = FIELD_TYPES.find(f => f.type === field.type);
                    const Icon = fieldTypeMeta?.icon || FileText;
                    
                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-slate-900 dark:text-white">
                            {field.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubField(field.id)}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                disabled={!config.itemName || config.subFields.length === 0}
              >
                Add Batch Field
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}