import { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, MoreVertical, History, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { InstanceDetailModal } from './InstanceDetailModal';
import { LogicEngine } from '../../utils/logicEngine';
import { useResourceStore } from '../../store/resourceStore';
import type { ResourceInstance, ResourceType, FieldSchema, OperationDefinition } from '../../types/resource';

interface ResourcePoolCompleteProps {
  instances: ResourceInstance[];
  resourceTypes: ResourceType[];
  canEdit: boolean;
  category: string;
}

export function ResourcePoolComplete({ instances, resourceTypes, canEdit, category }: ResourcePoolCompleteProps) {
  const createInstance = useResourceStore((state) => state.createInstance);
  const updateInstance = useResourceStore((state) => state.updateInstance);
  const deleteInstance = useResourceStore((state) => state.deleteInstance);
  
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<ResourceInstance | null>(null);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('view');

  // Filter published types only
  const publishedTypes = resourceTypes.filter(rt => rt.status === 'published');

  // Filter instances
  const filteredInstances = instances.filter(instance => {
    if (selectedTypeId !== 'all' && instance.typeId !== selectedTypeId) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return instance.typeName.toLowerCase().includes(searchLower) ||
             Object.values(instance.data).some(val => 
               String(val).toLowerCase().includes(searchLower)
             );
    }
    return true;
  });

  const handleCreateInstance = () => {
    if (publishedTypes.length === 0) {
      alert('No published resource types available. Please publish a resource type first.');
      return;
    }
    
    const typeToUse = selectedTypeId !== 'all' 
      ? publishedTypes.find(t => t.id === selectedTypeId)
      : publishedTypes[0];

    if (!typeToUse) return;

    // Create empty instance based on schema
    const emptyData: Record<string, any> = {};
    typeToUse.schema.forEach(field => {
      emptyData[field.internalName] = getDefaultValue(field.type);
    });

    setSelectedInstance({
      id: '',
      typeId: typeToUse.id,
      typeName: typeToUse.name,
      data: emptyData,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: []
    });
    setViewMode('create');
    setShowInstanceModal(true);
  };

  const handleViewInstance = (instance: ResourceInstance) => {
    setSelectedInstance(instance);
    setViewMode('view');
    setShowInstanceModal(true);
  };

  const handleEditInstance = (instance: ResourceInstance) => {
    setSelectedInstance(instance);
    setViewMode('edit');
    setShowInstanceModal(true);
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm('Delete this resource instance?')) {
      deleteInstance(instanceId);
    }
  };

  const handleSaveInstance = (instance: ResourceInstance) => {
    if (viewMode === 'create') {
      // Create new - use typeId and data
      createInstance(instance.typeId, instance.data);
    } else {
      // Update existing - use id and data
      updateInstance(instance.id, instance.data);
    }
    setShowInstanceModal(false);
  };

  const handleExecuteOperation = (instance: ResourceInstance, operation: OperationDefinition) => {
    // Execute operation using LogicEngine
    console.log('Executing operation:', operation.name, 'on instance:', instance.id);
    
    const executionResult = LogicEngine.execute(instance, operation, {});
    
    if (executionResult.success && executionResult.updatedInstance) {
      // Update instance data in store
      updateInstance(instance.id, executionResult.updatedInstance.data);
      
      alert(`Operation "${operation.name}" executed successfully!\n${executionResult.changes.length} field(s) updated.`);
    } else {
      alert(`Operation failed: ${executionResult.error}`);
      console.error('Execution log:', executionResult.executionLog);
    }
  };

  function getDefaultValue(type: string) {
    switch (type) {
      case 'text': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'date':
      case 'datetime': return new Date().toISOString().split('T')[0];
      case 'enum': return '';
      default: return null;
    }
  }

  const selectedType = selectedTypeId !== 'all' ? publishedTypes.find(t => t.id === selectedTypeId) : null;
  const displaySchema = selectedType?.schema || [];

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Type Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="all">All Resource Types</option>
            {publishedTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="lg:col-span-6">
          <Input
            type="text"
            placeholder="Search instances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Actions */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <Badge variant="outline">
            {filteredInstances.length} instance{filteredInstances.length !== 1 ? 's' : ''}
          </Badge>
          {canEdit && (
            <Button onClick={handleCreateInstance} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Instance
            </Button>
          )}
        </div>
      </div>

      {/* Data Grid */}
      {publishedTypes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Published Resource Types</h3>
          <p className="text-slate-600 dark:text-white/60">
            Publish a resource type in the Type Library to start adding instances
          </p>
        </GlassCard>
      ) : filteredInstances.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Instances Found</h3>
          <p className="text-slate-600 dark:text-white/60 mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Add your first resource instance to get started'}
          </p>
          {canEdit && !searchQuery && (
            <Button onClick={handleCreateInstance} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Instance
            </Button>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 text-sm">ID</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 text-sm">Type</th>
                  {displaySchema.slice(0, 3).map(field => (
                    <th key={field.id} className="text-left p-4 text-slate-600 dark:text-white/60 text-sm">
                      {field.displayName}
                    </th>
                  ))}
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 text-sm">Updated</th>
                  <th className="text-right p-4 text-slate-600 dark:text-white/60 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstances.map((instance) => {
                  const instanceType = publishedTypes.find(t => t.id === instance.typeId);
                  const schema = instanceType?.schema || [];
                  
                  return (
                    <motion.tr
                      key={instance.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <code className="text-xs text-purple-500">{instance.id}</code>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {instanceType?.icon} {instance.typeName}
                        </Badge>
                      </td>
                      {schema.slice(0, 3).map(field => (
                        <td key={field.id} className="p-4">
                          <span className="text-sm text-slate-900 dark:text-white">
                            {renderFieldValue(instance.data[field.internalName], field)}
                          </span>
                        </td>
                      ))}
                      <td className="p-4">
                        <span className="text-xs text-slate-600 dark:text-white/60">
                          {new Date(instance.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewInstance(instance)}
                            className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleEditInstance(instance)}
                                className="p-2 hover:bg-green-500/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-green-400" />
                              </button>
                              <OperationsMenu
                                instance={instance}
                                operations={instanceType?.operations.filter(op => op.isPublic) || []}
                                onExecute={(op) => handleExecuteOperation(instance, op)}
                              />
                              <button
                                onClick={() => handleDeleteInstance(instance.id)}
                                className="p-2 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Instance Detail Modal */}
      {showInstanceModal && selectedInstance && (() => {
        const resourceType = publishedTypes.find(t => t.id === selectedInstance.typeId);
        if (!resourceType) return null;
        
        return (
          <InstanceDetailModal
            instance={selectedInstance}
            resourceType={resourceType}
            mode={viewMode}
            onSave={handleSaveInstance}
            onClose={() => {
              setShowInstanceModal(false);
              setSelectedInstance(null);
            }}
            onExecuteOperation={handleExecuteOperation}
          />
        );
      })()}
    </div>
  );
}

// Helper function to render field values
function renderFieldValue(value: any, field: FieldSchema): string {
  if (value === null || value === undefined) return '-';
  
  switch (field.type) {
    case 'boolean':
      return value ? '✓ Yes' : '✗ No';
    case 'date':
    case 'datetime':
      return new Date(value).toLocaleDateString();
    case 'enum':
      const option = field.enumOptions?.find(opt => opt.value === value);
      return option?.label || value;
    default:
      return String(value);
  }
}

// Operations Menu Component
interface OperationsMenuProps {
  instance: ResourceInstance;
  operations: OperationDefinition[];
  onExecute: (operation: OperationDefinition) => void;
}

function OperationsMenu({ instance, operations, onExecute }: OperationsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (operations.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-purple-500/20 rounded transition-colors"
        title="Operations"
      >
        <MoreVertical className="w-4 h-4 text-purple-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-20 w-48 rounded-lg overflow-hidden shadow-xl"
            >
              <GlassCard className="p-2">
                <div className="text-xs text-slate-600 dark:text-white/60 px-2 py-1 mb-1">
                  Execute Operation:
                </div>
                {operations.map(op => (
                  <button
                    key={op.id}
                    onClick={() => {
                      onExecute(op);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <Play className="w-3 h-3 text-purple-400" />
                    <span className="text-sm text-slate-900 dark:text-white">{op.name}</span>
                  </button>
                ))}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}