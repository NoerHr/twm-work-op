import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export const RouterNode = memo(({ data, selected }: NodeProps) => {
  const routes = data.config?.routes || [];

  return (
    <div className={`rounded-lg border-2 transition-all ${
      selected 
        ? 'border-amber-500 shadow-lg shadow-amber-500/20' 
        : 'border-slate-300 dark:border-white/20 hover:border-amber-500'
    } bg-white dark:bg-slate-800 min-w-[220px]`}>
      {/* Header */}
      <div className="px-3 py-2 rounded-t-lg bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-white" />
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
              <div className="text-xs text-slate-700 dark:text-white/70 font-mono">
                Evaluation Value
              </div>
              {data.config?.evaluationValue && (
                <div className="text-xs text-slate-500 dark:text-white/40 mt-1 font-mono">
                  {data.config.evaluationValue}
                </div>
              )}
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
                background: '#f59e0b',
                border: '2px solid white'
              }}
            />
          </div>
        </div>

        {/* Routes */}
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Routes:</div>
          <div className="space-y-1">
            {routes.map((route: any, index: number) => (
              <div key={route.id} className="relative">
                <div className={`rounded px-2 py-1 ${
                  route.id === 'default' 
                    ? 'bg-slate-200 dark:bg-white/10' 
                    : 'bg-amber-100 dark:bg-amber-500/10'
                }`}>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    {route.label}
                  </div>
                  {route.condition && route.id !== 'default' && (
                    <div className="text-xs text-slate-600 dark:text-white/60 font-mono mt-0.5">
                      {route.condition}
                    </div>
                  )}
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={route.id}
                  style={{
                    right: -8,
                    top: 12 + (index * 40),
                    width: 10,
                    height: 10,
                    background: route.id === 'default' ? '#64748b' : '#f59e0b',
                    border: '2px solid white'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Config hint */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="text-xs text-slate-500 dark:text-white/40">
            Mode: {data.config?.evaluationMode || 'first-match'}
          </div>
        </div>
      </div>
    </div>
  );
});

RouterNode.displayName = 'RouterNode';