import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'day' | 'week' | 'month';
export type NodeType = 'stage' | 'gateway';
export type EdgeType = 'standard' | 'conditional';
export type GateTrigger = 'automatic' | 'manual';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  startDate: Date;
  duration: number; // in days
  lane: number; // Vertical position (0-indexed)
  position: { x: number; y: number }; // Canvas coordinates
  
  // Gate configuration (for stages that have approval gates)
  hasGate?: boolean;
  gateTrigger?: GateTrigger;
  gateApprovers?: string[]; // User IDs
  
  // Visual state
  isSelected?: boolean;
  color?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: EdgeType;
  condition?: string; // e.g., "approval.status == 'approved'"
  conditionLabel?: string; // Human-readable label
  
  // Visual routing
  points?: { x: number; y: number }[]; // For custom routing
}

export interface WorkflowGap {
  id: string;
  afterNodeId: string;
  width: number; // Gap width in pixels
  position: number; // X position on timeline
}

interface WorkflowStore {
  // State
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  gaps: WorkflowGap[];
  viewMode: ViewMode;
  gridSize: number; // Pixels per day
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDragging: boolean;
  
  // Timeline settings
  timelineStart: Date;
  timelineEnd: Date;
  
  // Actions - Node Management
  addNode: (node: Omit<WorkflowNode, 'id' | 'position' | 'lane'>) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  
  // Actions - Edge Management
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => string;
  updateEdge: (id: string, updates: Partial<WorkflowEdge>) => void;
  deleteEdge: (id: string) => void;
  selectEdge: (id: string | null) => void;
  
  // Actions - Dependency Management
  addDependency: (sourceId: string, targetId: string) => void;
  setEdgeCondition: (edgeId: string, condition: string, label: string) => void;
  
  // Actions - Node Manipulation
  resizeNode: (id: string, newDuration: number) => void;
  moveNode: (id: string, newStartDate: Date) => void;
  
  // Actions - Layout & Calculation
  autoLayout: () => void;
  calculateGaps: () => void;
  calculateRippleEffect: (nodeId: string, visited?: Set<string>) => void;
  calculateLanes: () => void;
  
  // Actions - View
  setViewMode: (mode: ViewMode) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  
  // Query Methods
  getNode: (id: string) => WorkflowNode | undefined;
  getEdge: (id: string) => WorkflowEdge | undefined;
  getNodesByLane: (lane: number) => WorkflowNode[];
  getIncomingEdges: (nodeId: string) => WorkflowEdge[];
  getOutgoingEdges: (nodeId: string) => WorkflowEdge[];
  getSuccessors: (nodeId: string) => WorkflowNode[];
  getPredecessors: (nodeId: string) => WorkflowNode[];
  
  // Utility
  reset: () => void;
  exportWorkflow: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  importWorkflow: (data: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
}

const PIXELS_PER_DAY = 40;
const LANE_HEIGHT = 100;
const NODE_HEIGHT = 60;

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      // Initial State
      nodes: [],
      edges: [],
      gaps: [],
      viewMode: 'week',
      gridSize: PIXELS_PER_DAY,
      selectedNodeId: null,
      selectedEdgeId: null,
      isDragging: false,
      timelineStart: new Date(),
      timelineEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      
      // Node Management
      addNode: (nodeData) => {
        const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNode: WorkflowNode = {
          ...nodeData,
          id,
          position: { x: 0, y: 0 },
          lane: 0,
        };
        
        set((state) => ({
          nodes: [...state.nodes, newNode]
        }));
        
        // Recalculate layout
        get().autoLayout();
        
        return id;
      },
      
      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === id ? { ...node, ...updates } : node
          )
        }));
      },
      
      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== id),
          edges: state.edges.filter(edge => edge.source !== id && edge.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
        }));
        get().autoLayout();
      },
      
      selectNode: (id) => {
        set({ selectedNodeId: id, selectedEdgeId: null });
      },
      
      // Edge Management
      addEdge: (edgeData) => {
        const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newEdge: WorkflowEdge = {
          ...edgeData,
          id,
        };
        
        set((state) => ({
          edges: [...state.edges, newEdge]
        }));
        
        // Recalculate dependent node positions
        get().calculateRippleEffect(edgeData.target);
        
        return id;
      },
      
      updateEdge: (id, updates) => {
        set((state) => ({
          edges: state.edges.map(edge =>
            edge.id === id ? { ...edge, ...updates } : edge
          )
        }));
      },
      
      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter(edge => edge.id !== id),
          selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId
        }));
      },
      
      selectEdge: (id) => {
        set({ selectedEdgeId: id, selectedNodeId: null });
      },
      
      // Dependency Management
      addDependency: (sourceId, targetId) => {
        // Check if dependency already exists
        const { edges } = get();
        const exists = edges.some(e => e.source === sourceId && e.target === targetId);
        if (exists) return;
        
        get().addEdge({
          source: sourceId,
          target: targetId,
          type: 'standard'
        });
      },
      
      setEdgeCondition: (edgeId, condition, label) => {
        get().updateEdge(edgeId, {
          type: 'conditional',
          condition,
          conditionLabel: label
        });
      },
      
      // Node Manipulation
      resizeNode: (id, newDuration) => {
        const node = get().getNode(id);
        if (!node) return;
        
        get().updateNode(id, { duration: newDuration });
        
        // Trigger ripple effect for all successors
        get().calculateRippleEffect(id);
      },
      
      moveNode: (id, newStartDate) => {
        get().updateNode(id, { startDate: newStartDate });
        get().calculateRippleEffect(id);
      },
      
      // Layout & Calculation
      autoLayout: () => {
        get().calculateLanes();
        get().calculatePositions();
        get().calculateGaps();
      },
      
      calculateLanes: () => {
        const { nodes, edges } = get();
        
        // Topological sort to determine rendering order
        const sorted = topologicalSort(nodes, edges);
        
        // Assign lanes using a date-aware algorithm
        const laneAssignments = new Map<string, number>();
        const dateOccupancy = new Map<string, number[]>(); // dateKey -> array of occupied lanes
        
        sorted.forEach(node => {
          const nodeStartDate = node.startDate instanceof Date ? node.startDate : new Date(node.startDate);
          const nodeEndDate = new Date(nodeStartDate.getTime() + node.duration * 24 * 60 * 60 * 1000);
          
          // Create date keys for all days this node occupies
          const occupiedDates: string[] = [];
          const currentDate = new Date(nodeStartDate);
          while (currentDate <= nodeEndDate) {
            occupiedDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          // Find the first available lane that doesn't conflict with any occupied dates
          let assignedLane = 0;
          let foundLane = false;
          
          while (!foundLane) {
            // Check if this lane is free for all dates this node occupies
            const hasConflict = occupiedDates.some(dateKey => {
              const lanesForDate = dateOccupancy.get(dateKey) || [];
              return lanesForDate.includes(assignedLane);
            });
            
            if (!hasConflict) {
              foundLane = true;
              
              // Mark this lane as occupied for all dates
              occupiedDates.forEach(dateKey => {
                const lanesForDate = dateOccupancy.get(dateKey) || [];
                lanesForDate.push(assignedLane);
                dateOccupancy.set(dateKey, lanesForDate);
              });
            } else {
              assignedLane++;
            }
          }
          
          laneAssignments.set(node.id, assignedLane);
        });
        
        // Update nodes with lane assignments
        set((state) => ({
          nodes: state.nodes.map(node => ({
            ...node,
            lane: laneAssignments.get(node.id) || 0
          }))
        }));
      },
      
      calculatePositions: () => {
        const { nodes, gridSize } = get();
        
        set((state) => ({
          nodes: state.nodes.map(node => {
            const nodeStartDate = node.startDate instanceof Date ? node.startDate : new Date(node.startDate);
            return {
              ...node,
              position: {
                x: dateToX(nodeStartDate),
                y: node.lane * LANE_HEIGHT
              }
            };
          })
        }));
      },
      
      calculateGaps: () => {
        const { nodes, edges } = get();
        const gaps: WorkflowGap[] = [];
        
        // Identify merge points (nodes with multiple predecessors)
        nodes.forEach(node => {
          const predecessors = get().getPredecessors(node.id);
          
          if (predecessors.length > 1) {
            // Calculate the latest end time among predecessors
            const maxPredEnd = Math.max(
              ...predecessors.map(p => {
                const pStart = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
                return pStart.getTime() + p.duration * 24 * 60 * 60 * 1000;
              })
            );
            
            const nodeStartDate = node.startDate instanceof Date ? node.startDate : new Date(node.startDate);
            const nodeStart = nodeStartDate.getTime();
            const gapDuration = (nodeStart - maxPredEnd) / (24 * 60 * 60 * 1000);
            
            if (gapDuration > 0.5) { // Only create gap if > 0.5 days
              gaps.push({
                id: `gap-${node.id}`,
                afterNodeId: predecessors[predecessors.length - 1].id,
                width: gapDuration * get().gridSize,
                position: dateToX(new Date(maxPredEnd))
              });
            }
          }
        });
        
        set({ gaps });
      },
      
      calculateRippleEffect: (nodeId, visited = new Set<string>()) => {
        const node = get().getNode(nodeId);
        if (!node) return;
        
        // Prevent infinite recursion from circular dependencies
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        
        const successors = get().getSuccessors(nodeId);
        
        // Recursively update all successors
        successors.forEach(successor => {
          const incomingEdges = get().getIncomingEdges(successor.id);
          
          // Calculate the earliest this node can start (max of all predecessor ends)
          const earliestStart = new Date(
            Math.max(
              ...incomingEdges.map(edge => {
                const pred = get().getNode(edge.source);
                if (!pred) return 0;
                const predStartDate = pred.startDate instanceof Date ? pred.startDate : new Date(pred.startDate);
                return predStartDate.getTime() + pred.duration * 24 * 60 * 60 * 1000;
              })
            )
          );
          
          const successorStartDate = successor.startDate instanceof Date ? successor.startDate : new Date(successor.startDate);
          
          // Only update if we need to push it forward
          if (earliestStart > successorStartDate) {
            get().updateNode(successor.id, { startDate: earliestStart });
            get().calculateRippleEffect(successor.id, visited); // Recursive with visited set
          }
        });
        
        // Only recalculate positions once at the end of the ripple chain
        if (visited.size === 1) {
          get().calculatePositions();
        }
      },
      
      // View Actions
      setViewMode: (mode) => {
        const gridSizes = {
          day: PIXELS_PER_DAY,
          week: PIXELS_PER_DAY / 7,
          month: PIXELS_PER_DAY / 30
        };
        
        set({ 
          viewMode: mode,
          gridSize: gridSizes[mode]
        });
        
        get().calculatePositions();
      },
      
      zoomIn: () => {
        set((state) => ({
          gridSize: Math.min(state.gridSize * 1.2, 100)
        }));
        get().calculatePositions();
      },
      
      zoomOut: () => {
        set((state) => ({
          gridSize: Math.max(state.gridSize * 0.8, 10)
        }));
        get().calculatePositions();
      },
      
      // Query Methods
      getNode: (id) => {
        return get().nodes.find(n => n.id === id);
      },
      
      getEdge: (id) => {
        return get().edges.find(e => e.id === id);
      },
      
      getNodesByLane: (lane) => {
        return get().nodes.filter(n => n.lane === lane);
      },
      
      getIncomingEdges: (nodeId) => {
        return get().edges.filter(e => e.target === nodeId);
      },
      
      getOutgoingEdges: (nodeId) => {
        return get().edges.filter(e => e.source === nodeId);
      },
      
      getSuccessors: (nodeId) => {
        const outgoing = get().getOutgoingEdges(nodeId);
        return outgoing
          .map(edge => get().getNode(edge.target))
          .filter(Boolean) as WorkflowNode[];
      },
      
      getPredecessors: (nodeId) => {
        const incoming = get().getIncomingEdges(nodeId);
        return incoming
          .map(edge => get().getNode(edge.source))
          .filter(Boolean) as WorkflowNode[];
      },
      
      // Utility
      reset: () => {
        set({
          nodes: [],
          edges: [],
          gaps: [],
          selectedNodeId: null,
          selectedEdgeId: null
        });
      },
      
      exportWorkflow: () => {
        const { nodes, edges } = get();
        return { nodes, edges };
      },
      
      importWorkflow: (data) => {
        // Ensure dates are properly converted from strings to Date objects
        const nodes = data.nodes.map(node => ({
          ...node,
          startDate: typeof node.startDate === 'string' ? new Date(node.startDate) : node.startDate
        }));
        
        set({
          nodes,
          edges: data.edges
        });
        get().autoLayout();
      }
    }),
    {
      name: 'workflow-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewMode: state.viewMode
      }),
      // Custom storage to handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const data = JSON.parse(str);
          
          // Convert date strings back to Date objects
          if (data.state?.nodes) {
            data.state.nodes = data.state.nodes.map((node: any) => ({
              ...node,
              startDate: new Date(node.startDate)
            }));
          }
          
          if (data.state?.timelineStart) {
            data.state.timelineStart = new Date(data.state.timelineStart);
          }
          if (data.state?.timelineEnd) {
            data.state.timelineEnd = new Date(data.state.timelineEnd);
          }
          
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

// Helper Functions
function dateToX(date: Date): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diffDays = (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  return diffDays * PIXELS_PER_DAY;
}

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const sorted: WorkflowNode[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      // Cycle detected - break it
      return;
    }
    
    visiting.add(nodeId);
    
    // Visit all dependencies first
    const incomingEdges = edges.filter(e => e.target === nodeId);
    incomingEdges.forEach(edge => {
      visit(edge.source);
    });
    
    visiting.delete(nodeId);
    visited.add(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      sorted.push(node);
    }
  };
  
  nodes.forEach(node => visit(node.id));
  
  return sorted;
}