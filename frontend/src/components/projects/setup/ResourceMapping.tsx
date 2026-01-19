import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus,
  Wand2,
  Save,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import type { Project } from '../../../types/project';

interface ResourceMappingProps {
  project: Project;
  onComplete: () => void;
}

interface ResourceType {
  id: string;
  name: string;
  category: 'human' | 'equipment' | 'material' | 'software';
  unit: string;
  costPerUnit?: number;
  description?: string;
}

interface ResourceAllocation {
  assignmentId: string;
  resources: Array<{
    id: string;
    typeId: string;
    quantity: number;
    allocation: number; // percentage
  }>;
}

export function ResourceMapping({ project, onComplete }: ResourceMappingProps) {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([
    {
      id: 'rt-001',
      name: 'Frontend Developer',
      category: 'human',
      unit: 'person',
      costPerUnit: 5000,
      description: 'React/TypeScript developer'
    },
    {
      id: 'rt-002',
      name: 'Backend Developer',
      category: 'human',
      unit: 'person',
      costPerUnit: 5500,
      description: 'Node.js/Python developer'
    },
    {
      id: 'rt-003',
      name: 'UI/UX Designer',
      category: 'human',
      unit: 'person',
      costPerUnit: 4500,
      description: 'Product designer'
    }
  ]);

  const [allocations, setAllocations] = useState<Record<string, ResourceAllocation>>({});
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    project.assignments[0]?.id || null
  );
  const [showGenerator, setShowGenerator] = useState(false);

  const selectedAssignment = project.assignments.find(a => a.id === selectedAssignmentId);
  const selectedAllocation = selectedAssignmentId ? allocations[selectedAssignmentId] : null;

  const handleGenerateResourceTypes = () => {
    // AI-powered resource type generation based on project context
    const generatedTypes: ResourceType[] = [];

    // Analyze project assignments and generate relevant resource types
    const assignmentNames = project.assignments.map(a => a.name.toLowerCase());
    
    // Frontend/UI related
    if (assignmentNames.some(n => n.includes('ui') || n.includes('frontend') || n.includes('design'))) {
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-1`,
        name: 'Frontend Developer',
        category: 'human',
        unit: 'person',
        costPerUnit: 5000,
        description: 'React/Vue/Angular developer'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-2`,
        name: 'UI/UX Designer',
        category: 'human',
        unit: 'person',
        costPerUnit: 4500,
        description: 'Product designer'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-3`,
        name: 'Figma License',
        category: 'software',
        unit: 'license',
        costPerUnit: 15,
        description: 'Design tool subscription'
      });
    }

    // Backend/API related
    if (assignmentNames.some(n => n.includes('backend') || n.includes('api') || n.includes('server'))) {
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-4`,
        name: 'Backend Developer',
        category: 'human',
        unit: 'person',
        costPerUnit: 5500,
        description: 'Node.js/Python/Java developer'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-5`,
        name: 'Cloud Infrastructure',
        category: 'equipment',
        unit: 'instance',
        costPerUnit: 200,
        description: 'AWS/GCP/Azure resources'
      });
    }

    // Mobile development
    if (assignmentNames.some(n => n.includes('mobile') || n.includes('ios') || n.includes('android'))) {
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-6`,
        name: 'iOS Developer',
        category: 'human',
        unit: 'person',
        costPerUnit: 6000,
        description: 'Swift/SwiftUI developer'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-7`,
        name: 'Android Developer',
        category: 'human',
        unit: 'person',
        costPerUnit: 5500,
        description: 'Kotlin developer'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-8`,
        name: 'Apple Developer Account',
        category: 'software',
        unit: 'account',
        costPerUnit: 99,
        description: 'Annual subscription'
      });
    }

    // Data/Analytics
    if (assignmentNames.some(n => n.includes('data') || n.includes('analytics') || n.includes('dashboard'))) {
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-9`,
        name: 'Data Engineer',
        category: 'human',
        unit: 'person',
        costPerUnit: 6500,
        description: 'ETL/Data pipeline specialist'
      });
      generatedTypes.push({
        id: `rt-gen-${Date.now()}-10`,
        name: 'Analytics Platform',
        category: 'software',
        unit: 'license',
        costPerUnit: 500,
        description: 'Tableau/PowerBI license'
      });
    }

    // QA/Testing
    generatedTypes.push({
      id: `rt-gen-${Date.now()}-11`,
      name: 'QA Engineer',
      category: 'human',
      unit: 'person',
      costPerUnit: 4000,
      description: 'Quality assurance specialist'
    });

    // Project Management
    generatedTypes.push({
      id: `rt-gen-${Date.now()}-12`,
      name: 'Project Manager',
      category: 'human',
      unit: 'person',
      costPerUnit: 7000,
      description: 'Technical project manager'
    });

    // Add generated types to existing ones (avoid duplicates)
    const existingNames = new Set(resourceTypes.map(rt => rt.name.toLowerCase()));
    const uniqueGenerated = generatedTypes.filter(gt => !existingNames.has(gt.name.toLowerCase()));

    setResourceTypes([...resourceTypes, ...uniqueGenerated]);
    toast.success(`Generated ${uniqueGenerated.length} resource types based on project analysis`);
    setShowGenerator(false);
  };

  const handleAddResourceType = () => {
    const newType: ResourceType = {
      id: `rt-custom-${Date.now()}`,
      name: 'New Resource Type',
      category: 'human',
      unit: 'person',
      costPerUnit: 0
    };
    setResourceTypes([...resourceTypes, newType]);
  };

  const handleUpdateResourceType = (id: string, updates: Partial<ResourceType>) => {
    setResourceTypes(prev => prev.map(rt => 
      rt.id === id ? { ...rt, ...updates } : rt
    ));
  };

  const handleDeleteResourceType = (id: string) => {
    setResourceTypes(prev => prev.filter(rt => rt.id !== id));
    toast.success('Resource type deleted');
  };

  const handleAddResourceToAssignment = (assignmentId: string, typeId: string) => {
    setAllocations(prev => ({
      ...prev,
      [assignmentId]: {
        assignmentId,
        resources: [
          ...(prev[assignmentId]?.resources || []),
          {
            id: `res-${Date.now()}`,
            typeId,
            quantity: 1,
            allocation: 100
          }
        ]
      }
    }));
  };

  const handleUpdateResource = (
    assignmentId: string, 
    resourceId: string, 
    updates: { quantity?: number; allocation?: number }
  ) => {
    setAllocations(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        resources: prev[assignmentId]?.resources.map(r =>
          r.id === resourceId ? { ...r, ...updates } : r
        ) || []
      }
    }));
  };

  const handleRemoveResource = (assignmentId: string, resourceId: string) => {
    setAllocations(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        resources: prev[assignmentId]?.resources.filter(r => r.id !== resourceId) || []
      }
    }));
  };

  const handleCompleteMapping = () => {
    // Check if all assignments have resources mapped
    const unmapped = project.assignments.filter(a => !allocations[a.id]?.resources.length);
    
    if (unmapped.length > 0) {
      toast.error(`${unmapped.length} assignment(s) without resources`);
      return;
    }

    toast.success('Resource mapping completed!');
    onComplete();
  };

  const mappedCount = Object.values(allocations).filter(a => a.resources.length > 0).length;
  const totalCount = project.assignments.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[30px] font-bold text-slate-900 dark:text-white leading-[36px] tracking-[-0.75px] mb-1">
              Resource Mapping
            </h2>
            <p className="text-[14px] font-medium text-[#45556c] dark:text-white/60 leading-[22.75px]">
              Map resources to each assignment for operational planning
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            <span className="text-[14px] font-medium">AI Generator</span>
          </button>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
              style={{ width: `${(mappedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-white/60 whitespace-nowrap">
            {mappedCount} / {totalCount} mapped
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Resource Types Library - Glass Card */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(15,23,42,0.95)] backdrop-blur-xl rounded-2xl border-[1.5px] border-[rgba(148,163,184,0.3)] shadow-xl p-[17.5px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#45556c] dark:text-white/70 tracking-[-0.35px]">
                Resource Types
              </h3>
              <button
                onClick={handleAddResourceType}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-2xl shadow-lg shadow-indigo-500/20 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {resourceTypes.map(type => (
                <div
                  key={type.id}
                  className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Input
                        value={type.name}
                        onChange={(e) => handleUpdateResourceType(type.id, { name: e.target.value })}
                        className="text-sm mb-1"
                      />
                      <Badge variant="outline" className="text-xs">
                        {type.category}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleDeleteResourceType(type.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-600 dark:text-white/60 block mb-1">Unit</label>
                      <Input
                        value={type.unit}
                        onChange={(e) => handleUpdateResourceType(type.id, { unit: e.target.value })}
                        className="text-xs"
                        placeholder="e.g., person, hour"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-white/60 block mb-1">Cost/Unit</label>
                      <Input
                        type="number"
                        value={type.costPerUnit || 0}
                        onChange={(e) => handleUpdateResourceType(type.id, { costPerUnit: Number(e.target.value) })}
                        className="text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <Input
                    value={type.description || ''}
                    onChange={(e) => handleUpdateResourceType(type.id, { description: e.target.value })}
                    className="text-xs mt-2"
                    placeholder="Description..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignment Resource Mapping */}
        <div className="col-span-12 lg:col-span-8">
          <div className="space-y-4">
            {/* Assignment Selector */}
            <GlassCard className="p-4">
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Select Assignment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {project.assignments.map(assignment => {
                  const isSelected = selectedAssignmentId === assignment.id;
                  const isMapped = !!allocations[assignment.id]?.resources.length;

                  return (
                    <button
                      key={assignment.id}
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                      className={`
                        p-3 rounded-lg text-left transition-all border-2
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {assignment.name}
                        </div>
                        {isMapped && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Stage: {project.workflow.find(s => s.id === assignment.stageId)?.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Resource Allocation for Selected Assignment */}
            {selectedAssignment && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-1">
                      {selectedAssignment.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-white/60">
                      {selectedAssignment.description}
                    </p>
                  </div>
                </div>

                {/* Add Resource Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                    Add Resource
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddResourceToAssignment(selectedAssignment.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                  >
                    <option value="">Select resource type...</option>
                    {resourceTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Allocated Resources */}
                <div className="space-y-3">
                  <h4 className="text-sm text-slate-600 dark:text-white/60">
                    Allocated Resources
                  </h4>

                  {selectedAllocation?.resources.map(resource => {
                    const type = resourceTypes.find(rt => rt.id === resource.typeId);
                    if (!type) return null;

                    return (
                      <div
                        key={resource.id}
                        className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm text-slate-900 dark:text-white mb-1">
                              {type.name}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {type.category}
                            </Badge>
                          </div>
                          <button
                            onClick={() => handleRemoveResource(selectedAssignment.id, resource.id)}
                            className="p-2 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                              Quantity ({type.unit})
                            </label>
                            <Input
                              type="number"
                              value={resource.quantity}
                              onChange={(e) => handleUpdateResource(
                                selectedAssignment.id,
                                resource.id,
                                { quantity: Number(e.target.value) }
                              )}
                              min={0}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                              Allocation (%)
                            </label>
                            <Input
                              type="number"
                              value={resource.allocation}
                              onChange={(e) => handleUpdateResource(
                                selectedAssignment.id,
                                resource.id,
                                { allocation: Number(e.target.value) }
                              )}
                              min={0}
                              max={100}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        {type.costPerUnit && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-white/60">
                            Estimated cost: ${(type.costPerUnit * resource.quantity * (resource.allocation / 100)).toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!selectedAllocation?.resources.length && (
                    <div className="p-6 text-center text-slate-400 bg-slate-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-slate-200 dark:border-white/10">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No resources allocated yet</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleCompleteMapping}
          disabled={mappedCount < totalCount}
          size="lg"
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Complete Resource Mapping
        </Button>
      </div>

      {/* AI Generator Modal */}
      {showGenerator && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xl z-40"
            onClick={() => setShowGenerator(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white">AI Resource Generator</h3>
                    <p className="text-sm text-slate-600 dark:text-white/60">
                      Analyze project and suggest resources
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-sm text-slate-600 dark:text-white/60 mb-2">
                    AI will analyze:
                  </div>
                  <ul className="text-sm text-slate-700 dark:text-white/70 space-y-1">
                    <li>• {project.assignments.length} assignments</li>
                    <li>• {project.workflow.length} workflow stages</li>
                    <li>• Project priority: {project.details.priority}</li>
                    <li>• Technology stack patterns</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerator(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateResourceTypes}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate Resources
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}