import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Users, X, Check, Search, Calendar, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import type { Assignment, Stage, AssignmentResource, AssignmentLeader } from '../../../types/project';
import type { ProjectResourceType } from '../../../types/resource';

interface AssignmentsTabProps {
  projectId?: string;
  projectName?: string;
  assignments: Assignment[];
  stages: Stage[];
  inheritedResources?: ProjectResourceType[];
  onChange: (assignments: Assignment[]) => void;
  readOnly?: boolean;
}

interface AssignmentData {
  id: string;
  stageId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  leaders: AssignmentLeader[];
  budgetAllocation?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'completed';
  assignmentIndicators?: string[];
  resources: AssignmentResource[];
}

// Mock leaders data
const MOCK_LEADERS = [
  { id: 'leader-1', name: 'Dian Pratama', role: 'Tech Lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dian' },
  { id: 'leader-2', name: 'Sarah Chen', role: 'Design Lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'leader-3', name: 'Mike Johnson', role: 'Product Lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: 'leader-4', name: 'Lisa Anderson', role: 'QA Lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
];

export function AssignmentsTab({ 
  projectId, 
  projectName, 
  assignments, 
  stages, 
  inheritedResources = [], 
  onChange, 
  readOnly 
}: AssignmentsTabProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [stageAssignments, setStageAssignments] = useState<Record<string, AssignmentData[]>>({});
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);

  const validStages = Array.isArray(stages) ? stages : [];

  useEffect(() => {
    const allAssignments: Assignment[] = Object.values(stageAssignments)
      .flat()
      .map(assignmentData => ({
        id: assignmentData.id,
        name: assignmentData.name,
        description: assignmentData.description,
        stageId: assignmentData.stageId,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
        budgetAllocation: assignmentData.budgetAllocation,
        notes: '',
        status: assignmentData.status,
        createdAt: new Date(),
        assignmentIndicators: assignmentData.assignmentIndicators,
        resources: assignmentData.resources,
        priority: assignmentData.priority,
        leaders: assignmentData.leaders
      }));

    onChange(allAssignments);
  }, [stageAssignments]);

  const handleAddAssignment = (stageId: string) => {
    setSelectedStage(stageId);
    setEditingAssignment(null);
    setShowAssignmentModal(true);
  };

  const handleEditAssignment = (stageId: string, assignment: AssignmentData) => {
    setSelectedStage(stageId);
    setEditingAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleSaveAssignment = (assignmentData: AssignmentData) => {
    if (!selectedStage) return;

    setStageAssignments(prev => {
      const stageAssigns = prev[selectedStage] || [];
      
      if (editingAssignment) {
        return {
          ...prev,
          [selectedStage]: stageAssigns.map(a => 
            a.id === editingAssignment.id ? assignmentData : a
          )
        };
      } else {
        return {
          ...prev,
          [selectedStage]: [...stageAssigns, assignmentData]
        };
      }
    });

    setShowAssignmentModal(false);
    setSelectedStage(null);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (stageId: string, assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return;

    setStageAssignments(prev => ({
      ...prev,
      [stageId]: (prev[stageId] || []).filter(a => a.id !== assignmentId)
    }));
  };

  const getStageAssignmentCount = (stageId: string) => {
    return (stageAssignments[stageId] || []).length;
  };

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-slate-900 dark:text-white mb-1">Assignment Management</h2>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Configure assignments for each stage. One stage can have multiple assignments, and each assignment can have multiple leaders.
          </p>
          {inheritedResources.length > 0 && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ℹ️ {inheritedResources.length} resource(s) available from Resources tab
              </p>
            </div>
          )}
        </div>

        {validStages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg">
            <Users className="w-16 h-16 text-slate-400 dark:text-white/40 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-white/60">
              No stages defined yet. Go to Workflow Builder to create stages first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Stage List */}
            <div className="col-span-3 space-y-4">
              <div>
                <div className="text-sm text-slate-600 dark:text-white/60 mb-3">All Stages</div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search stage..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-500 dark:placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide pr-1">
                {validStages.map((stage) => {
                  const isSelected = expandedStage === stage.id;
                  const assignmentCount = getStageAssignmentCount(stage.id);

                  return (
                    <button
                      key={stage.id}
                      onClick={() => {
                        setExpandedStage(stage.id);
                        toggleStage(stage.id);
                      }}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all
                        ${isSelected
                          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-white/5 border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-500/30'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-white/70'}`}>
                          {stage.name}
                        </span>
                        {assignmentCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {assignmentCount}
                          </Badge>
                        )}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-slate-600 dark:text-white/60' : 'text-slate-500 dark:text-white/50'}`}>
                        {stage.duration} days
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-slate-600 dark:text-white/60' : 'text-slate-500 dark:text-white/50'}`}>
                        {new Date(stage.startDate).toLocaleDateString()} - {new Date(stage.endDate).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Assignments */}
            <div className="col-span-9">
              {!expandedStage ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-slate-400 dark:text-white/40" />
                  </div>
                  <p className="text-slate-600 dark:text-white/60">
                    Select a stage to view and manage assignments
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-slate-900 dark:text-white">
                        {validStages.find(s => s.id === expandedStage)?.name} Assignments
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        {getStageAssignmentCount(expandedStage)} assignment(s)
                      </p>
                    </div>
                    <Button
                      onClick={() => handleAddAssignment(expandedStage)}
                      variant="primary"
                      size="md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assignment
                    </Button>
                  </div>

                  {(stageAssignments[expandedStage] || []).length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-indigo-500" />
                      </div>
                      <h4 className="text-slate-900 dark:text-white mb-2">No Assignments Yet</h4>
                      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                        Create your first assignment to get started
                      </p>
                      <Button
                        onClick={() => handleAddAssignment(expandedStage)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(stageAssignments[expandedStage] || []).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-slate-900 dark:text-white mb-1">
                                {assignment.name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-white/60">
                                {assignment.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  assignment.priority === 'high'
                                    ? 'destructive'
                                    : assignment.priority === 'medium'
                                    ? 'warning'
                                    : 'default'
                                }
                                className="text-xs"
                              >
                                {assignment.priority}
                              </Badge>
                              <button
                                onClick={() => handleEditAssignment(expandedStage, assignment)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-slate-600 dark:text-white/60" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(expandedStage, assignment.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          {/* Leaders */}
                          <div className="space-y-2">
                            <div className="text-xs text-slate-600 dark:text-white/60">
                              Assigned Leaders ({assignment.leaders.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {assignment.leaders.map((leader) => (
                                <div
                                  key={leader.id}
                                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                                >
                                  <img
                                    src={leader.avatar}
                                    alt={leader.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <div>
                                    <div className="text-sm text-slate-900 dark:text-white">
                                      {leader.name}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-white/60">
                                      {leader.role}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Resources */}
                          {assignment.resources && assignment.resources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                              <div className="text-xs text-slate-600 dark:text-white/60 mb-2">
                                Resources ({assignment.resources.length})
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {assignment.resources.map((resource) => (
                                  <Badge key={resource.id} variant="outline" className="text-xs">
                                    <Package className="w-3 h-3 mr-1" />
                                    {resource.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Budget */}
                          {assignment.budgetAllocation && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-white/60">
                                  Budget Allocation
                                </span>
                                <span className="text-purple-500">
                                  ${assignment.budgetAllocation.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Assignment Configuration Modal */}
      {showAssignmentModal && selectedStage && (() => {
        const stage = validStages.find(s => s.id === selectedStage);
        if (!stage) return null;
        
        return (
          <AssignmentConfigModal
            stage={stage}
            assignment={editingAssignment}
            inheritedResources={inheritedResources}
            onSave={handleSaveAssignment}
            onClose={() => {
              setShowAssignmentModal(false);
              setSelectedStage(null);
              setEditingAssignment(null);
            }}
          />
        );
      })()}
    </div>
  );
}

// Assignment Configuration Modal
interface AssignmentConfigModalProps {
  stage: Stage;
  assignment: AssignmentData | null;
  inheritedResources: ProjectResourceType[];
  onSave: (data: AssignmentData) => void;
  onClose: () => void;
}

function AssignmentConfigModal({ stage, assignment, inheritedResources, onSave, onClose }: AssignmentConfigModalProps) {
  const [name, setName] = useState(assignment?.name || '');
  const [description, setDescription] = useState(assignment?.description || '');
  const [startDate, setStartDate] = useState<string>(
    assignment ? new Date(stage.startDate).toISOString().split('T')[0] : new Date(stage.startDate).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    assignment ? new Date(stage.endDate).toISOString().split('T')[0] : new Date(stage.endDate).toISOString().split('T')[0]
  );
  const [budgetAllocation, setBudgetAllocation] = useState<number | undefined>(assignment?.budgetAllocation);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(assignment?.priority || 'medium');
  const [selectedLeaders, setSelectedLeaders] = useState<AssignmentLeader[]>(assignment?.leaders || []);
  const [selectedResources, setSelectedResources] = useState<string[]>(
    assignment?.resources.map(r => r.id) || []
  );
  const [showLeaderSelector, setShowLeaderSelector] = useState(false);

  const handleAddLeader = (leader: typeof MOCK_LEADERS[0]) => {
    if (selectedLeaders.find(l => l.id === leader.id)) return;

    setSelectedLeaders([...selectedLeaders, {
      ...leader,
      allocation: 100 // Default, not displayed
    }]);
    setShowLeaderSelector(false);
  };

  const handleRemoveLeader = (leaderId: string) => {
    setSelectedLeaders(selectedLeaders.filter(l => l.id !== leaderId));
  };

  const handleToggleResource = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Assignment name is required');
      return;
    }

    if (selectedLeaders.length === 0) {
      alert('At least one leader is required');
      return;
    }

    const resources: AssignmentResource[] = selectedResources.map(resourceId => {
      const resource = inheritedResources.find(r => r.id === resourceId);
      return {
        id: resourceId,
        type: 'material',
        name: resource?.name || '',
        description: resource?.description || 'Inherited from Resources tab'
      };
    });

    const assignmentData: AssignmentData = {
      id: assignment?.id || `assignment-${Date.now()}`,
      stageId: stage.id,
      name: name.trim(),
      description: description.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      leaders: selectedLeaders,
      budgetAllocation,
      priority,
      status: 'pending',
      assignmentIndicators: [],
      resources
    };

    onSave(assignmentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">
                {assignment ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Stage: {stage.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Assignment Name */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Assignment Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Frontend Development"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the assignment objectives and scope..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
              />
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date(stage.startDate).toISOString().split('T')[0]}
                  max={new Date(stage.endDate).toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date(stage.endDate).toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      priority === p
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Budget Allocation (Optional)
              </label>
              <Input
                type="number"
                value={budgetAllocation || ''}
                onChange={(e) => setBudgetAllocation(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Enter budget amount"
                className="w-full"
              />
            </div>

            {/* Leaders - NO PERCENTAGE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-slate-600 dark:text-white/60">
                  Assigned Leaders <span className="text-red-500">*</span>
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLeaderSelector(!showLeaderSelector)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Leader
                </Button>
              </div>

              {showLeaderSelector && (
                <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                  <div className="space-y-2">
                    {MOCK_LEADERS.filter(
                      l => !selectedLeaders.find(sl => sl.id === l.id)
                    ).map((leader) => (
                      <button
                        key={leader.id}
                        onClick={() => handleAddLeader(leader)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <img
                          src={leader.avatar}
                          alt={leader.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm text-slate-900 dark:text-white">
                            {leader.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            {leader.role}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {selectedLeaders.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-white/60 text-center py-4">
                    No leaders assigned yet
                  </p>
                ) : (
                  selectedLeaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={leader.avatar}
                          alt={leader.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-sm text-slate-900 dark:text-white">
                            {leader.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            {leader.role}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLeader(leader.id)}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resources - CHECKBOX ONLY */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Resources
              </label>

              {inheritedResources.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border-2 border-dashed border-slate-200 dark:border-white/10 text-center">
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    No resources available. Import resources in Step 2 (Resources tab) first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                  {inheritedResources.map((resource) => (
                    <label
                      key={resource.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedResources.includes(resource.id)
                          ? 'bg-purple-500/10 border-purple-500'
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={() => handleToggleResource(resource.id)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {resource.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          {resource.description || 'Inherited from Resources tab'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Check className="w-4 h-4 mr-2" />
                {assignment ? 'Update Assignment' : 'Create Assignment'}
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}