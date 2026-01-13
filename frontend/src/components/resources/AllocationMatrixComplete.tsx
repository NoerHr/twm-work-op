import { useState } from 'react';
import { Calendar, AlertTriangle, ChevronLeft, ChevronRight, Filter, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { useResourceStore } from '../../store/resourceStore';
import type { ResourceAllocation, ResourceInstance, AllocationConflict } from '../../types/resource';

interface AllocationMatrixCompleteProps {
  allocations: ResourceAllocation[];
  instances: ResourceInstance[];
  canEdit: boolean;
}

type ViewMode = 'day' | 'week' | 'month';

export function AllocationMatrixComplete({ allocations, instances, canEdit }: AllocationMatrixCompleteProps) {
  const allocateResource = useResourceStore((state) => state.allocateResource);
  const updateAllocation = useResourceStore((state) => state.updateAllocation);
  const deallocateResource = useResourceStore((state) => state.deallocateResource);
  const completeAllocation = useResourceStore((state) => state.completeAllocation);
  
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAllocation, setSelectedAllocation] = useState<ResourceAllocation | null>(null);
  const [draggedAllocation, setDraggedAllocation] = useState<ResourceAllocation | null>(null);
  const [conflicts, setConflicts] = useState<AllocationConflict[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [activeConflict, setActiveConflict] = useState<AllocationConflict | null>(null);

  // Generate time periods based on view mode
  const getTimePeriods = () => {
    const periods: Date[] = [];
    const start = new Date(currentDate);
    
    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        const date = new Date(start);
        date.setHours(i);
        periods.push(date);
      }
    } else if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay()); // Start of week
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        periods.push(date);
      }
    } else { // month
      start.setDate(1); // Start of month
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      for (let i = 0; i < daysInMonth; i++) {
        const date = new Date(start);
        date.setDate(i + 1);
        periods.push(date);
      }
    }
    
    return periods;
  };

  const timePeriods = getTimePeriods();

  // Check for conflicts
  const checkConflicts = (allocation: ResourceAllocation): AllocationConflict | null => {
    const overlapping = allocations.filter(a => 
      a.id !== allocation.id &&
      a.resourceInstanceId === allocation.resourceInstanceId &&
      a.status !== 'completed' &&
      // Check date overlap
      (
        (new Date(allocation.startDate) <= new Date(a.endDate) &&
         new Date(allocation.endDate) >= new Date(a.startDate))
      )
    );

    if (overlapping.length === 0) return null;

    const totalUtilization = overlapping.reduce((sum, a) => sum + a.utilizationPercent, 0) + allocation.utilizationPercent;

    if (totalUtilization > 100) {
      return {
        resourceInstanceId: allocation.resourceInstanceId,
        resourceName: allocation.resourceName,
        conflictingAllocations: [allocation, ...overlapping],
        totalUtilization,
        suggestedResolutions: [
          { type: 'swap', description: 'Find a substitute resource' },
          { type: 'split', description: 'Split the allocation across multiple resources' },
          { type: 'overbook', description: 'Allow overbooking (not recommended)' }
        ]
      };
    }

    return null;
  };

  // Handle allocation drag and drop
  const handleDragStart = (allocation: ResourceAllocation) => {
    if (!canEdit) return;
    setDraggedAllocation(allocation);
  };

  const handleDrop = (resourceId: string, date: Date) => {
    if (!draggedAllocation || !canEdit) return;

    const duration = new Date(draggedAllocation.endDate).getTime() - new Date(draggedAllocation.startDate).getTime();
    const newStartDate = new Date(date);
    const newEndDate = new Date(date.getTime() + duration);

    const updatedAllocation = {
      ...draggedAllocation,
      resourceInstanceId: resourceId,
      startDate: newStartDate,
      endDate: newEndDate
    };

    // Check for conflicts
    const conflict = checkConflicts(updatedAllocation);
    
    if (conflict) {
      setActiveConflict(conflict);
      setShowConflictModal(true);
      setDraggedAllocation(null);
      return;
    }

    // Update allocation
    updateAllocation(draggedAllocation.id, {
      resourceInstanceId: resourceId,
      startDate: newStartDate,
      endDate: newEndDate
    });
    setDraggedAllocation(null);
  };

  const handleCreateAllocation = (resourceId: string, startDate: Date) => {
    if (!canEdit) return;

    const resource = instances.find(i => i.id === resourceId);
    if (!resource) return;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30));

    const newAllocation: ResourceAllocation = {
      id: `alloc-${Date.now()}`,
      resourceInstanceId: resourceId,
      resourceName: resource.typeName,
      projectId: 'project-1',
      projectName: 'Sample Project',
      startDate,
      endDate,
      utilizationPercent: 50,
      status: 'planned'
    };

    // Check for conflicts
    const conflict = checkConflicts(newAllocation);
    
    if (conflict) {
      setActiveConflict(conflict);
      setShowConflictModal(true);
      return;
    }

    allocateResource(newAllocation);
  };

  const handleResolveConflict = (resolution: 'swap' | 'split' | 'overbook') => {
    if (!activeConflict) return;

    if (resolution === 'overbook') {
      // Allow overbooking - update all conflicting allocations to conflict status
      activeConflict.conflictingAllocations.forEach(allocation => {
        updateAllocation(allocation.id, { status: 'conflict' });
      });
    }

    setShowConflictModal(false);
    setActiveConflict(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  // Calculate allocation position and width
  const getAllocationStyle = (allocation: ResourceAllocation, periods: Date[]) => {
    const start = new Date(allocation.startDate);
    const end = new Date(allocation.endDate);
    
    const startIndex = periods.findIndex(p => 
      p.toDateString() === start.toDateString() ||
      (p < start && periods[periods.indexOf(p) + 1] && periods[periods.indexOf(p) + 1] > start)
    );
    
    const endIndex = periods.findIndex(p => 
      p.toDateString() === end.toDateString() ||
      (p < end && periods[periods.indexOf(p) + 1] && periods[periods.indexOf(p) + 1] > end)
    );

    if (startIndex === -1 || endIndex === -1) return null;

    const cellWidth = 100 / periods.length;
    const left = startIndex * cellWidth;
    const width = (endIndex - startIndex + 1) * cellWidth;

    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusColor = (status: ResourceAllocation['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/80 hover:bg-blue-500';
      case 'active': return 'bg-green-500/80 hover:bg-green-500';
      case 'completed': return 'bg-slate-500/80 hover:bg-slate-500';
      case 'conflict': return 'bg-red-500/80 hover:bg-red-500';
      default: return 'bg-purple-500/80 hover:bg-purple-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* View Mode Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-lg">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-white/10 text-purple-500'
                  : 'text-slate-600 dark:text-white/60'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-white/10 text-purple-500'
                  : 'text-slate-600 dark:text-white/60'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-white/10 text-purple-500'
                  : 'text-slate-600 dark:text-white/60'
              }`}
            >
              Month
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleNavigate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-slate-900 dark:text-white min-w-[200px] text-center">
              {viewMode === 'month' 
                ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : viewMode === 'week'
                ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            </div>
            <Button variant="outline" size="sm" onClick={() => handleNavigate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              {allocations.length} allocation{allocations.length !== 1 ? 's' : ''}
            </Badge>
            {conflicts.length > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Timeline Grid */}
      {instances.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-slate-900 dark:text-white mb-2">No Resources Available</h3>
          <p className="text-slate-600 dark:text-white/60">
            Add resource instances in the Resource Pool to start scheduling allocations
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                <div className="w-48 p-4 text-sm text-slate-600 dark:text-white/60 border-r border-slate-200 dark:border-white/10">
                  Resource
                </div>
                <div className="flex-1 flex">
                  {timePeriods.map((period, index) => (
                    <div
                      key={index}
                      className="flex-1 p-2 text-center text-xs text-slate-600 dark:text-white/60 border-r border-slate-200 dark:border-white/10"
                    >
                      {viewMode === 'day' 
                        ? `${period.getHours()}:00`
                        : period.toLocaleDateString('en-US', { 
                            month: viewMode === 'month' ? undefined : 'short',
                            day: 'numeric',
                            weekday: viewMode === 'week' ? 'short' : undefined
                          })
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Rows */}
              {instances.map((instance) => {
                const instanceAllocations = allocations.filter(a => a.resourceInstanceId === instance.id);
                
                return (
                  <div
                    key={instance.id}
                    className="flex border-b border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Resource Name */}
                    <div className="w-48 p-4 border-r border-slate-200 dark:border-white/10">
                      <div className="text-sm text-slate-900 dark:text-white truncate">
                        {instance.typeName}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60 truncate">
                        {instance.id}
                      </div>
                    </div>

                    {/* Timeline Cells */}
                    <div className="flex-1 relative" style={{ height: 60 }}>
                      <div className="absolute inset-0 flex">
                        {timePeriods.map((period, index) => (
                          <div
                            key={index}
                            className={`flex-1 border-r border-slate-200 dark:border-white/10 ${
                              canEdit ? 'cursor-pointer hover:bg-purple-500/10' : ''
                            }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(instance.id, period)}
                            onClick={() => canEdit && handleCreateAllocation(instance.id, period)}
                          />
                        ))}
                      </div>

                      {/* Allocation Blocks */}
                      {instanceAllocations.map((allocation) => {
                        const style = getAllocationStyle(allocation, timePeriods);
                        if (!style) return null;

                        return (
                          <motion.div
                            key={allocation.id}
                            draggable={canEdit}
                            onDragStart={() => handleDragStart(allocation)}
                            onClick={() => setSelectedAllocation(allocation)}
                            className={`
                              absolute top-2 h-14 rounded-lg shadow-lg cursor-pointer
                              ${getStatusColor(allocation.status)}
                              flex items-center justify-center text-white text-xs p-2
                              transition-all
                            `}
                            style={style}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="text-center truncate">
                              <div className="truncate">{allocation.projectName}</div>
                              <div className="text-xs opacity-75">{allocation.utilizationPercent}%</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Legend */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-white/60">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs text-slate-600 dark:text-white/60">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs text-slate-600 dark:text-white/60">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-500" />
              <span className="text-xs text-slate-600 dark:text-white/60">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs text-slate-600 dark:text-white/60">Conflict</span>
            </div>
          </div>
          {canEdit && (
            <p className="text-xs text-slate-600 dark:text-white/60">
              Click cells to create • Drag blocks to reschedule
            </p>
          )}
        </div>
      </GlassCard>

      {/* Conflict Resolution Modal */}
      {showConflictModal && activeConflict && (
        <ConflictResolutionModal
          conflict={activeConflict}
          onResolve={handleResolveConflict}
          onClose={() => {
            setShowConflictModal(false);
            setActiveConflict(null);
          }}
        />
      )}
    </div>
  );
}