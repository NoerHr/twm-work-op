import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Package, 
  X, 
  Search,
  Wrench,
  Check,
  Info,
  Database,
  LockKeyhole
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Project } from '../../../types/project';
import type { ProjectResourceType } from '../../../types/resource';

interface ResourcesTabProps {
  project: Partial<Project>;
  onUpdate: (field: keyof Project, value: any) => void;
  readOnly?: boolean;
}

export function ResourcesTab({ project, onUpdate, readOnly = false }: ResourcesTabProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock organizational resource types
  const mockOrgResources = [
    {
      id: 'res-heavy-machinery',
      name: 'Heavy Machinery',
      category: 'Equipment',
      description: 'Construction equipment with tracking',
      functionCount: 3
    },
    {
      id: 'res-software-licenses',
      name: 'Software Licenses',
      category: 'Digital',
      description: 'Enterprise software allocation',
      functionCount: 2
    },
    {
      id: 'res-raw-materials',
      name: 'Raw Materials Inventory',
      category: 'Materials',
      description: 'Material tracking and consumption',
      functionCount: 4
    }
  ];

  const selectedResources = (project.resourceTypes as ProjectResourceType[]) || [];

  const handleImportResources = (resourceIds: string[]) => {
    const newResources = resourceIds.map(id => {
      const orgResource = mockOrgResources.find(r => r.id === id);
      return {
        id: `proj-${project.id}-${id}`,
        organizationalResourceTypeId: id,
        name: orgResource?.name || '',
        inherited: true,
        scope: 'full' as const,
        modificationHistory: []
      };
    });

    onUpdate('resourceTypes', [...selectedResources, ...newResources]);
    setShowImportModal(false);
  };

  const handleRemoveResource = (resourceId: string) => {
    if (readOnly) return;
    const updated = selectedResources.filter(r => r.id !== resourceId);
    onUpdate('resourceTypes', updated);
  };

  const filteredOrgResources = mockOrgResources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white">Resource Inheritance</h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
            Import resource types from Organization Library for use in this project.
          </p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowImportModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Import Resources
          </Button>
        )}
        {readOnly && (
          <Badge variant="warning">
            <LockKeyhole className="w-3 h-3 mr-1" />
            Read Only
          </Badge>
        )}
      </div>

      {/* Selected Resources List */}
      {selectedResources.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Database className="w-16 h-16 text-slate-400 dark:text-white/20 mx-auto mb-4" />
          <h4 className="text-slate-900 dark:text-white mb-2">No Resources Imported</h4>
          <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
            {readOnly 
              ? 'This project has no resource types configured yet.'
              : 'Import resource types from the organization library to begin.'}
          </p>
          {!readOnly && (
            <Button onClick={() => setShowImportModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Import Your First Resource
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {selectedResources.map((resource) => {
            const orgResource = mockOrgResources.find(r => r.id === resource.organizationalResourceTypeId);
            
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-slate-900 dark:text-white">{resource.name}</h4>
                          <Badge variant="success">
                            <Check className="w-3 h-3 mr-1" />
                            Inherited
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-white/60 mb-2">
                          {orgResource?.description || 'Organizational resource type'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/40">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {orgResource?.functionCount || 0} Operations
                          </span>
                          <span>Category: {orgResource?.category || 'General'}</span>
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource(resource.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <GlassCard className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-white/70">
            <strong>Resource Scoping:</strong> Imported resources will be available for Stage and Assignment configuration. 
            Leaders can only use resources that have been explicitly mapped to their assignments.
          </div>
        </div>
      </GlassCard>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && !readOnly && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-900 dark:text-white">Import Resources from Organization</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search resource types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Resource List */}
                <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                  {filteredOrgResources.map((resource) => {
                    const isSelected = selectedResources.some(r => r.organizationalResourceTypeId === resource.id);
                    
                    return (
                      <div
                        key={resource.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/50'
                            : 'bg-white/30 dark:bg-slate-800/30 border-slate-200 dark:border-white/10 hover:border-purple-500/30'
                        }`}
                        onClick={() => {
                          if (!isSelected) {
                            handleImportResources([resource.id]);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-slate-900 dark:text-white">{resource.name}</h4>
                              {isSelected && (
                                <Badge variant="success">
                                  <Check className="w-3 h-3 mr-1" />
                                  Imported
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-white/60 mb-2">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/40">
                              <span className="flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                {resource.functionCount} Operations
                              </span>
                              <span>Category: {resource.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowImportModal(false)}>
                    Done
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}