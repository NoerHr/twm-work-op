import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  TrendingUp, 
  Plus, 
  X, 
  Save,
  Info,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { toast } from 'sonner@2.0.3';
import type { Project, Assignment, Indicator } from '../../../types/project';
import type { IndicatorConnection } from '../../../types/resource';

interface IndicatorConnectionsTabProps {
  project: Project;
  assignments: Assignment[];
  connections: IndicatorConnection[];
  onUpdate: (connections: IndicatorConnection[]) => void;
}

type AggregationType = 'sum' | 'average' | 'weighted' | 'custom';

export function IndicatorConnectionsTab({
  project,
  assignments, // ⚠️ This parameter is kept for compatibility but we use project.assignments
  connections,
  onUpdate
}: IndicatorConnectionsTabProps) {
  const [selectedConnections, setSelectedConnections] = useState<IndicatorConnection[]>(connections);
  const [activeConnection, setActiveConnection] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregationType, setAggregationType] = useState<AggregationType>('average');
  const [weight, setWeight] = useState(1);

  // ✅ FIX: Get assignment-level indicators correctly
  // All assignment-level indicators are available for all assignments
  // We create a cartesian product: each assignment can use any assignment-level indicator
  const assignmentLevelIndicators = project.indicators.filter(ind => ind.scope === 'assignment');
  
  const assignmentIndicators = (project.assignments || []).flatMap(assignment => 
    assignmentLevelIndicators.map(indicator => ({
      ...indicator,
      assignmentId: assignment.id,
      assignmentName: assignment.name
    }))
  );

  // ✅ FIX: Get project-level indicators correctly
  const projectIndicators = project.indicators.filter(ind => ind.scope === 'project');

  const handleCreateConnection = (sourceId: string, targetId: string) => {
    setActiveConnection({ sourceId, targetId });
    setShowAggregationModal(true);
  };

  const handleSaveConnection = () => {
    if (!activeConnection) return;

    const newConnection: IndicatorConnection = {
      id: `conn-${Date.now()}`,
      sourceId: activeConnection.sourceId,
      sourceType: 'assignment',
      targetId: activeConnection.targetId,
      targetType: 'project',
      aggregationType,
      weight: aggregationType === 'weighted' ? weight : undefined,
      createdAt: new Date()
    };

    setSelectedConnections([...selectedConnections, newConnection]);
    setShowAggregationModal(false);
    setActiveConnection(null);
    
    toast.success('Connection created!', {
      description: `Linked to ${aggregationType} aggregation`
    });
  };

  const handleRemoveConnection = (connectionId: string) => {
    setSelectedConnections(selectedConnections.filter(c => c.id !== connectionId));
    toast.success('Connection removed');
  };

  const handleSaveAll = () => {
    onUpdate(selectedConnections);
    toast.success('Indicator connections saved!', {
      description: `${selectedConnections.length} connections configured`
    });
  };

  const isConnected = (sourceId: string, targetId: string) => {
    return selectedConnections.some(
      c => c.sourceId === sourceId && c.targetId === targetId
    );
  };

  const getConnectionsForTarget = (targetId: string) => {
    return selectedConnections.filter(c => c.targetId === targetId);
  };

  if (assignmentIndicators.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-slate-600 dark:text-white/60" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-3">No Assignment Indicators</h3>
          <p className="text-slate-600 dark:text-white/60">
            Assignments must have indicators defined before creating connections.
            These should have been configured during project creation.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (projectIndicators.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-slate-600 dark:text-white/60" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-3">No Project Indicators</h3>
          <p className="text-slate-600 dark:text-white/60">
            Project-level KPIs must be defined before creating connections.
            These should have been configured during project creation.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-slate-900 dark:text-white mb-1">Indicator Connections</h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Connect assignment metrics to project KPIs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-white/60">
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedConnections.length}
              </span>{' '}
              connections
            </div>
            <Button
              onClick={handleSaveAll}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Connections
            </Button>
          </div>
        </div>

        <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-white/80">
              <strong>The Nervous System:</strong> Connect real data from assignments 
              to strategic goals. Click cells to create connections and define how 
              multiple sources aggregate into project KPIs.
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Node Graph Canvas */}
      <div className="flex-1 overflow-auto">
        <GlassCard className="p-6 min-h-full">
          <div className="grid grid-cols-3 gap-8 h-full">
            {/* Left: Source Nodes (Assignment Indicators) */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Assignment Indicators
                </h3>
                <Badge variant="outline" size="sm">
                  {assignmentIndicators.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {assignmentIndicators.map((indicator) => (
                  <motion.div
                    key={`${indicator.id}-${indicator.assignmentId}`}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          {indicator.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          {indicator.assignmentName}
                        </div>
                      </div>
                      <Badge variant="outline" size="sm">
                        {indicator.unit}
                      </Badge>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      Target: {indicator.target} {indicator.unit}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center: Connection Matrix */}
            <div className="border-x border-slate-200 dark:border-white/10 px-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Connections
                </h3>
              </div>
              <div className="space-y-2">
                {projectIndicators.map((projectInd) => {
                  const conns = getConnectionsForTarget(projectInd.id);
                  return (
                    <div key={projectInd.id} className="mb-6">
                      <div className="text-xs font-medium text-slate-600 dark:text-white/60 mb-2">
                        {projectInd.name}:
                      </div>
                      {assignmentIndicators.map((assignInd) => {
                        const connected = isConnected(assignInd.id, projectInd.id);
                        const connection = selectedConnections.find(
                          c => c.sourceId === assignInd.id && c.targetId === projectInd.id
                        );
                        
                        return (
                          <div
                            key={`${assignInd.id}-${projectInd.id}`}
                            className="flex items-center gap-2 mb-1"
                          >
                            <button
                              onClick={() => {
                                if (connected && connection) {
                                  handleRemoveConnection(connection.id);
                                } else {
                                  handleCreateConnection(assignInd.id, projectInd.id);
                                }
                              }}
                              className={`flex-1 p-2 rounded text-xs transition-all ${
                                connected
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-300 dark:hover:bg-white/20'
                              }`}
                            >
                              {connected ? (
                                <div className="flex items-center justify-between">
                                  <ArrowRight className="w-3 h-3" />
                                  <span className="uppercase text-xs">
                                    {connection?.aggregationType}
                                  </span>
                                  <X className="w-3 h-3" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 opacity-60">
                                  <Plus className="w-3 h-3" />
                                  <span>Connect</span>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Target Nodes (Project KPIs) */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Project KPIs
                </h3>
                <Badge variant="outline" size="sm">
                  {projectIndicators.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {projectIndicators.map((indicator) => {
                  const conns = getConnectionsForTarget(indicator.id);
                  return (
                    <motion.div
                      key={indicator.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            {indicator.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/60">
                            Project Level
                          </div>
                        </div>
                        <Badge variant="outline" size="sm">
                          {indicator.unit}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Target: {indicator.target} {indicator.unit}
                        </div>
                        <Badge
                          variant={conns.length > 0 ? 'success' : 'outline'}
                          size="sm"
                        >
                          {conns.length} source{conns.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Aggregation Modal */}
      {showAggregationModal && activeConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md m-4"
          >
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-1">
                    Configure Connection
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    Define how this metric aggregates
                  </p>
                </div>
                <button
                  onClick={() => setShowAggregationModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Aggregation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['sum', 'average', 'weighted'] as AggregationType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAggregationType(type)}
                        className={`p-3 rounded-lg text-sm capitalize transition-all ${
                          aggregationType === type
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {aggregationType === 'weighted' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAggregationModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveConnection}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    Create Connection
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-slate-600 dark:text-white/60">
                  {assignmentIndicators.length} Assignment Indicators
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-slate-600 dark:text-white/60">
                  {projectIndicators.length} Project KPIs
                </span>
              </div>
            </div>
            <div className="text-slate-600 dark:text-white/60">
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedConnections.length}
              </span>{' '}
              connections configured
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}