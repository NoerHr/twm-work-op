import { useState } from 'react';
import { Plus, Target, Trash2, Link as LinkIcon, Circle, TrendingUp, Activity, Edit2, Move } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import type { Assignment } from '../../../types/assignment';

interface OperationalTabProps {
  assignment: Assignment;
}

// Assignment Indicator Node (dari project level - left side)
interface AssignmentIndicatorNode {
  id: string;
  name: string;
  assignmentName: string;
  counter: number; // Assignment P #1, #2, etc
  x: number;
  y: number;
  connections: string[]; // Connected operational indicator IDs
  description?: string;
}

// Operational Indicator Node (dibuat di assignment level - right side)
interface OperationalIndicatorNode {
  id: string;
  name: string;
  x: number;
  y: number;
  connections: string[]; // Connected assignment indicator IDs
  description?: string;
  type: 'performance' | 'quality' | 'efficiency' | 'output';
}

// Mock Assignment Indicators (from project level)
const MOCK_ASSIGNMENT_INDICATORS: AssignmentIndicatorNode[] = [
  {
    id: 'ai-1',
    name: 'Sprint Velocity',
    assignmentName: 'Frontend Development',
    counter: 1,
    x: 100,
    y: 100,
    connections: ['oi-1'],
    description: 'Track sprint completion rate'
  },
  {
    id: 'ai-2',
    name: 'Code Coverage',
    assignmentName: 'Frontend Development',
    counter: 2,
    x: 100,
    y: 240,
    connections: ['oi-1', 'oi-2'],
    description: 'Measure test coverage percentage'
  },
  {
    id: 'ai-3',
    name: 'Bug Resolution Time',
    assignmentName: 'Frontend Development',
    counter: 3,
    x: 100,
    y: 380,
    connections: ['oi-3'],
    description: 'Average time to resolve bugs'
  },
];

export function OperationalTab({ assignment }: OperationalTabProps) {
  const [assignmentIndicatorNodes] = useState<AssignmentIndicatorNode[]>(MOCK_ASSIGNMENT_INDICATORS);
  const [operationalIndicatorNodes, setOperationalIndicatorNodes] = useState<OperationalIndicatorNode[]>([
    {
      id: 'oi-1',
      name: 'Development Speed',
      x: 650,
      y: 140,
      connections: ['ai-1', 'ai-2'],
      description: 'Overall development velocity',
      type: 'performance'
    },
    {
      id: 'oi-2',
      name: 'Code Quality Index',
      x: 650,
      y: 300,
      connections: ['ai-2'],
      description: 'Quality metrics composite',
      type: 'quality'
    },
    {
      id: 'oi-3',
      name: 'Response Efficiency',
      x: 650,
      y: 460,
      connections: ['ai-3'],
      description: 'Bug fix efficiency metric',
      type: 'efficiency'
    },
  ]);
  
  // Canvas panning state
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<{ id: string; type: 'assignment' | 'operational' } | null>(null);
  const [showOperationalIndicatorModal, setShowOperationalIndicatorModal] = useState(false);
  const [editingOperationalIndicator, setEditingOperationalIndicator] = useState<OperationalIndicatorNode | null>(null);

  // Canvas pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking on canvas background (not on nodes)
    if ((e.target as HTMLElement).closest('.node-draggable')) return;
    
    setIsPanning(true);
    setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    setCanvasPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Edit operational indicator
  const handleEditOperationalIndicator = (node: OperationalIndicatorNode) => {
    setEditingOperationalIndicator(node);
    setShowOperationalIndicatorModal(true);
  };

  // Handle node click for connections
  const handleNodeClick = (nodeId: string, type: 'assignment' | 'operational') => {
    if (!selectedNodeForConnection) {
      // First selection
      setSelectedNodeForConnection({ id: nodeId, type });
    } else if (selectedNodeForConnection.id === nodeId) {
      // Deselect
      setSelectedNodeForConnection(null);
    } else if (selectedNodeForConnection.type === type) {
      // Same type, switch selection
      setSelectedNodeForConnection({ id: nodeId, type });
    } else {
      // Different types, create connection
      const assignmentNodeId = type === 'assignment' ? nodeId : selectedNodeForConnection.id;
      const operationalNodeId = type === 'operational' ? nodeId : selectedNodeForConnection.id;
      
      handleToggleConnection(assignmentNodeId, operationalNodeId);
      setSelectedNodeForConnection(null);
    }
  };

  // Toggle connection between assignment and operational indicator
  const handleToggleConnection = (assignmentIndicatorId: string, operationalIndicatorId: string) => {
    const assignmentNode = assignmentIndicatorNodes.find(n => n.id === assignmentIndicatorId);
    const operationalNode = operationalIndicatorNodes.find(n => n.id === operationalIndicatorId);
    
    if (!assignmentNode || !operationalNode) return;

    const isConnected = assignmentNode.connections.includes(operationalIndicatorId);

    if (isConnected) {
      // Remove connection - but assignment indicators are read-only, so we only update operational
      setOperationalIndicatorNodes(operationalIndicatorNodes.map(n => 
        n.id === operationalIndicatorId 
          ? { ...n, connections: n.connections.filter(c => c !== assignmentIndicatorId) }
          : n
      ));
      toast.success('Connection removed');
    } else {
      // Add connection
      setOperationalIndicatorNodes(operationalIndicatorNodes.map(n => 
        n.id === operationalIndicatorId 
          ? { ...n, connections: [...n.connections, assignmentIndicatorId] }
          : n
      ));
      toast.success('Connection created');
    }
  };

  // Create operational indicator
  const handleCreateOperationalIndicator = () => {
    setEditingOperationalIndicator(null);
    setShowOperationalIndicatorModal(true);
  };

  const handleSaveOperationalIndicator = (
    name: string,
    description: string,
    type: OperationalIndicatorNode['type']
  ) => {
    if (editingOperationalIndicator) {
      // Update existing
      setOperationalIndicatorNodes(operationalIndicatorNodes.map(n => 
        n.id === editingOperationalIndicator.id 
          ? { ...n, name, description, type }
          : n
      ));
      toast.success('Operational Indicator updated');
    } else {
      // Create new
      const newNode: OperationalIndicatorNode = {
        id: `oi-${Date.now()}`,
        name,
        description,
        type,
        x: 650,
        y: 100 + (operationalIndicatorNodes.length * 160),
        connections: []
      };
      
      setOperationalIndicatorNodes([...operationalIndicatorNodes, newNode]);
      toast.success('Operational Indicator created');
    }
    
    setShowOperationalIndicatorModal(false);
    setEditingOperationalIndicator(null);
  };

  // Delete operational indicator
  const handleDeleteOperationalIndicator = (id: string) => {
    if (!confirm('Delete this operational indicator?')) return;
    
    setOperationalIndicatorNodes(operationalIndicatorNodes.filter(n => n.id !== id));
    toast.success('Operational indicator deleted');
  };

  const getTypeColor = (type: OperationalIndicatorNode['type']) => {
    const colors = {
      performance: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
      quality: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-700 dark:text-green-300' },
      efficiency: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300' },
      output: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' }
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl text-slate-900 dark:text-white mb-2">
          Operational Indicator Builder
        </h2>
        <p className="text-sm text-slate-600 dark:text-white/60">
          Create operational indicators that feed data into assignment-level indicators
        </p>
      </div>

      {/* Main Canvas Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Assignment Indicators */}
        <div className="col-span-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm text-slate-900 dark:text-white">Assignment Indicators</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-white/60 mb-4">
              From project level (read-only)
            </p>

            {/* Assignment Indicator List */}
            <div className="space-y-2">
              {assignmentIndicatorNodes.map((indicator) => (
                <div
                  key={indicator.id}
                  className="p-3 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 hover:bg-blue-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                      #{indicator.counter}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {indicator.connections.length} links
                    </Badge>
                  </div>
                  <h4 className="text-sm text-slate-900 dark:text-white mb-1">
                    {indicator.name}
                  </h4>
                  {indicator.description && (
                    <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2">
                      {indicator.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/60">Assignment Indicators</span>
                <Badge variant="default" className="text-xs">{assignmentIndicatorNodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/60">Operational Indicators</span>
                <Badge variant="default" className="text-xs">{operationalIndicatorNodes.length}</Badge>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 <strong>How to use:</strong><br/>
                1. Create operational indicators<br/>
                2. Click assignment indicator<br/>
                3. Click operational indicator to connect
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Main Canvas */}
        <div className="col-span-9">
          <GlassCard className="p-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-slate-900 dark:text-white">Indicator Flow Canvas</h3>
                <p className="text-xs text-slate-600 dark:text-white/60 mt-1">
                  Operational indicators (right) → Assignment indicators (left)
                </p>
              </div>
              <Button 
                onClick={handleCreateOperationalIndicator}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Operational Indicator
              </Button>
            </div>

            {/* Canvas */}
            <div 
              className="relative bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 min-h-[700px] overflow-hidden"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} 
              />

              {/* Connection Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <marker
                    id="arrowhead-op"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#10b981" opacity="0.6" />
                  </marker>
                </defs>
                
                {operationalIndicatorNodes.map((operationalNode) =>
                  operationalNode.connections.map((assignmentNodeId) => {
                    const assignmentNode = assignmentIndicatorNodes.find(n => n.id === assignmentNodeId);
                    if (!assignmentNode) return null;
                    
                    // Arrow direction: Operational (right) → Assignment (left)
                    // Operational indicators feed data into assignment indicators
                    const startX = operationalNode.x; // Start from operational node (right)
                    const startY = operationalNode.y + 40;
                    const endX = assignmentNode.x + 220; // End at assignment node (left)
                    const endY = assignmentNode.y + 40;
                    
                    return (
                      <g key={`${assignmentNodeId}-${operationalNode.id}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeDasharray="6 3"
                          opacity="0.5"
                          markerEnd="url(#arrowhead-op)"
                        />
                      </g>
                    );
                  })
                )}
              </svg>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-2 z-20">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Assignment Indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Operational Indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Data Flow</span>
                </div>
              </div>

              {/* Assignment Indicator Nodes (Left) - Can be dragged */}
              {assignmentIndicatorNodes.map((node) => {
                const isSelected = selectedNodeForConnection?.id === node.id;
                const canConnect = selectedNodeForConnection && selectedNodeForConnection.type === 'operational';
                
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      // Note: Assignment indicators are from project level
                      // This drag is for visual positioning on canvas only
                      // In production, consider if position should sync back to project level
                    }}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                    }}
                    className="z-20 node-draggable"
                  >
                    <div
                      onClick={() => handleNodeClick(node.id, 'assignment')}
                      className={`
                        px-4 py-3 rounded-xl border-2 transition-all w-[220px]
                        ${isSelected
                          ? 'bg-blue-500 border-blue-600 text-white shadow-xl shadow-blue-500/40 scale-105'
                          : canConnect
                          ? 'bg-blue-500/30 border-blue-500 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 hover:scale-105'
                          : 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20'
                        }
                        cursor-pointer
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium opacity-70">
                          Assignment #{node.counter}
                        </span>
                        <Badge 
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs ${isSelected ? 'bg-blue-600 text-white' : ''}`}
                        >
                          {node.connections.length} links
                        </Badge>
                      </div>
                      
                      <div className="text-sm mb-2">{node.name}</div>
                      
                      {node.description && (
                        <p className="text-xs opacity-70 line-clamp-2">
                          {node.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Operational Indicator Nodes (Right) */}
              {operationalIndicatorNodes.map((node) => {
                const isSelected = selectedNodeForConnection?.id === node.id;
                const canConnect = selectedNodeForConnection && selectedNodeForConnection.type === 'assignment';
                const typeColors = getTypeColor(node.type);
                
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      setOperationalIndicatorNodes(operationalIndicatorNodes.map(n => 
                        n.id === node.id 
                          ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y }
                          : n
                      ));
                    }}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                    }}
                    className="z-20 node-draggable"
                  >
                    <div
                      onClick={() => handleNodeClick(node.id, 'operational')}
                      className={`
                        px-4 py-4 rounded-xl border-2 transition-all w-[220px]
                        ${isSelected
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl shadow-emerald-500/40 scale-105'
                          : canConnect
                          ? 'bg-emerald-500/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20 hover:scale-105'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20'
                        }
                        cursor-pointer
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">Operational</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOperationalIndicator(node);
                            }}
                            className="p-1 hover:bg-blue-500/20 rounded transition-colors cursor-pointer"
                            title="Edit indicator"
                          >
                            <Edit2 className="w-3 h-3 text-blue-500" />
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOperationalIndicator(node.id);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                            title="Delete indicator"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{node.name}</div>

                      {node.description && (
                        <p className="text-xs opacity-70 mb-3 line-clamp-2">
                          {node.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={`text-xs border-2 ${typeColors.bg} ${typeColors.border} ${typeColors.text}`}
                        >
                          {node.type}
                        </Badge>
                        <Badge 
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs ${isSelected ? 'bg-emerald-600 text-white' : ''}`}
                        >
                          {node.connections.length} inputs
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Column Labels */}
              <div className="absolute bottom-4 left-8 text-xs text-slate-600 dark:text-white/60 font-medium">
                📊 Assignment Indicators (Project Level)
              </div>
              <div className="absolute bottom-4 right-8 text-xs text-slate-600 dark:text-white/60 font-medium">
                🎯 Operational Indicators (Assignment Level)
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-500/10 dark:to-emerald-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>Indicator Flow:</strong>
              </p>
              <ol className="text-sm text-slate-600 dark:text-white/60 space-y-1 list-decimal list-inside">
                <li><strong>Operational Indicators</strong> are created by Leader at assignment level (tactical metrics)</li>
                <li><strong>Assignment Indicators</strong> are defined at project level and receive data (strategic KPIs)</li>
                <li>Operational indicators feed data into assignment indicators (right → left flow)</li>
                <li>Click operational indicator, then assignment indicator to create connection</li>
                <li>Drag operational indicator nodes to reposition on canvas</li>
              </ol>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Operational Indicator Modal */}
      {showOperationalIndicatorModal && (
        <OperationalIndicatorModal
          indicator={editingOperationalIndicator}
          onSave={handleSaveOperationalIndicator}
          onClose={() => {
            setShowOperationalIndicatorModal(false);
            setEditingOperationalIndicator(null);
          }}
        />
      )}
    </div>
  );
}

// Operational Indicator Modal
interface OperationalIndicatorModalProps {
  indicator: OperationalIndicatorNode | null;
  onSave: (name: string, description: string, type: OperationalIndicatorNode['type']) => void;
  onClose: () => void;
}

function OperationalIndicatorModal({ indicator, onSave, onClose }: OperationalIndicatorModalProps) {
  const [name, setName] = useState(indicator?.name || '');
  const [description, setDescription] = useState(indicator?.description || '');
  const [type, setType] = useState<OperationalIndicatorNode['type']>(indicator?.type || 'performance');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Indicator name is required');
      return;
    }
    onSave(name.trim(), description.trim(), type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-slate-900 dark:text-white mb-1">
              {indicator ? 'Edit' : 'Create'} Operational Indicator
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/60">
              Track tactical execution metrics for this assignment
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                Indicator Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Development Speed"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                placeholder="Describe what this operational indicator measures..."
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                Indicator Type <span className="text-red-500">*</span>
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as OperationalIndicatorNode['type'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
              >
                <option value="performance">Performance - Speed & velocity metrics</option>
                <option value="quality">Quality - Code/output quality measures</option>
                <option value="efficiency">Efficiency - Resource utilization metrics</option>
                <option value="output">Output - Deliverable quantity metrics</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                💡 <strong>Tip:</strong> Connect this to assignment indicators after creation to establish data flow
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {indicator ? 'Update' : 'Create'} Indicator
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}