import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, ChevronDown, ZoomIn, ZoomOut, Edit2, Circle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { StageConfigModal } from './StageConfigModal';
import type { WorkflowNode as WorkflowNodeType } from '../../types/workflow';

interface WorkflowBuilderProps {
  projectId?: string;
  readOnly?: boolean;
  onSave?: (workflow: { nodes: WorkflowNodeType[]; edges: any[] }) => void;
}

type ViewMode = 'day' | 'week' | 'month';

interface StagePosition {
  id: string;
  startDay: number;
  duration: number;
  lane: number;
}

interface MonthYear {
  month: string;
  year: number;
  daysInMonth: number;
}

const BASE_CELL_WIDTH = 140; // Base width per day
const WEEK_CELL_WIDTH = 180; // Width per week
const MONTH_CELL_WIDTH = 200; // Width per month
const LANE_HEIGHT = 120; // Height per lane/row
const HEADER_HEIGHT = 80;
const EMPTY_COLUMN_WIDTH = 60; // Width of empty columns for arrows

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

const getDaysInMonth = (month: string, year: number): number => {
  const monthIndex = MONTHS.indexOf(month);
  return new Date(year, monthIndex + 1, 0).getDate();
};

export function WorkflowBuilder({ 
  projectId, 
  readOnly = false,
  onSave 
}: WorkflowBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedMonthYear, setSelectedMonthYear] = useState<MonthYear>({ month: 'December', year: 2025, daysInMonth: 31 });
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [stagePositions, setStagePositions] = useState<StagePosition[]>([]);
  const [draggedStage, setDraggedStage] = useState<{
    id: string;
    startDay: number;
    offsetX: number;
  } | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [resizingStage, setResizingStage] = useState<{
    id: string;
    originalDuration: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { nodes, edges, addNode, updateNode, deleteNode, addEdge, exportWorkflow } = useWorkflowStore();

  // Generate timeline days (1-30)
  const timelineDays = Array.from({ length: selectedMonthYear.daysInMonth }, (_, i) => i + 1);

  // Calculate which days need empty columns (after stage ends, before next stage starts)
  const calculateEmptyColumns = useCallback(() => {
    const emptyDays = new Set<number>();
    
    if (stagePositions.length === 0) return [];

    // Find all stages and their end days
    const stageEnds = stagePositions.map(pos => ({
      ...pos,
      endDay: pos.startDay + pos.duration - 1
    }));

    // Group stages that run in parallel (overlapping time ranges)
    const parallelGroups: typeof stageEnds[][] = [];
    const processed = new Set<string>();

    stageEnds.forEach(stage => {
      if (processed.has(stage.id)) return;

      // Find all stages that overlap with this one
      const group = stageEnds.filter(other => {
        // Two stages are parallel if their time ranges overlap
        const stageStart = stage.startDay;
        const stageEnd = stage.endDay;
        const otherStart = other.startDay;
        const otherEnd = other.endDay;
        
        // Check for overlap
        return !(stageEnd <= otherStart || stageStart >= otherEnd);
      });

      group.forEach(s => processed.add(s.id));
      parallelGroups.push(group);
    });

    // For each parallel group, find the stage that ends last
    parallelGroups.forEach(group => {
      const lastEndingStage = group.reduce((latest, current) => {
        return current.endDay > latest.endDay ? current : latest;
      });

      // Add empty column after the last ending stage in this group
      emptyDays.add(lastEndingStage.endDay);
    });

    return Array.from(emptyDays).sort((a, b) => a - b);
  }, [stagePositions]);

  const emptyColumns = calculateEmptyColumns();

  // Calculate lane for each stage to avoid overlaps
  const calculateStagePositions = useCallback(() => {
    const positions: StagePosition[] = [];
    
    // Sort nodes by start day
    const sortedNodes = [...nodes].sort((a, b) => {
      const aStart = a.startDay || 1;
      const bStart = b.startDay || 1;
      return aStart - bStart;
    });

    sortedNodes.forEach((node) => {
      const startDay = node.startDay || 1;
      const duration = node.duration || 3;
      const endDay = startDay + duration;

      // Find the first available lane where this stage doesn't overlap
      let lane = 0;
      let foundLane = false;

      while (!foundLane) {
        const hasOverlap = positions.some(pos => {
          if (pos.lane !== lane) return false;
          const posEndDay = pos.startDay + pos.duration;
          // Check if there's overlap (with 1 day gap for spacing)
          return !(endDay <= pos.startDay || startDay >= posEndDay);
        });

        if (!hasOverlap) {
          foundLane = true;
        } else {
          lane++;
        }
      }

      positions.push({
        id: node.id,
        startDay,
        duration,
        lane
      });
    });

    setStagePositions(positions);
  }, [nodes]);

  useEffect(() => {
    calculateStagePositions();
  }, [calculateStagePositions]);

  // Generate timeline cells with empty columns
  // Timeline cells include both date cells and empty columns
  const generateTimelineCells = useCallback(() => {
    const cells: Array<{ type: 'date' | 'empty'; day?: number; index: number }> = [];
    let cellIndex = 0;

    for (let day = 1; day <= selectedMonthYear.daysInMonth; day++) {
      // Add date cell
      cells.push({ type: 'date', day, index: cellIndex });
      cellIndex++;

      // Check if this day needs an empty column after it
      if (emptyColumns.includes(day)) {
        cells.push({ type: 'empty', day, index: cellIndex }); // Include day reference for debugging
        cellIndex++;
      }
    }

    return cells;
  }, [emptyColumns, selectedMonthYear]);

  const timelineCells = generateTimelineCells();

  // Helper to get cell X position
  const getCellXPosition = (cellIndex: number) => {
    return cellIndex * BASE_CELL_WIDTH;
  };

  // Helper to convert day to cell index
  const dayCellIndex = useCallback((day: number) => {
    let index = 0;
    for (let d = 1; d < day; d++) {
      index++; // date cell
      if (emptyColumns.includes(d)) {
        index++; // empty column after this day
      }
    }
    return index;
  }, [emptyColumns]);

  // Helper to get actual X position for a stage based on its start day
  const getStageXPosition = useCallback((startDay: number) => {
    const cellIdx = dayCellIndex(startDay);
    return getCellXPosition(cellIdx);
  }, [dayCellIndex]);

  // Handle add new stage
  const handleAddStage = () => {
    if (readOnly) return;

    const newNode: WorkflowNodeType = {
      id: `stage-${Date.now()}`,
      type: 'stage',
      name: 'New Stage',
      description: '',
      position: { x: 0, y: 0 },
      startDay: 1,
      duration: 3,
      color: '#8B5CF6',
      data: {
        name: 'New Stage',
        description: '',
        assignedTo: [],
        status: 'pending',
        probability: 100,
        hasRedesignRisk: false,
        redesignProbability: 0
      },
      startDate: new Date(),
      lane: 0,
      hasGate: false
    };

    addNode(newNode);
    setEditingNodeId(newNode.id);
    setShowConfigModal(true);
  };

  // Handle stage click
  const handleStageClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // Handle stage double click (edit)
  const handleStageDoubleClick = (nodeId: string) => {
    if (readOnly) return;
    setEditingNodeId(nodeId);
    setShowConfigModal(true);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, nodeId: string, currentStartDay: number) => {
    if (readOnly) return;
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left - (currentStartDay - 1) * BASE_CELL_WIDTH;
    
    setDraggedStage({
      id: nodeId,
      startDay: currentStartDay,
      offsetX
    });
  };

  // Handle drag move
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!draggedStage || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Calculate new start day (snap to grid)
    const newStartDay = Math.max(1, Math.round((mouseX - draggedStage.offsetX) / BASE_CELL_WIDTH) + 1);
    
    // Update dragged stage position temporarily
    if (newStartDay !== draggedStage.startDay) {
      setDraggedStage({
        ...draggedStage,
        startDay: newStartDay
      });
    }
  }, [draggedStage]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!draggedStage) return;

    const node = nodes.find(n => n.id === draggedStage.id);
    if (!node) return;

    // Update node with new start day
    updateNode(draggedStage.id, {
      startDay: draggedStage.startDay
    });

    setDraggedStage(null);
    
    // Recalculate positions after drag
    setTimeout(() => calculateStagePositions(), 0);
  }, [draggedStage, nodes, updateNode, calculateStagePositions]);

  // Global mouse handlers for drag
  useEffect(() => {
    if (draggedStage) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e as any);
      };
      const handleMouseUp = () => {
        handleDragEnd();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedStage, handleDragMove, handleDragEnd]);

  // Handle resize
  useEffect(() => {
    if (resizingStage) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current) return;
        
        const node = nodes.find(n => n.id === resizingStage.id);
        const position = stagePositions.find(p => p.id === resizingStage.id);
        if (!node || !position) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const stageLeft = (position.startDay - 1) * BASE_CELL_WIDTH + 32;
        const newWidth = mouseX - stageLeft;
        const newDuration = Math.max(1, Math.round(newWidth / BASE_CELL_WIDTH));

        if (newDuration !== position.duration) {
          updateNode(resizingStage.id, {
            duration: newDuration
          });
        }
      };

      const handleMouseUp = () => {
        setResizingStage(null);
        calculateStagePositions();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingStage, canvasRef, nodes, stagePositions, updateNode, calculateStagePositions]);

  // Get stage icon
  const getStageIcon = (node: WorkflowNodeType) => {
    const name = node?.data?.name?.toLowerCase() || node?.name?.toLowerCase() || '';
    if (name.includes('design') || name.includes('redesign')) return '🎨';
    if (name.includes('product')) return '📦';
    if (name.includes('develop')) return '💻';
    if (name.includes('test')) return '🧪';
    if (name.includes('deploy')) return '🚀';
    return '📋';
  };

  const formatDateRange = (startDay: number, duration: number) => {
    const start = `${startDay} Dec`;
    const end = `${startDay + duration - 1} Dec`;
    return `${start} - ${end}`;
  };

  // Calculate canvas height
  const maxLane = Math.max(...stagePositions.map(p => p.lane), 0);
  const canvasHeight = (maxLane + 1) * LANE_HEIGHT + HEADER_HEIGHT + 100;

  // Handle save
  const handleSave = () => {
    const workflow = exportWorkflow();
    onSave?.(workflow);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-1">Workflow Designer</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              >
                <span className="text-slate-900 dark:text-white text-sm">{selectedMonthYear.month} {selectedMonthYear.year}</span>
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-white/60" />
              </button>
              {showMonthDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowMonthDropdown(false)}
                  />
                  <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-40 backdrop-blur-xl overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {YEARS.map((year) => (
                        <div key={year} className="border-b border-slate-100 dark:border-white/5 last:border-b-0">
                          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50">
                            <span className="text-slate-700 dark:text-white/80">{year}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            {MONTHS.map((month) => {
                              const isSelected = selectedMonthYear.month === month && selectedMonthYear.year === year;
                              return (
                                <button
                                  key={`${year}-${month}`}
                                  className={`px-4 py-2.5 text-sm text-left transition-colors ${
                                    isSelected
                                      ? 'bg-purple-500 text-white'
                                      : 'text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                                  }`}
                                  onClick={() => {
                                    setSelectedMonthYear({ 
                                      month, 
                                      year, 
                                      daysInMonth: getDaysInMonth(month, year) 
                                    });
                                    setShowMonthDropdown(false);
                                  }}
                                >
                                  {month.substring(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-full p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
            </div>

            {/* Add Stage Button */}
            {!readOnly && (
              <button
                onClick={handleAddStage}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-full shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Stage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50">
        <div 
          ref={canvasRef}
          className="relative min-w-max p-8"
          style={{ minHeight: `${canvasHeight}px` }}
        >
          {/* Timeline Header */}
          <div className="sticky top-0 z-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl pb-4 mb-6">
            <div className="flex items-center">
              {timelineCells.map((cell) => (
                <div
                  key={`header-${cell.index}`}
                  className={`flex-shrink-0 text-center border-r ${
                    cell.type === 'empty' 
                      ? 'bg-purple-50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20'
                      : 'border-slate-200 dark:border-white/5'
                  }`}
                  style={{ width: `${BASE_CELL_WIDTH}px` }}
                >
                  {cell.type === 'date' ? (
                    <div className="text-slate-900 dark:text-white text-sm font-medium">{cell.day}</div>
                  ) : (
                    <div className="text-purple-300 dark:text-purple-400/50 text-xs">•</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 top-16 pointer-events-none">
            {timelineCells.map((cell) => (
              <div
                key={`grid-${cell.index}`}
                className={`absolute top-0 bottom-0 ${
                  cell.type === 'empty'
                    ? 'bg-purple-50/30 dark:bg-purple-500/5 border-l-2 border-dashed border-purple-200 dark:border-purple-500/20'
                    : 'border-l border-slate-200 dark:border-white/5'
                }`}
                style={{ left: `${getCellXPosition(cell.index)}px` }}
              />
            ))}
            {/* Horizontal lane dividers */}
            {Array.from({ length: maxLane + 2 }, (_, i) => (
              <div
                key={`lane-${i}`}
                className="absolute left-0 right-0 border-t border-slate-100 dark:border-white/5"
                style={{ top: `${HEADER_HEIGHT + i * LANE_HEIGHT}px` }}
              />
            ))}
          </div>

          {/* Stage Cards */}
          <div className="relative z-10">
            <AnimatePresence>
              {stagePositions.map((position) => {
                const node = nodes.find(n => n.id === position.id);
                if (!node) return null;

                const isSelected = selectedNodeId === position.id;
                const isDragging = draggedStage?.id === position.id;
                
                // Use dragged position if this is the dragged stage
                const displayStartDay = isDragging && draggedStage ? draggedStage.startDay : position.startDay;
                
                // Calculate X position considering empty columns
                const stageX = getStageXPosition(displayStartDay);
                // Calculate stage width (spans across days)
                const stageWidth = position.duration * BASE_CELL_WIDTH - 16;

                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleStageClick(position.id)}
                    onDoubleClick={() => handleStageDoubleClick(position.id)}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${stageX}px`,
                      top: `${position.lane * LANE_HEIGHT + HEADER_HEIGHT}px`,
                      width: `${stageWidth}px`,
                    }}
                  >
                    <div
                      className={`relative h-20 rounded-2xl overflow-hidden transition-all backdrop-blur-xl border-2 ${
                        isSelected
                          ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                          : 'border-slate-300 dark:border-white/20'
                      } ${isDragging ? 'opacity-50 scale-105 rotate-1' : 'hover:scale-[1.02] hover:-translate-y-1'}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                      }}
                      onMouseDown={(e) => handleDragStart(e, position.id, displayStartDay)}
                    >
                      {/* Inner glow for selected state */}
                      {isSelected && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 20px ${node.color || '#8B5CF6'}20`
                          }}
                        />
                      )}

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-4">
                        {/* Top: Icon and Name */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getStageIcon(node)}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 dark:text-slate-900 truncate">
                              {node.data?.name || node.name || 'Unnamed Stage'}
                            </h3>
                            {node.data?.probability && node.data.probability < 100 && (
                              <p className="text-xs text-slate-500">
                                {node.data.probability}% probability
                              </p>
                            )}
                          </div>
                          
                          {/* Edit Button - Right Side */}
                          {!readOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNodeId(position.id);
                                setShowConfigModal(true);
                              }}
                              className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-300 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                          )}
                        </div>

                        {/* Bottom: Date Range */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-600">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span>{formatDateRange(displayStartDay, position.duration)}</span>
                        </div>
                      </div>

                      {/* White inner shadow for depth */}
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]" />
                      
                      {/* Redesign risk indicator */}
                      {node.data?.hasRedesignRisk && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" title="Has redesign risk" />
                      )}
                      
                      {/* Green Connection Dot - Right Side */}
                      {!readOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (connectingFrom === position.id) {
                              // Cancel connection mode
                              setConnectingFrom(null);
                            } else if (connectingFrom) {
                              // Complete connection
                              const newEdge = {
                                id: `edge-${connectingFrom}-${position.id}`,
                                source: connectingFrom,
                                target: position.id,
                                type: 'dependency'
                              };
                              addEdge(newEdge);
                              setConnectingFrom(null);
                            } else {
                              // Start connection mode
                              setConnectingFrom(position.id);
                            }
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all z-20 shadow-md ${
                            connectingFrom === position.id
                              ? 'bg-blue-500 scale-110 shadow-blue-500/50'
                              : connectingFrom
                              ? 'bg-emerald-500 hover:bg-emerald-600 scale-100 shadow-emerald-500/30'
                              : 'bg-emerald-500 hover:bg-emerald-600 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-emerald-500/30'
                          }`}
                          title={connectingFrom === position.id ? 'Cancel connection' : connectingFrom ? 'Connect to this stage' : 'Create connection'}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </button>
                      )}
                      
                      {/* Resize Handle - Right Edge */}
                      {!readOnly && (
                        <div
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize group/resize z-20"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingStage({
                              id: position.id,
                              originalDuration: position.duration
                            });
                          }}
                        >
                          <div 
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-full opacity-0 group-hover/resize:opacity-100 group/resize:opacity-100 transition-all shadow-lg bg-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Connection Lines - Temporarily disabled */}
          {/* Will be re-enabled later with arrow drawing functionality */}
        </div>
      </div>

      {/* Stage Config Modal */}
      {showConfigModal && editingNodeId && (
        <StageConfigModal
          nodeId={editingNodeId}
          onClose={() => {
            setShowConfigModal(false);
            setEditingNodeId(null);
          }}
        />
      )}
    </div>
  );
}