import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, Calendar, Users, Target, GitBranch, FileText, Send, MessageSquare, User, Check } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { Project } from '../../../types/project';

interface ReviewDiscussTabProps {
  project: Partial<Project>;
  onChange: (project: Partial<Project>) => void;
  isApproved?: boolean; // ✅ NEW: Track if project is approved
}

type TabType = 'review' | 'discuss';

interface ChatMessage {
  id: string;
  author: string;
  role: string;
  avatar: string;
  message: string;
  timestamp: Date;
  mentions?: string[];
  isCurrentUser?: boolean;
}

export function ReviewDiscussTab({ project, onChange, isApproved = false }: ReviewDiscussTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>(isApproved ? 'discuss' : 'review');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    passed: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'John Doe',
      role: 'Project Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      message: 'I\'ve reviewed the workflow structure and it looks solid. The gate configurations align with our governance requirements.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isCurrentUser: false
    },
    {
      id: '2',
      author: 'Sarah Chen',
      role: 'Team Lead',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      message: '@John Doe - Should we add more indicators for Stage 2? I think we need better tracking for that phase.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isCurrentUser: false
    },
    {
      id: '3',
      author: 'You',
      role: 'Project Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      message: 'Good point @Sarah Chen! I\'ll add two more indicators for Stage 2 tracking.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isCurrentUser: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Defensive: Ensure arrays are valid
  const validWorkflow = Array.isArray(project.workflow) ? project.workflow : [];
  const validAssignments = Array.isArray(project.assignments) ? project.assignments : [];
  const validIndicators = Array.isArray(project.indicators) ? project.indicators : [];

  const runValidation = () => {
    setIsValidating(true);
    
    setTimeout(() => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check details
      if (!project.details?.name) errors.push('Project name is required');
      if (!project.details?.description) errors.push('Description is required');
      if (!project.details?.expectedStartDate) errors.push('Start date is required');
      if (!project.details?.expectedEndDate) errors.push('End date is required');

      // Check workflow
      if (validWorkflow.length === 0) {
        errors.push('At least one stage is required');
      } else {
        const stagesWithoutGates = validWorkflow.filter(s => !s.gate);
        if (stagesWithoutGates.length > 0) {
          errors.push(`${stagesWithoutGates.length} stage(s) missing review gates`);
        }
      }

      // Warnings
      if (validAssignments.length === 0) {
        warnings.push('No assignments configured - you can add them later');
      }

      if (validIndicators.length === 0) {
        warnings.push('No indicators configured - you can add them later');
      }

      setValidationResults({
        passed: errors.length === 0,
        errors,
        warnings
      });
      setIsValidating(false);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!validationResults?.passed) {
      runValidation();
      return;
    }

    console.log('Submitting project for governance review:', project);
    alert('Project submitted for BOD review! 🎉');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      author: 'You',
      role: 'Project Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      message: newMessage.trim(),
      timestamp: new Date(),
      isCurrentUser: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Auto-scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-run validation on mount
  useEffect(() => {
    if (!isApproved) {
      runValidation();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-slate-900 dark:text-white mb-2">
              {isApproved ? 'Team Discussion' : 'Review & Discuss'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {isApproved 
                ? 'Project approved! Continue discussing with your team.'
                : 'Review your project configuration and discuss with your team before submitting to BOD for approval.'
              }
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Conditional Tab Switcher - Only show if NOT approved */}
      {!isApproved && (
        <GlassCard className="p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-purple-500/20 text-purple-500'
                  : 'text-slate-600 dark:text-white/60 hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Review</span>
            </button>
            <button
              onClick={() => setActiveTab('discuss')}
              className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'discuss'
                  ? 'bg-purple-500/20 text-purple-500'
                  : 'text-slate-600 dark:text-white/60 hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Discuss</span>
              {messages.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {messages.length}
                </Badge>
              )}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Review Tab Content - Only show if NOT approved */}
      {!isApproved && activeTab === 'review' && (
        <div className="space-y-6">
          {/* Validation Status */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white">Validation Status</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={runValidation}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Re-validate'}
              </Button>
            </div>

            {validationResults && (
              <div className="space-y-3">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  validationResults.passed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    {validationResults.passed ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <div className="text-green-500">Ready to Submit</div>
                          <div className="text-sm text-slate-600 dark:text-white/60">
                            All required fields are complete
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <div>
                          <div className="text-red-500">Action Required</div>
                          <div className="text-sm text-slate-600 dark:text-white/60">
                            Please fix the errors below
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Errors */}
                {validationResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm text-slate-900 dark:text-white">Errors</h4>
                    {validationResults.errors.map((error, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {validationResults.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm text-slate-900 dark:text-white">Warnings</h4>
                    {validationResults.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Project Summary */}
          <GlassCard className="p-6">
            <h3 className="text-slate-900 dark:text-white mb-4">Project Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Name:</span>
                  <span className="text-slate-900 dark:text-white">{project.details?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Duration:</span>
                  <span className="text-slate-900 dark:text-white">
                    {project.details?.expectedStartDate && project.details?.expectedEndDate
                      ? `${new Date(project.details.expectedStartDate).toLocaleDateString()} - ${new Date(project.details.expectedEndDate).toLocaleDateString()}`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Team Size:</span>
                  <span className="text-slate-900 dark:text-white">{project.details?.teamSize || 'N/A'}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Stages:</span>
                  <span className="text-slate-900 dark:text-white">{validWorkflow.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Assignments:</span>
                  <span className="text-slate-900 dark:text-white">{validAssignments.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-white/60">Indicators:</span>
                  <span className="text-slate-900 dark:text-white">{validIndicators.length}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!validationResults?.passed}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Submit for BOD Review
            </Button>
          </div>
        </div>
      )}

      {/* Discuss Tab Content - Show always if approved, or when tab is selected */}
      {(isApproved || activeTab === 'discuss') && (
        <GlassCard className="p-6">
          <h3 className="text-slate-900 dark:text-white mb-4">Team Discussion</h3>

          {/* Chat Container - Fixed Height with Scroll */}
          <div className="space-y-4">
            {/* Messages Area - Fixed height container */}
            <div className="h-[500px] overflow-y-auto pr-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <img
                    src={msg.avatar}
                    alt={msg.author}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-900 dark:text-white">{msg.author}</span>
                      <span className="text-xs text-slate-500 dark:text-white/50">{formatTimestamp(msg.timestamp)}</span>
                    </div>

                    {/* Message Content */}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.isCurrentUser
                          ? 'bg-purple-500 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>

                    {/* Role Badge */}
                    <Badge variant="outline" className="text-xs mt-1">
                      {msg.role}
                    </Badge>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Use @ to mention)"
                  rows={2}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="self-end bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/50 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}