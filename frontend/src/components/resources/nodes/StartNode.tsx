import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 transition-all ${
      selected 
        ? 'border-green-500 shadow-lg shadow-green-500/20' 
        : 'border-green-500/50 hover:border-green-500'
    } bg-gradient-to-br from-green-500 to-emerald-600`}>
      <div className="flex items-center gap-2 mb-2">
        <Play className="w-5 h-5 text-white" />
        <div className="text-sm font-bold text-white">START</div>
      </div>
      
      {/* Output handles for parameters */}
      {data.outputs && Object.keys(data.outputs).length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs text-white/70 mb-1">Parameters:</div>
          {Object.entries(data.outputs).map(([paramName, paramData]: [string, any], index) => (
            <div key={paramName} className="relative">
              <div className="bg-white/10 rounded px-2 py-1 text-xs text-white font-mono">
                {paramName}: <span className="text-white/70">{paramData.type}</span>
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={paramName}
                style={{
                  right: -8,
                  top: 16 + index * 28,
                  width: 12,
                  height: 12,
                  background: '#10b981',
                  border: '2px solid white'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Default output if no parameters */}
      {(!data.outputs || Object.keys(data.outputs).length === 0) && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          style={{
            bottom: -8,
            width: 12,
            height: 12,
            background: '#10b981',
            border: '2px solid white'
          }}
        />
      )}
    </div>
  );
});

StartNode.displayName = 'StartNode';
