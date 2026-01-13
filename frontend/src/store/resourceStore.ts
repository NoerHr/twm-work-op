import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ResourceType,
  ResourceInstance,
  FieldSchema,
  OperationDefinition
} from '../types/resource';
import { SEED_RESOURCE_TYPES, SEED_RESOURCE_INSTANCES } from '../data/resourceSeedData';

// Extended types for resource management
export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  projectId: string;
  projectName: string;
  assignmentId?: string;
  assignmentName?: string;
  taskId?: string;
  taskName?: string;
  startDate: Date;
  endDate: Date;
  allocatedBy: string;
  allocatedAt: Date;
  percentage: number; // 0-100, percentage of resource capacity
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ResourceConflict {
  id: string;
  resourceId: string;
  resourceName: string;
  conflictingAllocations: ResourceAllocation[];
  type: 'overlap' | 'overallocation' | 'unavailable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: ConflictResolution;
}

export interface ConflictResolution {
  id: string;
  conflictId: string;
  resolvedBy: string;
  resolutionType: 'reschedule' | 'reallocate' | 'split' | 'cancel';
  changes: any; // Specific changes made
  resolvedAt: Date;
  notes?: string;
}

export interface ResourceUtilization {
  id: string;
  resourceId: string;
  date: Date;
  hoursLogged: number;
  hoursAllocated: number;
  utilizationPercentage: number;
  taskId?: string;
  projectId?: string;
  notes?: string;
}

export interface ResourceAvailability {
  resourceId: string;
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
  reason?: string; // vacation, training, etc.
}

interface ResourceStore {
  // State
  resourceTypes: ResourceType[];
  resourceInstances: ResourceInstance[];
  allocations: ResourceAllocation[];
  conflicts: ResourceConflict[];
  utilization: ResourceUtilization[];
  availability: ResourceAvailability[];
  
  // Resource Type Management
  createResourceType: (type: ResourceType) => ResourceType;
  updateResourceType: (id: string, updates: Partial<ResourceType>) => void;
  deleteResourceType: (id: string) => void;
  publishResourceType: (id: string) => void;
  getResourceType: (id: string) => ResourceType | undefined;
  getResourceTypesByCategory: (category: string) => ResourceType[];
  
  // Resource Instance Management
  createInstance: (typeId: string, data: any) => ResourceInstance;
  updateInstance: (id: string, data: any) => void;
  deleteInstance: (id: string) => void;
  getInstance: (id: string) => ResourceInstance | undefined;
  getInstancesByType: (typeId: string) => ResourceInstance[];
  
  // Allocation Management
  allocateResource: (allocation: Omit<ResourceAllocation, 'id' | 'allocatedAt' | 'status'>) => ResourceAllocation | null;
  updateAllocation: (id: string, updates: Partial<ResourceAllocation>) => void;
  deallocateResource: (allocationId: string) => void;
  completeAllocation: (allocationId: string) => void;
  getAllocationsByResource: (resourceId: string) => ResourceAllocation[];
  getAllocationsByProject: (projectId: string) => ResourceAllocation[];
  getAllocationsByAssignment: (assignmentId: string) => ResourceAllocation[];
  
  // Availability Management
  checkAvailability: (resourceId: string, startDate: Date, endDate: Date) => boolean;
  setUnavailable: (resourceId: string, startDate: Date, endDate: Date, reason: string) => void;
  setAvailable: (resourceId: string, startDate: Date, endDate: Date) => void;
  getResourceAvailability: (resourceId: string, date: Date) => ResourceAvailability | undefined;
  
  // Conflict Detection & Resolution
  detectConflicts: (resourceId?: string) => ResourceConflict[];
  resolveConflict: (conflictId: string, resolution: Omit<ConflictResolution, 'id' | 'resolvedAt'>) => void;
  getActiveConflicts: () => ResourceConflict[];
  
  // Utilization Tracking
  addUtilizationData: (data: Omit<ResourceUtilization, 'id' | 'utilizationPercentage'>) => void;
  getUtilization: (resourceId: string, startDate: Date, endDate: Date) => ResourceUtilization[];
  getUtilizationSummary: (resourceId: string, period: 'week' | 'month' | 'quarter') => {
    totalHours: number;
    avgUtilization: number;
    peakUtilization: number;
  };
  
  // Query Methods
  getAvailableResources: (typeId: string, startDate: Date, endDate: Date) => ResourceInstance[];
  getResourcesByProject: (projectId: string) => ResourceInstance[];
  getResourceCapacity: (resourceId: string, date: Date) => number; // Available capacity percentage
  searchResources: (query: string) => ResourceInstance[];
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      // Initial State
      resourceTypes: SEED_RESOURCE_TYPES,
      resourceInstances: SEED_RESOURCE_INSTANCES,
      allocations: [],
      conflicts: [],
      utilization: [],
      availability: [],
      
      // Resource Type Management
      createResourceType: (type) => {
        const newType: ResourceType = {
          ...type,
          id: type.id || `rt-${Date.now()}`,
          status: type.status || 'draft',
          createdAt: type.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          resourceTypes: [...state.resourceTypes, newType]
        }));
        
        return newType;
      },
      
      updateResourceType: (id, updates) => {
        set((state) => ({
          resourceTypes: state.resourceTypes.map((rt) =>
            rt.id === id
              ? { ...rt, ...updates, updatedAt: new Date() }
              : rt
          )
        }));
      },
      
      deleteResourceType: (id) => {
        set((state) => ({
          resourceTypes: state.resourceTypes.filter((rt) => rt.id !== id)
        }));
      },
      
      publishResourceType: (id) => {
        get().updateResourceType(id, {
          status: 'published',
          publishedAt: new Date()
        });
      },
      
      getResourceType: (id) => {
        return get().resourceTypes.find((rt) => rt.id === id);
      },
      
      getResourceTypesByCategory: (category) => {
        return get().resourceTypes.filter((rt) => rt.category === category);
      },
      
      // Resource Instance Management
      createInstance: (typeId, data) => {
        const type = get().getResourceType(typeId);
        if (!type) {
          console.error('Resource type not found:', typeId);
          return null as any;
        }
        
        const newInstance: ResourceInstance = {
          id: `ri-${Date.now()}`,
          typeId,
          typeName: type.name,
          data,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user' // Should come from auth
        };
        
        set((state) => ({
          resourceInstances: [...state.resourceInstances, newInstance]
        }));
        
        return newInstance;
      },
      
      updateInstance: (id, data) => {
        set((state) => ({
          resourceInstances: state.resourceInstances.map((ri) =>
            ri.id === id
              ? { ...ri, data: { ...ri.data, ...data }, updatedAt: new Date() }
              : ri
          )
        }));
      },
      
      deleteInstance: (id) => {
        set((state) => ({
          resourceInstances: state.resourceInstances.filter((ri) => ri.id !== id)
        }));
      },
      
      getInstance: (id) => {
        return get().resourceInstances.find((ri) => ri.id === id);
      },
      
      getInstancesByType: (typeId) => {
        return get().resourceInstances.filter((ri) => ri.typeId === typeId);
      },
      
      // Allocation Management
      allocateResource: (allocation) => {
        // Check for conflicts first
        const conflicts = get().detectConflicts(allocation.resourceId);
        const hasActiveConflict = conflicts.some((c) => 
          !c.resolvedAt && 
          c.severity === 'critical'
        );
        
        if (hasActiveConflict) {
          console.error('Cannot allocate resource with active critical conflicts');
          return null;
        }
        
        const newAllocation: ResourceAllocation = {
          ...allocation,
          id: `alloc-${Date.now()}`,
          allocatedAt: new Date(),
          status: 'pending'
        };
        
        set((state) => ({
          allocations: [...state.allocations, newAllocation]
        }));
        
        // Detect new conflicts after allocation
        get().detectConflicts(allocation.resourceId);
        
        return newAllocation;
      },
      
      updateAllocation: (id, updates) => {
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          )
        }));
      },
      
      deallocateResource: (allocationId) => {
        get().updateAllocation(allocationId, { status: 'cancelled' });
      },
      
      completeAllocation: (allocationId) => {
        get().updateAllocation(allocationId, { status: 'completed' });
      },
      
      getAllocationsByResource: (resourceId) => {
        return get().allocations.filter((a) => a.resourceId === resourceId);
      },
      
      getAllocationsByProject: (projectId) => {
        return get().allocations.filter((a) => a.projectId === projectId);
      },
      
      getAllocationsByAssignment: (assignmentId) => {
        return get().allocations.filter((a) => a.assignmentId === assignmentId);
      },
      
      // Availability Management
      checkAvailability: (resourceId, startDate, endDate) => {
        // Check if resource is marked unavailable
        const unavailability = get().availability.find(
          (a) =>
            a.resourceId === resourceId &&
            !a.isAvailable &&
            startDate <= a.endDate &&
            endDate >= a.startDate
        );
        
        if (unavailability) {
          return false;
        }
        
        // Check for allocation conflicts
        const allocations = get().getAllocationsByResource(resourceId);
        const hasConflict = allocations.some(
          (a) =>
            a.status !== 'cancelled' &&
            a.status !== 'completed' &&
            startDate <= a.endDate &&
            endDate >= a.startDate &&
            a.percentage >= 100
        );
        
        return !hasConflict;
      },
      
      setUnavailable: (resourceId, startDate, endDate, reason) => {
        const newAvailability: ResourceAvailability = {
          resourceId,
          startDate,
          endDate,
          isAvailable: false,
          reason
        };
        
        set((state) => ({
          availability: [...state.availability, newAvailability]
        }));
      },
      
      setAvailable: (resourceId, startDate, endDate) => {
        const newAvailability: ResourceAvailability = {
          resourceId,
          startDate,
          endDate,
          isAvailable: true
        };
        
        set((state) => ({
          availability: [...state.availability, newAvailability]
        }));
      },
      
      getResourceAvailability: (resourceId, date) => {
        return get().availability.find(
          (a) =>
            a.resourceId === resourceId &&
            date >= a.startDate &&
            date <= a.endDate
        );
      },
      
      // Conflict Detection & Resolution
      detectConflicts: (resourceId) => {
        const allocations = resourceId
          ? get().getAllocationsByResource(resourceId)
          : get().allocations;
        
        const newConflicts: ResourceConflict[] = [];
        
        // Group allocations by resource
        const allocationsByResource: Record<string, ResourceAllocation[]> = {};
        allocations.forEach((a) => {
          if (a.status !== 'cancelled' && a.status !== 'completed') {
            if (!allocationsByResource[a.resourceId]) {
              allocationsByResource[a.resourceId] = [];
            }
            allocationsByResource[a.resourceId].push(a);
          }
        });
        
        // Check for conflicts
        Object.entries(allocationsByResource).forEach(([resId, resAllocations]) => {
          // Sort by start date
          const sorted = resAllocations.sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime()
          );
          
          // Check for overlaps
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            
            if (current.endDate >= next.startDate) {
              // Overlap detected
              const totalPercentage = current.percentage + next.percentage;
              
              const conflict: ResourceConflict = {
                id: `conflict-${Date.now()}-${i}`,
                resourceId: resId,
                resourceName: current.resourceName,
                conflictingAllocations: [current, next],
                type: totalPercentage > 100 ? 'overallocation' : 'overlap',
                severity:
                  totalPercentage > 150
                    ? 'critical'
                    : totalPercentage > 100
                    ? 'high'
                    : 'medium',
                detectedAt: new Date()
              };
              
              newConflicts.push(conflict);
            }
          }
        });
        
        // Add new conflicts to state
        if (newConflicts.length > 0) {
          set((state) => ({
            conflicts: [...state.conflicts, ...newConflicts]
          }));
        }
        
        return newConflicts;
      },
      
      resolveConflict: (conflictId, resolution) => {
        const newResolution: ConflictResolution = {
          ...resolution,
          id: `res-${Date.now()}`,
          conflictId,
          resolvedAt: new Date()
        };
        
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId
              ? { ...c, resolvedAt: new Date(), resolution: newResolution }
              : c
          )
        }));
      },
      
      getActiveConflicts: () => {
        return get().conflicts.filter((c) => !c.resolvedAt);
      },
      
      // Utilization Tracking
      addUtilizationData: (data) => {
        const utilizationPercentage =
          data.hoursAllocated > 0
            ? (data.hoursLogged / data.hoursAllocated) * 100
            : 0;
        
        const newUtilization: ResourceUtilization = {
          ...data,
          id: `util-${Date.now()}`,
          utilizationPercentage
        };
        
        set((state) => ({
          utilization: [...state.utilization, newUtilization]
        }));
      },
      
      getUtilization: (resourceId, startDate, endDate) => {
        return get().utilization.filter(
          (u) =>
            u.resourceId === resourceId &&
            u.date >= startDate &&
            u.date <= endDate
        );
      },
      
      getUtilizationSummary: (resourceId, period) => {
        const now = new Date();
        const startDate = new Date();
        
        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        const utilData = get().getUtilization(resourceId, startDate, now);
        
        const totalHours = utilData.reduce((sum, u) => sum + u.hoursLogged, 0);
        const avgUtilization =
          utilData.length > 0
            ? utilData.reduce((sum, u) => sum + u.utilizationPercentage, 0) /
              utilData.length
            : 0;
        const peakUtilization = Math.max(
          ...utilData.map((u) => u.utilizationPercentage),
          0
        );
        
        return {
          totalHours,
          avgUtilization,
          peakUtilization
        };
      },
      
      // Query Methods
      getAvailableResources: (typeId, startDate, endDate) => {
        return get()
          .getInstancesByType(typeId)
          .filter((instance) =>
            get().checkAvailability(instance.id, startDate, endDate)
          );
      },
      
      getResourcesByProject: (projectId) => {
        const projectAllocations = get().getAllocationsByProject(projectId);
        const resourceIds = [...new Set(projectAllocations.map((a) => a.resourceId))];
        
        return get().resourceInstances.filter((ri) =>
          resourceIds.includes(ri.id)
        );
      },
      
      getResourceCapacity: (resourceId, date) => {
        const allocations = get()
          .getAllocationsByResource(resourceId)
          .filter(
            (a) =>
              a.status !== 'cancelled' &&
              a.status !== 'completed' &&
              date >= a.startDate &&
              date <= a.endDate
          );
        
        const totalAllocated = allocations.reduce((sum, a) => sum + a.percentage, 0);
        return Math.max(0, 100 - totalAllocated);
      },
      
      searchResources: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().resourceInstances.filter((ri) => {
          const nameMatch = ri.typeName.toLowerCase().includes(lowerQuery);
          const dataMatch = JSON.stringify(ri.data).toLowerCase().includes(lowerQuery);
          return nameMatch || dataMatch;
        });
      }
    }),
    {
      name: 'resource-storage',
      partialize: (state) => ({
        resourceTypes: state.resourceTypes,
        resourceInstances: state.resourceInstances,
        allocations: state.allocations,
        conflicts: state.conflicts,
        utilization: state.utilization,
        availability: state.availability
      })
    }
  )
);