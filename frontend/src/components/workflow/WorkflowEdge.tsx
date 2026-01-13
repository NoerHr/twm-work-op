import React from 'react';
import { motion } from 'motion/react';
import type { WorkflowEdge as WorkflowEdgeType, WorkflowNode } from '../../store/workflowStore';

interface WorkflowEdgeProps {
  edge: WorkflowEdgeType;
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  gridSize: number;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const NODE_HEIGHT = 60;

export function WorkflowEdge({
  edge,
  sourceNode,
  targetNode,
  gridSize,
  isSelected,
  onClick,
  onContextMenu
}: WorkflowEdgeProps) {
  // Calculate positions
  const sourceX = sourceNode.position.x + (sourceNode.duration * gridSize);
  const sourceY = sourceNode.position.y + NODE_HEIGHT / 2;
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + NODE_HEIGHT / 2;

  // Determine routing style based on positions
  const isStraight = Math.abs(sourceY - targetY) < 10;
  const needsGap = targetNode.lane !== sourceNode.lane || targetX - sourceX > gridSize * 2;

  // Generate path
  let pathD: string;
  
  if (isStraight && !needsGap) {
    // Simple straight line
    pathD = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  } else {
    // Curved routing with gap
    const midX = sourceX + (targetX - sourceX) / 2;
    const controlOffset = Math.min(50, (targetX - sourceX) / 4);
    
    if (targetY > sourceY) {
      // Target is below source
      pathD = `
        M ${sourceX} ${sourceY}
        C ${sourceX + controlOffset} ${sourceY},
          ${midX - controlOffset} ${sourceY},
          ${midX} ${(sourceY + targetY) / 2}
        C ${midX + controlOffset} ${(sourceY + targetY) / 2},
          ${targetX - controlOffset} ${targetY},
          ${targetX} ${targetY}
      `;
    } else if (targetY < sourceY) {
      // Target is above source
      pathD = `
        M ${sourceX} ${sourceY}
        C ${sourceX + controlOffset} ${sourceY},
          ${midX - controlOffset} ${sourceY},
          ${midX} ${(sourceY + targetY) / 2}
        C ${midX + controlOffset} ${(sourceY + targetY) / 2},
          ${targetX - controlOffset} ${targetY},
          ${targetX} ${targetY}
      `;
    } else {
      // Same level
      pathD = `
        M ${sourceX} ${sourceY}
        C ${sourceX + controlOffset} ${sourceY},
          ${targetX - controlOffset} ${targetY},
          ${targetX} ${targetY}
      `;
    }
  }

  // Arrow marker
  const arrowColor = edge.type === 'conditional' ? '#8B5CF6' : '#94A3B8';
  const markerId = `arrow-${edge.id}`;

  // Label position (midpoint)
  const labelX = sourceX + (targetX - sourceX) / 2;
  const labelY = sourceY + (targetY - sourceY) / 2;

  return (
    <g className="pointer-events-auto">
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={arrowColor}
          />
        </marker>
      </defs>

      {/* Invisible thick path for easier clicking */}
      <motion.path
        d={pathD}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        onClick={onClick}
        onContextMenu={onContextMenu}
        className="cursor-pointer"
      />

      {/* Visible path */}
      <motion.path
        d={pathD}
        stroke={arrowColor}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={edge.type === 'conditional' ? '8,4' : undefined}
        fill="none"
        markerEnd={`url(#${markerId})`}
        className="transition-all"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: 1,
          stroke: isSelected ? '#8B5CF6' : arrowColor
        }}
        transition={{ duration: 0.5 }}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />

      {/* Condition label for conditional edges */}
      {edge.type === 'conditional' && edge.conditionLabel && (
        <g>
          {/* Label background */}
          <rect
            x={labelX - 40}
            y={labelY - 12}
            width="80"
            height="24"
            rx="12"
            fill="#8B5CF6"
            fillOpacity="0.9"
          />
          {/* Label text */}
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            className="text-xs fill-white font-medium"
          >
            {edge.conditionLabel}
          </text>
        </g>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <motion.circle
          cx={labelX}
          cy={labelY}
          r="8"
          fill="#8B5CF6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="pointer-events-none"
        />
      )}
    </g>
  );
}