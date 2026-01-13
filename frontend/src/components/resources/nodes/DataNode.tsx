import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database, Plus, Trash2, Edit } from 'lucide-react';

const iconMap: Record<string, any> = {
  getItemId: Database,
  updateFieldValue: Edit,
  createNew: Plus,
  deleteItem: Trash2
};

const colorMap: Record<string, string> = {
  getItemId: 'from-blue-500 to-blue-600',
  updateFieldValue: 'from-green-500 to-green-600',
  createNew: 'from-purple-500 to-purple-600',
  deleteItem: 'from-red-500 to-red-600'
};

export const DataNode = memo(({ data, selected }: NodeProps) => {
  const Icon = iconMap[data.type] || Database;
  const gradient = colorMap[data.type] || 'from-slate-500 to-slate-600';
  const hasInputs = data.inputs && Object.keys(data.inputs).length > 0;
  const hasOutputs = data.outputs && Object.keys(data.outputs).length > 0;

  return (
    <div className={`rounded-lg border-2 transition-all ${
      selected 
        ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
        : 'border-slate-300 dark:border-white/20 hover:border-purple-500'
    } bg-white dark:bg-slate-800 min-w-[200px]`}>
      {/* Header */}
      <div className={`px-3 py-2 rounded-t-lg bg-gradient-to-r ${gradient}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white" />
          <div className="text-sm font-medium text-white">{data.label}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Inputs */}
        {hasInputs && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 dark:text-white/40">Inputs:</div>
            {Object.entries(data.inputs).map(([inputName, inputData]: [string, any], index) => (
              <div key={inputName} className="relative">
                <div className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
                  <div className="text-xs text-slate-700 dark:text-white/70 font-mono">
                    {inputName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/40">
                    {inputData.type}
                  </div>
                </div>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={inputName}
                  style={{
                    left: -8,
                    top: 12 + index * 48,
                    width: 10,
                    height: 10,
                    background: '#8b5cf6',
                    border: '2px solid white'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Outputs */}
        {hasOutputs && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 dark:text-white/40">Outputs:</div>
            {Object.entries(data.outputs).map(([outputName, outputData]: [string, any], index) => (
              <div key={outputName} className="relative">
                <div className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
                  <div className="text-xs text-slate-700 dark:text-white/70 font-mono">
                    {outputName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/40">
                    {outputData.type}
                  </div>
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={outputName}
                  style={{
                    right: -8,
                    top: hasInputs ? 60 + (Object.keys(data.inputs).length * 48) + 12 + (index * 48) : 12 + (index * 48),
                    width: 10,
                    height: 10,
                    background: '#8b5cf6',
                    border: '2px solid white'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Config preview */}
        {data.config && (
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <div className="text-xs text-slate-500 dark:text-white/40">
              Click to configure
            </div>
          </div>
        )}
      </div>

      {/* Error indicator */}
      {data.error && (
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20 rounded-b-lg">
          <div className="text-xs text-red-600 dark:text-red-400">{data.error}</div>
        </div>
      )}
    </div>
  );
});

DataNode.displayName = 'DataNode';
