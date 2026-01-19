import { useState, useEffect } from 'react';
import { Plus, Target, Database, TrendingUp, Layers, Search, Edit, Trash2, Eye, Calculator, BarChart3, AlertCircle, Lock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LogicStudio } from './LogicStudio';
import { useIndicatorStore } from '../../store/indicatorStore';
import { useAuthStore } from '../../store/authStore';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import type { IndicatorLevel, IndicatorDefinition } from '../../types/indicator';

interface IndicatorBuilderProps {
  triggerCreate?: boolean;
  onCreateTriggered?: () => void;
}

export function IndicatorBuilder({ triggerCreate, onCreateTriggered }: IndicatorBuilderProps = {}) {
  const user = useAuthStore((state) => state.user);
  const indicators = useIndicatorStore((state) => state.indicators);
  const addIndicator = useIndicatorStore((state) => state.addIndicator);
  const updateIndicator = useIndicatorStore((state) => state.updateIndicator);
  const deleteIndicator = useIndicatorStore((state) => state.deleteIndicator);
  
  const [selectedLevel, setSelectedLevel] = useState<IndicatorLevel | 'all'>(() => {
    if (user?.role === 'Leader') return 'operational';
    if (user?.role === 'PM') return 'all';
    return 'all';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogicStudio, setShowLogicStudio] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | undefined>();

  const filteredIndicators = indicators.filter((ind) => {
    // Leaders can ONLY see/edit Operational indicators
    if (user?.role === 'Leader' && ind.level !== 'operational') {
      return false;
    }
    // PMs can ONLY see/edit Assignment and Project indicators
    if (user?.role === 'PM' && ind.level === 'operational') {
      return false;
    }
    
    const matchesLevel = selectedLevel === 'all' || ind.level === selectedLevel;
    const matchesSearch =
      ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Role-based permissions
  const canEditProject = user?.role === 'Admin' || user?.role === 'BOD' || user?.role === 'PM';
  const canEditAssignment = user?.role === 'Admin' || user?.role === 'BOD' || user?.role === 'PM';
  const canEditOperational = user?.role === 'Admin' || user?.role === 'BOD' || user?.role === 'Leader';

  const getLevelBadgeVariant = (level: IndicatorLevel) => {
    return level === 'project' ? 'primary' : level === 'assignment' ? 'warning' : 'secondary';
  };

  const getLevelIcon = (level: IndicatorLevel) => {
    return level === 'project' ? Target : level === 'assignment' ? Layers : Database;
  };

  const canEdit = (level: IndicatorLevel) => {
    if (level === 'project') return canEditProject;
    if (level === 'assignment') return canEditAssignment;
    return canEditOperational;
  };

  const handleCreateIndicator = () => {
    console.log('Creating new indicator...');
    setSelectedIndicatorId(undefined);
    setShowLogicStudio(true);
  };

  const handleEditIndicator = (id: string, level: IndicatorLevel) => {
    // Check if user can access this indicator
    if (!canAccessIndicator(level)) {
      toast.error(`You don't have permission to access ${level} indicators`);
      return;
    }
    setSelectedIndicatorId(id);
    setShowLogicStudio(true);
  };

  const canAccessIndicator = (level: IndicatorLevel) => {
    if (user?.role === 'Leader') {
      return level === 'operational';
    }
    if (user?.role === 'PM') {
      return level === 'assignment' || level === 'project';
    }
    return true; // Admin and BOD can access all
  };

  const handleSaveIndicator = (indicator: IndicatorDefinition) => {
    if (selectedIndicatorId) {
      updateIndicator(indicator.id, indicator);
      toast.success('Indicator updated successfully');
    } else {
      addIndicator(indicator);
      toast.success('Indicator created successfully');
    }
    setShowLogicStudio(false);
    setSelectedIndicatorId(undefined);
  };

  const handleDeleteIndicator = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteIndicator(id);
      toast.success('Indicator deleted');
    }
  };

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerCreate) {
      handleCreateIndicator();
      onCreateTriggered?.();
    }
  }, [triggerCreate]);

  return (
    <div className="h-full flex">
      {/* Node Palette (Left Sidebar) */}
      <div className="w-80 glass-surface border-r border-slate-200 dark:border-white/10 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-3">
            Indicator Library
          </h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Level Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'project', 'assignment', 'operational'] as const)
              .filter((level) => {
                // Leaders can only see "operational" option
                if (user?.role === 'Leader') {
                  return level === 'operational';
                }
                // PMs can only see "project" and "assignment" options
                if (user?.role === 'PM') {
                  return level === 'all' || level === 'project' || level === 'assignment';
                }
                return true;
              })
              .map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedLevel === level
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
          </div>

          {/* Role Permission Info */}
          {(user?.role === 'Leader' || user?.role === 'PM') && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  {user?.role === 'Leader' && (
                    <p><strong>Leaders</strong> can only create and view Operational indicators</p>
                  )}
                  {user?.role === 'PM' && (
                    <p><strong>PMs</strong> can create and view Project and Assignment level indicators</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicator List */}
        <div className="space-y-3">
          {filteredIndicators.map((indicator) => {
            const Icon = getLevelIcon(indicator.level);
            const isEditable = canEdit(indicator.level);
            
            return (
              <GlassCard
                key={indicator.id}
                hover
                className="p-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      indicator.level === 'project'
                        ? 'bg-indigo-500/10'
                        : indicator.level === 'assignment'
                        ? 'bg-amber-500/10'
                        : 'bg-slate-500/10'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        indicator.level === 'project'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : indicator.level === 'assignment'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {indicator.name}
                      </div>
                      {!isEditable && (
                        <Badge variant="secondary" className="text-xs">
                          Read-only
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getLevelBadgeVariant(indicator.level) as any}>
                      {indicator.level}
                    </Badge>
                    {indicator.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {indicator.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 text-xs text-slate-500">
                      <span>{indicator.values.length} values</span>
                      <span>•</span>
                      <span>{indicator.visualizations.length} widgets</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditIndicator(indicator.id, indicator.level)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-500/20 transition-all"
                        disabled={!isEditable}
                      >
                        {isEditable ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isEditable ? 'Edit' : 'View'}
                      </button>
                      {isEditable && (
                        <button
                          onClick={() => handleDeleteIndicator(indicator.id, indicator.name)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/10 text-red-600 dark:text-red-400 rounded hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}

          {filteredIndicators.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No indicators found
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
                All Indicators
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {indicators.length} indicator{indicators.length !== 1 ? 's' : ''} defined
              </p>
            </div>
            {canEditProject && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCreateIndicator}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Indicator
              </Button>
            )}
          </div>
        </div>

        {/* Canvas Content - Grid View */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
            {indicators.map((indicator) => {
              const Icon = getLevelIcon(indicator.level);
              const isEditable = canEdit(indicator.level);
              const isAccessible = canAccessIndicator(indicator.level);
              
              return (
                <GlassCard
                  key={indicator.id}
                  hover={isAccessible}
                  className={`p-4 transition-all relative ${
                    isAccessible 
                      ? 'cursor-pointer' 
                      : 'cursor-not-allowed opacity-50 saturate-0'
                  }`}
                  onClick={() => isAccessible && handleEditIndicator(indicator.id, indicator.level)}
                >
                  {/* Restricted Overlay */}
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-xl rounded-xl flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Lock className="w-8 h-8" />
                        <span className="text-xs font-medium">
                          {user?.role === 'Leader' ? 'PM Only' : 'Leader Only'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        indicator.level === 'project'
                          ? 'bg-indigo-500/10'
                          : indicator.level === 'assignment'
                          ? 'bg-amber-500/10'
                          : 'bg-slate-500/10'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          indicator.level === 'project'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : indicator.level === 'assignment'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant={getLevelBadgeVariant(indicator.level) as any} className="mb-2">
                        {indicator.level}
                      </Badge>
                      {!isEditable && (
                        <Badge variant="secondary" className="ml-2">
                          Read-only
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                    {indicator.name}
                  </h3>
                  
                  {indicator.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {indicator.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calculator className="w-3 h-3" />
                      <span>{indicator.values.length} values</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{indicator.visualizations.length} widgets</span>
                    </div>
                  </div>

                  {indicator.tags && indicator.tags.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {indicator.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              );
            })}

            {/* Empty State */}
            {indicators.length === 0 && (
              <div className="col-span-3 py-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
                  No indicators yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Create your first indicator to start measuring performance
                </p>
                {canEditProject && (
                  <Button variant="primary" size="sm" onClick={handleCreateIndicator}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Indicator
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel (Right Sidebar) */}
      <div className="w-80 glass-surface border-l border-slate-200 dark:border-white/10 p-4 overflow-y-auto">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-3">
          Quick Stats
        </h3>
        
        <div className="space-y-4">
          {/* Role-based access info */}
          {(user?.role === 'Leader' || user?.role === 'PM') && (
            <div className={`p-3 rounded-lg border text-xs ${
              user?.role === 'Leader'
                ? 'bg-slate-500/10 border-slate-500/20'
                : 'bg-indigo-500/10 border-indigo-500/20'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                  {user?.role === 'Leader' ? 'Leader Access' : 'PM Access'}
                </p>
              </div>
              <p className={`leading-relaxed ${
                user?.role === 'Leader'
                  ? 'text-slate-600 dark:text-slate-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {user?.role === 'Leader'
                  ? 'You can only create and edit Operational indicators. Other indicator types are locked.'
                  : 'You can only create and edit Project and Assignment indicators. Operational indicators are locked.'
                }
              </p>
            </div>
          )}
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {indicators.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Indicators
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-center">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {indicators.filter(i => i.level === 'project').length}
              </div>
              <div className="text-xs text-slate-500">Project</div>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-center">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {indicators.filter(i => i.level === 'assignment').length}
              </div>
              <div className="text-xs text-slate-500">Assignment</div>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-center">
              <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                {indicators.filter(i => i.level === 'operational').length}
              </div>
              <div className="text-xs text-slate-500">Operational</div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {indicators.reduce((sum, i) => sum + i.visualizations.length, 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Widgets
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {indicators.reduce((sum, i) => sum + i.values.length, 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Values
            </div>
          </div>

          {canEditProject && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateIndicator}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Indicator
            </Button>
          )}
        </div>
      </div>

      {/* Logic Studio Modal */}
      <AnimatePresence>
        {showLogicStudio && (
          <LogicStudio
            indicatorId={selectedIndicatorId}
            mode="modal"
            onSave={handleSaveIndicator}
            onClose={() => {
              setShowLogicStudio(false);
              setSelectedIndicatorId(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}