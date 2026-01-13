import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, PackagePlus, Database, Settings, History, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResourceTypeCreator } from '../components/resources/ResourceTypeCreator';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner@2.0.3';

// Mock helper functions for resource types
const getAllResourceTypes = () => {
  const stored = localStorage.getItem('swiz_resource_types');
  return stored ? JSON.parse(stored) : [];
};

const getResourceTypeStats = () => {
  const types = getAllResourceTypes();
  return {
    total: types.length,
    published: types.filter((t: any) => t.status === 'Published').length,
    draft: types.filter((t: any) => t.status === 'Draft').length,
    totalVersions: types.reduce((sum: number, t: any) => sum + (parseInt(t.version) || 1), 0)
  };
};

const initializeSampleData = () => {
  const sampleTypes = [
    {
      id: 'rt-1',
      name: 'Senior Developer',
      icon: '👨‍💻',
      category: 'Human Resource',
      version: '1.0',
      status: 'Published',
      fieldCount: 8,
      operationCount: 5,
      lastModified: 'Yesterday'
    },
    {
      id: 'rt-2',
      name: 'Meeting Room',
      icon: '🏢',
      category: 'Physical Resource',
      version: '2.1',
      status: 'Published',
      fieldCount: 6,
      operationCount: 4,
      lastModified: '3 days ago'
    }
  ];
  localStorage.setItem('swiz_resource_types', JSON.stringify(sampleTypes));
};

const duplicateResourceType = (id: string, newName: string) => {
  const types = getAllResourceTypes();
  const original = types.find((t: any) => t.id === id);
  if (!original) return false;
  
  const duplicated = {
    ...original,
    id: `rt-${Date.now()}`,
    name: newName,
    status: 'Draft',
    version: '1.0'
  };
  
  types.push(duplicated);
  localStorage.setItem('swiz_resource_types', JSON.stringify(types));
  return true;
};

export function ResourceTypes() {
  const navigate = useNavigate();
  const [showCreator, setShowCreator] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    published: 0,
    draft: 0,
    totalVersions: 0
  });

  // Load resource types on mount
  useEffect(() => {
    loadResourceTypes();
    
    // Initialize sample data if empty
    const types = getAllResourceTypes();
    if (types.length === 0) {
      initializeSampleData();
      loadResourceTypes();
    }
  }, []);

  const loadResourceTypes = () => {
    const types = getAllResourceTypes();
    const statistics = getResourceTypeStats();
    setResourceTypes(types);
    setStats(statistics);
  };

  const handleSaveResourceType = (data: any) => {
    toast.success(editingResource ? 'Resource Type updated successfully!' : 'Resource Type created successfully!');
    setShowCreator(false);
    setEditingResource(null);
    loadResourceTypes(); // Reload list
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setShowCreator(true);
  };

  const handleDuplicateResource = (resource: any) => {
    const newName = `${resource.name} (Copy)`;
    const duplicated = duplicateResourceType(resource.id, newName);
    if (duplicated) {
      toast.success(`Resource type duplicated as "${newName}"`);
      loadResourceTypes();
    } else {
      toast.error('Failed to duplicate resource type');
    }
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setEditingResource(null);
  };

  // If showing creator, render creator interface
  if (showCreator) {
    return (
      <div className="p-8">
        <ResourceTypeCreator
          resourceType={editingResource}
          onBack={handleCloseCreator}
          onSave={handleSaveResourceType}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate('/organization')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organization
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Resource Types</h1>
            <p className="text-slate-600 dark:text-white/60">
              The Creator - Build and manage resource type schemas with 5-tab interface (Basic, Fields, Operations, Simulation, Versioning)
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowCreator(true)}
          >
            <Plus className="w-4 h-4" />
            Create New Resource Type
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-600 dark:text-white/60">Total Types</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</div>
              <div className="text-sm text-slate-600 dark:text-white/60">Published</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.draft}</div>
              <div className="text-sm text-slate-600 dark:text-white/60">In Draft</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVersions}</div>
              <div className="text-sm text-slate-600 dark:text-white/60">Total Versions</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Resource Type List */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {resourceTypes.map((resource) => (
            <div
              key={resource.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{resource.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900 dark:text-white font-medium">{resource.name}</h3>
                      <Badge variant={resource.status === 'Published' ? 'success' : 'warning'}>
                        v{resource.version} - {resource.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-white/60">
                      Category: {resource.category} • {resource.fieldCount} Fields • {resource.operationCount} Operations
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      Last modified: {resource.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditResource(resource)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateResource(resource)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Info */}
      <GlassCard className="p-4 mt-6 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-white/70">
            <strong>The Creator Interface:</strong> Each resource type has 5 tabs - Basic Info (metadata), 
            Fields (schema builder), Operations (logic builder), Simulation (testing lab), and Versioning (publish & history). 
            Use this to define templates that Projects can inherit.
          </div>
        </div>
      </GlassCard>
    </div>
  );
}