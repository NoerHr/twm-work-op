import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, X, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { LogicEngine } from '../../../utils/logicEngine';
import type { OperationDefinition, FieldSchema, SimulationResult } from '../../../types/resource';

interface SimulationModalProps {
  operation: OperationDefinition;
  schema: FieldSchema[];
  onClose: () => void;
}

export function SimulationModal({ operation, schema, onClose }: SimulationModalProps) {
  const [inputState, setInputState] = useState<string>(
    JSON.stringify(
      schema.reduce((acc, field) => {
        acc[field.internalName] = getDefaultValue(field.type);
        return acc;
      }, {} as Record<string, any>),
      null,
      2
    )
  );
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  function getDefaultValue(type: string) {
    switch (type) {
      case 'text': return 'Sample Text';
      case 'number': return 0;
      case 'boolean': return false;
      case 'date':
      case 'datetime': return new Date().toISOString();
      case 'enum': return 'option1';
      default: return null;
    }
  }

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setResult(null);

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const parsedInput = JSON.parse(inputState);
      
      // Use LogicEngine to simulate
      const executionResult = LogicEngine.simulate(parsedInput, operation, parameters);
      
      if (executionResult.success && executionResult.updatedInstance) {
        setResult({
          success: true,
          outputState: executionResult.updatedInstance.data,
          executionLog: executionResult.executionLog
        });
      } else {
        setResult({
          success: false,
          error: executionResult.error,
          executionLog: executionResult.executionLog
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        executionLog: ['❌ Execution failed:', error.message]
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">Operation Simulation</h2>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Test "{operation.name}" with mock data
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Input State */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Input State (JSON)
              </label>
              <textarea
                value={inputState}
                onChange={(e) => setInputState(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs resize-none"
                placeholder="{}"
              />
            </div>

            {/* Parameters */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Operation Parameters
              </label>
              <div className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                {operation.parameters.length > 0 ? (
                  <div className="space-y-3">
                    {operation.parameters.map(param => (
                      <div key={param.id}>
                        <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={param.type === 'number' ? 'number' : param.type === 'boolean' ? 'checkbox' : 'text'}
                          defaultValue={param.defaultValue}
                          onChange={(e) => {
                            const value = param.type === 'boolean' ? e.target.checked : 
                                        param.type === 'number' ? Number(e.target.value) : 
                                        e.target.value;
                            setParameters({ ...parameters, [param.name]: value });
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-white/60 text-center py-4">
                    No parameters required
                  </p>
                )}
              </div>

              {/* Operation Info */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm text-blue-400 mb-2">Operation Info</h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-white/60">
                  <div>Blocks: {operation.blocks.length}</div>
                  <div>Connections: {operation.connections.length}</div>
                  <div>Type: <Badge variant="outline" className="text-xs ml-1">{operation.type}</Badge></div>
                </div>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex items-center justify-center mb-6">
            <Button
              onClick={handleRunSimulation}
              disabled={isRunning}
              size="lg"
              className="flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {isRunning ? 'Running Simulation...' : 'Execute Operation'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Output State */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <label className="text-sm text-slate-600 dark:text-white/60">
                    {result.success ? 'Output State' : 'Error'}
                  </label>
                </div>
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10">
                  {result.success && result.outputState ? (
                    <pre className="text-xs text-slate-900 dark:text-white font-mono overflow-x-auto">
                      {JSON.stringify(result.outputState, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-red-400">{result.error}</p>
                  )}
                </div>
              </div>

              {/* Execution Log */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                  Execution Log
                </label>
                <div className="p-4 rounded-lg bg-slate-900 dark:bg-black/50 border border-slate-700 dark:border-white/20 h-64 overflow-y-auto">
                  {result.executionLog.map((log, index) => (
                    <div key={index} className="text-xs text-green-400 font-mono mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}