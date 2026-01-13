import { useState, useEffect } from 'react';
import { X, ChevronRight, SkipForward, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import type { TaskInstance, BatchQueueItem } from '../../types/task';
import { useToast } from '../../hooks/useToast';

interface BatchProcessingModalProps {
  task: TaskInstance;
  onClose: () => void;
  onComplete: () => void;
}

type BatchState = 'intro' | 'processing' | 'complete';

export function BatchProcessingModal({ task, onClose, onComplete }: BatchProcessingModalProps) {
  const [batchState, setBatchState] = useState<BatchState>('intro');
  const [processedCount, setProcessedCount] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(300); // 5 minutes in seconds
  const [formData, setFormData] = useState<Record<string, any>>({});
  const toast = useToast();

  const minRequired = 10;
  const totalItems = task.batchSize || 50;

  // Mock queue items
  const queueItems: BatchQueueItem[] = Array.from({ length: totalItems }, (_, i) => ({
    id: `item-${i + 1}`,
    batchId: task.id,
    itemData: {
      orderId: `#${1001 + i}`,
      customer: `Customer ${i + 1}`,
      amount: Math.floor(Math.random() * 1000) + 100,
      status: 'pending'
    },
    status: 'available',
    position: i
  }));

  // Lock timer countdown
  useEffect(() => {
    if (batchState !== 'processing') return;

    const interval = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          toast.warning('Lock Expired', 'Your lock has expired. Item released.');
          handleSkip();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [batchState]);

  const handleBegin = () => {
    setBatchState('processing');
    toast.info('Batch Started', 'First item locked for processing.');
  };

  const handleSubmitNext = () => {
    // Validate form
    if (!formData.status) {
      toast.error('Validation Error', 'Please complete all required fields.');
      return;
    }

    // Submit current item
    setProcessedCount((prev) => prev + 1);
    setCurrentItemIndex((prev) => prev + 1);
    setFormData({});
    setLockTimeRemaining(300);

    toast.success('Item Processed', 'Moving to next item...');

    // Check if we reached min required or completed all
    if (processedCount + 1 >= minRequired || currentItemIndex + 1 >= totalItems) {
      if (processedCount + 1 >= totalItems) {
        setBatchState('complete');
        toast.success('Batch Complete', 'All items have been processed!');
      }
    }
  };

  const handleSkip = () => {
    setCurrentItemIndex((prev) => prev + 1);
    setFormData({});
    setLockTimeRemaining(300);
    toast.info('Item Skipped', 'Lock released. Moving to next item.');
  };

  const handleExitBatch = () => {
    if (processedCount < minRequired) {
      toast.warning(
        'Minimum Not Met',
        `You've processed ${processedCount}/${minRequired} items. Progress saved.`
      );
    } else {
      toast.success('Progress Saved', `You've processed ${processedCount} items.`);
    }
    onComplete();
  };

  const handleExtendLock = () => {
    setLockTimeRemaining((prev) => prev + 300);
    toast.success('Lock Extended', 'Added 5 more minutes.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentItem = queueItems[currentItemIndex];
  const progressPercentage = (processedCount / minRequired) * 100;

  return (
    <AnimatePresence mode="wait">
      {batchState === 'intro' && (
        <IntroScreen
          key="intro"
          task={task}
          totalItems={totalItems}
          minRequired={minRequired}
          onBegin={handleBegin}
          onClose={onClose}
        />
      )}

      {batchState === 'processing' && (
        <ProcessingScreen
          key="processing"
          task={task}
          currentItem={currentItem}
          processedCount={processedCount}
          minRequired={minRequired}
          totalItems={totalItems}
          lockTimeRemaining={lockTimeRemaining}
          formData={formData}
          setFormData={setFormData}
          onSubmitNext={handleSubmitNext}
          onSkip={handleSkip}
          onExtendLock={handleExtendLock}
          onExit={handleExitBatch}
          progressPercentage={progressPercentage}
        />
      )}

      {batchState === 'complete' && (
        <CompleteScreen
          key="complete"
          processedCount={processedCount}
          totalItems={totalItems}
          onClose={onComplete}
        />
      )}
    </AnimatePresence>
  );
}

// Intro Screen
interface IntroScreenProps {
  task: TaskInstance;
  totalItems: number;
  minRequired: number;
  onBegin: () => void;
  onClose: () => void;
}

function IntroScreen({ task, totalItems, minRequired, onBegin, onClose }: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <GlassCard variant="frosted" className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Info className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white mb-2">
                {task.workflowName} - Batch Processing
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                You're about to process a batch of items. Review the details below before starting.
              </p>
            </div>
          </div>

          {/* Batch Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Items Available
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {totalItems}
              </div>
            </div>

            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                Minimum Required
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {minRequired}
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-6">
            <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
              Processing Rules
            </h4>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
              <li>• Each item will be locked for 5 minutes</li>
              <li>• You can extend the lock if needed</li>
              <li>• Skipped items will be released back to the queue</li>
              <li>• You can exit after processing {minRequired} items</li>
            </ul>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <Clock className="w-4 h-4" />
            <span>Estimated time: ~{Math.ceil((minRequired * 3) / 60)} minutes (3 min/item avg)</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" onClick={onBegin}>
              Begin Processing
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// Processing Screen
interface ProcessingScreenProps {
  task: TaskInstance;
  currentItem: BatchQueueItem;
  processedCount: number;
  minRequired: number;
  totalItems: number;
  lockTimeRemaining: number;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  onSubmitNext: () => void;
  onSkip: () => void;
  onExtendLock: () => void;
  onExit: () => void;
  progressPercentage: number;
}

function ProcessingScreen({
  currentItem,
  processedCount,
  minRequired,
  totalItems,
  lockTimeRemaining,
  formData,
  setFormData,
  onSubmitNext,
  onSkip,
  onExtendLock,
  onExit,
  progressPercentage
}: ProcessingScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canExit = processedCount >= minRequired;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header with Progress */}
      <div className="glass-surface border-b border-slate-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Processing Item {processedCount + 1} of {totalItems}
            </div>
            <div className="text-slate-900 dark:text-white font-semibold">
              {processedCount} / {minRequired} Required Complete
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Lock Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              lockTimeRemaining < 60
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse'
                : lockTimeRemaining < 180
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(lockTimeRemaining)}</span>
            </div>

            {lockTimeRemaining < 120 && (
              <Button size="sm" variant="secondary" onClick={onExtendLock}>
                +5 min
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Item Context */}
        <div className="w-1/3 p-6 overflow-y-auto border-r border-slate-200 dark:border-white/10">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">
            Item Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                Order ID
              </label>
              <div className="text-slate-900 dark:text-white font-mono mt-1">
                {currentItem?.itemData.orderId}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                Customer
              </label>
              <div className="text-slate-900 dark:text-white mt-1">
                {currentItem?.itemData.customer}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                Amount
              </label>
              <div className="text-slate-900 dark:text-white font-semibold mt-1">
                ${currentItem?.itemData.amount}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Processing Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-6">
            Process Item
          </h3>

          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Verification Status *
              </label>
              <select
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="">Select status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                rows={3}
                placeholder="Add any notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="glass-surface border-t border-slate-200 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={onExit}
            disabled={!canExit}
          >
            {canExit ? 'Exit Batch' : `Exit (Need ${minRequired - processedCount} more)`}
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onSkip}>
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>

            <Button variant="primary" size="lg" onClick={onSubmitNext}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit & Next
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Complete Screen
interface CompleteScreenProps {
  processedCount: number;
  totalItems: number;
  onClose: () => void;
}

function CompleteScreen({ processedCount, totalItems, onClose }: CompleteScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard variant="frosted" className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="text-slate-900 dark:text-white mb-2">
            Batch Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You've successfully processed {processedCount} of {totalItems} items.
          </p>

          <Button variant="primary" onClick={onClose} className="w-full">
            Return to Tasks
          </Button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}