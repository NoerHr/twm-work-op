import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Input } from '../../ui/Input';

interface DetailsTabProps {
  data: {
    name: string;
    description: string;
    category: string;
    icon: string;
  };
  onChange: (data: any) => void;
}

const CATEGORIES = [
  { value: 'operations', label: 'Operations', icon: '⚙️' },
  { value: 'hr', label: 'Human Resources', icon: '👥' },
  { value: 'digital', label: 'Digital Assets', icon: '💻' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'facilities', label: 'Facilities', icon: '🏢' },
  { value: 'financial', label: 'Financial', icon: '💰' }
];

const ICON_OPTIONS = ['📦', '🔧', '💼', '🏢', '💻', '📊', '🚀', '⚡', '🎯', '💡', '🔨', '📱', '🎨', '📈', '🔐', '🌟'];

export function DetailsTab({ data, onChange }: DetailsTabProps) {
  const [autoId, setAutoId] = useState(true);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleNameChange = (name: string) => {
    updateField('name', name);
    if (autoId) {
      // Auto-generate ID from name
      const id = generateId(name);
      // In real implementation, this would update the resource type ID
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-slate-900 dark:text-white mb-6">Basic Information</h2>

        <div className="space-y-6">
          {/* Resource Name */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Resource Type Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Equipment Inventory, Project Resources"
              className="w-full"
            />
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
              Choose a clear, descriptive name for this resource type
            </p>
          </div>

          {/* Auto-generated ID */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Internal ID (Auto-generated)
            </label>
            <div className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <code className="text-sm text-purple-500">
                {data.name ? generateId(data.name) : 'resource_type_id'}
              </code>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
              This ID will be used in the database and API
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
              placeholder="Describe the purpose and use cases for this resource type..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => updateField('category', cat.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${data.category === cat.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-purple-500/50'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm text-slate-900 dark:text-white">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-white/60 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => updateField('icon', icon)}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all
                    ${data.icon === icon
                      ? 'bg-purple-500/20 ring-2 ring-purple-500'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Live Preview */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-slate-900 dark:text-white">Preview</h3>
        </div>
        <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{data.icon}</div>
            <div className="flex-1">
              <h4 className="text-slate-900 dark:text-white mb-1">
                {data.name || 'Resource Type Name'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-white/60 mb-2">
                {data.description || 'Description will appear here...'}
              </p>
              <div className="text-xs text-slate-600 dark:text-white/60">
                Category: {CATEGORIES.find(c => c.value === data.category)?.label || 'Not selected'}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
