import React from 'react';
import type { ViewMode } from '../../store/workflowStore';

interface WorkflowGridProps {
  width: number;
  height: number;
  gridSize: number;
  viewMode: ViewMode;
}

export function WorkflowGrid({ width, height, gridSize, viewMode }: WorkflowGridProps) {
  const verticalLines: JSX.Element[] = [];
  const labels: JSX.Element[] = [];
  
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Always use daily grid (40px per day) for vertical lines
  const PIXELS_PER_DAY = 40;
  
  // Calculate step based on view mode for labels only
  let labelStep: number;
  let labelFormat: (date: Date) => string;
  
  switch (viewMode) {
    case 'day':
      labelStep = PIXELS_PER_DAY; // Every day
      labelFormat = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      break;
    case 'week':
      labelStep = PIXELS_PER_DAY * 7; // Every 7 days
      labelFormat = (date) => `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      break;
    case 'month':
      labelStep = PIXELS_PER_DAY * 30; // Every 30 days
      labelFormat = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      break;
  }
  
  // Generate vertical grid lines (one per day)
  for (let x = 0; x <= width; x += PIXELS_PER_DAY) {
    const isMainLine = x % labelStep === 0;
    
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={isMainLine ? '#CBD5E1' : '#E2E8F0'}
        strokeWidth={isMainLine ? 2 : 1}
        opacity={isMainLine ? 0.3 : 0.15}
        className="dark:stroke-white/10"
      />
    );
    
    // Add labels only for main lines
    if (isMainLine) {
      const daysOffset = x / PIXELS_PER_DAY;
      const labelDate = new Date(startDate);
      labelDate.setDate(labelDate.getDate() + daysOffset);
      
      labels.push(
        <text
          key={`label-${x}`}
          x={x}
          y={20}
          className="fill-slate-600 dark:fill-white/60 text-xs"
          textAnchor="middle"
        >
          {labelFormat(labelDate)}
        </text>
      );
    }
  }
  
  // Horizontal lines (for lanes) - one per 100px (lane height)
  const horizontalLines: JSX.Element[] = [];
  const laneHeight = 100;
  
  for (let y = 0; y <= height; y += laneHeight) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#E2E8F0"
        strokeWidth={1}
        opacity={0.1}
        className="dark:stroke-white/10"
      />
    );
  }
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
    >
      {/* Background */}
      <rect
        width={width}
        height={height}
        fill="transparent"
      />
      
      {/* Horizontal lines */}
      {horizontalLines}
      
      {/* Vertical lines */}
      {verticalLines}
      
      {/* Timeline labels */}
      <g>
        {labels}
      </g>
      
      {/* Today indicator */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={height}
        stroke="#EF4444"
        strokeWidth={2}
        opacity={0.5}
        strokeDasharray="5,5"
      />
      <text
        x={5}
        y={40}
        className="fill-red-500 text-xs font-medium"
      >
        Today
      </text>
    </svg>
  );
}