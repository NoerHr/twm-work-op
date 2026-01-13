import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  const hasReturnValue = data.inputs && Object.keys(data.inputs).length > 0;

  return (
    <div className={`px-4 py-3 rounded-lg border-2 transition-all ${
      selected 
        ? 'border-red-500 shadow-lg shadow-red-500/20' 
        : 'border-red-500/50 hover:border-red-500'
    } bg-gradient-to-br from-red-500 to-rose-600`}>
      <div className="flex items-center gap-2 mb-2">
        <Square className="w-5 h-5 text-white" />
        <div className="text-sm font-bold text-white">END</div>
      </div>

      {/* Input handle for return value */}
      {hasReturnValue && (
        <div className="mt-2">
          <div className="text-xs text-white/70 mb-1">Return Value:</div>
          {Object.entries(data.inputs).map(([inputName, inputData]: [string, any], index) => (
            <div key={inputName} className="relative">
              <div className="bg-white/10 rounded px-2 py-1 text-xs text-white font-mono">
                {inputName}: <span className="text-white/70">{inputData.type}</span>
              </div>
              <Handle
                type="target"
                position={Position.Left}
                id={inputName}
                style={{
                  left: -8,
                  top: 16 + index * 28,
                  width: 12,
                  height: 12,
                  background: '#ef4444',
                  border: '2px solid white'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Default input if no return value */}
      {!hasReturnValue && (
        <Handle
          type="target"
          position={Position.Top}
          id="default"
          style={{
            top: -8,
            width: 12,
            height: 12,
            background: '#ef4444',
            border: '2px solid white'
          }}
        />
      )}
    </div>
  );
});

EndNode.displayName = 'EndNode';
