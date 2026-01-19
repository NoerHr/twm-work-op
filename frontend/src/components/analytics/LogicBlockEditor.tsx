import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { LocalValue, LogicBlockRoot, OperatorType } from '../../types/indicator';

interface LogicBlockEditorProps {
  value?: LogicBlockRoot;
  availableValues: LocalValue[];
  onChange: (formula: LogicBlockRoot) => void;
}

export function LogicBlockEditor({ value, availableValues, onChange }: LogicBlockEditorProps) {
  const operators: { id: OperatorType; label: string; category: 'math' | 'logic' | 'aggregate' }[] = [
    // Math
    { id: 'add', label: 'Add (+)', category: 'math' },
    { id: 'subtract', label: 'Subtract (-)', category: 'math' },
    { id: 'multiply', label: 'Multiply (×)', category: 'math' },
    { id: 'divide', label: 'Divide (÷)', category: 'math' },
    
    // Logic
    { id: 'equals', label: 'Equals (=)', category: 'logic' },
    { id: 'greaterThan', label: 'Greater Than (>)', category: 'logic' },
    { id: 'lessThan', label: 'Less Than (<)', category: 'logic' },
    { id: 'and', label: 'AND', category: 'logic' },
    { id: 'or', label: 'OR', category: 'logic' },
    { id: 'if', label: 'IF', category: 'logic' },
    
    // Aggregate
    { id: 'sum', label: 'SUM', category: 'aggregate' },
    { id: 'average', label: 'AVERAGE', category: 'aggregate' },
    { id: 'count', label: 'COUNT', category: 'aggregate' },
    { id: 'min', label: 'MIN', category: 'aggregate' },
    { id: 'max', label: 'MAX', category: 'aggregate' }
  ];

  const [formula, setFormula] = useState<LogicBlockRoot>(
    value || { operator: 'add', operands: [] }
  );

  const handleOperatorChange = (operator: OperatorType) => {
    const updated = { ...formula, operator };
    setFormula(updated);
    onChange(updated);
  };

  const handleAddOperand = () => {
    const updated = { ...formula, operands: [...formula.operands, ''] };
    setFormula(updated);
    onChange(updated);
  };

  const handleOperandChange = (index: number, value: string | number) => {
    const updated = {
      ...formula,
      operands: formula.operands.map((op, i) => (i === index ? value : op))
    };
    setFormula(updated);
    onChange(updated);
  };

  const handleRemoveOperand = (index: number) => {
    const updated = {
      ...formula,
      operands: formula.operands.filter((_, i) => i !== index)
    };
    setFormula(updated);
    onChange(updated);
  };

  const getOperatorColor = (category: string) => {
    switch (category) {
      case 'math':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
      case 'logic':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
      case 'aggregate':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400';
    }
  };

  const selectedOperator = operators.find(op => op.id === formula.operator);

  return (
    <div className="space-y-4">
      {/* Operator Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Operator
        </label>
        <select
          value={formula.operator}
          onChange={(e) => handleOperatorChange(e.target.value as OperatorType)}
          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <optgroup label="Math Operations">
            {operators.filter(op => op.category === 'math').map(op => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </optgroup>
          <optgroup label="Logic Operations">
            {operators.filter(op => op.category === 'logic').map(op => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </optgroup>
          <optgroup label="Aggregate Functions">
            {operators.filter(op => op.category === 'aggregate').map(op => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Visual Block Representation */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/10">
        <div className="flex items-start gap-3">
          {/* Operator Block */}
          <div className={`px-4 py-2 rounded-lg border-2 font-mono text-sm font-semibold ${getOperatorColor(selectedOperator?.category || 'math')}`}>
            {selectedOperator?.label.toUpperCase()}
          </div>

          {/* Operands */}
          <div className="flex-1 space-y-2">
            {formula.operands.map((operand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex-1">
                  <select
                    value={typeof operand === 'string' ? operand : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Check if it's a number
                      if (!isNaN(Number(val)) && val !== '') {
                        handleOperandChange(index, Number(val));
                      } else {
                        handleOperandChange(index, val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg text-sm text-blue-600 dark:text-blue-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select value or enter number</option>
                    <optgroup label="Available Values">
                      {availableValues.map(v => (
                        <option key={v.key} value={v.key}>{v.label} ({v.key})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Constants">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="100">100</option>
                    </optgroup>
                  </select>
                </div>
                <button
                  onClick={() => handleRemoveOperand(index)}
                  className="p-2 hover:bg-red-500/10 text-red-600 rounded transition-all"
                  title="Remove operand"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {/* Add Operand Button */}
            <button
              onClick={handleAddOperand}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Operand
            </button>
          </div>
        </div>
      </div>

      {/* Formula Preview */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Formula Preview:</p>
        <code className="text-sm text-slate-900 dark:text-white font-mono">
          {formula.operator}({formula.operands.map((op, i) => (
            typeof op === 'string' ? op : op
          )).join(', ')})
        </code>
      </div>

      {/* Helper Text */}
      <div className="flex gap-2 text-xs">
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
          Math
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
          Logic
        </Badge>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          Aggregate
        </Badge>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          Values
        </Badge>
      </div>

      {/* Example Formulas */}
      <details className="text-sm">
        <summary className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          Show example formulas
        </summary>
        <div className="mt-2 space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="font-mono text-xs text-slate-900 dark:text-white">
              divide(tasks_completed, hours_logged)
            </p>
            <p className="text-xs text-slate-500">Calculates tasks per hour</p>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-900 dark:text-white">
              multiply(subtract(1, defect_rate), 100)
            </p>
            <p className="text-xs text-slate-500">Quality percentage (100 - defect_rate%)</p>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-900 dark:text-white">
              average(quality, schedule, budget)
            </p>
            <p className="text-xs text-slate-500">Overall health score</p>
          </div>
        </div>
      </details>
    </div>
  );
}