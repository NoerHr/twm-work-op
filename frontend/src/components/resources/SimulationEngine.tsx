import { useState, useEffect } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  Activity,
  TrendingUp,
  Info,
  Eye,
  Code
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { Field } from './FieldSchemaDesigner';

export interface SimulationConfig {
  mockDataCount: number;
  executionSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  validationMode: 'strict' | 'lenient';
  logLevel: 'verbose' | 'normal' | 'quiet';
}

export interface SimulationStep {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeName: string;
  action: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
}

export interface SimulationResult {
  id: string;
  status: 'running' | 'completed' | 'error';
  startTime: number;
  endTime?: number;
  duration?: number;
  steps: SimulationStep[];
  mockData: any[];
  finalState: any;
  errors: string[];
  warnings: string[];
}

interface SimulationEngineProps {
  fields: Field[];
  operations: Array<{
    id: string;
    name: string;
    logic?: string; // JSON of nodes/edges
  }>;
  onResultsChange?: (results: SimulationResult) => void;
}

export function SimulationEngine({ fields, operations, onResultsChange }: SimulationEngineProps) {
  const [config, setConfig] = useState<SimulationConfig>({
    mockDataCount: 10,
    executionSpeed: 'normal',
    validationMode: 'strict',
    logLevel: 'normal'
  });

  const [mockData, setMockData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(
    operations.length > 0 ? operations[0].id : null
  );
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Generate mock data based on field schema
  const generateMockData = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const generated = Array.from({ length: config.mockDataCount }, (_, index) => {
        const item: any = {
          id: `item-${index + 1}`,
          _metadata: {
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        };

        fields.forEach(field => {
          item[field.internalName || field.name.toLowerCase().replace(/\s+/g, '_')] = 
            generateFieldValue(field, index);
        });

        return item;
      });

      setMockData(generated);
      setIsGenerating(false);
    }, 500);
  };

  const generateFieldValue = (field: Field, index: number): any => {
    switch (field.type) {
      case 'text':
        if (field.autoGen) {
          // Generate from pattern
          return generateFromPattern(field.autoGen.pattern, index);
        }
        return `${field.name} ${index + 1}`;
      
      case 'number':
        const min = field.validation?.min ?? 0;
        const max = field.validation?.max ?? 1000;
        const value = Math.random() * (max - min) + min;
        return field.precision ? parseFloat(value.toFixed(field.precision)) : Math.floor(value);
      
      case 'date':
      case 'datetime':
        const daysAgo = Math.floor(Math.random() * 365);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return field.type === 'date' 
          ? date.toISOString().split('T')[0]
          : date.toISOString();
      
      case 'boolean':
        return Math.random() > 0.5;
      
      case 'enum':
        if (field.enumValues && field.enumValues.length > 0) {
          const randomIndex = Math.floor(Math.random() * field.enumValues.length);
          return field.enumValues[randomIndex].internal;
        }
        return null;
      
      case 'formula':
        // Would evaluate formula here
        return 0;
      
      case 'relationship':
        return `rel-${Math.floor(Math.random() * 100)}`;
      
      default:
        return null;
    }
  };

  const generateFromPattern = (pattern: string, index: number): string => {
    const now = new Date();
    let result = pattern;
    
    result = result.replace(/{YYYY}/g, now.getFullYear().toString());
    result = result.replace(/{YY}/g, now.getFullYear().toString().slice(-2));
    result = result.replace(/{MM}/g, (now.getMonth() + 1).toString().padStart(2, '0'));
    result = result.replace(/{DD}/g, now.getDate().toString().padStart(2, '0'));
    
    // Replace number patterns
    result = result.replace(/{####}/g, (index + 1).toString().padStart(4, '0'));
    result = result.replace(/{###}/g, (index + 1).toString().padStart(3, '0'));
    result = result.replace(/{##}/g, (index + 1).toString().padStart(2, '0'));
    
    return result;
  };

  // Run simulation
  const runSimulation = async () => {
    if (!selectedOperation || mockData.length === 0) return;

    setIsSimulating(true);
    setCurrentStepIndex(-1);

    const operation = operations.find(op => op.id === selectedOperation);
    if (!operation) return;

    const result: SimulationResult = {
      id: `sim-${Date.now()}`,
      status: 'running',
      startTime: Date.now(),
      steps: [],
      mockData: [...mockData],
      finalState: {},
      errors: [],
      warnings: []
    };

    // Parse operation logic
    let logic: { nodes: any[]; edges: any[] } | null = null;
    try {
      logic = operation.logic ? JSON.parse(operation.logic) : null;
    } catch (e) {
      result.errors.push('Invalid operation logic format');
      result.status = 'error';
      setSimulationResult(result);
      setIsSimulating(false);
      return;
    }

    if (!logic || !logic.nodes) {
      result.errors.push('No operation logic defined');
      result.status = 'error';
      setSimulationResult(result);
      setIsSimulating(false);
      return;
    }

    // Execute flow (simplified simulation)
    await executeFlow(logic, result);

    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.status = result.errors.length === 0 ? 'completed' : 'error';

    setSimulationResult(result);
    setIsSimulating(false);
    onResultsChange?.(result);
  };

  const executeFlow = async (logic: { nodes: any[]; edges: any[] }, result: SimulationResult) => {
    const { nodes, edges } = logic;
    
    // Find START node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      result.errors.push('No START node found');
      return;
    }

    // Simulate execution
    const executionQueue = [startNode.id];
    const visited = new Set<string>();
    let stepIndex = 0;

    const speedDelay = {
      slow: 2000,
      normal: 1000,
      fast: 500,
      instant: 0
    }[config.executionSpeed];

    while (executionQueue.length > 0) {
      const currentNodeId = executionQueue.shift()!;
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);

      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) continue;

      // Skip START and END nodes for step display
      if (node.type !== 'start' && node.type !== 'end') {
        const step: SimulationStep = {
          id: `step-${stepIndex++}`,
          timestamp: Date.now(),
          nodeId: node.id,
          nodeName: node.data.label,
          action: getActionDescription(node),
          inputs: node.data.inputs || {},
          outputs: node.data.outputs || {},
          status: 'running',
          duration: 0
        };

        result.steps.push(step);
        setSimulationResult({ ...result });
        setCurrentStepIndex(result.steps.length - 1);

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, speedDelay));

        // Simulate execution
        const executionResult = await simulateNodeExecution(node, mockData);
        
        step.status = executionResult.success ? 'success' : 'error';
        step.duration = Math.floor(Math.random() * 100) + 50; // Mock duration
        
        if (!executionResult.success && executionResult.error) {
          step.error = executionResult.error;
          result.errors.push(`${node.data.label}: ${executionResult.error}`);
        }

        setSimulationResult({ ...result });
      }

      // Find next nodes
      const outgoingEdges = edges.filter(e => e.source === currentNodeId);
      outgoingEdges.forEach(edge => {
        if (!executionQueue.includes(edge.target)) {
          executionQueue.push(edge.target);
        }
      });
    }
  };

  const getActionDescription = (node: any): string => {
    switch (node.data.type) {
      case 'getItemId':
        return 'Searching items by field criteria';
      case 'updateFieldValue':
        return 'Updating field values on items';
      case 'createNew':
        return 'Creating new item';
      case 'deleteItem':
        return 'Deleting items';
      case 'router':
        return 'Evaluating conditional routes';
      case 'parenthesis':
        return 'Executing transaction block';
      default:
        return 'Processing';
    }
  };

  const simulateNodeExecution = async (node: any, data: any[]): Promise<{ success: boolean; error?: string }> => {
    // Simulate different node types
    switch (node.data.type) {
      case 'getItemId':
        // Simulate searching
        const foundItems = data.filter(() => Math.random() > 0.3);
        return { success: foundItems.length > 0 };
      
      case 'updateFieldValue':
        // Simulate update
        return { success: Math.random() > 0.1 };
      
      case 'createNew':
        // Simulate creation
        return { success: Math.random() > 0.05 };
      
      case 'deleteItem':
        // Simulate deletion
        return { success: Math.random() > 0.1 };
      
      case 'router':
        // Simulate routing
        return { success: true };
      
      case 'parenthesis':
        // Simulate transaction
        if (node.data.config?.transactionMode === 'atomic') {
          // Atomic might fail all-or-nothing
          const success = Math.random() > 0.2;
          return { 
            success,
            error: success ? undefined : 'Transaction rolled back due to error'
          };
        }
        return { success: true };
      
      default:
        return { success: true };
    }
  };

  const resetSimulation = () => {
    setSimulationResult(null);
    setCurrentStepIndex(-1);
    setExpandedStep(null);
  };

  // Auto-generate initial data
  useEffect(() => {
    if (fields.length > 0 && mockData.length === 0) {
      generateMockData();
    }
  }, [fields]);

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <GlassCard className="p-6">
        <h2 className="text-lg text-slate-900 dark:text-white mb-4">Simulation Configuration</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Mock Data Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
              Mock Data Count
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={config.mockDataCount}
                onChange={(e) => setConfig({ ...config, mockDataCount: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                {config.mockDataCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
              Number of sample items to generate
            </p>
          </div>

          {/* Execution Speed */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
              Execution Speed
            </label>
            <select
              value={config.executionSpeed}
              onChange={(e) => setConfig({ ...config, executionSpeed: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            >
              <option value="slow">Slow (2s per step)</option>
              <option value="normal">Normal (1s per step)</option>
              <option value="fast">Fast (0.5s per step)</option>
              <option value="instant">Instant</option>
            </select>
          </div>

          {/* Validation Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
              Validation Mode
            </label>
            <select
              value={config.validationMode}
              onChange={(e) => setConfig({ ...config, validationMode: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            >
              <option value="strict">Strict (fail on any error)</option>
              <option value="lenient">Lenient (continue on errors)</option>
            </select>
          </div>

          {/* Log Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
              Log Level
            </label>
            <select
              value={config.logLevel}
              onChange={(e) => setConfig({ ...config, logLevel: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            >
              <option value="verbose">Verbose (all details)</option>
              <option value="normal">Normal (standard logs)</option>
              <option value="quiet">Quiet (errors only)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={generateMockData} disabled={isGenerating} variant="outline">
            <Database className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Regenerate Data'}
          </Button>
          
          <Button 
            onClick={() => setShowDataPreview(!showDataPreview)} 
            variant="ghost"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showDataPreview ? 'Hide' : 'Show'} Data Preview
          </Button>

          <div className="flex-1" />

          <Badge variant="secondary">
            {mockData.length} items ready
          </Badge>
        </div>
      </GlassCard>

      {/* Data Preview */}
      <AnimatePresence>
        {showDataPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Mock Data Preview
                </h3>
                <Badge variant="secondary">{mockData.length} items</Badge>
              </div>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-white/60">ID</th>
                      {fields.slice(0, 5).map(field => (
                        <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-white/60">
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t border-slate-200 dark:border-white/10">
                        <td className="px-3 py-2 text-slate-900 dark:text-white font-mono text-xs">{item.id}</td>
                        {fields.slice(0, 5).map(field => (
                          <td key={field.id} className="px-3 py-2 text-slate-700 dark:text-white/70">
                            {String(item[field.internalName || field.name.toLowerCase().replace(/\s+/g, '_')] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mockData.length > 10 && (
                  <div className="text-center py-3 text-xs text-slate-500 dark:text-white/40">
                    Showing 10 of {mockData.length} items
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operation Selector & Controls */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
              Select Operation to Test
            </label>
            <select
              value={selectedOperation || ''}
              onChange={(e) => setSelectedOperation(e.target.value)}
              disabled={operations.length === 0}
              className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white disabled:opacity-50"
            >
              {operations.length === 0 ? (
                <option value="">No operations defined</option>
              ) : (
                operations.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-7">
            <Button
              onClick={runSimulation}
              disabled={!selectedOperation || mockData.length === 0 || isSimulating}
              className="min-w-32"
            >
              {isSimulating ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </>
              )}
            </Button>

            {simulationResult && (
              <Button onClick={resetSimulation} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Simulation Results */}
      {simulationResult && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                Simulation Results
              </h3>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Step-by-step execution log
              </p>
            </div>

            <div className="flex items-center gap-3">
              {simulationResult.status === 'completed' ? (
                <Badge variant="success" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </Badge>
              ) : simulationResult.status === 'error' ? (
                <Badge variant="destructive" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed
                </Badge>
              ) : (
                <Badge variant="warning" className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Running
                </Badge>
              )}

              {simulationResult.duration && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {simulationResult.duration}ms
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Steps</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {simulationResult.steps.length}
              </div>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Successful</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {simulationResult.steps.filter(s => s.status === 'success').length}
              </div>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">Errors</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {simulationResult.errors.length}
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Warnings</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {simulationResult.warnings.length}
              </div>
            </div>
          </div>

          {/* Step Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-white/70 mb-3">
              Execution Timeline
            </h4>

            {simulationResult.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-2 rounded-lg overflow-hidden transition-all ${
                  index === currentStepIndex
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : step.status === 'success'
                    ? 'border-green-500/20'
                    : step.status === 'error'
                    ? 'border-red-500/20'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  className="w-full p-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Step Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'success'
                        ? 'bg-green-500'
                        : step.status === 'error'
                        ? 'bg-red-500'
                        : step.status === 'running'
                        ? 'bg-purple-500 animate-pulse'
                        : 'bg-slate-300'
                    }`}>
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {step.nodeName}
                        </span>
                        {step.status === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {step.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        {step.status === 'running' && (
                          <Activity className="w-4 h-4 text-purple-500 animate-spin" />
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {step.action}
                      </div>
                    </div>

                    {/* Duration */}
                    {step.duration !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {step.duration}ms
                      </Badge>
                    )}

                    {/* Expand Icon */}
                    {expandedStep === step.id ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-200 dark:border-white/10"
                    >
                      <div className="p-4 bg-slate-50 dark:bg-white/5 space-y-3">
                        {/* Inputs */}
                        {Object.keys(step.inputs).length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-slate-700 dark:text-white/70 mb-2">
                              Inputs:
                            </div>
                            <div className="bg-white dark:bg-white/5 rounded p-2 font-mono text-xs">
                              <pre className="text-slate-900 dark:text-white overflow-auto">
                                {JSON.stringify(step.inputs, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Outputs */}
                        {Object.keys(step.outputs).length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-slate-700 dark:text-white/70 mb-2">
                              Outputs:
                            </div>
                            <div className="bg-white dark:bg-white/5 rounded p-2 font-mono text-xs">
                              <pre className="text-slate-900 dark:text-white overflow-auto">
                                {JSON.stringify(step.outputs, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Error */}
                        {step.error && (
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-red-600 dark:text-red-400">
                                {step.error}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Errors Summary */}
          {simulationResult.errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Execution Errors ({simulationResult.errors.length})
                  </div>
                  <ul className="space-y-1">
                    {simulationResult.errors.map((error, i) => (
                      <li key={i} className="text-xs text-red-600 dark:text-red-400">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
