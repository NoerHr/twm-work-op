import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useWorkflowStore, type WorkflowNode as WorkflowNodeType } from '../../store/workflowStore';
import {
  GripVertical,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  gridSize: number;
  isSelected: boolean;
  readOnly?: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onConnectionStart: () => void;
  onDetail?: () => void;
}

const NODE_HEIGHT = 80;
const NODE_MIN_WIDTH = 160;

export function WorkflowNode({
  node,
  gridSize,
  isSelected,
  readOnly = false,
  onClick,
  onDoubleClick,
  onConnectionStart,
  onDetail
}: WorkflowNodeProps) {
  const { updateNode, resizeNode, moveNode } = useWorkflowStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  // Ensure startDate is a Date object
  const startDate = node.startDate instanceof Date ? node.startDate : new Date(node.startDate);
  const nodeWidth = Math.max(node.duration * gridSize, NODE_MIN_WIDTH);

  // Handle node drag
  const handleDragStart = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || readOnly) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Snap to grid
    const snappedX = Math.round(newX / gridSize) * gridSize;
    
    updateNode(node.id, {
      position: { x: snappedX, y: newY }
    });
  };

  const handleDragEnd = () => {
    if (isDragging) {
      // Update actual start date based on position
      const days = Math.round(node.position.x / gridSize);
      const newStartDate = new Date();
      newStartDate.setDate(newStartDate.getDate() + days);
      moveNode(node.id, newStartDate);
    }
    setIsDragging(false);
  };

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || readOnly) return;
    
    const nodeLeft = node.position.x;
    const mouseX = e.clientX - (nodeRef.current?.getBoundingClientRect().left || 0) + nodeLeft;
    const newWidth = mouseX - nodeLeft;
    const newDuration = Math.max(1, Math.round(newWidth / gridSize));
    
    resizeNode(node.id, newDuration);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Handle global mouse events during drag/resize
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDrag(e as any);
      } else if (isResizing) {
        handleResize(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      handleDragEnd();
      handleResizeEnd();
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <motion.div
      ref={nodeRef}
      layout
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="absolute group"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeWidth,
        height: NODE_HEIGHT,
        zIndex: isSelected ? 10 : 1
      }}
    >
      {/* Connection Points */}
      <motion.div
        whileHover={{ scale: 1.3 }}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 cursor-crosshair z-10 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${node.color || '#8B5CF6'}, ${node.color || '#8B5CF6'}dd)`
        }}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionStart();
        }}
        title="Create dependency from here"
      >
        <ChevronRight className="w-full h-full p-1 text-white" />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.3 }}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 cursor-crosshair z-10 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${node.color || '#8B5CF6'}, ${node.color || '#8B5CF6'}dd)`
        }}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionStart();
        }}
        title="Create dependency to here"
      >
        <ChevronRight className="w-full h-full p-1 text-white rotate-180" />
      </motion.div>

      {/* Main Node - Premium Glass Design */}
      <motion.div
        whileHover={{ scale: readOnly ? 1 : 1.02, y: -2 }}
        className={`h-full rounded-xl overflow-hidden transition-all backdrop-blur-xl border shadow-2xl relative ${
          isSelected 
            ? 'ring-2 ring-purple-500 shadow-purple-500/50' 
            : 'border-white/20'
        } ${isDragging ? 'cursor-grabbing opacity-70 scale-105' : 'cursor-pointer'} ${
          node.hasGate ? 'ring-2 ring-purple-400' : ''
        }`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          background: node.color 
            ? `linear-gradient(135deg, ${node.color}25 0%, ${node.color}10 50%, ${node.color}05 100%)`
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(139, 92, 246, 0.03) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: isSelected 
            ? `0 20px 60px -15px ${node.color || '#8B5CF6'}40, 0 0 0 1px ${node.color || '#8B5CF6'}30`
            : '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(circle at top right, ${node.color || '#8B5CF6'}15, transparent 70%)`
          }}
        />

        {/* Header Bar */}
        <div
          className="relative flex items-center gap-2 px-4 py-2.5 border-b backdrop-blur-xl cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          style={{
            background: `linear-gradient(to right, ${node.color || '#8B5CF6'}30, ${node.color || '#8B5CF6'}10)`,
            borderColor: `${node.color || '#8B5CF6'}20`
          }}
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {!readOnly && (
              <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            
            {node.hasGate ? (
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `${node.color || '#8B5CF6'}30`,
                  border: `1.5px solid ${node.color || '#8B5CF6'}`
                }}
              >
                <Shield className="w-4 h-4" style={{ color: node.color || '#8B5CF6' }} />
              </div>
            ) : (
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `${node.color || '#8B5CF6'}20`,
                  border: `1.5px solid ${node.color || '#8B5CF6'}40`
                }}
              >
                <Circle className="w-3.5 h-3.5" style={{ color: node.color || '#8B5CF6' }} />
              </div>
            )}
          </div>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm truncate" style={{ color: node.color || '#8B5CF6' }}>
              {node.name}
            </h4>
          </div>
          
          {/* Duration Badge */}
          <div 
            className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-xl"
            style={{
              background: `${node.color || '#8B5CF6'}25`,
              color: node.color || '#8B5CF6',
              border: `1px solid ${node.color || '#8B5CF6'}30`
            }}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            {node.duration}d
          </div>
        </div>

        {/* Content Area */}
        <div className="relative px-4 py-3">
          {node.description ? (
            <p className="text-xs text-slate-600 dark:text-white/70 line-clamp-2 leading-relaxed">
              {node.description}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40 italic">
              <Sparkles className="w-3 h-3" />
              <span>Click to add details</span>
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>

      {/* Resize Handle */}
      {!readOnly && (
        <div
          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize group/resize z-20"
          onMouseDown={handleResizeStart}
        >
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-full opacity-0 group-hover/resize:opacity-100 transition-all shadow-lg"
            style={{
              background: `linear-gradient(to bottom, ${node.color || '#8B5CF6'}80, ${node.color || '#8B5CF6'})`
            }}
          />
        </div>
      )}

      {/* Timeline Indicator */}
      <div className="absolute -bottom-6 left-0 right-0">
        <div className="flex items-center justify-center gap-1">
          <div className="glass-card px-3 py-1 rounded-full border border-white/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[10px]">
              <Calendar className="w-3 h-3 text-blue-500" />
              <span className="text-slate-600 dark:text-white/60">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-slate-400 dark:text-white/40">→</span>
              <span className="text-slate-600 dark:text-white/60">
                {new Date(startDate.getTime() + node.duration * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Gate Indicator Badge */}
      {node.hasGate && (
        <div 
          className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border-2 border-white dark:border-slate-900 shadow-lg z-20"
          style={{
            background: `linear-gradient(135deg, ${node.color || '#8B5CF6'}, ${node.color || '#8B5CF6'}dd)`,
            color: 'white'
          }}
        >
          <Shield className="w-2.5 h-2.5 inline mr-0.5" />
          GATE
        </div>
      )}
    </motion.div>
  );
}