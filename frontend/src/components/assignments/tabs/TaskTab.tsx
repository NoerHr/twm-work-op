import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, AlertCircle, CheckCircle2, GitBranch, Edit, Trash2, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Assignment } from '../../../types/assignment';

interface TaskTabProps {
  assignment: Assignment;
}

// Task nodes for workflow canvas
interface TaskNode {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  assignedTo: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
  description?: string;
  pillarConfig?: {
    hasInput: boolean;
    hasTrigger: boolean;
    hasForm: boolean;
    hasOutput: boolean;
  };
}

const INITIAL_TASK_NODES: TaskNode[] = [
  {
    id: 'task-1',
    title: 'Create Design Mockups',
    status: 'completed',
    assignedTo: 'Alice Chen',
    position: { x: 100, y: 100 },
    connections: ['task-2', 'task-3'],
    description: 'Design initial UI mockups',
    pillarConfig: {
      hasInput: true,
      hasTrigger: true,
      hasForm: true,
      hasOutput: true
    }
  },
  {
    id: 'task-2',
    title: 'Review with Stakeholders',
    status: 'active',
    assignedTo: 'Bob Smith',
    position: { x: 450, y: 80 },
    connections: ['task-4'],
    description: 'Present mockups to stakeholders',
    pillarConfig: {
      hasInput: true,
      hasTrigger: true,
      hasForm: true,
      hasOutput: false
    }
  },
  {
    id: 'task-3',
    title: 'Technical Feasibility Check',
    status: 'active',
    assignedTo: 'Carol Lee',
    position: { x: 450, y: 250 },
    connections: ['task-4'],
    description: 'Validate technical requirements',
    pillarConfig: {
      hasInput: true,
      hasTrigger: true,
      hasForm: false,
      hasOutput: true
    }
  },
  {
    id: 'task-4',
    title: 'Final Implementation',
    status: 'pending',
    assignedTo: 'Unassigned',
    position: { x: 800, y: 165 },
    connections: [],
    description: 'Execute implementation plan',
    pillarConfig: {
      hasInput: false,
      hasTrigger: false,
      hasForm: false,
      hasOutput: false
    }
  }
];

export function TaskTab({ assignment }: TaskTabProps) {
  const [taskNodes, setTaskNodes] = useState<TaskNode[]>(INITIAL_TASK_NODES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleCreateTask = () => {
    navigate(`/my-assignments/${assignment.id}/create-task`);
  };

  const handleNodeClick = (taskId: string) => {
    if (selectedNode === taskId) {
      // Double click to edit
      navigate(`/my-assignments/${assignment.id}/tasks/${taskId}`);
    } else {
      setSelectedNode(taskId);
    }
  };

  const handleEditTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/my-assignments/${assignment.id}/tasks/${taskId}`);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      // Remove task and its connections
      setTaskNodes(prev => {
        const filtered = prev.filter(n => n.id !== taskId);
        return filtered.map(n => ({
          ...n,
          connections: n.connections.filter(c => c !== taskId)
        }));
      });
      setSelectedNode(null);
    }
  };

  const getStatusColor = (status: TaskNode['status']) => {
    const colors = {
      pending: {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500',
        text: 'text-slate-700 dark:text-slate-300',
        shadow: 'shadow-slate-500/20'
      },
      active: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        shadow: 'shadow-blue-500/20'
      },
      completed: {
        bg: 'bg-green-500/20',
        border: 'border-green-500',
        text: 'text-green-700 dark:text-green-300',
        shadow: 'shadow-green-500/20'
      }
    };
    return colors[status];
  };

  const getStatusIcon = (status: TaskNode['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'active': return <Play className="w-3.5 h-3.5" />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  // Calculate stats
  const stats = {
    total: taskNodes.length,
    pending: taskNodes.filter(t => t.status === 'pending').length,
    active: taskNodes.filter(t => t.status === 'active').length,
    completed: taskNodes.filter(t => t.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl text-slate-900 dark:text-white mb-1">Task Workflow Canvas</h2>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Design execution flow and break down assignment into tasks using 4-Pillar Model
          </p>
        </div>
        <Button
          onClick={handleCreateTask}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Task
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Total Tasks</p>
              <p className="text-2xl text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Pending</p>
              <p className="text-2xl text-slate-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Active</p>
              <p className="text-2xl text-slate-900 dark:text-white">{stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-white/60 mb-1">Completed</p>
              <p className="text-2xl text-slate-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Task Canvas */}
      {taskNodes.length === 0 ? (
        // Empty State
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Tasks Yet</h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
            Start building your workflow by creating your first task
          </p>
          <Button
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Task
          </Button>
        </GlassCard>
      ) : (
        // Task Flow Visualization
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-500" />
              <h3 className="text-slate-900 dark:text-white">Interactive Workflow Canvas</h3>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {taskNodes.length} Task{taskNodes.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-slate-600 dark:text-white/60">
                💡 Drag to reposition • Click to select • Double-click to edit
              </span>
            </div>
          </div>

          {/* Canvas Area - Interactive Drag & Drop */}
          <div 
            ref={canvasRef}
            onClick={() => setSelectedNode(null)}
            className="relative bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 p-8 min-h-[700px] overflow-hidden"
          >
            {/* Grid Background Pattern */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} 
            />

            {/* Connection Lines (Behind Nodes) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <marker
                  id="arrowhead-task"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" opacity="0.6" />
                </marker>
              </defs>

              {taskNodes.map((node) =>
                node.connections.map((targetId) => {
                  const target = taskNodes.find(n => n.id === targetId);
                  if (!target) return null;
                  
                  const startX = node.position.x + 240; // Node width
                  const startY = node.position.y + 60; // Half node height
                  const endX = target.position.x;
                  const endY = target.position.y + 60;
                  
                  // Curved bezier path
                  const midX = (startX + endX) / 2;
                  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  
                  return (
                    <g key={`${node.id}-${targetId}`}>
                      <path
                        d={path}
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        fill="none"
                        opacity="0.4"
                        strokeDasharray="6 3"
                        markerEnd="url(#arrowhead-task)"
                      />
                    </g>
                  );
                })
              )}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 p-3 space-y-2 z-20 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600 dark:text-white/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-600 dark:text-white/60">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-600 dark:text-white/60">Pending</span>
              </div>
              <div className="border-t border-slate-200 dark:border-white/10 pt-2 mt-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-slate-600 dark:text-white/60">Dependencies</span>
                </div>
              </div>
            </div>

            {/* Task Nodes */}
            <div className="relative" style={{ zIndex: 2 }}>
              {taskNodes.map((node) => {
                const statusColors = getStatusColor(node.status);
                const isSelected = selectedNode === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      setTaskNodes(prev => prev.map(n => 
                        n.id === node.id 
                          ? { ...n, position: { x: n.position.x + info.offset.x, y: n.position.y + info.offset.y } }
                          : n
                      ));
                    }}
                    style={{
                      position: 'absolute',
                      left: node.position.x,
                      top: node.position.y,
                    }}
                    className="z-20"
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node.id);
                      }}
                      className={`
                        w-[240px] px-4 py-3 rounded-xl border-2 transition-all cursor-pointer
                        bg-white dark:bg-slate-800
                        ${isSelected 
                          ? 'border-purple-500 shadow-xl shadow-purple-500/30' 
                          : `${statusColors.border} shadow-lg ${statusColors.shadow}`
                        }
                        hover:shadow-xl
                      `}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`text-xs border-2 ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(node.status)}
                            {node.status}
                          </span>
                        </Badge>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <div
                            onClick={(e) => handleEditTask(node.id, e)}
                            className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all cursor-pointer"
                            title="Edit task"
                          >
                            <Edit className="w-3 h-3" />
                          </div>
                          <div
                            onClick={(e) => handleDeleteTask(node.id, e)}
                            className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Task Title */}
                      <h4 className="text-sm text-slate-900 dark:text-white mb-2 pr-2">
                        {node.title}
                      </h4>
                      
                      {/* Description */}
                      {node.description && (
                        <p className="text-xs text-slate-600 dark:text-white/60 mb-3 line-clamp-2">
                          {node.description}
                        </p>
                      )}

                      {/* Assignee */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-white/60">
                          {node.assignedTo}
                        </span>
                      </div>

                      {/* 4-Pillar Status */}
                      {node.pillarConfig && (
                        <div className="grid grid-cols-4 gap-1">
                          <div 
                            className={`h-1 rounded-full ${node.pillarConfig.hasInput ? 'bg-purple-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            title="Input"
                          />
                          <div 
                            className={`h-1 rounded-full ${node.pillarConfig.hasTrigger ? 'bg-blue-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            title="Trigger"
                          />
                          <div 
                            className={`h-1 rounded-full ${node.pillarConfig.hasForm ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            title="Form"
                          />
                          <div 
                            className={`h-1 rounded-full ${node.pillarConfig.hasOutput ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            title="Output"
                          />
                        </div>
                      )}

                      {/* Connection Indicators */}
                      {node.connections.length > 0 && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white dark:border-slate-800" />
                      )}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Instructions Overlay (show when no selection) */}
            {!selectedNode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-lg border border-purple-500/30 px-4 py-2 shadow-lg z-20"
              >
                <p className="text-xs text-slate-600 dark:text-white/60 text-center">
                  <strong className="text-purple-600 dark:text-purple-400">Tip:</strong> Drag nodes to arrange • Click once to select • Double-click to edit
                </p>
              </motion.div>
            )}
          </div>

          {/* Canvas Instructions */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>4-Pillar Task Model:</strong>
                </p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-purple-500" />
                    <span>Input - Data sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-blue-500" />
                    <span>Trigger - Activation rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-emerald-500" />
                    <span>Form - User interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full bg-amber-500" />
                    <span>Output - Actions & effects</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Canvas Controls:</strong>
                </p>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-white/60 list-disc list-inside">
                  <li>Drag nodes to reposition on canvas</li>
                  <li>Click task once to select/deselect</li>
                  <li>Double-click to open task editor</li>
                  <li>Use edit/delete icons for quick actions</li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Task List View (Alternative View) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white">Task List View</h3>
          <Badge variant="outline" className="text-xs">
            {taskNodes.length} total
          </Badge>
        </div>
        
        {taskNodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600 dark:text-white/60">No tasks created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {taskNodes.map((node) => {
              const statusColors = getStatusColor(node.status);
              
              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleNodeClick(node.id)}
                  className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Badge className={`text-xs border-2 ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                        {getStatusIcon(node.status)}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="text-sm text-slate-900 dark:text-white mb-1">
                          {node.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/60">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {node.assignedTo}
                          </span>
                          {node.connections.length > 0 && (
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {node.connections.length} dependencies
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        onClick={(e) => handleEditTask(node.id, e)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </div>
                      <div
                        onClick={(e) => handleDeleteTask(node.id, e)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}