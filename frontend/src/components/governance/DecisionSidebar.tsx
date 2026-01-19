import { useState } from 'react';
import { CheckCircle2, XCircle, X, MessageSquare, AlertCircle, Lock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import type { ReviewRequest, Vote, ChecklistItem } from '../../types/governance';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface DecisionSidebarProps {
  review: ReviewRequest;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onVote: (vote: Vote) => void;
  onClose: () => void;
}

export function DecisionSidebar({ review, currentUser, onVote, onClose }: DecisionSidebarProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(review.checklist);
  const [comment, setComment] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const hasUserVoted = review.votes.some(v => v.bodId === currentUser.id);
  const hasRejection = review.votes.some(v => v.decision === 'reject');
  const approvedCount = review.votes.filter(v => v.decision === 'approve').length;
  const isFullyApproved = approvedCount === review.requiredVotes;

  const handleChecklistToggle = (itemId: string) => {
    setChecklist(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleApprove = () => {
    if (hasUserVoted) {
      toast.error('You have already voted on this review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please add a comment explaining your decision');
      return;
    }

    const vote: Vote = {
      bodId: currentUser.id,
      bodName: currentUser.name,
      bodAvatar: currentUser.avatar,
      decision: 'approve',
      comments: comment,
      timestamp: new Date()
    };

    onVote(vote);
    toast.success('Vote submitted successfully');
  };

  const handleReject = () => {
    setShowRejectionModal(true);
  };

  const handleDismiss = () => {
    if (hasUserVoted) {
      toast.error('You have already voted on this review');
      return;
    }

    if (confirm('Are you sure you want to dismiss this review? This action cannot be undone.')) {
      const vote: Vote = {
        bodId: currentUser.id,
        bodName: currentUser.name,
        bodAvatar: currentUser.avatar,
        decision: 'dismiss',
        comments: comment || 'Review dismissed',
        timestamp: new Date()
      };

      onVote(vote);
      toast.success('Review dismissed');
    }
  };

  return (
    <>
      <div className="h-full flex flex-col glass-surface border-l border-slate-200 dark:border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-900 dark:text-white font-semibold">
              Decision Matrix
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Required votes: {review.requiredVotes}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Consensus Tracker */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Consensus Status
            </h4>
            <div className="space-y-2">
              {Array.from({ length: review.requiredVotes }).map((_, index) => {
                const vote = review.votes[index];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {vote ? (
                      <>
                        <img
                          src={vote.bodAvatar}
                          alt={vote.bodName}
                          className="w-10 h-10 rounded-full border-2 border-slate-900 dark:border-slate-800"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {vote.bodName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(vote.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${
                          vote.decision === 'approve' ? 'bg-green-500/10' :
                          vote.decision === 'reject' ? 'bg-red-500/10' :
                          'bg-slate-500/10'
                        }`}>
                          {vote.decision === 'approve' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : vote.decision === 'reject' ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-800" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Pending
                          </p>
                          <p className="text-xs text-slate-500">
                            Awaiting decision
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-500/10">
                          <AlertCircle className="w-5 h-5 text-slate-400" />
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Rejection Warning */}
          {hasRejection && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900 dark:text-red-200">
                  <p className="font-semibold mb-1">Draft Blocked</p>
                  <p className="text-xs leading-relaxed">
                    One or more board members have rejected this draft. All approvals have been reset.
                    The PM must revise and resubmit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Review Checklist
            </h4>
            <div className="space-y-2">
              {checklist.map(item => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleChecklistToggle(item.id)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    disabled={hasUserVoted}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white">
                      {item.text}
                    </p>
                    {item.category && (
                      <p className="text-xs text-slate-500 mt-1">
                        Category: {item.category}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Discussion Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Discussion
            </h4>
            <div className="space-y-3">
              {review.votes.map(vote => (
                <div
                  key={vote.bodId}
                  className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={vote.bodAvatar}
                      alt={vote.bodName}
                      className="w-6 h-6 rounded-full"
                    />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {vote.bodName}
                    </p>
                    <span className="text-xs text-slate-500">
                      {new Date(vote.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {vote.comments}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          {!hasUserVoted && (
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Your Comments *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain your decision..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Vote Section */}
        {!hasUserVoted && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleApprove}
              disabled={hasRejection}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleReject}
              className="w-full border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 font-semibold"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Request Changes
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleDismiss}
              className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        )}

        {hasUserVoted && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                  Your vote has been recorded
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <RejectionModal
            review={review}
            currentUser={currentUser}
            comment={comment}
            onSubmit={(vote) => {
              onVote(vote);
              setShowRejectionModal(false);
              toast.success('Rejection submitted - draft returned to PM');
            }}
            onClose={() => setShowRejectionModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Rejection Modal Component
interface RejectionModalProps {
  review: ReviewRequest;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  comment: string;
  onSubmit: (vote: Vote) => void;
  onClose: () => void;
}

function RejectionModal({ review, currentUser, comment, onSubmit, onClose }: RejectionModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  const categories = [
    { id: 'vision', label: 'Vision & Strategy', icon: '🎯' },
    { id: 'scope', label: 'Scope & Deliverables', icon: '📋' },
    { id: 'budget', label: 'Budget & Resources', icon: '💰' },
    { id: 'team', label: 'Team Composition', icon: '👥' },
    { id: 'workflow', label: 'Workflow & Timeline', icon: '🔄' },
    { id: 'indicators', label: 'Success Metrics', icon: '📊' }
  ];

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category requiring changes');
      return;
    }

    if (!instructions.trim()) {
      toast.error('Please provide specific instructions for the PM');
      return;
    }

    const vote: Vote = {
      bodId: currentUser.id,
      bodName: currentUser.name,
      bodAvatar: currentUser.avatar,
      decision: 'reject',
      comments: `${comment}\n\nCategories requiring changes: ${selectedCategories.join(', ')}\n\nInstructions: ${instructions}`,
      timestamp: new Date()
    };

    onSubmit(vote);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              Return Draft for Revision
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {review.projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900 dark:text-yellow-200">
              <p className="font-semibold mb-1">Impact Warning</p>
              <p className="leading-relaxed">
                Rejecting this draft will reset all existing approvals. The PM will need to revise
                and resubmit for a fresh review cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
            Select areas requiring changes
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => (
              <label
                key={category.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'bg-yellow-500/20 border-2 border-yellow-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleToggleCategory(category.id)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
            Specific instructions for the PM *
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Provide detailed feedback on what needs to be changed..."
            rows={6}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
          >
            Submit Rejection
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}