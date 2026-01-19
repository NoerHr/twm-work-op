import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Calculator, 
  Database,
  GitBranch,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import type { Project, Indicator } from '../../../types/project';

interface IndicatorSetupProps {
  project: Project;
  onComplete: () => void;
}

type CalculationMethod = 'manual' | 'formula' | 'aggregation' | 'api';
type AggregationType = 'sum' | 'average' | 'min' | 'max' | 'count' | 'percentage';

interface IndicatorFormula {
  indicatorId: string;
  method: CalculationMethod;
  
  // For formula-based
  formula?: string;
  variables?: Array<{
    id: string;
    name: string;
    source: 'indicator' | 'assignment' | 'stage' | 'constant';
    sourceId?: string;
    defaultValue?: number;
  }>;
  
  // For aggregation-based
  aggregation?: {
    type: AggregationType;
    sourceType: 'assignment' | 'stage' | 'task';
    sourceIds: string[];
    field: string;
  };
  
  // For API-based
  api?: {
    endpoint: string;
    method: 'GET' | 'POST';
    params: Record<string, any>;
    dataPath: string;
  };
  
  // Update frequency
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
}

export function IndicatorSetup({ project, onComplete }: IndicatorSetupProps) {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(
    project.indicators[0]?.id || null
  );
  const [formulas, setFormulas] = useState<Record<string, IndicatorFormula>>({});
  
  const selectedIndicator = project.indicators.find(ind => ind.id === selectedIndicatorId);
  const selectedFormula = selectedIndicatorId ? formulas[selectedIndicatorId] : null;

  const handleMethodChange = (indicatorId: string, method: CalculationMethod) => {
    setFormulas(prev => ({
      ...prev,
      [indicatorId]: {
        indicatorId,
        method,
        updateFrequency: 'realtime',
        ...(method === 'aggregation' ? {
          aggregation: {
            type: 'sum',
            sourceType: 'assignment',
            sourceIds: [],
            field: 'progress'
          }
        } : {}),
        ...(method === 'formula' ? {
          formula: '',
          variables: []
        } : {})
      }
    }));
  };

  const handleFormulaUpdate = (indicatorId: string, updates: Partial<IndicatorFormula>) => {
    setFormulas(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        ...updates
      } as IndicatorFormula
    }));
  };

  const addVariable = (indicatorId: string) => {
    const formula = formulas[indicatorId];
    if (!formula || formula.method !== 'formula') return;

    const newVariable = {
      id: `var-${Date.now()}`,
      name: `variable_${(formula.variables?.length || 0) + 1}`,
      source: 'constant' as const,
      defaultValue: 0
    };

    handleFormulaUpdate(indicatorId, {
      variables: [...(formula.variables || []), newVariable]
    });
  };

  const removeVariable = (indicatorId: string, variableId: string) => {
    const formula = formulas[indicatorId];
    if (!formula || formula.method !== 'formula') return;

    handleFormulaUpdate(indicatorId, {
      variables: formula.variables?.filter(v => v.id !== variableId) || []
    });
  };

  const handleSaveFormula = (indicatorId: string) => {
    const formula = formulas[indicatorId];
    if (!formula) {
      toast.error('No formula configured');
      return;
    }

    // Validation
    if (formula.method === 'formula' && !formula.formula) {
      toast.error('Formula expression is required');
      return;
    }

    if (formula.method === 'aggregation' && (!formula.aggregation?.sourceIds.length)) {
      toast.error('Please select data sources for aggregation');
      return;
    }

    toast.success('Formula saved successfully');
  };

  const handleCompleteSetup = () => {
    // Check if all indicators have formulas configured
    const unconfigured = project.indicators.filter(ind => !formulas[ind.id]);
    
    if (unconfigured.length > 0) {
      toast.error(`${unconfigured.length} indicator(s) not configured yet`);
      return;
    }

    toast.success('All indicators configured!');
    onComplete();
  };

  const configuredCount = Object.keys(formulas).length;
  const totalCount = project.indicators.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-[30px] font-bold text-slate-900 dark:text-white leading-[36px] tracking-[-0.75px] mb-1">
          Configure Indicator Formulas
        </h2>
        <p className="text-[14px] font-medium text-[#45556c] dark:text-white/60 leading-[22.75px]">
          Define how each indicator will calculate its value during project execution
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
              style={{ width: `${(configuredCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-white/60 whitespace-nowrap">
            {configuredCount} / {totalCount} configured
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Indicator List - Glass Card */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(15,23,42,0.95)] backdrop-blur-xl rounded-2xl border-[1.5px] border-[rgba(148,163,184,0.3)] shadow-xl p-[17.5px]">
            <div className="mb-4">
              <h3 className="text-[14px] font-semibold text-[#45556c] dark:text-white/70 tracking-[-0.35px] mb-4">
                All Indicators
              </h3>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <Input
                  placeholder="Search by name or type..."
                  className="bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.1)] rounded-3xl border-[1.5px] border-slate-200 dark:border-white/10 px-4 py-2.5 text-[16px]"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {project.indicators.map(indicator => {
                const isConfigured = !!formulas[indicator.id];
                const isSelected = selectedIndicatorId === indicator.id;

                return (
                  <button
                    key={indicator.id}
                    onClick={() => setSelectedIndicatorId(indicator.id)}
                    className={`
                      w-full p-4 rounded-2xl text-left transition-all
                      ${isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className={`text-[16px] font-normal mb-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {indicator.name}
                        </div>
                        <div className={`text-[14px] ${isSelected ? 'text-white/80' : 'text-[#45556c] dark:text-white/60'}`}>
                          {indicator.type}
                        </div>
                      </div>
                      {isConfigured ? (
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-green-500'}`} />
                      ) : (
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 ml-2 ${isSelected ? 'text-white/60' : 'text-yellow-500'}`} />
                      )}
                    </div>
                    {isConfigured && (
                      <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-600 dark:text-white/60'}`}>
                        Method: {formulas[indicator.id].method}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Formula Configuration */}
        <div className="col-span-12 lg:col-span-8">
          {selectedIndicator ? (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-1">
                    {selectedIndicator.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {selectedIndicator.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleSaveFormula(selectedIndicator.id)}
                  disabled={!selectedFormula}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Formula
                </Button>
              </div>

              {/* Calculation Method Selection */}
              <div className="mb-6">
                <label className="block text-sm text-slate-600 dark:text-white/60 mb-3">
                  Calculation Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      value: 'manual', 
                      label: 'Manual Entry', 
                      icon: Database,
                      description: 'Manually update values'
                    },
                    { 
                      value: 'formula', 
                      label: 'Formula-based', 
                      icon: Calculator,
                      description: 'Calculate using formula'
                    },
                    { 
                      value: 'aggregation', 
                      label: 'Aggregation', 
                      icon: GitBranch,
                      description: 'Aggregate from assignments'
                    },
                    { 
                      value: 'api', 
                      label: 'External API', 
                      icon: Database,
                      description: 'Fetch from API'
                    }
                  ].map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      onClick={() => handleMethodChange(selectedIndicator.id, value as CalculationMethod)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${selectedFormula?.method === value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${
                        selectedFormula?.method === value ? 'text-purple-500' : 'text-slate-400'
                      }`} />
                      <div className="text-sm text-slate-900 dark:text-white mb-1">
                        {label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        {description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method-specific Configuration */}
              {selectedFormula && (
                <>
                  {/* Formula-based Configuration */}
                  {selectedFormula.method === 'formula' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                          Formula Expression
                        </label>
                        <Input
                          value={selectedFormula.formula || ''}
                          onChange={(e) => handleFormulaUpdate(selectedIndicator.id, {
                            formula: e.target.value
                          })}
                          placeholder="e.g., (completed_tasks / total_tasks) * 100"
                          className="font-mono"
                        />
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                          Use variable names defined below
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-slate-600 dark:text-white/60">
                            Variables
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addVariable(selectedIndicator.id)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Variable
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {selectedFormula.variables?.map((variable, index) => (
                            <div 
                              key={variable.id}
                              className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                              <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-4">
                                  <Input
                                    value={variable.name}
                                    onChange={(e) => {
                                      const updated = [...(selectedFormula.variables || [])];
                                      updated[index] = { ...variable, name: e.target.value };
                                      handleFormulaUpdate(selectedIndicator.id, { variables: updated });
                                    }}
                                    placeholder="Variable name"
                                    className="text-xs font-mono"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <select
                                    value={variable.source}
                                    onChange={(e) => {
                                      const updated = [...(selectedFormula.variables || [])];
                                      updated[index] = { ...variable, source: e.target.value as any };
                                      handleFormulaUpdate(selectedIndicator.id, { variables: updated });
                                    }}
                                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                                  >
                                    <option value="constant">Constant</option>
                                    <option value="indicator">Indicator</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="stage">Stage</option>
                                  </select>
                                </div>
                                <div className="col-span-4">
                                  {variable.source === 'constant' ? (
                                    <Input
                                      type="number"
                                      value={variable.defaultValue || 0}
                                      onChange={(e) => {
                                        const updated = [...(selectedFormula.variables || [])];
                                        updated[index] = { ...variable, defaultValue: Number(e.target.value) };
                                        handleFormulaUpdate(selectedIndicator.id, { variables: updated });
                                      }}
                                      placeholder="Value"
                                      className="text-xs"
                                    />
                                  ) : (
                                    <select
                                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                                      onChange={(e) => {
                                        const updated = [...(selectedFormula.variables || [])];
                                        updated[index] = { ...variable, sourceId: e.target.value };
                                        handleFormulaUpdate(selectedIndicator.id, { variables: updated });
                                      }}
                                    >
                                      <option value="">Select source...</option>
                                      {variable.source === 'assignment' && project.assignments.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                      ))}
                                      {variable.source === 'stage' && project.workflow.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                      {variable.source === 'indicator' && project.indicators.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                                <div className="col-span-1 flex items-center">
                                  <button
                                    onClick={() => removeVariable(selectedIndicator.id, variable.id)}
                                    className="p-2 hover:bg-red-500/20 rounded text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aggregation Configuration */}
                  {selectedFormula.method === 'aggregation' && selectedFormula.aggregation && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                            Aggregation Type
                          </label>
                          <select
                            value={selectedFormula.aggregation.type}
                            onChange={(e) => handleFormulaUpdate(selectedIndicator.id, {
                              aggregation: {
                                ...selectedFormula.aggregation!,
                                type: e.target.value as AggregationType
                              }
                            })}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                          >
                            <option value="sum">Sum</option>
                            <option value="average">Average</option>
                            <option value="min">Minimum</option>
                            <option value="max">Maximum</option>
                            <option value="count">Count</option>
                            <option value="percentage">Percentage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                            Source Type
                          </label>
                          <select
                            value={selectedFormula.aggregation.sourceType}
                            onChange={(e) => handleFormulaUpdate(selectedIndicator.id, {
                              aggregation: {
                                ...selectedFormula.aggregation!,
                                sourceType: e.target.value as any,
                                sourceIds: []
                              }
                            })}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                          >
                            <option value="assignment">Assignments</option>
                            <option value="stage">Stages</option>
                            <option value="task">Tasks</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                          Data Sources
                        </label>
                        <div className="space-y-2">
                          {selectedFormula.aggregation.sourceType === 'assignment' && project.assignments.map(assignment => (
                            <label key={assignment.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={selectedFormula.aggregation!.sourceIds.includes(assignment.id)}
                                onChange={(e) => {
                                  const sourceIds = e.target.checked
                                    ? [...selectedFormula.aggregation!.sourceIds, assignment.id]
                                    : selectedFormula.aggregation!.sourceIds.filter(id => id !== assignment.id);
                                  
                                  handleFormulaUpdate(selectedIndicator.id, {
                                    aggregation: {
                                      ...selectedFormula.aggregation!,
                                      sourceIds
                                    }
                                  });
                                }}
                                className="rounded border-slate-300 dark:border-white/20"
                              />
                              <div className="flex-1">
                                <div className="text-sm text-slate-900 dark:text-white">{assignment.name}</div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Stage: {project.workflow.find(s => s.id === assignment.stageId)?.name}
                                </div>
                              </div>
                            </label>
                          ))}

                          {selectedFormula.aggregation.sourceType === 'stage' && project.workflow.map(stage => (
                            <label key={stage.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={selectedFormula.aggregation!.sourceIds.includes(stage.id)}
                                onChange={(e) => {
                                  const sourceIds = e.target.checked
                                    ? [...selectedFormula.aggregation!.sourceIds, stage.id]
                                    : selectedFormula.aggregation!.sourceIds.filter(id => id !== stage.id);
                                  
                                  handleFormulaUpdate(selectedIndicator.id, {
                                    aggregation: {
                                      ...selectedFormula.aggregation!,
                                      sourceIds
                                    }
                                  });
                                }}
                                className="rounded border-slate-300 dark:border-white/20"
                              />
                              <div className="flex-1">
                                <div className="text-sm text-slate-900 dark:text-white">{stage.name}</div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  {stage.duration} days
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                          Field to Aggregate
                        </label>
                        <select
                          value={selectedFormula.aggregation.field}
                          onChange={(e) => handleFormulaUpdate(selectedIndicator.id, {
                            aggregation: {
                              ...selectedFormula.aggregation!,
                              field: e.target.value
                            }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                        >
                          <option value="progress">Progress (%)</option>
                          <option value="budget">Budget</option>
                          <option value="duration">Duration (days)</option>
                          <option value="tasks_completed">Completed Tasks</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Manual Entry */}
                  {selectedFormula.method === 'manual' && (
                    <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <div className="text-blue-500 mb-1">Manual Entry Mode</div>
                          <div className="text-sm text-slate-600 dark:text-white/60">
                            Values for this indicator will be manually updated by team members during project execution.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Update Frequency */}
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                      Update Frequency
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'realtime', label: 'Real-time' },
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'manual', label: 'Manual' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleFormulaUpdate(selectedIndicator.id, {
                            updateFrequency: value as any
                          })}
                          className={`
                            px-4 py-2 rounded-lg border-2 text-sm transition-all
                            ${selectedFormula.updateFrequency === value
                              ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                              : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60'
                            }
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center">
              <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-white/60">
                Select an indicator to configure its calculation formula
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleCompleteSetup}
          disabled={configuredCount < totalCount}
          size="lg"
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Complete Indicator Setup
        </Button>
      </div>
    </div>
  );
}