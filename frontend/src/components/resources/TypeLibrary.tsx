import { useState } from 'react';
import { Plus, Search, Edit, Eye, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { ResourceTypeBuilder } from './builder/ResourceTypeBuilder';
import { useResourceStore } from '../../store/resourceStore';
import type { ResourceType } from '../../types/resource';

interface TypeLibraryProps {
  resourceTypes: ResourceType[];
  canEdit: boolean;
  category: string;
}

type ViewMode = 'list' | 'builder' | 'viewer';

export function TypeLibrary({ resourceTypes, canEdit, category }: TypeLibraryProps) {
  const createResourceType = useResourceStore((state) => state.createResourceType);
  const updateResourceType = useResourceStore((state) => state.updateResourceType);
  const deleteResourceType = useResourceStore((state) => state.deleteResourceType);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTypes = resourceTypes.filter(type => {
    if (category !== 'all' && type.category !== category) return false;
    if (searchQuery && !type.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateType = () => {
    setSelectedTypeId(null);
    setViewMode('builder');
  };

  const handleEditType = (typeId: string) => {
    setSelectedTypeId(typeId);
    setViewMode('builder');
  };

  const handleViewType = (typeId: string) => {
    setSelectedTypeId(typeId);
    setViewMode('viewer');
  };

  const handleSaveType = (type: ResourceType) => {
    if (selectedTypeId) {
      // Update existing
      updateResourceType(selectedTypeId, type);
    } else {
      // Create new
      createResourceType(type);
    }
    setViewMode('list');
  };

  const handleDeleteType = (typeId: string) => {
    if (confirm('Are you sure you want to delete this resource type?')) {
      deleteResourceType(typeId);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedTypeId(null);
  };

  const selectedType = selectedTypeId ? resourceTypes.find(t => t.id === selectedTypeId) : undefined;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'draft': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'validated': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'validated': return 'info';
      default: return 'default';
    }
  };

  if (viewMode === 'builder') {
    return (
      <ResourceTypeBuilder
        resourceType={selectedType}
        onSave={handleSaveType}
        onCancel={handleCancel}
      />
    );
  }

  if (viewMode === 'viewer' && selectedType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Back to Library
          </Button>
          {canEdit && (
            <Button onClick={() => setViewMode('builder')}>
              Edit Type
            </Button>
          )}
        </div>
        <GlassCard className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{selectedType.icon}</div>
            <h2 className="text-slate-900 dark:text-white mb-2">{selectedType.name}</h2>
            <p className="text-slate-600 dark:text-white/60 mb-4">{selectedType.description}</p>
            <Badge variant={getStatusColor(selectedType.status) as any}>
              {selectedType.status}
            </Badge>
          </div>
          <div className="mt-8">
            <h3 className="text-slate-900 dark:text-white mb-4">Schema ({selectedType.schema.length} fields)</h3>
            <div className="space-y-2">
              {selectedType.schema.map(field => (
                <div key={field.id} className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white">{field.displayName}</span>
                    <Badge variant="outline" className="text-xs">{field.type}</Badge>
                  </div>
                  {field.helpText && (
                    <p className="text-xs text-slate-600 dark:text-white/60 mt-1">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search resource types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        {canEdit && (
          <Button onClick={handleCreateType} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Type
          </Button>
        )}
      </div>

      {/* Type Grid */}
      {filteredTypes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-slate-900 dark:text-white mb-2">No Resource Types Found</h3>
          <p className="text-slate-600 dark:text-white/60 mb-6">
            {canEdit
              ? 'Create your first resource type to get started'
              : 'No resource types available in this category'}
          </p>
          {canEdit && (
            <Button onClick={handleCreateType} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Resource Type
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
            >
              <GlassCard className="p-6 hover-glow h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{type.icon}</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(type.status)}
                    <Badge variant={getStatusColor(type.status) as any} className="text-xs">
                      {type.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-slate-900 dark:text-white mb-2">{type.name}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-4 line-clamp-2">
                  {type.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/60 mb-4">
                  <span>{type.schema.length} fields</span>
                  <span>•</span>
                  <span>{type.operations.length} operations</span>
                  <span>•</span>
                  <span>v{type.version}</span>
                </div>

                {type.validationErrors && type.validationErrors.length > 0 && (
                  <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400">
                      {type.validationErrors.length} validation issue{type.validationErrors.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewType(type.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  {canEdit && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditType(type.id)}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      {type.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}