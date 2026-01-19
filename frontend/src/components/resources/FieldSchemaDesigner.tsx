import { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  Calculator,
  Link2,
  Info,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'motion/react';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customError?: string;
  allowNegative?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface AutoGenConfig {
  pattern: string;
  startNumber: number;
  padding: number;
  resetFrequency: 'never' | 'yearly' | 'monthly';
  transform: 'uppercase' | 'lowercase' | 'none';
}

export interface EnumValue {
  internal: string;
  label: string;
  color?: string;
}

export interface RelationshipConfig {
  targetType: string;
  cardinality: '1:1' | '1:N' | 'N:N';
  filter?: string;
}

export interface Field {
  id: string;
  name: string;
  internalName: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'enum' | 'formula' | 'relationship';
  required: boolean;
  unique: boolean;
  helpText?: string;
  defaultValue?: string;
  
  // Type-specific configs
  validation?: FieldValidation;
  autoGen?: AutoGenConfig;
  enumValues?: EnumValue[];
  enumStyle?: 'dropdown' | 'radio' | 'badge';
  formula?: string;
  relationship?: RelationshipConfig;
  
  // UI state
  precision?: number; // For number type
  unit?: string; // For number type
  dateMode?: 'date' | 'datetime'; // For date type
  booleanStyle?: 'checkbox' | 'switch' | 'toggle';
  textFormat?: 'single' | 'multi';
}

interface FieldSchemaDesignerProps {
  fields: Field[];
  onChange: (fields: Field[]) => void;
  resourceTypes?: Array<{ id: string; name: string }>; // For relationship targets
}

export function FieldSchemaDesigner({ fields, onChange, resourceTypes = [] }: FieldSchemaDesignerProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(true);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const fieldTypePalette = [
    { type: 'text', label: 'Text', icon: Type, color: 'bg-blue-500' },
    { type: 'number', label: 'Number', icon: Hash, color: 'bg-green-500' },
    { type: 'date', label: 'Date', icon: Calendar, color: 'bg-amber-500' },
    { type: 'datetime', label: 'DateTime', icon: Calendar, color: 'bg-amber-600' },
    { type: 'boolean', label: 'Boolean', icon: ToggleLeft, color: 'bg-purple-500' },
    { type: 'enum', label: 'Enum', icon: List, color: 'bg-purple-500' },
    { type: 'formula', label: 'Formula', icon: Calculator, color: 'bg-yellow-500' },
    { type: 'relationship', label: 'Relationship', icon: Link2, color: 'bg-blue-500' }
  ];

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const addField = (type: Field['type']) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      internalName: '',
      type,
      required: false,
      unique: false
    };
    
    newField.internalName = slugify(newField.name);
    
    // Set defaults based on type
    if (type === 'text') {
      newField.textFormat = 'single';
    } else if (type === 'number') {
      newField.precision = 0;
      newField.validation = { allowNegative: true };
    } else if (type === 'datetime') {
      newField.dateMode = 'datetime';
    } else if (type === 'date') {
      newField.dateMode = 'date';
    } else if (type === 'boolean') {
      newField.booleanStyle = 'checkbox';
    } else if (type === 'enum') {
      newField.enumStyle = 'dropdown';
      newField.enumValues = [];
    } else if (type === 'relationship' && resourceTypes.length > 0) {
      newField.relationship = {
        targetType: resourceTypes[0].id,
        cardinality: '1:1'
      };
    }

    const newFields = [...fields, newField];
    onChange(newFields);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    const newFields = fields.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...updates };
        // Auto-update internal name if name changes
        if (updates.name && !updates.internalName) {
          updated.internalName = slugify(updates.name);
        }
        return updated;
      }
      return f;
    });
    onChange(newFields);
  };

  const deleteField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    onChange(newFields);
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange(newFields);
  };

  const validateAutoGenPattern = (pattern: string): { valid: boolean; preview: string; error?: string } => {
    try {
      // Replace placeholders with examples
      let preview = pattern
        .replace(/{YYYY}/g, '2025')
        .replace(/{YY}/g, '25')
        .replace(/{MM}/g, '01')
        .replace(/{DD}/g, '15')
        .replace(/{####}/g, '0001')
        .replace(/{###}/g, '001')
        .replace(/{##}/g, '01')
        .replace(/{VAR1}/g, 'VAL1')
        .replace(/{VAR2}/g, 'VAL2');
      
      return { valid: true, preview };
    } catch (error) {
      return { valid: false, preview: '', error: 'Invalid pattern' };
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[600px]">
      {/* PANEL 1: PALETTE (Left - Collapsible) */}
      <div className={`${showPalette ? 'col-span-2' : 'col-span-1'} transition-all`}>
        <GlassCard className="p-4 h-full">
          {showPalette ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Field Types</h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {fieldTypePalette.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => addField(item.type as Field['type'])}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500 transition-all group"
                    >
                      <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-white/70 group-hover:text-purple-500">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowPalette(true)}
              className="w-full p-2 text-slate-400 hover:text-purple-500 transition-all"
            >
              <ChevronDown className="w-4 h-4 mx-auto" />
            </button>
          )}
        </GlassCard>
      </div>

      {/* PANEL 2: FIELD LIST (Middle) */}
      <div className="col-span-4">
        <GlassCard className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Fields ({fields.length})
            </h3>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {fields.map((field, index) => {
                const typeInfo = fieldTypePalette.find(t => t.type === field.type);
                const Icon = typeInfo?.icon || Type;
                const isSelected = selectedFieldId === field.id;

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-purple-500/50'
                    }`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, 'up');
                          }}
                          disabled={index === 0}
                          className="text-slate-400 hover:text-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, 'down');
                          }}
                          disabled={index === fields.length - 1}
                          className="text-slate-400 hover:text-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Field Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 ${typeInfo?.color} rounded flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {field.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs text-slate-500 dark:text-white/40 font-mono">
                            {field.internalName}
                          </code>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs py-0 px-1">Required</Badge>
                          )}
                          {field.unique && (
                            <Badge variant="default" className="text-xs py-0 px-1">Unique</Badge>
                          )}
                          {field.autoGen && (
                            <Badge variant="success" className="text-xs py-0 px-1 flex items-center gap-1">
                              <Sparkles className="w-2 h-2" />
                              Auto
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {fields.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-white/40">
                <Plus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click a field type to add</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* PANEL 3: CONFIGURATION (Right) */}
      <div className="col-span-6">
        <GlassCard className="p-6 h-full overflow-y-auto">
          {selectedField ? (
            <FieldConfigPanel
              field={selectedField}
              onUpdate={(updates) => updateField(selectedField.id, updates)}
              allFields={fields}
              resourceTypes={resourceTypes}
              validateAutoGenPattern={validateAutoGenPattern}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-white/40">
              <div className="text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select a field to configure</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// FIELD CONFIGURATION PANEL
interface FieldConfigPanelProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  allFields: Field[];
  resourceTypes: Array<{ id: string; name: string }>;
  validateAutoGenPattern: (pattern: string) => { valid: boolean; preview: string; error?: string };
}

function FieldConfigPanel({ field, onUpdate, allFields, resourceTypes, validateAutoGenPattern }: FieldConfigPanelProps) {
  const [showAutoGen, setShowAutoGen] = useState(!!field.autoGen);

  const autoGenPreview = field.autoGen ? validateAutoGenPattern(field.autoGen.pattern) : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
          Field Configuration
        </h3>
        <p className="text-sm text-slate-600 dark:text-white/60">
          Configure {field.name} ({field.type})
        </p>
      </div>

      {/* BASIC SETTINGS */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Internal Name (Slug) *
          </label>
          <input
            type="text"
            value={field.internalName}
            onChange={(e) => onUpdate({ internalName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
          />
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
            Used in database and API. Must be unique and lowercase.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Help Text
          </label>
          <textarea
            value={field.helpText || ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
            placeholder="Guidance for users filling this field..."
            rows={2}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-white/70">Required</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.unique}
              onChange={(e) => onUpdate({ unique: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-white/70">Unique</span>
          </label>
        </div>
      </div>

      {/* TYPE-SPECIFIC CONFIGURATION */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
          Type-Specific Settings
        </h4>

        {/* TEXT TYPE */}
        {field.type === 'text' && (
          <TextFieldConfig field={field} onUpdate={onUpdate} showAutoGen={showAutoGen} setShowAutoGen={setShowAutoGen} autoGenPreview={autoGenPreview} />
        )}

        {/* NUMBER TYPE */}
        {field.type === 'number' && (
          <NumberFieldConfig field={field} onUpdate={onUpdate} />
        )}

        {/* DATE/DATETIME TYPE */}
        {(field.type === 'date' || field.type === 'datetime') && (
          <DateFieldConfig field={field} onUpdate={onUpdate} />
        )}

        {/* BOOLEAN TYPE */}
        {field.type === 'boolean' && (
          <BooleanFieldConfig field={field} onUpdate={onUpdate} />
        )}

        {/* ENUM TYPE */}
        {field.type === 'enum' && (
          <EnumFieldConfig field={field} onUpdate={onUpdate} />
        )}

        {/* FORMULA TYPE */}
        {field.type === 'formula' && (
          <FormulaFieldConfig field={field} onUpdate={onUpdate} allFields={allFields} />
        )}

        {/* RELATIONSHIP TYPE */}
        {field.type === 'relationship' && (
          <RelationshipFieldConfig field={field} onUpdate={onUpdate} resourceTypes={resourceTypes} />
        )}
      </div>
    </div>
  );
}

// TYPE-SPECIFIC CONFIG COMPONENTS
function TextFieldConfig({ field, onUpdate, showAutoGen, setShowAutoGen, autoGenPreview }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Format
        </label>
        <select
          value={field.textFormat || 'single'}
          onChange={(e) => onUpdate({ textFormat: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="single">Single Line</option>
          <option value="multi">Multi-line</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={showAutoGen}
            onChange={(e) => {
              setShowAutoGen(e.target.checked);
              if (!e.target.checked) {
                onUpdate({ autoGen: undefined });
              } else {
                onUpdate({
                  autoGen: {
                    pattern: '{YYYY}-{####}',
                    startNumber: 1,
                    padding: 4,
                    resetFrequency: 'never',
                    transform: 'uppercase'
                  }
                });
              }
            }}
            className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-white/70 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Auto-Generate Pattern
          </span>
        </label>

        {showAutoGen && field.autoGen && (
          <div className="space-y-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-white/70 mb-1">
                Pattern *
              </label>
              <input
                type="text"
                value={field.autoGen.pattern}
                onChange={(e) => onUpdate({ autoGen: { ...field.autoGen, pattern: e.target.value } })}
                placeholder="e.g., EQ-{YYYY}-{####}"
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
              />
              <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                Placeholders: {'{YYYY}'}, {'{YY}'}, {'{MM}'}, {'{DD}'}, {'{####}'}
              </p>
            </div>

            {autoGenPreview && (
              <div className={`p-2 rounded border ${autoGenPreview.valid ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {autoGenPreview.valid ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-xs font-medium text-slate-700 dark:text-white/70">
                    {autoGenPreview.valid ? 'Preview' : 'Error'}
                  </span>
                </div>
                <code className="text-xs font-mono text-slate-900 dark:text-white">
                  {autoGenPreview.preview || autoGenPreview.error}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-white/70 mb-1">
                  Start Number
                </label>
                <input
                  type="number"
                  value={field.autoGen.startNumber}
                  onChange={(e) => onUpdate({ autoGen: { ...field.autoGen, startNumber: parseInt(e.target.value) || 1 } })}
                  className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-white/70 mb-1">
                  Padding
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={field.autoGen.padding}
                  onChange={(e) => onUpdate({ autoGen: { ...field.autoGen, padding: parseInt(e.target.value) || 4 } })}
                  className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-white/70 mb-1">
                Reset Frequency
              </label>
              <select
                value={field.autoGen.resetFrequency}
                onChange={(e) => onUpdate({ autoGen: { ...field.autoGen, resetFrequency: e.target.value } })}
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              >
                <option value="never">Never</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Validation Pattern (Regex)
        </label>
        <input
          type="text"
          value={field.validation?.pattern || ''}
          onChange={(e) => onUpdate({ validation: { ...field.validation, pattern: e.target.value } })}
          placeholder="e.g., ^[A-Z]{2}-[0-9]{4}$"
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Min Length
          </label>
          <input
            type="number"
            value={field.validation?.min || ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, min: parseInt(e.target.value) || undefined } })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Max Length
          </label>
          <input
            type="number"
            value={field.validation?.max || ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, max: parseInt(e.target.value) || undefined } })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}

function NumberFieldConfig({ field, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Precision
        </label>
        <select
          value={field.precision || 0}
          onChange={(e) => onUpdate({ precision: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="0">Integer</option>
          <option value="1">1 decimal place</option>
          <option value="2">2 decimal places</option>
          <option value="3">3 decimal places</option>
          <option value="4">4 decimal places</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Unit
        </label>
        <input
          type="text"
          value={field.unit || ''}
          onChange={(e) => onUpdate({ unit: e.target.value })}
          placeholder="e.g., $, kg, m, etc."
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Min Value
          </label>
          <input
            type="number"
            value={field.validation?.min ?? ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, min: e.target.value ? parseFloat(e.target.value) : undefined } })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Max Value
          </label>
          <input
            type="number"
            value={field.validation?.max ?? ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, max: e.target.value ? parseFloat(e.target.value) : undefined } })}
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={field.validation?.allowNegative !== false}
          onChange={(e) => onUpdate({ validation: { ...field.validation, allowNegative: e.target.checked } })}
          className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
        />
        <span className="text-sm text-slate-700 dark:text-white/70">Allow Negative Values</span>
      </label>
    </div>
  );
}

function DateFieldConfig({ field, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Mode
        </label>
        <select
          value={field.dateMode || 'date'}
          onChange={(e) => onUpdate({ dateMode: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="date">Date Only</option>
          <option value="datetime">Date & Time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Min Date
          </label>
          <input
            type="text"
            value={field.validation?.minDate || ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, minDate: e.target.value } })}
            placeholder="TODAY() or 2025-01-01"
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
            Max Date
          </label>
          <input
            type="text"
            value={field.validation?.maxDate || ''}
            onChange={(e) => onUpdate({ validation: { ...field.validation, maxDate: e.target.value } })}
            placeholder="TODAY() + 1 YEAR"
            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}

function BooleanFieldConfig({ field, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Display Style
        </label>
        <select
          value={field.booleanStyle || 'checkbox'}
          onChange={(e) => onUpdate({ booleanStyle: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="checkbox">Checkbox</option>
          <option value="switch">Switch</option>
          <option value="toggle">Toggle</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Default Value
        </label>
        <select
          value={field.defaultValue || 'false'}
          onChange={(e) => onUpdate({ defaultValue: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      </div>
    </div>
  );
}

function EnumFieldConfig({ field, onUpdate }: any) {
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#8B5CF6');

  const addEnumValue = () => {
    if (!newValue || !newLabel) return;

    const enumValues = field.enumValues || [];
    const updated = [
      ...enumValues,
      { internal: newValue, label: newLabel, color: newColor }
    ];
    onUpdate({ enumValues: updated });
    setNewValue('');
    setNewLabel('');
    setNewColor('#8B5CF6');
  };

  const removeEnumValue = (internal: string) => {
    const updated = (field.enumValues || []).filter((v: EnumValue) => v.internal !== internal);
    onUpdate({ enumValues: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Display Style
        </label>
        <select
          value={field.enumStyle || 'dropdown'}
          onChange={(e) => onUpdate({ enumStyle: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="dropdown">Dropdown</option>
          <option value="radio">Radio Buttons</option>
          <option value="badge">Badge Selector</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Enum Values
        </label>

        <div className="space-y-2 mb-3">
          {(field.enumValues || []).map((val: EnumValue) => (
            <div key={val.internal} className="flex items-center gap-2 p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: val.color || '#8B5CF6' }} />
              <code className="text-xs font-mono text-slate-600 dark:text-white/60">{val.internal}</code>
              <span className="text-sm text-slate-900 dark:text-white flex-1">{val.label}</span>
              <button
                onClick={() => removeEnumValue(val.internal)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="internal_value"
            className="col-span-4 px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Display Label"
            className="col-span-5 px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="col-span-2 h-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer"
          />
          <button
            onClick={addEnumValue}
            className="col-span-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormulaFieldConfig({ field, onUpdate, allFields }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Formula Expression
        </label>
        <textarea
          value={field.formula || ''}
          onChange={(e) => onUpdate({ formula: e.target.value })}
          placeholder="e.g., {quantity} * {unit_price}"
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono resize-none"
        />
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs font-medium text-slate-700 dark:text-white/70 mb-2">Available Fields:</p>
        <div className="flex flex-wrap gap-2">
          {allFields
            .filter((f: Field) => f.id !== field.id && (f.type === 'number' || f.type === 'formula'))
            .map((f: Field) => (
              <code key={f.id} className="text-xs bg-white dark:bg-white/10 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                {'{' + f.internalName + '}'}
              </code>
            ))}
        </div>
      </div>
    </div>
  );
}

function RelationshipFieldConfig({ field, onUpdate, resourceTypes }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Target Resource Type
        </label>
        <select
          value={field.relationship?.targetType || ''}
          onChange={(e) => onUpdate({ relationship: { ...field.relationship, targetType: e.target.value } })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="">Select target...</option>
          {resourceTypes.map((rt: any) => (
            <option key={rt.id} value={rt.id}>{rt.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Cardinality
        </label>
        <select
          value={field.relationship?.cardinality || '1:1'}
          onChange={(e) => onUpdate({ relationship: { ...field.relationship, cardinality: e.target.value } })}
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
        >
          <option value="1:1">One-to-One (1:1)</option>
          <option value="1:N">One-to-Many (1:N)</option>
          <option value="N:N">Many-to-Many (N:N)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
          Filter (Optional)
        </label>
        <input
          type="text"
          value={field.relationship?.filter || ''}
          onChange={(e) => onUpdate({ relationship: { ...field.relationship, filter: e.target.value } })}
          placeholder="e.g., status = 'active'"
          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
        />
      </div>
    </div>
  );
}