import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Square,
  Database,
  GitBranch,
  Box,
  Plus,
  Trash2,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Code,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { NodeConfigModal, NodeConfig } from './NodeConfigModal';

// Import custom node components
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { DataNode } from './nodes/DataNode';
import { RouterNode } from './nodes/RouterNode';
import { ParenthesisNode } from './nodes/ParenthesisNode';

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  data: DataNode,
  router: RouterNode,
  parenthesis: ParenthesisNode
};

export interface OperationParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'item' | 'item[]';
  required: boolean;
  description?: string;
}

export interface BlockData {
  label: string;
  type: string;
  config?: any;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
}

interface OperationBuilderProps {
  operation: {
    id: string;
    name: string;
    type: 'void' | 'return';
    parameters: OperationParameter[];
    description?: string;
  };
  fields: Array<{
    id: string;
    name: string;
    internalName: string;
    type: string;
  }>;
  onChange: (nodes: Node[], edges: Edge[]) => void;
  onValidate?: (result: { valid: boolean; errors: string[] }) => void;
}

export function OperationBuilder({ operation, fields, onChange, onValidate }: OperationBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configModalNode, setConfigModalNode] = useState<Node | null>(null);
  const [showBlockPalette, setShowBlockPalette] = useState(true);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize with START and END nodes if empty
  useState(() => {
    if (nodes.length === 0) {
      const startNode: Node = {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 50 },
        data: {
          label: 'START',
          type: 'start',
          outputs: operation.parameters.reduce((acc, param) => {
            acc[param.name] = { type: param.type, value: null };
            return acc;
          }, {} as Record<string, any>)
        }
      };

      const endNode: Node = {
        id: 'end',
        type: 'end',
        position: { x: 250, y: 500 },
        data: {
          label: 'END',
          type: 'end',
          inputs: operation.type === 'return' ? { returnValue: { type: 'any', value: null } } : {}
        }
      };

      setNodes([startNode, endNode]);
    }
  });

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Type checking before connecting
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const sourceOutputType = sourceNode.data.outputs?.[params.sourceHandle || '']?.type;
      const targetInputType = targetNode.data.inputs?.[params.targetHandle || '']?.type;

      // Type compatibility check
      if (sourceOutputType && targetInputType && !areTypesCompatible(sourceOutputType, targetInputType)) {
        // Show error - types not compatible
        return;
      }

      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#8B5CF6'
        },
        style: { stroke: '#8B5CF6', strokeWidth: 2 }
      }, eds));
    },
    [nodes, setEdges]
  );

  const areTypesCompatible = (sourceType: string, targetType: string): boolean => {
    if (targetType === 'any') return true;
    if (sourceType === targetType) return true;
    if (sourceType === 'item[]' && targetType === 'item') return true; // Array can connect to single item
    return false;
  };

  const addBlock = (blockType: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: blockType === 'router' ? 'router' : blockType === 'parenthesis' ? 'parenthesis' : 'data',
      position: { x: 250, y: 200 },
      data: getDefaultBlockData(blockType)
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultBlockData = (blockType: string): BlockData => {
    switch (blockType) {
      case 'getItemId':
        return {
          label: 'Get Item ID',
          type: 'getItemId',
          inputs: {
            field: { type: 'string', value: null },
            value: { type: 'any', value: null }
          },
          outputs: {
            itemIds: { type: 'item[]', value: null }
          }
        };
      case 'updateFieldValue':
        return {
          label: 'Update Field',
          type: 'updateFieldValue',
          inputs: {
            itemIds: { type: 'item[]', value: null },
            field: { type: 'string', value: null },
            value: { type: 'any', value: null }
          },
          outputs: {}
        };
      case 'createNew':
        return {
          label: 'Create New',
          type: 'createNew',
          inputs: {
            data: { type: 'object', value: {} }
          },
          outputs: {
            newItemId: { type: 'item', value: null }
          }
        };
      case 'deleteItem':
        return {
          label: 'Delete Item',
          type: 'deleteItem',
          inputs: {
            itemIds: { type: 'item[]', value: null }
          },
          outputs: {}
        };
      case 'router':
        return {
          label: 'Router',
          type: 'router',
          config: {
            evaluationValue: '',
            evaluationMode: 'first-match',
            routes: [
              { id: 'route-1', label: 'Route A', condition: '' },
              { id: 'route-2', label: 'Route B', condition: '' },
              { id: 'default', label: 'Default', condition: '' }
            ]
          },
          inputs: {
            input: { type: 'any', value: null }
          },
          outputs: {}
        };
      case 'parenthesis':
        return {
          label: 'Transaction Block',
          type: 'parenthesis',
          config: {
            transactionMode: 'atomic',
            errorHandling: 'fail-block',
            outputMode: 'last-operation'
          },
          inputs: {
            input: { type: 'any', value: null }
          },
          outputs: {
            output: { type: 'any', value: null }
          }
        };
      default:
        return {
          label: 'Unknown Block',
          type: 'unknown',
          inputs: {},
          outputs: {}
        };
    }
  };

  const validateFlow = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if START node exists
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      errors.push('START node is missing');
    }

    // Check if END node exists
    const endNode = nodes.find(n => n.type === 'end');
    if (!endNode) {
      errors.push('END node is missing');
    }

    // Check for orphan nodes (not connected to START)
    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add('start');

    const traverseGraph = (nodeId: string) => {
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => {
        if (!connectedNodeIds.has(edge.target)) {
          connectedNodeIds.add(edge.target);
          traverseGraph(edge.target);
        }
      });
    };

    traverseGraph('start');

    const orphanNodes = nodes.filter(n => n.type !== 'start' && !connectedNodeIds.has(n.id));
    if (orphanNodes.length > 0) {
      errors.push(`${orphanNodes.length} orphan node(s) not connected to START`);
    }

    // Check if all required inputs are connected
    nodes.forEach(node => {
      if (node.data.inputs) {
        Object.entries(node.data.inputs).forEach(([inputName, inputData]: [string, any]) => {
          const isConnected = edges.some(e => e.target === node.id && e.targetHandle === inputName);
          if (!isConnected && inputData.required) {
            errors.push(`Node "${node.data.label}" has unconnected required input "${inputName}"`);
          }
        });
      }
    });

    const result = { valid: errors.length === 0, errors };
    setValidationResult(result);
    onValidate?.(result);
    return result;
  };

  const blockPalette = [
    { type: 'getItemId', label: 'Get Item ID', icon: Database, color: 'bg-blue-500', category: 'Data' },
    { type: 'updateFieldValue', label: 'Update Field', icon: Database, color: 'bg-green-500', category: 'Data' },
    { type: 'createNew', label: 'Create New', icon: Plus, color: 'bg-purple-500', category: 'Data' },
    { type: 'deleteItem', label: 'Delete Item', icon: Trash2, color: 'bg-red-500', category: 'Data' },
    { type: 'router', label: 'Router', icon: GitBranch, color: 'bg-amber-500', category: 'Flow' },
    { type: 'parenthesis', label: 'Transaction', icon: Box, color: 'bg-blue-500', category: 'Flow' }
  ];

  const deleteNode = () => {
    if (selectedNode && selectedNode.type !== 'start' && selectedNode.type !== 'end') {
      setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      onChange(nodes, edges);
    },
    [nodes, edges, onNodesChange, onChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      onChange(nodes, edges);
    },
    [nodes, edges, onEdgesChange, onChange]
  );

  // Handle node double-click to open configuration modal
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Don't open config for START/END nodes
      if (node.type !== 'start' && node.type !== 'end') {
        setConfigModalNode(node);
      }
    },
    []
  );

  // Save node configuration from modal
  const handleSaveNodeConfig = useCallback(
    (nodeId: string, config: NodeConfig) => {
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: config.label,
                description: config.description,
                config: {
                  ...config
                }
              }
            };
          }
          return node;
        })
      );
      onChange(nodes, edges);
    },
    [nodes, edges, setNodes, onChange]
  );

  return (
    <div className="h-[700px] relative">
      <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-white/10" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          className="bg-slate-50 dark:bg-slate-900/50"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1} 
            color="#94a3b8" 
            className="dark:opacity-20"
          />
          
          <Controls 
            showZoom 
            showFitView 
            showInteractive 
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg"
          />
          
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'start': return '#10b981';
                case 'end': return '#ef4444';
                case 'router': return '#f59e0b';
                case 'parenthesis': return '#06b6d4';
                default: return '#8b5cf6';
              }
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg"
          />

          {/* Top Toolbar */}
          <Panel position="top-left" className="space-x-2">
            <GlassCard className="inline-flex items-center gap-2 px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBlockPalette(!showBlockPalette)}
              >
                {showBlockPalette ? 'Hide' : 'Show'} Palette
              </Button>
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
              <Button variant="ghost" size="sm" onClick={validateFlow}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validate
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteNode} disabled={!selectedNode || selectedNode.type === 'start' || selectedNode.type === 'end'}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </GlassCard>
          </Panel>

          {/* Validation Results */}
          {validationResult && (
            <Panel position="top-right">
              <GlassCard className={`px-4 py-3 ${validationResult.valid ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {validationResult.valid ? 'Valid Flow ✓' : 'Invalid Flow'}
                  </span>
                </div>
                {validationResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.errors.map((error, i) => (
                      <div key={i} className="text-xs text-red-600 dark:text-red-400">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </Panel>
          )}

          {/* Operation Info */}
          <Panel position="bottom-left">
            <GlassCard className="px-4 py-3">
              <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {operation.name}
              </div>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Type: {operation.type} • Nodes: {nodes.length} • Edges: {edges.length}
              </div>
            </GlassCard>
          </Panel>
        </ReactFlow>
      </div>

      {/* Block Palette Sidebar */}
      <AnimatePresence>
        {showBlockPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute left-4 top-4 bottom-4 w-64 z-10"
          >
            <GlassCard className="h-full p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                Block Palette
              </h3>

              <div className="space-y-6">
                {/* Entry/Exit Blocks */}
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-2 uppercase">
                    Entry & Exit
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-slate-900 dark:text-white">START</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-white/60">Entry point - exposes parameters</p>
                    </div>
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Square className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium text-slate-900 dark:text-white">END</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-white/60">Exit point - accepts return value</p>
                    </div>
                  </div>
                </div>

                {/* Data Blocks */}
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-2 uppercase">
                    Data Operations
                  </div>
                  <div className="space-y-2">
                    {blockPalette.filter(b => b.category === 'Data').map((block) => {
                      const Icon = block.icon;
                      return (
                        <button
                          key={block.type}
                          onClick={() => addBlock(block.type)}
                          className="w-full p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500 transition-all group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                {block.label}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flow Control Blocks */}
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-2 uppercase">
                    Flow Control
                  </div>
                  <div className="space-y-2">
                    {blockPalette.filter(b => b.category === 'Flow').map((block) => {
                      const Icon = block.icon;
                      return (
                        <button
                          key={block.type}
                          onClick={() => addBlock(block.type)}
                          className="w-full p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500 transition-all group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                {block.label}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Node Info */}
              {selectedNode && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <div className="text-xs font-medium text-slate-500 dark:text-white/40 mb-2 uppercase">
                    Selected Node
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {selectedNode.data.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60 mb-2">
                      Type: {selectedNode.data.type}
                    </div>
                    {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={deleteNode}
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete Node
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node Configuration Modal */}
      {configModalNode && (
        <NodeConfigModal
          node={configModalNode}
          fields={fields}
          onSave={handleSaveNodeConfig}
          onClose={() => setConfigModalNode(null)}
        />
      )}
    </div>
  );
}