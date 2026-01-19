import { useState, useCallback } from 'react';
import { Plus, Play, Trash2, Settings, GitBranch, Edit, ZoomIn, ZoomOut } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { SimulationModal } from './SimulationModal';
import type { OperationDefinition, FieldSchema, LogicBlock, Connection, BlockType, OperationParameter } from '../../../types/resource';

interface OperationsBuilderCompleteProps {
  operations: OperationDefinition[];
  schema: FieldSchema[];
  onChange: (operations: OperationDefinition[]) => void;
}

const BLOCK_TYPES: { type: BlockType; label: string; color: string; inputs: number; outputs: number }[] = [
  { type: 'getItemId', label: 'Get Item ID', color: 'blue', inputs: 0, outputs: 1 },
  { type: 'getValue', label: 'Get Field Value', color: 'green', inputs: 1, outputs: 1 },
  { type: 'setValue', label: 'Set Field Value', color: 'purple', inputs: 2, outputs: 0 },
  { type: 'updateFieldValue', label: 'Update Field', color: 'orange', inputs: 2, outputs: 0 },
  { type: 'createItem', label: 'Create Item', color: 'pink', inputs: 1, outputs: 1 },
  { type: 'deleteItem', label: 'Delete Item', color: 'red', inputs: 1, outputs: 0 },
  { type: 'router', label: 'Router (If/Else)', color: 'yellow', inputs: 1, outputs: 2 },
  { type: 'parenthesis', label: 'Group', color: 'slate', inputs: 1, outputs: 1 }
];

export function OperationsBuilderComplete({ operations, schema, onChange }: OperationsBuilderCompleteProps) {
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);
  const [editingOperation, setEditingOperation] = useState<OperationDefinition | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedOperation = operations.find(op => op.id === selectedOperationId);

  const handleAddOperation = () => {
    const newOperation: OperationDefinition = {
      id: `op-${Date.now()}`,
      name: 'New Operation',
      description: 'Describe what this operation does',
      type: 'void',
      parameters: [],
      blocks: [],
      connections: [],
      isPublic: true
    };

    onChange([...operations, newOperation]);
    setSelectedOperationId(newOperation.id);
    setEditingOperation(newOperation);
  };

  const handleUpdateOperation = (updated: Partial<OperationDefinition>) => {
    if (!selectedOperationId) return;
    
    onChange(operations.map(op => 
      op.id === selectedOperationId ? { ...op, ...updated } : op
    ));
    
    if (editingOperation) {
      setEditingOperation({ ...editingOperation, ...updated });
    }
  };

  const handleDeleteOperation = (opId: string) => {
    if (confirm('Delete this operation?')) {
      onChange(operations.filter(op => op.id !== opId));
      if (selectedOperationId === opId) {
        setSelectedOperationId(null);
      }
    }
  };

  const handleAddBlock = (type: BlockType) => {
    if (!selectedOperation) return;

    const blockType = BLOCK_TYPES.find(bt => bt.type === type);
    if (!blockType) return; // Safety check
    
    const newBlock: LogicBlock = {
      id: `block-${Date.now()}`,
      type,
      label: blockType.label,
      position: { x: 100 + selectedOperation.blocks.length * 50, y: 100 },
      config: {},
      inputs: Array.from({ length: blockType.inputs }, (_, i) => ({
        id: `input-${i}`,
        label: `Input ${i + 1}`,
        type: 'any',
        required: true
      })),
      outputs: Array.from({ length: blockType.outputs }, (_, i) => ({
        id: `output-${i}`,
        label: i === 1 ? 'Else' : 'Output',
        type: 'any',
        required: false
      }))
    };

    handleUpdateOperation({
      blocks: [...selectedOperation.blocks, newBlock]
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!selectedOperation) return;

    // Remove block and its connections
    handleUpdateOperation({
      blocks: selectedOperation.blocks.filter(b => b.id !== blockId),
      connections: selectedOperation.connections.filter(
        c => c.sourceBlockId !== blockId && c.targetBlockId !== blockId
      )
    });
  };

  const handleBlockMove = (blockId: string, position: { x: number; y: number }) => {
    if (!selectedOperation) return;

    handleUpdateOperation({
      blocks: selectedOperation.blocks.map(b =>
        b.id === blockId ? { ...b, position } : b
      )
    });
  };

  const handleConnect = (sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string) => {
    if (!selectedOperation) return;

    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId
    };

    handleUpdateOperation({
      connections: [...selectedOperation.connections, newConnection]
    });
  };

  const handleDeleteConnection = (connId: string) => {
    if (!selectedOperation) return;

    handleUpdateOperation({
      connections: selectedOperation.connections.filter(c => c.id !== connId)
    });
  };

  const handleBlockConfig = (blockId: string, config: Record<string, any>) => {
    if (!selectedOperation) return;

    handleUpdateOperation({
      blocks: selectedOperation.blocks.map(b =>
        b.id === blockId ? { ...b, config } : b
      )
    });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Operations List */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-slate-600 dark:text-white/60">Operations</h3>
            <Button size="sm" onClick={handleAddOperation}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className={`
                  p-3 rounded-lg transition-all cursor-pointer
                  ${selectedOperationId === operation.id
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                  }
                `}
                onClick={() => setSelectedOperationId(operation.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-900 dark:text-white truncate">
                      {operation.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOperation(operation.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  {operation.blocks.length} blocks • {operation.connections.length} connections
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Block Palette */}
        <GlassCard className="p-4">
          <h3 className="text-sm text-slate-600 dark:text-white/60 mb-4">Block Palette</h3>
          <div className="space-y-2">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => handleAddBlock(blockType.type)}
                disabled={!selectedOperation}
                className={`
                  w-full p-2 rounded-lg text-left transition-all text-xs
                  ${!selectedOperation
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-white/5'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${blockType.color}-500`} />
                  <span className="text-slate-900 dark:text-white">{blockType.label}</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Canvas */}
      <div className="col-span-12 lg:col-span-9 space-y-4">
        {selectedOperation ? (
          <>
            {/* Operation Header */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingOperation ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={editingOperation.name}
                        onChange={(e) => {
                          setEditingOperation({ ...editingOperation, name: e.target.value });
                          handleUpdateOperation({ name: e.target.value });
                        }}
                        placeholder="Operation name"
                        className="text-lg"
                      />
                      <Input
                        type="text"
                        value={editingOperation.description}
                        onChange={(e) => {
                          setEditingOperation({ ...editingOperation, description: e.target.value });
                          handleUpdateOperation({ description: e.target.value });
                        }}
                        placeholder="Description"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-slate-900 dark:text-white">{selectedOperation.name}</h2>
                      <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                        {selectedOperation.description}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingOperation(editingOperation ? null : selectedOperation)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={() => setShowSimulation(true)} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Simulate
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Parameters Panel */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm text-slate-900 dark:text-white">Parameters</h3>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    Define inputs required to execute this operation
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newParam: any = {
                      id: `param-${Date.now()}`,
                      name: 'newParam',
                      type: 'string',
                      required: true
                    };
                    handleUpdateOperation({
                      parameters: [...selectedOperation.parameters, newParam]
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              {selectedOperation.parameters.length > 0 ? (
                <div className="space-y-2">
                  {selectedOperation.parameters.map((param, index) => (
                    <div
                      key={param.id}
                      className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <Input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const updatedParams = [...selectedOperation.parameters];
                            updatedParams[index] = { ...param, name: e.target.value };
                            handleUpdateOperation({ parameters: updatedParams });
                          }}
                          placeholder="Parameter name"
                          className="text-sm"
                        />
                        <select
                          value={param.type}
                          onChange={(e) => {
                            const updatedParams = [...selectedOperation.parameters];
                            updatedParams[index] = { ...param, type: e.target.value as any };
                            handleUpdateOperation({ parameters: updatedParams });
                          }}
                          className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </select>
                        <Input
                          type="text"
                          value={param.defaultValue || ''}
                          onChange={(e) => {
                            const updatedParams = [...selectedOperation.parameters];
                            updatedParams[index] = { ...param, defaultValue: e.target.value };
                            handleUpdateOperation({ parameters: updatedParams });
                          }}
                          placeholder="Default value"
                          className="text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                            <input
                              type="checkbox"
                              checked={param.required}
                              onChange={(e) => {
                                const updatedParams = [...selectedOperation.parameters];
                                updatedParams[index] = { ...param, required: e.target.checked };
                                handleUpdateOperation({ parameters: updatedParams });
                              }}
                              className="rounded"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleUpdateOperation({
                            parameters: selectedOperation.parameters.filter((_, i) => i !== index)
                          });
                        }}
                        className="p-2 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-600 dark:text-white/60">
                  No parameters defined. Operations can work without parameters.
                </div>
              )}
            </GlassCard>

            {/* Visual Canvas */}
            <GlassCard className="p-6">
              <div className="relative h-[500px] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg overflow-auto bg-slate-50 dark:bg-black/20" onWheel={handleWheel}>
                {/* Grid Background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                  }}
                />

                {/* Zoomable Content Container */}
                <div 
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: `${100 / zoom}%`,
                    height: `${100 / zoom}%`
                  }}
                >
                  {/* Render Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedOperation.connections.map((conn) => {
                      const sourceBlock = selectedOperation.blocks.find(b => b.id === conn.sourceBlockId);
                      const targetBlock = selectedOperation.blocks.find(b => b.id === conn.targetBlockId);
                      
                      if (!sourceBlock || !targetBlock) return null;

                      // Calculate port centers (ports are w-3 h-3, so radius is 1.5)
                      // Output port: right: 2 from card edge, center at 150 - 2 - 1.5 = 146.5
                      // Input port: left: 2 from card edge, center at 2 + 1.5 = 3.5
                      const startX = sourceBlock.position.x + 150 - 2 - 1.5; // Output port center
                      const startY = sourceBlock.position.y + 40;
                      const endX = targetBlock.position.x + 2 + 1.5; // Input port center
                      const endY = targetBlock.position.y + 40;

                      const midX = (startX + endX) / 2;

                      return (
                        <g key={conn.id}>
                          <path
                            d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                            stroke="rgba(139, 92, 246, 0.5)"
                            strokeWidth="2"
                            fill="none"
                          />
                          <circle
                            cx={startX}
                            cy={startY}
                            r="4"
                            fill="rgb(139, 92, 246)"
                          />
                          <circle
                            cx={endX}
                            cy={endY}
                            r="4"
                            fill="rgb(139, 92, 246)"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Blocks */}
                  {selectedOperation.blocks.map((block) => {
                    const blockType = BLOCK_TYPES.find(bt => bt.type === block.type);
                    
                    return (
                      <div
                        key={block.id}
                        className={`
                          absolute p-3 rounded-lg shadow-lg cursor-move border-2
                          ${selectedBlockId === block.id
                            ? 'ring-2 ring-purple-500 bg-purple-500/10 border-purple-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10'
                          }
                        `}
                        style={{
                          left: block.position.x,
                          top: block.position.y,
                          width: 150
                        }}
                        onClick={() => setSelectedBlockId(block.id)}
                        draggable
                        onDragEnd={(e) => {
                          const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                          handleBlockMove(block.id, {
                            x: (e.clientX - rect.left) / zoom - 75,
                            y: (e.clientY - rect.top) / zoom - 40
                          });
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-3 h-3 rounded-full bg-${blockType?.color}-500`} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-900 dark:text-white mb-2">
                          {block.label}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          Type: {block.type}
                        </div>
                        
                        {/* Input Ports - Inside border */}
                        {block.inputs.map((input, idx) => (
                          <div
                            key={input.id}
                            className="absolute left-0 w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:scale-125 border-2 border-white dark:border-slate-800"
                            style={{ top: 20 + idx * 20, left: 2 }}
                            title={input.label}
                          />
                        ))}
                        
                        {/* Output Ports - Inside border */}
                        {block.outputs.map((output, idx) => (
                          <div
                            key={output.id}
                            className="absolute right-0 w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:scale-125 border-2 border-white dark:border-slate-800"
                            style={{ top: 20 + idx * 20, right: 2 }}
                            title={output.label}
                          />
                        ))}
                      </div>
                    );
                  })}

                  {/* Empty State */}
                  {selectedOperation.blocks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-white/60 mb-2">
                          No blocks yet
                        </p>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                          Click blocks from the palette to add them
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Block Configuration Panel */}
            {selectedBlockId && selectedOperation && (() => {
              const selectedBlock = selectedOperation.blocks.find(b => b.id === selectedBlockId);
              if (!selectedBlock) return null;
              
              return (
                <GlassCard className="p-4">
                  <h3 className="text-sm text-slate-600 dark:text-white/60 mb-4">Block Configuration</h3>
                  <BlockConfigPanel
                    block={selectedBlock}
                    schema={schema}
                    onUpdate={(config) => handleBlockConfig(selectedBlockId, config)}
                  />
                </GlassCard>
              );
            })()}
          </>
        ) : (
          <GlassCard className="p-12 text-center">
            <GitBranch className="w-16 h-16 text-slate-400 dark:text-white/40 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-white/60 mb-4">
              No operation selected
            </p>
            <Button onClick={handleAddOperation} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Operation
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Simulation Modal */}
      {showSimulation && selectedOperation && (
        <SimulationModal
          operation={selectedOperation}
          schema={schema}
          onClose={() => setShowSimulation(false)}
        />
      )}
    </div>
  );
}

// Block Configuration Panel
interface BlockConfigPanelProps {
  block: LogicBlock;
  schema: FieldSchema[];
  onUpdate: (config: Record<string, any>) => void;
}

function BlockConfigPanel({ block, schema, onUpdate }: BlockConfigPanelProps) {
  const [config, setConfig] = useState(block?.config || {});

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  if (!block) {
    return (
      <p className="text-sm text-slate-600 dark:text-white/60">
        No block selected
      </p>
    );
  }

  if (block.type === 'getValue' || block.type === 'setValue' || block.type === 'updateFieldValue') {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
            Field to Access
          </label>
          <select
            value={config.fieldName || ''}
            onChange={(e) => handleChange('fieldName', e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
          >
            <option value="">Select field...</option>
            {schema.map(field => (
              <option key={field.id} value={field.internalName}>
                {field.displayName} ({field.type})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'router') {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
            Condition
          </label>
          <Input
            type="text"
            value={config.condition || ''}
            onChange={(e) => handleChange('condition', e.target.value)}
            placeholder="e.g., value > 100"
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-600 dark:text-white/60">
      No configuration needed for this block type
    </p>
  );
}