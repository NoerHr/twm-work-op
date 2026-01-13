import { useState } from 'react';
import { Plus, Target, Trash2, Link as LinkIcon, Circle, GripVertical, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { useIndicatorStore } from '../../../store/indicatorStore';
import type { Indicator, Assignment, Stage } from '../../../types/project';
import type { IndicatorDefinition } from '../../../types/indicator';

interface IndicatorsTabProps {
  projectId?: string;
  projectName?: string;
  indicators: Indicator[];
  assignments?: Assignment[];
  stages?: Stage[];
  onChange: (indicators: Indicator[]) => void;
}

interface AssignmentIndicatorNode {
  id: string;
  name: string;
  assignmentId: string;
  assignmentName: string;
  counter: number; // Assignment P #1, #2, #3, etc
  x: number;
  y: number;
  connections: string[]; // Connected project indicator IDs
}

interface ProjectIndicatorNode {
  id: string;
  name: string;
  x: number;
  y: number;
  connections: string[]; // Connected assignment indicator IDs
}

// Mock data for demo
const MOCK_STAGES = [
  { id: 's1', name: 'Development' },
  { id: 's2', name: 'Design' },
  { id: 's3', name: 'Testing' },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { 
    id: 'a1', 
    name: 'Frontend Development', 
    stageId: 's1',
    description: 'Build React components',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    createdAt: new Date(),
    priority: 'high',
    leaders: [],
    resources: []
  },
  { 
    id: 'a2', 
    name: 'Backend API', 
    stageId: 's1',
    description: 'REST API development',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    createdAt: new Date(),
    priority: 'high',
    leaders: [],
    resources: []
  },
  { 
    id: 'a3', 
    name: 'UI/UX Design', 
    stageId: 's2',
    description: 'Design system creation',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    createdAt: new Date(),
    priority: 'medium',
    leaders: [],
    resources: []
  },
];

export function IndicatorsTab({ 
  projectId, 
  projectName, 
  indicators, 
  assignments = [],
  stages = [],
  onChange 
}: IndicatorsTabProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showProjectIndicatorModal, setShowProjectIndicatorModal] = useState(false);
  const [showAssignmentIndicatorModal, setShowAssignmentIndicatorModal] = useState(false);
  const [editingProjectIndicator, setEditingProjectIndicator] = useState<ProjectIndicatorNode | null>(null);
  const [selectedAssignmentForNewIndicator, setSelectedAssignmentForNewIndicator] = useState<Assignment | null>(null);
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<{ id: string; type: 'assignment' | 'project' } | null>(null);
  const [zoom, setZoom] = useState(1);
  
  // Store hooks
  const addIndicator = useIndicatorStore((state) => state.addIndicator);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Use real data if available, otherwise use mock
  const validStages = stages.length > 0 ? stages : MOCK_STAGES;
  const validAssignments = assignments.length > 0 ? assignments : MOCK_ASSIGNMENTS;

  // Filter assignments by selected stage
  const filteredAssignments = selectedStage 
    ? validAssignments.filter(a => a.stageId === selectedStage)
    : [];

  // Assignment Indicator Nodes (left side)
  const [assignmentIndicatorNodes, setAssignmentIndicatorNodes] = useState<AssignmentIndicatorNode[]>([
    {
      id: 'ai-1',
      name: 'Sprint Velocity',
      assignmentId: 'a1',
      assignmentName: 'Frontend Development',
      counter: 1,
      x: 100,
      y: 100,
      connections: ['pi-1', 'pi-2']
    },
    {
      id: 'ai-2',
      name: 'Code Coverage',
      assignmentId: 'a1',
      assignmentName: 'Frontend Development',
      counter: 2,
      x: 100,
      y: 220,
      connections: ['pi-1']
    },
    {
      id: 'ai-3',
      name: 'API Response Time',
      assignmentId: 'a2',
      assignmentName: 'Backend API',
      counter: 1,
      x: 100,
      y: 340,
      connections: ['pi-2', 'pi-3']
    },
  ]);

  // Project Indicator Nodes (right side)
  const [projectIndicatorNodes, setProjectIndicatorNodes] = useState<ProjectIndicatorNode[]>([
    {
      id: 'pi-1',
      name: 'Overall Progress',
      x: 650,
      y: 120,
      connections: ['ai-1', 'ai-2']
    },
    {
      id: 'pi-2',
      name: 'Quality Score',
      x: 650,
      y: 270,
      connections: ['ai-1', 'ai-3']
    },
    {
      id: 'pi-3',
      name: 'Performance Index',
      x: 650,
      y: 420,
      connections: ['ai-3']
    },
  ]);

  // Get counter for next assignment indicator
  const getNextCounter = (assignmentId: string) => {
    const existing = assignmentIndicatorNodes.filter(n => n.assignmentId === assignmentId);
    return existing.length + 1;
  };

  // Handle drag assignment from sidebar to create assignment indicator
  const handleDragStart = (e: React.DragEvent, assignment: Assignment) => {
    e.dataTransfer.setData('assignment', JSON.stringify(assignment));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assignmentData = e.dataTransfer.getData('assignment');
    if (!assignmentData) return;

    const assignment: Assignment = JSON.parse(assignmentData);
    
    // Set assignment for modal
    setSelectedAssignmentForNewIndicator(assignment);
    setShowAssignmentIndicatorModal(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Create assignment indicator
  const handleCreateAssignmentIndicator = (indicatorName: string, indicatorDescription: string) => {
    if (!selectedAssignmentForNewIndicator) return;

    const counter = getNextCounter(selectedAssignmentForNewIndicator.id);
    const newNode: AssignmentIndicatorNode = {
      id: `ai-${Date.now()}`,
      name: indicatorName,
      assignmentId: selectedAssignmentForNewIndicator.id,
      assignmentName: selectedAssignmentForNewIndicator.name,
      counter,
      x: 100,
      y: 100 + (assignmentIndicatorNodes.length * 120),
      connections: []
    };

    setAssignmentIndicatorNodes([...assignmentIndicatorNodes, newNode]);
    setShowAssignmentIndicatorModal(false);
    setSelectedAssignmentForNewIndicator(null);
    
    toast.success('Assignment Indicator Created', {
      description: `${selectedAssignmentForNewIndicator.name} #${counter} created`,
    });
  };

  // Create project indicator
  const handleCreateProjectIndicator = () => {
    setEditingProjectIndicator(null);
    setShowProjectIndicatorModal(true);
  };

  const handleSaveProjectIndicator = (indicator: Indicator) => {
    if (editingProjectIndicator) {
      // Update existing
      setProjectIndicatorNodes(projectIndicatorNodes.map(n => 
        n.id === editingProjectIndicator.id 
          ? { ...n, name: indicator.name }
          : n
      ));
      toast.success('Indicator updated');
    } else {
      // Create new
      const newNode: ProjectIndicatorNode = {
        id: `pi-${Date.now()}`,
        name: indicator.name,
        x: 650,
        y: 100 + (projectIndicatorNodes.length * 150),
        connections: []
      };
      
      setProjectIndicatorNodes([...projectIndicatorNodes, newNode]);
      
      // Add to parent indicators
      onChange([...indicators, indicator]);
      
      // Add to indicator store
      if (projectId && projectName) {
        const indicatorDefinition: IndicatorDefinition = {
          id: newNode.id,
          name: indicator.name,
          description: indicator.description,
          level: 'project',
          projectId,
          values: [
            {
              key: 'value',
              label: 'Value',
              type: 'percentage',
              source: 'manual',
              unit: '%'
            }
          ],
          connections: [],
          visualizations: [
            {
              id: `widget-${newNode.id}`,
              type: 'gauge',
              indicatorId: newNode.id,
              title: indicator.name,
              valueKey: 'value',
              size: { w: 2, h: 2 },
              position: { x: 0, y: 0 },
              config: {
                thresholds: [
                  { id: 't1', color: 'red', min: 0, max: 50, label: 'At Risk' },
                  { id: 't2', color: 'yellow', min: 50, max: 75, label: 'Warning' },
                  { id: 't3', color: 'green', min: 75, max: 100, label: 'On Track' }
                ],
                decimals: 0,
                suffix: '%'
              }
            }
          ],
          createdBy: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: [projectName?.toLowerCase().replace(/\s+/g, '-') || 'project']
        };
        
        try {
          addIndicator(indicatorDefinition);
          toast.success('Project Indicator Created');
        } catch (error) {
          console.error('Failed to add indicator to store:', error);
        }
      }
    }
    
    setShowProjectIndicatorModal(false);
    setEditingProjectIndicator(null);
  };

  // Delete indicators
  const handleDeleteAssignmentIndicator = (id: string) => {
    if (!confirm('Delete this assignment indicator?')) return;
    
    // Remove from project indicator connections
    setProjectIndicatorNodes(projectIndicatorNodes.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== id)
    })));
    
    setAssignmentIndicatorNodes(assignmentIndicatorNodes.filter(n => n.id !== id));
    toast.success('Assignment indicator deleted');
  };

  const handleDeleteProjectIndicator = (id: string) => {
    if (!confirm('Delete this project indicator?')) return;
    
    // Remove from assignment indicator connections
    setAssignmentIndicatorNodes(assignmentIndicatorNodes.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== id)
    })));
    
    setProjectIndicatorNodes(projectIndicatorNodes.filter(n => n.id !== id));
    onChange(indicators.filter(ind => ind.id !== id));
    toast.success('Project indicator deleted');
  };

  // Handle connections
  const handleNodeClick = (nodeId: string, type: 'assignment' | 'project') => {
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
      const projectNodeId = type === 'project' ? nodeId : selectedNodeForConnection.id;
      
      handleToggleConnection(assignmentNodeId, projectNodeId);
      setSelectedNodeForConnection(null);
    }
  };

  const handleToggleConnection = (assignmentIndicatorId: string, projectIndicatorId: string) => {
    const assignmentNode = assignmentIndicatorNodes.find(n => n.id === assignmentIndicatorId);
    const projectNode = projectIndicatorNodes.find(n => n.id === projectIndicatorId);
    
    if (!assignmentNode || !projectNode) return;

    const isConnected = assignmentNode.connections.includes(projectIndicatorId);

    if (isConnected) {
      // Remove connection
      setAssignmentIndicatorNodes(assignmentIndicatorNodes.map(n => 
        n.id === assignmentIndicatorId 
          ? { ...n, connections: n.connections.filter(c => c !== projectIndicatorId) }
          : n
      ));
      setProjectIndicatorNodes(projectIndicatorNodes.map(n => 
        n.id === projectIndicatorId 
          ? { ...n, connections: n.connections.filter(c => c !== assignmentIndicatorId) }
          : n
      ));
      toast.success('Connection removed');
    } else {
      // Add connection
      setAssignmentIndicatorNodes(assignmentIndicatorNodes.map(n => 
        n.id === assignmentIndicatorId 
          ? { ...n, connections: [...n.connections, projectIndicatorId] }
          : n
      ));
      setProjectIndicatorNodes(projectIndicatorNodes.map(n => 
        n.id === projectIndicatorId 
          ? { ...n, connections: [...n.connections, assignmentIndicatorId] }
          : n
      ));
      toast.success('Connection created');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-slate-900 dark:text-white mb-2">Indicator Relationship Builder</h2>
        <p className="text-sm text-slate-600 dark:text-white/60">
          Drag assignments from sidebar to create assignment indicators, then connect them to project indicators.
        </p>
      </div>

      {/* Main Canvas Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Stage & Assignment Selector */}
        <div className="col-span-3">
          <GlassCard className="p-4">
            <h3 className="text-sm text-slate-900 dark:text-white mb-4">Drag to Create</h3>
            
            {/* Stage Dropdown */}
            <div className="mb-4">
              <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                Stage
              </label>
              <select
                value={selectedStage || ''}
                onChange={(e) => setSelectedStage(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
              >
                <option value="">Select stage...</option>
                {validStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Draggable Assignment List */}
            {selectedStage && (
              <div className="space-y-2">
                <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                  Assignments (Drag to Canvas)
                </label>
                {filteredAssignments.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-white/50 text-center py-4">
                    No assignments in this stage
                  </p>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const indicatorCount = assignmentIndicatorNodes.filter(
                      n => n.assignmentId === assignment.id
                    ).length;
                    
                    return (
                      <div
                        key={assignment.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, assignment)}
                        className="p-3 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-900 dark:text-white flex-1">
                            {assignment.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-white/60">
                          <span>Drag to create indicator</span>
                          {indicatorCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {indicatorCount} indicator{indicatorCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/60">Assignment Indicators</span>
                <Badge variant="default" className="text-xs">{assignmentIndicatorNodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/60">Project Indicators</span>
                <Badge variant="default" className="text-xs">{projectIndicatorNodes.length}</Badge>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 <strong>How to use:</strong><br/>
                1. Select stage<br/>
                2. Drag assignment to canvas<br/>
                3. Click nodes to connect
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
                  Assignment indicators (left) → Project indicators (right)
                </p>
              </div>
              <Button 
                onClick={handleCreateProjectIndicator}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project Indicator
              </Button>
            </div>

            {/* Canvas Drop Zone */}
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 min-h-[600px] overflow-hidden"
            >
              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-white/10">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-slate-600 dark:text-white/60" />
                </button>
                <span className="text-xs text-slate-600 dark:text-white/60 font-medium min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-slate-600 dark:text-white/60" />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors text-slate-600 dark:text-white/60"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

              {/* Connection Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#a855f7" opacity="0.6" />
                  </marker>
                </defs>
                
                {assignmentIndicatorNodes.map((assignmentNode) => 
                  assignmentNode.connections.map((projectNodeId) => {
                    const projectNode = projectIndicatorNodes.find(n => n.id === projectNodeId);
                    if (!projectNode) return null;
                    
                    const startX = assignmentNode.x + 220;
                    const startY = assignmentNode.y + 35;
                    const endX = projectNode.x;
                    const endY = projectNode.y + 35;
                    
                    return (
                      <g key={`${assignmentNode.id}-${projectNodeId}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#a855f7"
                          strokeWidth="2.5"
                          strokeDasharray="6 3"
                          opacity="0.5"
                          markerEnd="url(#arrowhead)"
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
                  <Circle className="w-3 h-3 fill-purple-500 text-purple-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Project Indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Connection</span>
                </div>
              </div>

              {/* Assignment Indicator Nodes (Left) */}
              {assignmentIndicatorNodes.map((node) => {
                const isSelected = selectedNodeForConnection?.id === node.id;
                const canConnect = selectedNodeForConnection && selectedNodeForConnection.type === 'project';
                
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      setAssignmentIndicatorNodes(assignmentIndicatorNodes.map(n => 
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
                    className="z-20"
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
                          {node.assignmentName} #{node.counter}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignmentIndicator(node.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{node.name}</div>
                      
                      <Badge 
                        variant={isSelected ? "default" : "outline"}
                        className={`text-xs ${isSelected ? 'bg-blue-600 text-white' : ''}`}
                      >
                        {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}

              {/* Project Indicator Nodes (Right) */}
              {projectIndicatorNodes.map((node) => {
                const isSelected = selectedNodeForConnection?.id === node.id;
                const canConnect = selectedNodeForConnection && selectedNodeForConnection.type === 'assignment';
                
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      setProjectIndicatorNodes(projectIndicatorNodes.map(n => 
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
                    className="z-20"
                  >
                    <div
                      onClick={() => handleNodeClick(node.id, 'project')}
                      className={`
                        px-4 py-4 rounded-xl border-2 transition-all w-[200px]
                        ${isSelected
                          ? 'bg-purple-500 border-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : canConnect
                          ? 'bg-purple-500/30 border-purple-500 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/20 hover:scale-105'
                          : 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/20'
                        }
                        cursor-pointer
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="text-xs font-medium">Project KPI</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProjectIndicator(node.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </div>
                      </div>
                      
                      <div className="text-sm mb-3">{node.name}</div>
                      
                      <Badge 
                        variant={isSelected ? "default" : "outline"}
                        className={`text-xs ${isSelected ? 'bg-purple-600 text-white' : ''}`}
                      >
                        {node.connections.length} input{node.connections.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}

              {/* Column Labels */}
              <div className="absolute bottom-4 left-8 text-xs text-slate-600 dark:text-white/60 font-medium">
                📊 Assignment Indicators
              </div>
              <div className="absolute bottom-4 right-8 text-xs text-slate-600 dark:text-white/60 font-medium">
                🎯 Project Indicators
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>How to use:</strong>
              </p>
              <ol className="text-sm text-slate-600 dark:text-white/60 mt-2 space-y-1 list-decimal list-inside">
                <li>Select stage → Drag assignment to canvas to create assignment indicator</li>
                <li>1 assignment can have multiple indicators (Assignment P #1, #2, #3...)</li>
                <li>Click assignment indicator node, then click project indicator to connect</li>
                <li>Drag nodes to reposition them on the canvas</li>
              </ol>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Assignment Indicator Modal */}
      {showAssignmentIndicatorModal && selectedAssignmentForNewIndicator && (
        <AssignmentIndicatorModal
          assignment={selectedAssignmentForNewIndicator}
          counter={getNextCounter(selectedAssignmentForNewIndicator.id)}
          onSave={handleCreateAssignmentIndicator}
          onClose={() => {
            setShowAssignmentIndicatorModal(false);
            setSelectedAssignmentForNewIndicator(null);
          }}
        />
      )}

      {/* Project Indicator Modal */}
      {showProjectIndicatorModal && (
        <ProjectIndicatorModal
          indicator={editingProjectIndicator}
          onSave={handleSaveProjectIndicator}
          onClose={() => {
            setShowProjectIndicatorModal(false);
            setEditingProjectIndicator(null);
          }}
        />
      )}
    </div>
  );
}

// Assignment Indicator Modal
interface AssignmentIndicatorModalProps {
  assignment: Assignment;
  counter: number;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

function AssignmentIndicatorModal({ assignment, counter, onSave, onClose }: AssignmentIndicatorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Indicator name is required');
      return;
    }
    onSave(name.trim(), description.trim());
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
              Create Assignment Indicator
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/60">
              {assignment.name} #{counter}
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
                placeholder="e.g., Sprint Velocity"
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
                placeholder="Describe what this indicator measures..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Indicator
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

// Project Indicator Modal
interface ProjectIndicatorModalProps {
  indicator: ProjectIndicatorNode | null;
  onSave: (indicator: Indicator) => void;
  onClose: () => void;
}

function ProjectIndicatorModal({ indicator, onSave, onClose }: ProjectIndicatorModalProps) {
  const [name, setName] = useState(indicator?.name || '');
  const [description, setDescription] = useState('');
  const [widget, setWidget] = useState('gauge');
  const [useInGates, setUseInGates] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Indicator name is required');
      return;
    }

    const newIndicator: Indicator = {
      id: indicator?.id || `pi-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      scope: 'project',
      type: 'manual',
      visibility: {
        showOnDashboard: true,
        useInGates
      },
      visualization: {
        widget: widget as any,
        thresholds: {
          red: 50,
          yellow: 75,
          green: 90
        }
      }
    };

    onSave(newIndicator);
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
            <h3 className="text-slate-900 dark:text-white">
              {indicator ? 'Edit' : 'Create'} Project Indicator
            </h3>
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
                placeholder="e.g., Overall Progress"
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
                placeholder="Describe what this indicator measures..."
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-white/60 mb-2">
                Visualization Type
              </label>
              <select 
                value={widget}
                onChange={(e) => setWidget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
              >
                <option value="gauge">Gauge</option>
                <option value="line-chart">Line Chart</option>
                <option value="bar-chart">Bar Chart</option>
                <option value="big-number">Big Number</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
              <span className="text-sm text-slate-900 dark:text-white">Use as Gate Trigger</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useInGates}
                  onChange={(e) => setUseInGates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
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