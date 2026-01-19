import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Play
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { IndicatorSetup } from './IndicatorSetup';
import { ResourceMapping } from './ResourceMapping';
import type { Project } from '../../../types/project';

interface ProjectSetupProps {
  project: Project;
  onComplete: () => void;
  onCancel: () => void;
}

type SetupTab = 'indicators' | 'resources' | 'review';

export function ProjectSetup({ project, onComplete, onCancel }: ProjectSetupProps) {
  const [currentTab, setCurrentTab] = useState<SetupTab>('indicators');
  const [setupProgress, setSetupProgress] = useState({
    resourcesInherited: false,
    resourcesMapped: false,
    indicatorsConnected: false
  });

  const tabs = [
    {
      id: 'indicators' as SetupTab,
      label: 'Indicator Formulas',
      icon: TrendingUp,
      description: 'Configure calculation methods',
      completed: setupProgress.indicatorsConnected
    },
    {
      id: 'resources' as SetupTab,
      label: 'Resource Mapping',
      icon: Users,
      description: 'Map resources to assignments',
      completed: setupProgress.resourcesMapped
    },
    {
      id: 'review' as SetupTab,
      label: 'Review & Activate',
      icon: CheckCircle,
      description: 'Final review before activation',
      completed: false
    }
  ];

  const canActivate = Object.values(setupProgress).every(Boolean);

  const handleActivateProject = () => {
    if (canActivate) {
      onComplete();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Premium Header */}
      <div className="glass-surface border-b border-slate-200/50 dark:border-white/5 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[30px] font-bold text-slate-900 dark:text-white leading-tight tracking-[-0.75px]">
                  Project Setup
                </h1>
                <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Approved</span>
                </div>
              </div>
              <p className="text-[14px] font-medium text-[#45556c] dark:text-white/60">{project.details.name}</p>
            </div>
          </div>
          <button
            onClick={handleActivateProject}
            disabled={!canActivate}
            className={`
              px-6 py-3 rounded-2xl font-medium text-[14px] flex items-center gap-2 transition-all
              ${canActivate 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105' 
                : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
              }
            `}
          >
            <Play className="w-4 h-4" />
            Activate Project
          </button>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden backdrop-blur-xl border border-slate-200/50 dark:border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-purple-600 transition-all duration-500 relative overflow-hidden"
              style={{ 
                width: `${((Object.values(setupProgress).filter(Boolean).length) / Object.keys(setupProgress).length) * 100}%` 
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 backdrop-blur-xl">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {Object.values(setupProgress).filter(Boolean).length}
            </span>
            <span className="text-sm text-slate-400 dark:text-white/40">/</span>
            <span className="text-sm text-slate-600 dark:text-white/60">
              {Object.keys(setupProgress).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 px-8">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`
                  relative px-6 py-4 text-left transition-all
                  ${isActive 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tab.label}</span>
                      {tab.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs opacity-60">{tab.description}</div>
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {currentTab === 'indicators' && (
            <motion.div
              key="indicators"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <IndicatorSetup
                project={project}
                onComplete={() => {
                  setSetupProgress(prev => ({ ...prev, indicatorsConnected: true }));
                  setCurrentTab('resources');
                }}
              />
            </motion.div>
          )}

          {currentTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ResourceMapping
                project={project}
                onComplete={() => {
                  setSetupProgress(prev => ({ ...prev, resourcesMapped: true }));
                  setCurrentTab('review');
                }}
              />
            </motion.div>
          )}

          {currentTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SetupReview
                project={project}
                setupProgress={setupProgress}
                onActivate={handleActivateProject}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Review Tab Component
function SetupReview({ 
  project, 
  setupProgress,
  onActivate 
}: { 
  project: Project;
  setupProgress: { resourcesInherited: boolean; resourcesMapped: boolean; indicatorsConnected: boolean };
  onActivate: () => void;
}) {
  const allComplete = Object.values(setupProgress).every(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-slate-900 dark:text-white mb-2">Setup Review</h2>
        <p className="text-slate-600 dark:text-white/60">
          Review configuration before activating the project
        </p>
      </div>

      {/* Setup Checklist */}
      <GlassCard className="p-6">
        <h3 className="text-slate-900 dark:text-white mb-4">Configuration Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-sm text-slate-900 dark:text-white">Indicator Formulas</div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  Calculation methods configured
                </div>
              </div>
            </div>
            {setupProgress.indicatorsConnected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-slate-900 dark:text-white">Resource Mapping</div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  Resources assigned to assignments
                </div>
              </div>
            </div>
            {setupProgress.resourcesMapped ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>
      </GlassCard>

      {/* Project Summary */}
      <GlassCard className="p-6">
        <h3 className="text-slate-900 dark:text-white mb-4">Project Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-600 dark:text-white/60 mb-1">Workflow Stages</div>
            <div className="text-slate-900 dark:text-white">{project.workflow.length} stages</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-white/60 mb-1">Assignments</div>
            <div className="text-slate-900 dark:text-white">{project.assignments.length} assignments</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-white/60 mb-1">Success Indicators</div>
            <div className="text-slate-900 dark:text-white">{project.indicators.length} indicators</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-white/60 mb-1">Timeline</div>
            <div className="text-slate-900 dark:text-white">
              {Math.ceil((new Date(project.details.expectedEndDate).getTime() - new Date(project.details.expectedStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Activation Warning */}
      {allComplete ? (
        <GlassCard className="p-6 bg-green-500/10 border-green-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-green-500 mb-1">Ready to Activate</div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                All setup steps completed. Click "Activate Project" to start the project execution.
              </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-yellow-500 mb-1">Setup Incomplete</div>
              <div className="text-sm text-slate-600 dark:text-white/60">
                Please complete all setup steps before activating the project.
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          onClick={onActivate}
          disabled={!allComplete}
          size="lg"
          className="flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Activate Project
        </Button>
      </div>
    </div>
  );
}