import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Info, Zap, Database, GitBranch, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Node } from '@xyflow/react';

export interface NodeConfig {
  // Common
  label: string;
  description?: string;
  
  // Data Node (getItemId, updateFieldValue, createNew, deleteItem)
  operation?: 'getItemId' | 'updateFieldValue' | 'createNew' | 'deleteItem';
  targetField?: string;
  searchValue?: string;
  updateValue?: string;
  valueType?: 'static' | 'parameter' | 'formula';
  matchType?: 'exact' | 'contains' | 'startsWith' | 'endsWith';
  outputVariable?: string;
  
  // Router Node
  routes?: Array<{
    id: string;
    label: string;
    condition: string;
    conditionType: 'simple' | 'advanced';
    field?: string;
    operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'isEmpty';
    value?: string;
  }>;
  
  // Parenthesis Node (Transaction)
  transactionMode?: 'atomic' | 'sequential';
  rollbackOnError?: boolean;
  isolationLevel?: 'readCommitted' | 'repeatableRead' | 'serializable';
  timeout?: number;
  
  // Common outputs
  outputs?: Record<string, any>;
}

interface NodeConfigModalProps {
  node: Node | null;
  fields: Array<{
    id: string;
    name: string;
    internalName: string;
    type: string;
  }>;
  onClose: () => void;
  onSave: (nodeId: string, config: NodeConfig) => void;
}

export function NodeConfigModal({ node, fields, onClose, onSave }: NodeConfigModalProps) {
  const [config, setConfig] = useState<NodeConfig>({
    label: node?.data.label || '',
    description: node?.data.description || '',
    ...node?.data.config
  });

  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setConfig({
        label: node.data.label || '',
        description: node.data.description || '',
        ...node.data.config
      });
    }
  }, [node]);

  if (!node) return null;

  const nodeType = node.data.type;

  const handleSave = () => {
    onSave(node.id, config);
    onClose();
  };

  const addRoute = () => {
    const newRoute = {
      id: `route-${Date.now()}`,
      label: `Route ${(config.routes?.length || 0) + 1}`,
      condition: '',
      conditionType: 'simple' as const,
      operator: '==' as const
    };
    setConfig({
      ...config,
      routes: [...(config.routes || []), newRoute]
    });
    setActiveRouteId(newRoute.id);
  };

  const updateRoute = (routeId: string, updates: Partial<NodeConfig['routes'][0]>) => {
    setConfig({
      ...config,
      routes: config.routes?.map(r => r.id === routeId ? { ...r, ...updates } : r)
    });
  };

  const deleteRoute = (routeId: string) => {
    setConfig({
      ...config,
      routes: config.routes?.filter(r => r.id !== routeId)
    });
    if (activeRouteId === routeId) {
      setActiveRouteId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-white/20 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 glass-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {nodeType === 'router' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                )}
                {nodeType === 'parenthesis' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                )}
                {!nodeType || (nodeType !== 'router' && nodeType !== 'parenthesis') && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Configure Node
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {nodeType === 'router' && 'Conditional routing with multiple branches'}
                    {nodeType === 'parenthesis' && 'Transaction block settings'}
                    {nodeType === 'getItemId' && 'Search for items by field criteria'}
                    {nodeType === 'updateFieldValue' && 'Update field values on items'}
                    {nodeType === 'createNew' && 'Create new resource instance'}
                    {nodeType === 'deleteItem' && 'Delete resource instances'}
                    {!nodeType && 'Configure node settings'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                  Node Label
                </label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                  placeholder="e.g., Find Available Machines"
                  className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Describe what this node does..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Data Node Configuration */}
              {(nodeType === 'getItemId' || nodeType === 'updateFieldValue' || nodeType === 'createNew' || nodeType === 'deleteItem') && (
                <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      Data Operation Settings
                    </h3>
                  </div>

                  {nodeType === 'getItemId' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          Search by Field
                        </label>
                        <select
                          value={config.targetField || ''}
                          onChange={(e) => setConfig({ ...config, targetField: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                        >
                          <option value="">Select field...</option>
                          {fields.map(field => (
                            <option key={field.id} value={field.internalName}>
                              {field.name} ({field.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          Match Type
                        </label>
                        <select
                          value={config.matchType || 'exact'}
                          onChange={(e) => setConfig({ ...config, matchType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                        >
                          <option value="exact">Exact Match</option>
                          <option value="contains">Contains</option>
                          <option value="startsWith">Starts With</option>
                          <option value="endsWith">Ends With</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          Value Type
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {['static', 'parameter', 'formula'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setConfig({ ...config, valueType: type as any })}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                config.valueType === type
                                  ? 'bg-purple-500 text-white border-purple-500'
                                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={config.searchValue || ''}
                          onChange={(e) => setConfig({ ...config, searchValue: e.target.value })}
                          placeholder={
                            config.valueType === 'parameter' 
                              ? 'e.g., param:user_id or param:project_id'
                              : config.valueType === 'formula'
                              ? 'e.g., ${item.price} * 1.1'
                              : 'Enter search value...'
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          Output Variable Name
                        </label>
                        <input
                          type="text"
                          value={config.outputVariable || ''}
                          onChange={(e) => setConfig({ ...config, outputVariable: e.target.value })}
                          placeholder="e.g., foundItems, machineIds"
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                          This variable can be used in downstream nodes
                        </p>
                      </div>
                    </>
                  )}

                  {nodeType === 'updateFieldValue' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          Target Field to Update
                        </label>
                        <select
                          value={config.targetField || ''}
                          onChange={(e) => setConfig({ ...config, targetField: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                        >
                          <option value="">Select field...</option>
                          {fields.map(field => (
                            <option key={field.id} value={field.internalName}>
                              {field.name} ({field.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                          New Value Type
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {['static', 'parameter', 'formula'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setConfig({ ...config, valueType: type as any })}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                config.valueType === type
                                  ? 'bg-purple-500 text-white border-purple-500'
                                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={config.updateValue || ''}
                          onChange={(e) => setConfig({ ...config, updateValue: e.target.value })}
                          placeholder={
                            config.valueType === 'parameter' 
                              ? 'e.g., param:new_status'
                              : config.valueType === 'formula'
                              ? 'e.g., ${item.quantity} - 1'
                              : 'Enter new value...'
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono text-sm"
                        />
                      </div>
                    </>
                  )}

                  {nodeType === 'createNew' && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-white/70">
                          This node creates a new resource instance. Field values will be populated from parameters or static values defined in the workflow.
                        </p>
                      </div>
                    </div>
                  )}

                  {nodeType === 'deleteItem' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-white/70">
                          This node permanently deletes resource instances. Use with caution and consider adding a confirmation step in the workflow.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Router Node Configuration */}
              {nodeType === 'router' && (
                <div className="space-y-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                        Conditional Routes
                      </h3>
                    </div>
                    <Button size="sm" onClick={addRoute}>
                      Add Route
                    </Button>
                  </div>

                  {!config.routes || config.routes.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 dark:text-white/40 text-sm">
                      No routes defined. Click "Add Route" to create conditional branches.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.routes.map((route, index) => (
                        <div
                          key={route.id}
                          className={`p-3 rounded-lg border transition-all ${
                            activeRouteId === route.id
                              ? 'border-yellow-500 bg-yellow-500/5'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Route {index + 1}</Badge>
                            <input
                              type="text"
                              value={route.label}
                              onChange={(e) => updateRoute(route.id, { label: e.target.value })}
                              placeholder="Route label..."
                              className="flex-1 px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => deleteRoute(route.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button
                              onClick={() => updateRoute(route.id, { conditionType: 'simple' })}
                              className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                route.conditionType === 'simple'
                                  ? 'bg-yellow-500 text-white border-yellow-500'
                                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10'
                              }`}
                            >
                              Simple
                            </button>
                            <button
                              onClick={() => updateRoute(route.id, { conditionType: 'advanced' })}
                              className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                                route.conditionType === 'advanced'
                                  ? 'bg-yellow-500 text-white border-yellow-500'
                                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10'
                              }`}
                            >
                              Advanced
                            </button>
                          </div>

                          {route.conditionType === 'simple' ? (
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={route.field || ''}
                                onChange={(e) => updateRoute(route.id, { field: e.target.value })}
                                className="px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white"
                              >
                                <option value="">Field...</option>
                                {fields.map(field => (
                                  <option key={field.id} value={field.internalName}>
                                    {field.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={route.operator || '=='}
                                onChange={(e) => updateRoute(route.id, { operator: e.target.value as any })}
                                className="px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white"
                              >
                                <option value="==">==</option>
                                <option value="!=">!=</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value=">=">&gt;=</option>
                                <option value="<=">&lt;=</option>
                                <option value="contains">contains</option>
                                <option value="isEmpty">is empty</option>
                              </select>
                              <input
                                type="text"
                                value={route.value || ''}
                                onChange={(e) => updateRoute(route.id, { value: e.target.value })}
                                placeholder="Value..."
                                className="px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white font-mono"
                              />
                            </div>
                          ) : (
                            <textarea
                              value={route.condition || ''}
                              onChange={(e) => updateRoute(route.id, { condition: e.target.value })}
                              placeholder="e.g., item.status === 'available' && item.quantity > 0"
                              rows={2}
                              className="w-full px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-900 dark:text-white font-mono resize-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-white/70">
                        Routes are evaluated in order. The first matching condition determines the execution path. Add a default route without conditions to handle unmatched cases.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parenthesis Node Configuration */}
              {nodeType === 'parenthesis' && (
                <div className="space-y-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      Transaction Settings
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                      Transaction Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfig({ ...config, transactionMode: 'atomic' })}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          config.transactionMode === 'atomic'
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="font-medium mb-1">Atomic</div>
                        <div className="text-xs opacity-80">All or nothing</div>
                      </button>
                      <button
                        onClick={() => setConfig({ ...config, transactionMode: 'sequential' })}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          config.transactionMode === 'sequential'
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="font-medium mb-1">Sequential</div>
                        <div className="text-xs opacity-80">Step by step</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Rollback on Error
                      </div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Undo all changes if any operation fails
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.rollbackOnError ?? true}
                        onChange={(e) => setConfig({ ...config, rollbackOnError: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                      Isolation Level
                    </label>
                    <select
                      value={config.isolationLevel || 'readCommitted'}
                      onChange={(e) => setConfig({ ...config, isolationLevel: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    >
                      <option value="readCommitted">Read Committed</option>
                      <option value="repeatableRead">Repeatable Read</option>
                      <option value="serializable">Serializable</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      Higher isolation levels prevent more concurrency issues but may reduce performance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.timeout || 30}
                      onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                      min="1"
                      max="300"
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-white/40">
              Changes will be applied to the workflow
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}