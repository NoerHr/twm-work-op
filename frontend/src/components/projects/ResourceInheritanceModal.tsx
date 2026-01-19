import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Package,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import type { ProjectResourceType } from '../../types/project';

interface ResourceInheritanceModalProps {
  organizationalTypes: any[]; // Would use proper ResourceType from resource module
  inheritedTypes: ProjectResourceType[];
  onInherit: (typeId: string) => void;
  onClose: () => void;
}

export function ResourceInheritanceModal({
  organizationalTypes,
  inheritedTypes,
  onInherit,
  onClose
}: ResourceInheritanceModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showVersionDiff, setShowVersionDiff] = useState(false);

  const isInherited = (typeId: string) => {
    return inheritedTypes.some(t => t.organizationalTypeId === typeId);
  };

  const handleInherit = (typeId: string) => {
    onInherit(typeId);
    toast.success('Resource Type Inherited', {
      description: 'Type will be synced with organizational library',
      icon: <Download className="w-5 h-5" />
    });
  };

  const selectedOrgType = organizationalTypes.find(t => t.id === selectedType);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-6xl max-h-[90vh] flex gap-4"
      >
        {/* Left Panel - Type List */}
        <GlassCard className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">
                Organizational Resource Types
              </h2>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Select types to inherit into your project
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Type List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {organizationalTypes.length === 0 ? (
              <div className="glass-card p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-white mb-2">
                  No Resource Types Available
                </h3>
                <p className="text-slate-600 dark:text-white/60">
                  Admin needs to create organizational resource types first
                </p>
              </div>
            ) : (
              organizationalTypes.map((type) => {
                const inherited = isInherited(type.id);
                const isSelected = selectedType === type.id;

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full glass-card p-4 text-left transition-all ${
                      isSelected ? 'ring-2 ring-purple-500' : ''
                    } ${inherited ? 'opacity-60' : 'hover-glow'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-white">
                            {type.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-white/60">
                            Version {type.version || '1.0.0'}
                          </p>
                        </div>
                      </div>
                      {inherited ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Inherited
                        </Badge>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-white/60">
                      <span>
                        {type.schema?.properties ? Object.keys(type.schema.properties).length : 0} fields
                      </span>
                      <span>•</span>
                      <span>
                        {type.category || 'General'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Inherited Count */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="text-sm text-slate-600 dark:text-white/60">
              {inheritedTypes.length} type(s) inherited into this project
            </div>
          </div>
        </GlassCard>

        {/* Right Panel - Type Details */}
        {selectedOrgType && (
          <GlassCard className="p-6 w-[400px] flex flex-col">
            <h3 className="text-slate-900 dark:text-white mb-6">Type Details</h3>

            {/* Type Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white">{selectedOrgType.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    v{selectedOrgType.version || '1.0.0'}
                  </p>
                </div>
              </div>

              {selectedOrgType.description && (
                <p className="text-sm text-slate-600 dark:text-white/60">
                  {selectedOrgType.description}
                </p>
              )}
            </div>

            {/* Schema Fields */}
            <div className="flex-1 overflow-y-auto mb-6">
              <h4 className="text-slate-900 dark:text-white mb-3">Schema Fields</h4>
              {selectedOrgType.schema?.properties ? (
                <div className="space-y-2">
                  {Object.entries(selectedOrgType.schema.properties).map(([key, field]: [string, any]) => (
                    <div key={key} className="glass-card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-900 dark:text-white text-sm">
                          {key}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      {field.description && (
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-white/60">
                  No schema fields defined
                </p>
              )}
            </div>

            {/* Sync Information */}
            <div className="glass-card p-4 mb-6 border-2 border-blue-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-slate-900 dark:text-white text-sm mb-1">
                    Auto-Sync Enabled
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    This type will stay synchronized with the organizational version. 
                    Updates from Admin will automatically apply to your project.
                  </p>
                </div>
              </div>
            </div>

            {/* Version Diff (if already inherited) */}
            {isInherited(selectedOrgType.id) && (
              <div className="glass-card p-4 mb-6 border-2 border-green-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-slate-900 dark:text-white text-sm mb-1">
                      Already Inherited
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-white/60 mb-3">
                      This type is already in your project and synced.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setShowVersionDiff(!showVersionDiff)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {showVersionDiff ? 'Hide' : 'Show'} Version Details
                    </Button>
                  </div>
                </div>

                {showVersionDiff && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-white/60">Org Version:</span>
                        <span className="text-slate-900 dark:text-white">
                          {selectedOrgType.version || '1.0.0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-white/60">Project Version:</span>
                        <span className="text-slate-900 dark:text-white">
                          {selectedOrgType.version || '1.0.0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-white/60">Status:</span>
                        <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                          In Sync
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            {!isInherited(selectedOrgType.id) ? (
              <Button
                onClick={() => handleInherit(selectedOrgType.id)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Inherit This Type
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Check for Updates
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Detach & Customize
                </Button>
              </div>
            )}
          </GlassCard>
        )}

        {/* Placeholder when nothing selected */}
        {!selectedOrgType && (
          <GlassCard className="p-12 w-[400px] flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white mb-2">
                Select a Resource Type
              </h3>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Choose a type from the list to view details and inherit
              </p>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}