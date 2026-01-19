import { useState } from 'react';
import { Calendar, Paperclip, X, AlertCircle, UserPlus, Users } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { ProjectDetails, ProjectPriority } from '../../../types/project';

interface DetailsTabProps {
  data: ProjectDetails;
  errors: Record<string, string>;
  onChange: (data: ProjectDetails) => void;
  readOnly?: boolean;
}

// Mock PM collaborators
const MOCK_PMS = [
  { id: 'pm-1', name: 'Dian Pratama', email: 'dian@swiz.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dian' },
  { id: 'pm-2', name: 'Sarah Chen', email: 'sarah@swiz.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'pm-3', name: 'Mike Johnson', email: 'mike@swiz.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
];

export function DetailsTab({ data, errors, onChange, readOnly }: DetailsTabProps) {
  const [attachments, setAttachments] = useState(data.attachments || []);
  const [showCollaboratorSelector, setShowCollaboratorSelector] = useState(false);
  const [collaborators, setCollaborators] = useState<typeof MOCK_PMS>([]);

  const updateField = (field: keyof ProjectDetails, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !data.tags?.includes(tag)) {
      updateField('tags', [...(data.tags || []), tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateField('tags', data.tags?.filter(t => t !== tag) || []);
  };

  const calculateDuration = () => {
    const start = new Date(data.expectedStartDate);
    const end = new Date(data.expectedEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span>Project Details</span>
          {errors && Object.keys(errors).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Validation errors
            </Badge>
          )}
        </h2>

        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter a unique project name..."
              error={errors.name}
              className="w-full"
              readOnly={readOnly}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
              Choose a clear, descriptive name that stakeholders will recognize
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the project scope, objectives, and deliverables..."
              rows={6}
              className={`
                w-full px-4 py-3 rounded-lg
                bg-slate-100 dark:bg-white/5
                border ${errors.description ? 'border-red-500' : 'border-slate-200 dark:border-white/10'}
                text-slate-900 dark:text-white
                placeholder:text-slate-500 dark:placeholder:text-white/40
                focus:outline-none focus:ring-2 focus:ring-purple-500
              `}
              readOnly={readOnly}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Expected Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={data.expectedStartDate instanceof Date 
                    ? data.expectedStartDate.toISOString().split('T')[0] 
                    : data.expectedStartDate}
                  onChange={(e) => updateField('expectedStartDate', new Date(e.target.value))}
                  error={errors.startDate}
                  className="w-full"
                  readOnly={readOnly}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Expected End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={data.expectedEndDate instanceof Date 
                    ? data.expectedEndDate.toISOString().split('T')[0] 
                    : data.expectedEndDate}
                  onChange={(e) => updateField('expectedEndDate', new Date(e.target.value))}
                  error={errors.endDate}
                  className="w-full"
                  readOnly={readOnly}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40 pointer-events-none" />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
              )}
            </div>

            {/* Auto-calculated Duration */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
                Duration (Auto-calculated)
              </label>
              <div className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="text-2xl text-purple-500">{calculateDuration()}</div>
                <div className="text-xs text-slate-600 dark:text-white/60">days</div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high', 'critical'] as ProjectPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => updateField('priority', priority)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all capitalize
                    ${data.priority === priority
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:border-purple-500/50'
                    }
                  `}
                  disabled={readOnly}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {data.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400"
                    disabled={readOnly}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      handleAddTag(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="flex-1"
                readOnly={readOnly}
              />
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
              Press Enter to add tags (e.g., "strategic", "customer-facing", "innovation")
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg p-6 text-center">
              <Paperclip className="w-8 h-8 text-slate-400 dark:text-white/40 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-white/60 mb-2">
                Drag & drop files here or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-slate-600 dark:text-white/60" />
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white">{file.name}</div>
                        <div className="text-xs text-slate-600 dark:text-white/60">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button className="text-red-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Governance Mapping Check */}
      <GlassCard className="p-6 bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-400 mb-1">Governance Mapping</h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Your project will be routed to your assigned BOD supervisor for approval. 
              Ensure you have a valid governance mapping configured in your user settings.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Invite Collaborators */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invite Collaborators
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Invite other PMs to co-edit this draft with you
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCollaboratorSelector(!showCollaboratorSelector)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite PM
          </Button>
        </div>

        {/* Collaborator Selector */}
        {showCollaboratorSelector && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="space-y-2">
              {MOCK_PMS.filter(pm => !collaborators.find(c => c.id === pm.id)).map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setCollaborators([...collaborators, pm]);
                    setShowCollaboratorSelector(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <img
                    src={pm.avatar}
                    alt={pm.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-slate-900 dark:text-white">
                      {pm.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {pm.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collaborator List */}
        {collaborators.length > 0 ? (
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-10 h-10 rounded-full ring-2 ring-purple-500/30"
                  />
                  <div>
                    <div className="text-sm text-slate-900 dark:text-white">
                      {collaborator.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">
                      {collaborator.email} • Can edit
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCollaborators(collaborators.filter(c => c.id !== collaborator.id))}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg">
            <Users className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-white/60">
              No collaborators yet. Invite other PMs to work on this draft together.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}