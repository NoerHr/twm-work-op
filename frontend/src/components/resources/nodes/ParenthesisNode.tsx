import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, AlertCircle, Zap } from 'lucide-react';

export const ParenthesisNode = memo(({ data, selected }: NodeProps) => {
  const transactionMode = data.config?.transactionMode || 'atomic';
  const errorHandling = data.config?.errorHandling || 'fail-block';

  const modeIcon = transactionMode === 'atomic' ? AlertCircle : Zap;
  const ModeIcon = modeIcon;

  return (
    <div className={`rounded-lg border-2 transition-all ${
      selected 
        ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' 
        : 'border-slate-300 dark:border-white/20 hover:border-cyan-500'
    } bg-white dark:bg-slate-800 min-w-[240px]`}>
      {/* Header */}
      <div className="px-3 py-2 rounded-t-lg bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-white" />
          <div className="text-sm font-medium text-white">{data.label}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Input */}
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Input:</div>
          <div className="relative">
            <div className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
              <div className="text-xs text-slate-700 dark:text-white/70">
                Transaction Input
              </div>
            </div>
            <Handle
              type="target"
              position={Position.Left}
              id="input"
              style={{
                left: -8,
                top: 12,
                width: 10,
                height: 10,
                background: '#06b6d4',
                border: '2px solid white'
              }}
            />
          </div>
        </div>

        {/* Transaction Config */}
        <div className={`mb-3 p-2 rounded ${
          transactionMode === 'atomic' 
            ? 'bg-red-500/10 border border-red-500/20' 
            : 'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <ModeIcon className={`w-3 h-3 ${
              transactionMode === 'atomic' ? 'text-red-500' : 'text-blue-500'
            }`} />
            <div className="text-xs font-medium text-slate-900 dark:text-white">
              {transactionMode === 'atomic' ? 'Atomic (All-or-Nothing)' : 'Best-Effort'}
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-white/60">
            {transactionMode === 'atomic' 
              ? 'If any operation fails, all rollback' 
              : 'Continue on error, log failures'}
          </div>
        </div>

        {/* Error Handling */}
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Error Handling:</div>
          <div className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
            <div className="text-xs text-slate-700 dark:text-white/70">
              {errorHandling === 'fail-block' ? 'Fail Entire Block' : 'Continue and Log'}
            </div>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Output:</div>
          <div className="relative">
            <div className="bg-slate-100 dark:bg-white/5 rounded px-2 py-1">
              <div className="text-xs text-slate-700 dark:text-white/70">
                Transaction Result
              </div>
              <div className="text-xs text-slate-500 dark:text-white/40 mt-0.5">
                Mode: {data.config?.outputMode || 'last-operation'}
              </div>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="output"
              style={{
                right: -8,
                top: 12,
                width: 10,
                height: 10,
                background: '#06b6d4',
                border: '2px solid white'
              }}
            />
          </div>
        </div>

        {/* Sub-operations hint */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="text-xs text-slate-500 dark:text-white/40 flex items-center gap-1">
            <Box className="w-3 h-3" />
            Click to add sub-operations
          </div>
        </div>
      </div>
    </div>
  );
});

ParenthesisNode.displayName = 'ParenthesisNode';
