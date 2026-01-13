/**
 * Resource Type Storage Utility
 * Handles localStorage persistence for resource type definitions
 */

export interface ResourceTypeDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  
  // Metadata
  version: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt?: string;
  
  // Schema
  fields: any[];
  operations: any[];
  
  // Versioning
  changelog?: string;
  previousVersion?: string;
  breakingChanges?: string[];
  
  // Usage tracking
  usedInProjects?: string[];
  
  // JSON snapshots
  snapshot?: string; // JSON stringified version
}

export interface ResourceTypeVersion {
  version: string;
  publishedAt: string;
  snapshot: string;
  changelog: string;
  breakingChanges: string[];
}

const STORAGE_KEY = 'swiz_resource_types';
const VERSIONS_KEY = 'swiz_resource_type_versions';
const SETTINGS_KEY = 'swiz_resource_type_settings';

/**
 * Get all resource types
 */
export function getAllResourceTypes(): ResourceTypeDefinition[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading resource types:', error);
    return [];
  }
}

/**
 * Get resource type by ID
 */
export function getResourceTypeById(id: string): ResourceTypeDefinition | null {
  const types = getAllResourceTypes();
  return types.find(t => t.id === id) || null;
}

/**
 * Save resource type (create or update)
 */
export function saveResourceType(resourceType: ResourceTypeDefinition): void {
  try {
    const types = getAllResourceTypes();
    const existingIndex = types.findIndex(t => t.id === resourceType.id);
    
    const now = new Date().toISOString();
    const updatedType: ResourceTypeDefinition = {
      ...resourceType,
      updatedAt: now,
      snapshot: JSON.stringify({
        fields: resourceType.fields,
        operations: resourceType.operations
      })
    };
    
    if (existingIndex >= 0) {
      // Update existing
      types[existingIndex] = updatedType;
    } else {
      // Create new
      types.push({
        ...updatedType,
        createdAt: now
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
  } catch (error) {
    console.error('Error saving resource type:', error);
    throw new Error('Failed to save resource type');
  }
}

/**
 * Delete resource type
 */
export function deleteResourceType(id: string): boolean {
  try {
    const types = getAllResourceTypes();
    const filtered = types.filter(t => t.id !== id);
    
    if (filtered.length === types.length) {
      return false; // Not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Also delete version history
    deleteVersionHistory(id);
    
    return true;
  } catch (error) {
    console.error('Error deleting resource type:', error);
    return false;
  }
}

/**
 * Duplicate resource type
 */
export function duplicateResourceType(id: string, newName: string): ResourceTypeDefinition | null {
  try {
    const original = getResourceTypeById(id);
    if (!original) return null;
    
    const now = new Date().toISOString();
    const duplicate: ResourceTypeDefinition = {
      ...original,
      id: `res-${Date.now()}`,
      name: newName,
      status: 'draft',
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
      changelog: `Duplicated from ${original.name}`,
      previousVersion: undefined,
      breakingChanges: [],
      usedInProjects: []
    };
    
    saveResourceType(duplicate);
    return duplicate;
  } catch (error) {
    console.error('Error duplicating resource type:', error);
    return null;
  }
}

/**
 * Get version history for a resource type
 */
export function getVersionHistory(resourceTypeId: string): ResourceTypeVersion[] {
  try {
    const data = localStorage.getItem(`${VERSIONS_KEY}_${resourceTypeId}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading version history:', error);
    return [];
  }
}

/**
 * Save version snapshot
 */
export function saveVersionSnapshot(
  resourceTypeId: string,
  version: string,
  snapshot: string,
  changelog: string,
  breakingChanges: string[]
): void {
  try {
    const history = getVersionHistory(resourceTypeId);
    
    const versionEntry: ResourceTypeVersion = {
      version,
      publishedAt: new Date().toISOString(),
      snapshot,
      changelog,
      breakingChanges
    };
    
    history.push(versionEntry);
    
    localStorage.setItem(
      `${VERSIONS_KEY}_${resourceTypeId}`,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('Error saving version snapshot:', error);
  }
}

/**
 * Delete version history
 */
export function deleteVersionHistory(resourceTypeId: string): void {
  try {
    localStorage.removeItem(`${VERSIONS_KEY}_${resourceTypeId}`);
  } catch (error) {
    console.error('Error deleting version history:', error);
  }
}

/**
 * Get resource type statistics
 */
export function getResourceTypeStats() {
  const types = getAllResourceTypes();
  
  return {
    total: types.length,
    published: types.filter(t => t.status === 'published').length,
    draft: types.filter(t => t.status === 'draft').length,
    totalVersions: types.reduce((sum, t) => {
      const history = getVersionHistory(t.id);
      return sum + history.length;
    }, 0),
    categories: [...new Set(types.map(t => t.category))].length,
    recentlyUpdated: types
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  };
}

/**
 * Search resource types
 */
export function searchResourceTypes(query: string): ResourceTypeDefinition[] {
  const types = getAllResourceTypes();
  const lowerQuery = query.toLowerCase();
  
  return types.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description?.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter resource types
 */
export function filterResourceTypes(filters: {
  status?: 'draft' | 'published';
  category?: string;
  sortBy?: 'name' | 'updatedAt' | 'version';
  sortOrder?: 'asc' | 'desc';
}): ResourceTypeDefinition[] {
  let types = getAllResourceTypes();
  
  // Filter by status
  if (filters.status) {
    types = types.filter(t => t.status === filters.status);
  }
  
  // Filter by category
  if (filters.category) {
    types = types.filter(t => t.category === filters.category);
  }
  
  // Sort
  if (filters.sortBy) {
    types.sort((a, b) => {
      let aVal: any = a[filters.sortBy!];
      let bVal: any = b[filters.sortBy!];
      
      if (filters.sortBy === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (filters.sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
  }
  
  return types;
}

/**
 * Export resource type to JSON
 */
export function exportResourceType(id: string): string | null {
  const resourceType = getResourceTypeById(id);
  if (!resourceType) return null;
  
  return JSON.stringify(resourceType, null, 2);
}

/**
 * Import resource type from JSON
 */
export function importResourceType(jsonString: string): ResourceTypeDefinition | null {
  try {
    const resourceType = JSON.parse(jsonString);
    
    // Generate new ID to avoid conflicts
    const imported: ResourceTypeDefinition = {
      ...resourceType,
      id: `res-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedInProjects: []
    };
    
    saveResourceType(imported);
    return imported;
  } catch (error) {
    console.error('Error importing resource type:', error);
    return null;
  }
}

/**
 * Get settings
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        confirmDelete: true,
        showDrafts: true
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
}

/**
 * Save settings
 */
export function saveSettings(settings: any): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Clear all data (use with caution!)
 */
export function clearAllData(): void {
  try {
    const types = getAllResourceTypes();
    
    // Remove all version histories
    types.forEach(t => {
      localStorage.removeItem(`${VERSIONS_KEY}_${t.id}`);
    });
    
    // Remove main data
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

/**
 * Initialize with sample data (for demo purposes)
 */
export function initializeSampleData(): void {
  const existing = getAllResourceTypes();
  if (existing.length > 0) return; // Already has data
  
  const sampleTypes: ResourceTypeDefinition[] = [
    {
      id: 'res-heavy-machinery',
      name: 'Heavy Machinery',
      icon: '🚜',
      category: 'Equipment',
      description: 'Heavy construction and industrial machinery',
      version: '2.0',
      status: 'published',
      createdAt: '2024-10-15T10:00:00Z',
      updatedAt: '2024-11-20T14:30:00Z',
      publishedAt: '2024-11-20T14:30:00Z',
      createdBy: 'Admin',
      fields: [],
      operations: [],
      changelog: 'Updated field validations and added new operations',
      usedInProjects: ['Construction Project Alpha', 'Infrastructure Beta']
    },
    {
      id: 'res-software-licenses',
      name: 'Software Licenses',
      icon: '💻',
      category: 'Digital',
      description: 'Software licenses and subscriptions',
      version: '1.5',
      status: 'published',
      createdAt: '2024-09-01T08:00:00Z',
      updatedAt: '2024-10-15T12:00:00Z',
      publishedAt: '2024-10-15T12:00:00Z',
      createdBy: 'Admin',
      fields: [],
      operations: [],
      changelog: 'Added renewal tracking fields',
      usedInProjects: ['IT Infrastructure Project']
    },
    {
      id: 'res-raw-materials',
      name: 'Raw Materials',
      icon: '📦',
      category: 'Materials',
      description: 'Raw materials and inventory stock',
      version: '1.0',
      status: 'draft',
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-01T09:00:00Z',
      createdBy: 'Admin',
      fields: [],
      operations: [],
      changelog: 'Initial draft',
      usedInProjects: []
    }
  ];
  
  sampleTypes.forEach(type => saveResourceType(type));
}
