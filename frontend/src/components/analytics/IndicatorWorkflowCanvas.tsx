import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Calculator, BarChart3, GitBranch, Filter, FileSpreadsheet, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';

// Custom Node Components
function DataSourceNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-blue-500/90 text-white shadow-xl border-2 border-blue-300 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-4 h-4" />
        <div className="font-semibold text-sm">Data Source</div>
      </div>
      <div className="text-xs opacity-90">{data.label}</div>
      {data.sourceType && (
        <div className="mt-2 px-2 py-1 bg-white/20 rounded text-xs">
          {data.sourceType}
        </div>
      )}
    </div>
  );
}

function CalculationNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-purple-500/90 text-white shadow-xl border-2 border-purple-300 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4" />
        <div className="font-semibold text-sm">Calculation</div>
      </div>
      <div className="text-xs opacity-90">{data.label}</div>
      {data.formula && (
        <div className="mt-2 px-2 py-1 bg-white/20 rounded text-xs font-mono">
          {data.formula}
        </div>
      )}
    </div>
  );
}

function FilterNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-amber-500/90 text-white shadow-xl border-2 border-amber-300 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-4 h-4" />
        <div className="font-semibold text-sm">Filter</div>
      </div>
      <div className="text-xs opacity-90">{data.label}</div>
      {data.condition && (
        <div className="mt-2 px-2 py-1 bg-white/20 rounded text-xs">
          {data.condition}
        </div>
      )}
    </div>
  );
}

function AggregationNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-green-500/90 text-white shadow-xl border-2 border-green-300 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4" />
        <div className="font-semibold text-sm">Aggregation</div>
      </div>
      <div className="text-xs opacity-90">{data.label}</div>
      {data.operation && (
        <div className="mt-2 px-2 py-1 bg-white/20 rounded text-xs uppercase">
          {data.operation}
        </div>
      )}
    </div>
  );
}

function OutputNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-indigo-600/90 text-white shadow-xl border-2 border-indigo-300 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4" />
        <div className="font-semibold text-sm">Output</div>
      </div>
      <div className="text-xs opacity-90">{data.label}</div>
      {data.outputType && (
        <div className="mt-2 px-2 py-1 bg-white/20 rounded text-xs">
          {data.outputType}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  dataSource: DataSourceNode,
  calculation: CalculationNode,
  filter: FilterNode,
  aggregation: AggregationNode,
  output: OutputNode,
};

// Initial example workflow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'dataSource',
    position: { x: 50, y: 100 },
    data: { label: 'Project Tasks', sourceType: 'Projects Module' }
  },
  {
    id: '2',
    type: 'filter',
    position: { x: 300, y: 100 },
    data: { label: 'Completed Tasks', condition: 'status = "completed"' }
  },
  {
    id: '3',
    type: 'aggregation',
    position: { x: 550, y: 100 },
    data: { label: 'Count Tasks', operation: 'COUNT' }
  },
  {
    id: '4',
    type: 'dataSource',
    position: { x: 50, y: 250 },
    data: { label: 'Total Tasks', sourceType: 'Projects Module' }
  },
  {
    id: '5',
    type: 'aggregation',
    position: { x: 300, y: 250 },
    data: { label: 'Count All', operation: 'COUNT' }
  },
  {
    id: '6',
    type: 'calculation',
    position: { x: 550, y: 300 },
    data: { label: 'Completion Rate', formula: '(completed / total) * 100' }
  },
  {
    id: '7',
    type: 'output',
    position: { x: 800, y: 300 },
    data: { label: 'Dashboard Widget', outputType: 'KPI Card' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-6', source: '3', target: '6', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true },
];

interface IndicatorWorkflowCanvasProps {
  indicatorId?: string;
  readOnly?: boolean;
}

export function IndicatorWorkflowCanvas({ indicatorId, readOnly = false }: IndicatorWorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `New ${type}`,
        ...(type === 'dataSource' && { sourceType: 'Select source' }),
        ...(type === 'calculation' && { formula: 'Enter formula' }),
        ...(type === 'filter' && { condition: 'Define condition' }),
        ...(type === 'aggregation' && { operation: 'SUM' }),
        ...(type === 'output' && { outputType: 'Chart' })
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const loadExample = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      {!readOnly && (
        <div className="mb-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Workflow Designer Toolbar
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={loadExample}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Load Example
                </Button>
                <Button variant="ghost" size="sm" onClick={clearCanvas}>
                  Clear Canvas
                </Button>
                <Button variant="primary" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Test Workflow
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600 dark:text-slate-400 mr-2">Add Node:</span>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => addNode('dataSource')}
                className="!px-3 !py-1.5"
              >
                <Database className="w-3.5 h-3.5 mr-1.5" />
                Data Source
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => addNode('filter')}
                className="!px-3 !py-1.5"
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filter
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => addNode('aggregation')}
                className="!px-3 !py-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 mr-1.5" />
                Aggregation
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => addNode('calculation')}
                className="!px-3 !py-1.5"
              >
                <Calculator className="w-3.5 h-3.5 mr-1.5" />
                Calculation
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => addNode('output')}
                className="!px-3 !py-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Output
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'dataSource': return '#3b82f6';
                case 'calculation': return '#a855f7';
                case 'filter': return '#f59e0b';
                case 'aggregation': return '#10b981';
                case 'output': return '#4f46e5';
                default: return '#64748b';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Panel position="top-right" className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-white/10">
            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white mb-2">Legend</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Data Source</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Filter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Aggregation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-600"></div>
                <span className="text-slate-600 dark:text-slate-400">Output</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
