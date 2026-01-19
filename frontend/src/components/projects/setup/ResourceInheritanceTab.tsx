import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Package, 
  X, 
  Search,
  Wrench,
  BarChart3,
  History,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Project } from '../../../types/project';
import type { OrganizationalResourceType, ProjectResourceType } from '../../../types/resource';

interface ResourceInheritanceTabProps {
  project: Project;
  selectedTypes: ProjectResourceType[];
  onUpdate: (types: ProjectResourceType[]) => void;
}

// Mock organizational resource types library
const MOCK_ORG_RESOURCES: OrganizationalResourceType[] = [
  {
    id: 'res-heavy-machinery',
    name: 'Heavy Machinery',
    version: '2.0',
    description: 'Construction and excavation equipment with tracking and maintenance capabilities',
    category: 'equipment',
    icon: '🚜',
    functions: [
      {
        id: 'fn-checkout',
        name: 'CheckOut',
        description: 'Assign machinery to operator',
        parameters: [
          { name: 'operatorId', type: 'string', required: true },
          { name: 'duration', type: 'number', required: true }
        ],
        returnType: 'boolean'
      },
      {
        id: 'fn-report-repair',
        name: 'ReportRepair',
        description: 'Log maintenance issues',
        parameters: [
          { name: 'issueDescription', type: 'string', required: true },
          { name: 'severity', type: 'string', required: true }
        ],
        returnType: 'string'
      },
      {
        id: 'fn-update-mileage',
        name: 'UpdateMileage',
        description: 'Record equipment usage',
        parameters: [
          { name: 'odometer', type: 'number', required: true },
          { name: 'fuelLevel', type: 'number', required: false }
        ],
        returnType: 'void'
      }
    ],
    metrics: [
      {
        id: 'metric-fuel',
        name: 'Fuel Level',
        unit: '%',
        type: 'percentage',
        aggregation: 'average'
      },
      {
        id: 'metric-hours',
        name: 'Operating Hours',
        unit: 'hours',
        type: 'duration',
        aggregation: 'sum'
      },
      {
        id: 'metric-downtime',
        name: 'Maintenance Downtime',
        unit: 'hours',
        type: 'duration',
        aggregation: 'sum'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-11-20'),
    createdBy: 'admin-system',
    previousVersionId: 'res-heavy-machinery-v1',
    changeLog: 'Added UpdateMileage function and Fuel Level metric'
  },
  {
    id: 'res-software-licenses',
    name: 'Software License Pool',
    version: '1.5',
    description: 'Manage software license allocation and usage tracking',
    category: 'software',
    icon: '💻',
    functions: [
      {
        id: 'fn-allocate',
        name: 'AllocateLicense',
        description: 'Assign license to user',
        parameters: [
          { name: 'userId', type: 'string', required: true },
          { name: 'licenseType', type: 'string', required: true }
        ],
        returnType: 'string'
      },
      {
        id: 'fn-release',
        name: 'ReleaseLicense',
        description: 'Return license to pool',
        parameters: [
          { name: 'licenseId', type: 'string', required: true }
        ],
        returnType: 'boolean'
      }
    ],
    metrics: [
      {
        id: 'metric-available',
        name: 'Available Licenses',
        unit: 'count',
        type: 'count',
        aggregation: 'sum'
      },
      {
        id: 'metric-utilization',
        name: 'Utilization Rate',
        unit: '%',
        type: 'percentage',
        aggregation: 'average'
      }
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-10-05'),
    createdBy: 'admin-it',
    changeLog: 'Improved license pooling algorithm'
  },
  {
    id: 'res-safety-gear',
    name: 'Safety Equipment',
    version: '1.0',
    description: 'Track safety gear inventory and compliance',
    category: 'material',
    icon: '🦺',
    functions: [
      {
        id: 'fn-inspect',
        name: 'InspectGear',
        description: 'Log safety inspection',
        parameters: [
          { name: 'gearId', type: 'string', required: true },
          { name: 'inspectorId', type: 'string', required: true },
          { name: 'passed', type: 'boolean', required: true }
        ],
        returnType: 'string'
      }
    ],
    metrics: [
      {
        id: 'metric-compliance',
        name: 'Compliance Rate',
        unit: '%',
        type: 'percentage',
        aggregation: 'average'
      }
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'admin-safety'
  }
];

export function ResourceInheritanceTab({ project, selectedTypes, onUpdate }: ResourceInheritanceTabProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewResource, setPreviewResource] = useState<OrganizationalResourceType | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Package },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'software', label: 'Software', icon: '💻' },
    { id: 'material', label: 'Material', icon: '📦' }
  ];

  const filteredResources = MOCK_ORG_RESOURCES.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInherit = (orgResource: OrganizationalResourceType) => {
    const projectResource: ProjectResourceType = {
      ...orgResource,
      projectId: project.id,
      inheritedFrom: orgResource.id,
      inheritedAt: new Date()
    };
    
    onUpdate([...selectedTypes, projectResource]);
    setShowLibrary(false);
    setPreviewResource(null);
  };

  const handleRemove = (typeId: string) => {
    onUpdate(selectedTypes.filter(t => t.id !== typeId));
  };

  return (
    <div className="h-full flex flex-col p-8">
      {/* Empty State or List */}
      {selectedTypes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="max-w-md text-center p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-600 dark:text-white/60" />
            </div>
            <h3 className="text-slate-900 dark:text-white mb-3">No Resources Inherited</h3>
            <p className="text-slate-600 dark:text-white/60 mb-6">
              The project has no capabilities yet. Inherit resource types from your organization's library to unlock functionality.
            </p>
            <Button
              onClick={() => setShowLibrary(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Inherit Resource Type
            </Button>
          </GlassCard>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">Inherited Resources</h2>
              <p className="text-sm text-slate-600 dark:text-white/60">
                {selectedTypes.length} resource type{selectedTypes.length !== 1 ? 's' : ''} inherited
              </p>
            </div>
            <Button
              onClick={() => setShowLibrary(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource Type
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {selectedTypes.map((type) => (
              <GlassCard key={type.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{type.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-slate-900 dark:text-white">{type.name}</h3>
                          <Badge variant="outline">v{type.version}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                          {type.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(type.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-red-600 dark:text-red-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Functions */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Functions ({type.functions.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {type.functions.slice(0, 3).map((fn) => (
                            <div
                              key={fn.id}
                              className="text-sm text-slate-600 dark:text-white/60 pl-6"
                            >
                              • {fn.name}()
                            </div>
                          ))}
                          {type.functions.length > 3 && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 pl-6">
                              +{type.functions.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Metrics ({type.metrics.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {type.metrics.map((metric) => (
                            <div
                              key={metric.id}
                              className="text-sm text-slate-600 dark:text-white/60 pl-6"
                            >
                              • {metric.name} ({metric.unit})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Resource Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl max-h-[90vh] m-4"
            >
              <GlassCard className="flex flex-col h-full">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-slate-900 dark:text-white mb-1">
                        Organizational Resource Library
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        Select resource types to inherit capabilities
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowLibrary(false);
                        setPreviewResource(null);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                              : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Resource List */}
                  <div className="w-1/2 border-r border-slate-200 dark:border-white/10 overflow-y-auto p-6">
                    <div className="space-y-3">
                      {filteredResources.map((resource) => {
                        const isSelected = selectedTypes.some(t => t.inheritedFrom === resource.id);
                        return (
                          <button
                            key={resource.id}
                            onClick={() => setPreviewResource(resource)}
                            disabled={isSelected}
                            className={`w-full text-left p-4 rounded-lg transition-all ${
                              previewResource?.id === resource.id
                                ? 'glass-card border-2 border-purple-500/30'
                                : isSelected
                                ? 'opacity-50 cursor-not-allowed bg-green-500/10'
                                : 'hover:glass-card'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{resource.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-slate-900 dark:text-white font-medium">
                                    {resource.name}
                                  </span>
                                  <Badge variant="outline" size="sm">v{resource.version}</Badge>
                                  {isSelected && (
                                    <Badge variant="success" size="sm">
                                      <Check className="w-3 h-3 mr-1" />
                                      Inherited
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-white/60">
                                  <span>{resource.functions.length} functions</span>
                                  <span>{resource.metrics.length} metrics</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="w-1/2 overflow-y-auto p-6">
                    {previewResource ? (
                      <div>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="text-5xl">{previewResource.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-slate-900 dark:text-white">{previewResource.name}</h3>
                              <Badge variant="outline">v{previewResource.version}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                              {previewResource.description}
                            </p>
                            <Button
                              onClick={() => handleInherit(previewResource)}
                              disabled={selectedTypes.some(t => t.inheritedFrom === previewResource.id)}
                              className="bg-gradient-to-r from-purple-500 to-pink-600"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Inherit This Resource
                            </Button>
                          </div>
                        </div>

                        {/* Functions */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Available Functions
                          </h4>
                          <div className="space-y-2">
                            {previewResource.functions.map((fn) => (
                              <div
                                key={fn.id}
                                className="p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                              >
                                <div className="font-mono text-sm text-purple-600 dark:text-purple-400 mb-1">
                                  {fn.name}()
                                </div>
                                <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                                  {fn.description}
                                </p>
                                <div className="text-xs text-slate-500 dark:text-white/40">
                                  Parameters: {fn.parameters.map(p => p.name).join(', ') || 'none'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Available Metrics
                          </h4>
                          <div className="space-y-2">
                            {previewResource.metrics.map((metric) => (
                              <div
                                key={metric.id}
                                className="p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-slate-900 dark:text-white">
                                    {metric.name}
                                  </span>
                                  <Badge variant="outline" size="sm">{metric.unit}</Badge>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Aggregation: {metric.aggregation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-500 dark:text-white/40">
                          <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Select a resource to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}