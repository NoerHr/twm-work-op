import { useState } from 'react';
import { Zap, Clock, User, Users, Calendar } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import type { TaskTrigger } from '../../../types/assignment';

interface TriggerPillarProps {
  trigger: TaskTrigger;
  onChange: (trigger: TaskTrigger) => void;
}

export function TriggerPillar({ trigger, onChange }: TriggerPillarProps) {
  const [contributorSearch, setContributorSearch] = useState('');

  // Mock contributors
  const mockContributors = [
    { id: 'cont-1', name: 'Alice Chen', role: 'Developer' },
    { id: 'cont-2', name: 'Bob Smith', role: 'Designer' },
    { id: 'cont-3', name: 'Carol Lee', role: 'QA Engineer' },
    { id: 'cont-4', name: 'David Kim', role: 'Developer' }
  ];

  const handleAddContributor = (contributorId: string) => {
    const currentIds = trigger.assignedTo.contributorIds || [];
    if (!currentIds.includes(contributorId)) {
      onChange({
        ...trigger,
        assignedTo: {
          ...trigger.assignedTo,
          type: 'specific',
          contributorIds: [...currentIds, contributorId]
        }
      });
    }
  };

  const handleRemoveContributor = (contributorId: string) => {
    onChange({
      ...trigger,
      assignedTo: {
        ...trigger.assignedTo,
        contributorIds: (trigger.assignedTo.contributorIds || []).filter(id => id !== contributorId)
      }
    });
  };

  const selectedContributors = mockContributors.filter(c => 
    trigger.assignedTo.contributorIds?.includes(c.id)
  );

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
        <p className="text-sm text-slate-600 dark:text-white/60">
          <strong className="text-blue-600 dark:text-blue-400">Trigger Pillar</strong> defines <strong>when</strong> the task becomes active and <strong>who</strong> can execute it. Configure activation logic and assignment strategy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: Activation Logic */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="text-slate-900 dark:text-white">Activation Logic</h3>
          </div>

          <GlassCard className="p-4">
            <label className="block text-sm text-slate-900 dark:text-white mb-3">
              Trigger Type
            </label>
            
            <div className="space-y-2">
              {/* Manual Trigger */}
              <button
                onClick={() => onChange({ ...trigger, type: 'manual' })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  trigger.type === 'manual'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-slate-900 dark:text-white">
                      Manual
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      Contributor starts manually
                    </div>
                  </div>
                </div>
              </button>

              {/* Scheduled Trigger */}
              <button
                onClick={() => onChange({ 
                  ...trigger, 
                  type: 'scheduled',
                  schedule: {
                    frequency: 'once',
                    startDate: new Date().toISOString().split('T')[0]
                  }
                })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  trigger.type === 'scheduled'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-slate-900 dark:text-white">
                      Scheduled
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      Auto-start at specific time
                    </div>
                  </div>
                </div>
              </button>

              {/* Event-based Trigger */}
              <button
                onClick={() => onChange({ ...trigger, type: 'event' })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  trigger.type === 'event'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-slate-900 dark:text-white">
                      Event-based
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      Triggered by system events
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </GlassCard>

          {/* Schedule Configuration (if scheduled) */}
          {trigger.type === 'scheduled' && (
            <GlassCard className="p-4">
              <h4 className="text-sm text-slate-900 dark:text-white mb-3">
                Schedule Configuration
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                    Frequency
                  </label>
                  <select
                    value={trigger.schedule?.frequency || 'once'}
                    onChange={(e) => onChange({
                      ...trigger,
                      schedule: {
                        ...trigger.schedule!,
                        frequency: e.target.value as 'once' | 'daily' | 'weekly' | 'monthly'
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={trigger.schedule?.startDate || ''}
                    onChange={(e) => onChange({
                      ...trigger,
                      schedule: {
                        ...trigger.schedule!,
                        startDate: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                    Time (Optional)
                  </label>
                  <Input
                    type="time"
                    value={trigger.schedule?.time || ''}
                    onChange={(e) => onChange({
                      ...trigger,
                      schedule: {
                        ...trigger.schedule!,
                        time: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Event Configuration (if event) */}
          {trigger.type === 'event' && (
            <GlassCard className="p-4">
              <h4 className="text-sm text-slate-900 dark:text-white mb-3">
                Event Configuration
              </h4>
              
              <div>
                <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">
                  Event Source
                </label>
                <Input
                  type="text"
                  value={trigger.eventSource || ''}
                  onChange={(e) => onChange({
                    ...trigger,
                    eventSource: e.target.value
                  })}
                  placeholder="e.g., task-completed, indicator-updated"
                />
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Assignment Strategy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-slate-900 dark:text-white">Assignment Strategy</h3>
          </div>

          <GlassCard className="p-4">
            <label className="block text-sm text-slate-900 dark:text-white mb-3">
              Assign To
            </label>

            <div className="space-y-2 mb-4">
              {/* Specific Contributors */}
              <button
                onClick={() => onChange({
                  ...trigger,
                  assignedTo: { type: 'specific', contributorIds: [] }
                })}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  trigger.assignedTo.type === 'specific'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-900 dark:text-white">
                    Specific Contributors
                  </span>
                </div>
              </button>

              {/* Role-based */}
              <button
                onClick={() => onChange({
                  ...trigger,
                  assignedTo: { type: 'role' }
                })}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  trigger.assignedTo.type === 'role'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-900 dark:text-white">
                    By Role
                  </span>
                </div>
              </button>

              {/* Pool */}
              <button
                onClick={() => onChange({
                  ...trigger,
                  assignedTo: { type: 'pool' }
                })}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  trigger.assignedTo.type === 'pool'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-900 dark:text-white">
                    Task Pool (First Available)
                  </span>
                </div>
              </button>
            </div>
          </GlassCard>

          {/* Specific Contributors Selection */}
          {trigger.assignedTo.type === 'specific' && (
            <GlassCard className="p-4">
              <h4 className="text-sm text-slate-900 dark:text-white mb-3">
                Select Contributors
              </h4>

              {/* Search */}
              <Input
                type="text"
                value={contributorSearch}
                onChange={(e) => setContributorSearch(e.target.value)}
                placeholder="Search contributors..."
                className="mb-3"
              />

              {/* Selected Contributors */}
              {selectedContributors.length > 0 && (
                <div className="mb-3 space-y-2">
                  <div className="text-xs text-slate-600 dark:text-white/60 mb-2">
                    Selected ({selectedContributors.length})
                  </div>
                  {selectedContributors.map(contributor => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg"
                    >
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {contributor.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          {contributor.role}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveContributor(contributor.id)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Contributors */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="text-xs text-slate-600 dark:text-white/60 mb-2">
                  Available Contributors
                </div>
                {mockContributors
                  .filter(c => 
                    !trigger.assignedTo.contributorIds?.includes(c.id) &&
                    c.name.toLowerCase().includes(contributorSearch.toLowerCase())
                  )
                  .map(contributor => (
                    <button
                      key={contributor.id}
                      onClick={() => handleAddContributor(contributor.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left"
                    >
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {contributor.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          {contributor.role}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Add
                      </Badge>
                    </button>
                  ))}
              </div>
            </GlassCard>
          )}

          {/* Role Selection */}
          {trigger.assignedTo.type === 'role' && (
            <GlassCard className="p-4">
              <h4 className="text-sm text-slate-900 dark:text-white mb-3">
                Select Role
              </h4>
              
              <select
                value={trigger.assignedTo.roleId || ''}
                onChange={(e) => onChange({
                  ...trigger,
                  assignedTo: {
                    ...trigger.assignedTo,
                    roleId: e.target.value
                  }
                })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
              >
                <option value="">Select a role...</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="qa">QA Engineer</option>
                <option value="analyst">Analyst</option>
              </select>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
