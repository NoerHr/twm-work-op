import { useState, useEffect } from 'react';
import { X, Save, Target, Link2, Calculator, BarChart3, AlertCircle, Database, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LogicBlockEditor } from './LogicBlockEditor';
import { IndicatorWorkflowCanvas } from './IndicatorWorkflowCanvas';
import { useIndicatorStore } from '../../store/indicatorStore';
import { useAuthStore } from '../../store/authStore';
import type { IndicatorDefinition, IndicatorLevel, LocalValue, WidgetConfig, WidgetType } from '../../types/indicator';

interface LogicStudioProps {
  indicatorId?: string;
  mode?: 'modal' | 'embedded';
  onSave: (indicator: IndicatorDefinition) => void;
  onClose?: () => void;
}

type TabType = 'basic' | 'inputs' | 'values' | 'visualizations' | 'workflow';

export function LogicStudio({ indicatorId, mode = 'modal', onSave, onClose }: LogicStudioProps) {
  const user = useAuthStore((state) => state.user);
  const indicators = useIndicatorStore((state) => state.indicators);
  const existingIndicator = indicatorId ? indicators.find(i => i.id === indicatorId) : undefined;

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<IndicatorDefinition>>(() => {
    if (existingIndicator) return existingIndicator;
    
    // Set default level based on role
    let defaultLevel: IndicatorLevel = 'operational';
    if (user?.role === 'Leader') {
      defaultLevel = 'operational';
    } else if (user?.role === 'PM') {
      defaultLevel = 'assignment';
    }
    
    return {
      name: '',
      description: '',
      level: defaultLevel,
      values: [],
      connections: [],
      visualizations: [],
      tags: [],
      isActive: true
    };
  });

  const [newValue, setNewValue] = useState<Partial<LocalValue>>({
    key: '',
    label: '',
    type: 'number',
    source: 'calculated'
  });

  const [newVisualization, setNewVisualization] = useState<Partial<WidgetConfig>>({
    type: 'kpi',
    title: '',
    valueKey: '',
    size: { w: 2, h: 1 },
    position: { x: 0, y: 0 },
    config: {
      showTrend: true,
      showSparkline: false,
      decimals: 1
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Enforce role-based level restrictions
  useEffect(() => {
    if (user?.role === 'Leader') {
      setFormData(prev => prev.level !== 'operational' ? { ...prev, level: 'operational' } : prev);
    }
    if (user?.role === 'PM') {
      setFormData(prev => prev.level === 'operational' ? { ...prev, level: 'assignment' } : prev);
    }
  }, [user?.role]);

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: Target },
    { id: 'inputs' as TabType, label: 'Inputs', icon: Link2 },
    { id: 'values' as TabType, label: 'Values & Logic', icon: Calculator },
    { id: 'visualizations' as TabType, label: 'Visualizations', icon: BarChart3 },
    { id: 'workflow' as TabType, label: 'Workflow Canvas', icon: Network }
  ];

  const validateBasic = () => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = 'Name is required';
    if (!formData.level) errs.level = 'Level is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddValue = () => {
    if (!newValue.key || !newValue.label) {
      setErrors({ value: 'Key and label are required' });
      return;
    }

    const value: LocalValue = {
      key: newValue.key!,
      label: newValue.label!,
      type: newValue.type || 'number',
      source: newValue.source || 'calculated',
      unit: newValue.unit,
      description: newValue.description
    };

    setFormData({
      ...formData,
      values: [...(formData.values || []), value]
    });

    setNewValue({
      key: '',
      label: '',
      type: 'number',
      source: 'calculated'
    });
    setErrors({});
  };

  const handleRemoveValue = (key: string) => {
    setFormData({
      ...formData,
      values: (formData.values || []).filter(v => v.key !== key)
    });
  };

  const handleUpdateValueFormula = (key: string, formula: any) => {
    setFormData({
      ...formData,
      values: (formData.values || []).map(v =>
        v.key === key ? { ...v, formula } : v
      )
    });
  };

  const handleAddVisualization = () => {
    if (!newVisualization.title || !newVisualization.valueKey) {
      setErrors({ viz: 'Title and value key are required' });
      return;
    }

    const viz: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: newVisualization.type || 'kpi',
      indicatorId: indicatorId || 'temp',
      title: newVisualization.title!,
      valueKey: newVisualization.valueKey!,
      size: newVisualization.size || { w: 2, h: 1 },
      position: newVisualization.position || { x: 0, y: 0 },
      config: newVisualization.config || {}
    };

    setFormData({
      ...formData,
      visualizations: [...(formData.visualizations || []), viz]
    });

    setNewVisualization({
      type: 'kpi',
      title: '',
      valueKey: '',
      size: { w: 2, h: 1 },
      position: { x: 0, y: 0 },
      config: { showTrend: true, decimals: 1 }
    });
    setErrors({});
  };

  const handleRemoveVisualization = (id: string) => {
    setFormData({
      ...formData,
      visualizations: (formData.visualizations || []).filter(v => v.id !== id)
    });
  };

  const handleSave = () => {
    if (!validateBasic()) {
      setActiveTab('basic');
      return;
    }

    const indicator: IndicatorDefinition = {
      id: indicatorId || `ind-${Date.now()}`,
      name: formData.name!,
      description: formData.description,
      level: formData.level!,
      projectId: formData.projectId,
      assignmentId: formData.assignmentId,
      values: formData.values || [],
      connections: formData.connections || [],
      visualizations: formData.visualizations || [],
      createdBy: 'user-1',
      createdAt: existingIndicator?.createdAt || new Date(),
      updatedAt: new Date(),
      isActive: formData.isActive ?? true,
      tags: formData.tags
    };

    onSave(indicator);
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-slate-900 dark:text-white font-semibold mb-1">
            {indicatorId ? 'Edit Indicator' : 'Create Indicator'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define metrics, logic, and visualizations
          </p>
        </div>
        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'basic' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border ${
                  errors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10'
                } rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="e.g., Team Efficiency Score"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe what this indicator measures..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Level *
              </label>
              {user?.role === 'Leader' ? (
                <div className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white">
                  Operational
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Leaders can only create Operational indicators
                  </p>
                </div>
              ) : user?.role === 'PM' ? (
                <div>
                  <select
                    value={formData.level || 'assignment'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as IndicatorLevel })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                  </select>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    PMs can create Project and Assignment level indicators
                  </p>
                </div>
              ) : (
                <select
                  value={formData.level || 'operational'}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as IndicatorLevel })}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="operational">Operational</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="performance, quality, team (comma-separated)"
              />
            </div>
          </div>
        )}

        {activeTab === 'inputs' && (
          <div className="max-w-2xl">
            <div className="mb-4">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                Input Connections
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect child indicators to use their values in calculations
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Connections via Canvas
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 leading-relaxed">
                    Input connections are managed through the visual canvas. Draw lines from child indicators to create connections.
                  </p>
                </div>
              </div>
            </div>

            {formData.connections && formData.connections.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.connections.map((conn, index) => (
                  <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">
                          {conn.sourceId} → {conn.targetId}
                        </p>
                        <p className="text-xs text-slate-500">
                          {conn.sourceValueKey} • {conn.type}
                        </p>
                      </div>
                      <Badge variant="secondary">{conn.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'values' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                Values & Calculations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Define the data values and calculation logic
              </p>
            </div>

            {/* Existing Values */}
            {formData.values && formData.values.length > 0 && (
              <div className="space-y-3">
                {formData.values.map((value) => (
                  <GlassCard key={value.key} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-slate-900 dark:text-white font-medium">
                            {value.label}
                          </h4>
                          <Badge variant="secondary">{value.source}</Badge>
                          <Badge variant="info">{value.type}</Badge>
                        </div>
                        <p className="text-xs font-mono text-slate-500">
                          key: {value.key} {value.unit && `• unit: ${value.unit}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveValue(value.key)}
                        className="p-1 hover:bg-red-500/10 text-red-600 rounded transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {value.source === 'calculated' && (
                      <div className="mt-3">
                        <LogicBlockEditor
                          value={value.formula}
                          availableValues={formData.values?.filter(v => v.key !== value.key) || []}
                          onChange={(formula) => handleUpdateValueFormula(value.key, formula)}
                        />
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Add New Value */}
            <GlassCard className="p-4">
              <h4 className="text-slate-900 dark:text-white font-medium mb-4">
                Add New Value
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Key *
                  </label>
                  <input
                    type="text"
                    value={newValue.key || ''}
                    onChange={(e) => setNewValue({ ...newValue, key: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="e.g., efficiency_score"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={newValue.label || ''}
                    onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="e.g., Efficiency Score"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Type
                  </label>
                  <select
                    value={newValue.type || 'number'}
                    onChange={(e) => setNewValue({ ...newValue, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="string">String</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Source
                  </label>
                  <select
                    value={newValue.source || 'calculated'}
                    onChange={(e) => setNewValue({ ...newValue, source: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="calculated">Calculated</option>
                    <option value="manual">Manual Entry</option>
                    <option value="task">From Tasks</option>
                    <option value="external">External API</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Unit (optional)
                  </label>
                  <input
                    type="text"
                    value={newValue.unit || ''}
                    onChange={(e) => setNewValue({ ...newValue, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="e.g., %, $, hours"
                  />
                </div>
              </div>
              {errors.value && (
                <p className="text-red-500 text-sm mt-2">{errors.value}</p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddValue}
                className="mt-4"
              >
                Add Value
              </Button>
            </GlassCard>
          </div>
        )}

        {activeTab === 'visualizations' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                Visualizations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure how this indicator appears on dashboards
              </p>
            </div>

            {/* Existing Visualizations */}
            {formData.visualizations && formData.visualizations.length > 0 && (
              <div className="space-y-3">
                {formData.visualizations.map((viz) => (
                  <GlassCard key={viz.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-slate-900 dark:text-white font-medium">
                            {viz.title}
                          </h4>
                          <Badge variant="primary">{viz.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Value: {viz.valueKey} • Size: {viz.size.w}x{viz.size.h}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveVisualization(viz.id)}
                        className="p-1 hover:bg-red-500/10 text-red-600 rounded transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Add New Visualization */}
            <GlassCard className="p-4">
              <h4 className="text-slate-900 dark:text-white font-medium mb-4">
                Add New Visualization
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newVisualization.title || ''}
                    onChange={(e) => setNewVisualization({ ...newVisualization, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Widget title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Widget Type
                  </label>
                  <select
                    value={newVisualization.type || 'kpi'}
                    onChange={(e) => setNewVisualization({ ...newVisualization, type: e.target.value as WidgetType })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="kpi">KPI Card</option>
                    <option value="gauge">Gauge</option>
                    <option value="timeseries">Time Series</option>
                    <option value="badge">Badge</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Value Key *
                  </label>
                  <select
                    value={newVisualization.valueKey || ''}
                    onChange={(e) => setNewVisualization({ ...newVisualization, valueKey: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white"
                    disabled={!formData.values || formData.values.length === 0}
                  >
                    <option value="">Select a value</option>
                    {formData.values?.map(v => (
                      <option key={v.key} value={v.key}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.viz && (
                <p className="text-red-500 text-sm mt-2">{errors.viz}</p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddVisualization}
                className="mt-4"
                disabled={!formData.values || formData.values.length === 0}
              >
                Add Visualization
              </Button>
            </GlassCard>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="max-w-6xl h-[700px] flex flex-col">
            <div className="mb-4 space-y-3">
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Indicator Workflow Canvas
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Visual representation of indicator logic and data flow using node-based design
                </p>
              </div>
              
              {/* Workflow Info Banner */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Network className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-2 text-sm">
                      Node-Based Workflow Design
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 text-sm leading-relaxed mb-3">
                      Build complex indicator logic by connecting nodes. Available node types:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-purple-900 dark:text-purple-200"><strong>Data Source</strong> - Input data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                        <span className="text-purple-900 dark:text-purple-200"><strong>Filter</strong> - Conditional logic</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-purple-900 dark:text-purple-200"><strong>Aggregation</strong> - Sum, Avg, etc.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-purple-900 dark:text-purple-200"><strong>Calculation</strong> - Math formulas</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="w-3 h-3 rounded bg-indigo-600"></div>
                        <span className="text-purple-900 dark:text-purple-200"><strong>Output</strong> - Final result value</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <IndicatorWorkflowCanvas indicatorId={indicatorId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
        {mode === 'modal' && onClose && (
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {indicatorId ? 'Update' : 'Create'} Indicator
        </Button>
      </div>
    </div>
  );

  if (mode === 'embedded') {
    return <div className="h-full">{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh]"
      >
        <GlassCard className="h-full flex flex-col">
          {content}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}