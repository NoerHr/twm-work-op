import { WorkflowBuilder } from '../../workflow/WorkflowBuilder';
import { useWorkflowStore } from '../../../store/workflowStore';
import { useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { Stage } from '../../../types/project';
import { GlassCard } from '../../ui/GlassCard';

interface WorkflowBuilderTabProps {
  stages: Stage[];
  indicators: any[];
  errors: Record<string, string>;
  onChange: (stages: Stage[]) => void;
  readOnly?: boolean; // Note: This component ignores readOnly per requirements
}

export function WorkflowBuilderTab({ stages, indicators, errors, onChange }: WorkflowBuilderTabProps) {
  const { nodes, edges, importWorkflow, exportWorkflow, reset } = useWorkflowStore();

  // Load existing stages into workflow store on mount
  useEffect(() => {
    // Clear workflow store on mount to prevent stale data
    reset();
    
    if (stages.length > 0) {
      // Convert existing stages to workflow nodes
      const workflowNodes = stages.map(stage => ({
        id: stage.id,
        type: 'stage' as const,
        name: stage.name,
        description: stage.description,
        startDate: stage.startDate instanceof Date ? stage.startDate : new Date(stage.startDate),
        duration: stage.duration,
        lane: stage.position || 0,
        position: { x: 0, y: 0 },
        hasGate: !!stage.gate,
        gateTrigger: stage.gate?.triggerType || 'automatic' as const,
        color: '#8B5CF6'
      }));

      const workflowEdges = stages
        .filter(stage => stage.dependencies && stage.dependencies.length > 0)
        .flatMap(stage => 
          stage.dependencies.map(depId => ({
            id: `edge-${depId}-${stage.id}`,
            source: depId,
            target: stage.id,
            type: 'standard' as const
          }))
        );

      importWorkflow({
        nodes: workflowNodes,
        edges: workflowEdges
      });
    }
  }, []); // Only run on mount

  // Auto-save workflow changes whenever nodes/edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const workflow = exportWorkflow();
      handleSaveWorkflow(workflow);
    }
  }, [nodes, edges]);

  // Save workflow changes back to stages
  const handleSaveWorkflow = (workflow: { nodes: any[]; edges: any[] }) => {
    const newStages: Stage[] = workflow.nodes.map((node, index) => ({
      id: node.id,
      name: node.name,
      description: node.description || '',
      startDate: node.startDate,
      endDate: new Date(new Date(node.startDate).getTime() + node.duration * 24 * 60 * 60 * 1000),
      duration: node.duration,
      status: 'pending' as const,
      position: index,
      dependencies: workflow.edges
        .filter(edge => edge.target === node.id)
        .map(edge => edge.source),
      assignmentIds: [],
      gate: node.hasGate ? {
        id: `gate-${node.id}`,
        name: `${node.name} Gate`,
        description: '',
        triggerType: node.gateTrigger || 'automatic',
        conditions: [],
        approvers: []
      } : undefined
    }));

    onChange(newStages);
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <GlassCard className="p-4 bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-slate-900 dark:text-white mb-1">
              The Engine - Design Your Workflow
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Use the interactive Gantt Canvas to create stages, set durations, and configure review gates. 
              <strong className="text-blue-500"> Every stage must end with a Gate.</strong> BOD will review progress at each gate.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Error Display */}
      {errors.workflow && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-400">{errors.workflow}</p>
        </div>
      )}

      {errors.gates && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-400">{errors.gates}</p>
        </div>
      )}
      
      {/* Workflow Builder Canvas */}
      <div className="h-[600px]">
        <WorkflowBuilder 
          onSave={handleSaveWorkflow}
        />
      </div>

      {/* Helper Text */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-slate-900 dark:text-white mb-1">✨ Drag & Drop</div>
            <div className="text-slate-600 dark:text-white/60">
              Resize stages to adjust duration
            </div>
          </div>
          <div>
            <div className="text-slate-900 dark:text-white mb-1">🔗 Connect Stages</div>
            <div className="text-slate-600 dark:text-white/60">
              Draw arrows to define dependencies
            </div>
          </div>
          <div>
            <div className="text-slate-900 dark:text-white mb-1">🚪 Configure Gates</div>
            <div className="text-slate-600 dark:text-white/60">
              Set BOD approvers and criteria
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}