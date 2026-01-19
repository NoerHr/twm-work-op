import { useState } from 'react';
import { X, ChevronRight, Check, BookOpen, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getWorkflowGuide } from '../../utils/createCompleteWorkflowDemo';

interface WorkflowGuideModalProps {
  onClose: () => void;
  onAddDemo: () => void;
}

export function WorkflowGuideModal({ onClose, onAddDemo }: WorkflowGuideModalProps) {
  const guide = getWorkflowGuide();
  const [selectedPhase, setSelectedPhase] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] m-4 overflow-hidden"
      >
        <GlassCard className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-slate-900 dark:text-white mb-1">{guide.title}</h2>
                  <p className="text-slate-600 dark:text-white/60">{guide.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Phase Navigation */}
            <div className="w-64 border-r border-slate-200 dark:border-white/10 p-4 overflow-y-auto">
              <div className="space-y-2">
                {guide.phases.map((phase, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhase(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedPhase === index
                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedPhase === index
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`font-medium ${
                          selectedPhase === index
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-white/60'
                        }`}
                      >
                        Phase {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-white/60 ml-11">
                      {phase.phase.split(': ')[1]}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 ml-11 mt-1">
                      {phase.role}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Phase Details */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPhase}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {guide.phases[selectedPhase] && (
                    <>
                      <div className="mb-6">
                        <Badge variant="outline" className="mb-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                          {guide.phases[selectedPhase].phase}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                          <span>Role:</span>
                          <Badge variant="secondary">{guide.phases[selectedPhase].role}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {guide.phases[selectedPhase].steps.map((step, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="p-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500/30 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-slate-900 dark:text-white mb-2">{step.title}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start gap-2">
                                    <PlayCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-slate-600 dark:text-white/60">Action: </span>
                                      <span className="text-slate-900 dark:text-white">{step.action}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-slate-600 dark:text-white/60">Detail: </span>
                                      <span className="text-slate-900 dark:text-white">{step.detail}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPhase(Math.max(0, selectedPhase - 1))}
                          disabled={selectedPhase === 0}
                        >
                          Previous Phase
                        </Button>
                        {selectedPhase < guide.phases.length - 1 ? (
                          <Button
                            onClick={() => setSelectedPhase(selectedPhase + 1)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600"
                          >
                            Next Phase
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              onAddDemo();
                              onClose();
                            }}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600"
                          >
                            Add Demo Project
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Key Features Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <h4 className="text-sm text-slate-900 dark:text-white mb-3">Key Features:</h4>
            <div className="grid grid-cols-2 gap-3">
              {guide.keyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-white/60"
                >
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}