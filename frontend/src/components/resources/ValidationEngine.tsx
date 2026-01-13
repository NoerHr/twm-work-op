import { CheckCircle2, AlertCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { Field } from './FieldSchemaDesigner';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  phase: 'basic' | 'fields' | 'operations' | 'autogen' | 'crossref';
  severity: ValidationSeverity;
  message: string;
  details?: string;
  location?: string; // Deep link hint (e.g., "field:field-123" or "operation:op-456")
  canProceed: boolean; // false for blocking errors
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
  phasesCompleted: string[];
  timestamp: string;
}

interface ValidationEngineProps {
  basicInfo: {
    name: string;
    category: string;
    description: string;
  };
  fields: Field[];
  operations: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    logic?: string;
    fields?: string[];
  }>;
  onNavigate?: (location: string) => void; // Callback to jump to error location
}

export function ValidationEngine({ basicInfo, fields, operations, onNavigate }: ValidationEngineProps) {
  const result = performValidation({ basicInfo, fields, operations });

  const phaseInfo = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'fields', label: 'Field Integrity', icon: Info },
    { id: 'operations', label: 'Operation Logic', icon: Info },
    { id: 'autogen', label: 'Auto-Gen Patterns', icon: Info },
    { id: 'crossref', label: 'Cross-References', icon: Info }
  ];

  const issuesByPhase = result.issues.reduce((acc, issue) => {
    if (!acc[issue.phase]) acc[issue.phase] = [];
    acc[issue.phase].push(issue);
    return acc;
  }, {} as Record<string, ValidationIssue[]>);

  const blockingErrors = result.issues.filter(i => i.severity === 'error' && !i.canProceed);
  const warnings = result.issues.filter(i => i.severity === 'warning');
  const infos = result.issues.filter(i => i.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <GlassCard className={`p-6 ${result.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="flex items-center gap-4">
          {result.passed ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-500" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              {result.passed ? 'Validation Passed ✓' : 'Validation Failed'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {result.passed
                ? 'Resource Type is ready to publish'
                : `${blockingErrors.length} blocking error(s) must be fixed before publishing`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-white/40 mb-1">
              Last validated
            </div>
            <div className="text-sm text-slate-900 dark:text-white font-mono">
              {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-500">{blockingErrors.length}</div>
              <div className="text-xs text-slate-600 dark:text-white/60">Blocking Errors</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-500">{warnings.length}</div>
              <div className="text-xs text-slate-600 dark:text-white/60">Warnings</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-500">{infos.length}</div>
              <div className="text-xs text-slate-600 dark:text-white/60">Info</div>
            </div>
            <Info className="w-8 h-8 text-blue-500/30" />
          </div>
        </GlassCard>
      </div>

      {/* Phase Results */}
      <div className="space-y-3">
        {phaseInfo.map((phase) => {
          const phaseIssues = issuesByPhase[phase.id] || [];
          const phaseErrors = phaseIssues.filter(i => i.severity === 'error');
          const phaseWarnings = phaseIssues.filter(i => i.severity === 'warning');
          const phasePassed = phaseErrors.length === 0;

          return (
            <GlassCard key={phase.id} className={`p-4 ${phasePassed ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                {phasePassed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                  Phase {phaseInfo.indexOf(phase) + 1}: {phase.label}
                </h4>
                <div className="flex-1" />
                {phaseErrors.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {phaseErrors.length} error{phaseErrors.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {phaseWarnings.length > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {phaseWarnings.length} warning{phaseWarnings.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {phaseIssues.length > 0 && (
                <div className="space-y-2">
                  {phaseIssues.map((issue) => (
                    <ValidationIssueCard
                      key={issue.id}
                      issue={issue}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}

              {phaseIssues.length === 0 && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  All checks passed
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Action Recommendations */}
      {!result.passed && (
        <GlassCard className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                Next Steps
              </h4>
              <ul className="text-sm text-slate-700 dark:text-white/70 space-y-1 list-disc list-inside">
                {blockingErrors.length > 0 && (
                  <li>Fix {blockingErrors.length} blocking error{blockingErrors.length !== 1 ? 's' : ''} before publishing</li>
                )}
                {warnings.length > 0 && (
                  <li>Review {warnings.length} warning{warnings.length !== 1 ? 's' : ''} (optional but recommended)</li>
                )}
                <li>Click on any issue to jump to its location</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function ValidationIssueCard({ issue, onNavigate }: { issue: ValidationIssue; onNavigate?: (location: string) => void }) {
  const severityConfig = {
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${config.bg} ${config.border} ${issue.location && onNavigate ? 'cursor-pointer hover:border-purple-500' : ''}`}
      onClick={() => issue.location && onNavigate?.(issue.location)}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-900 dark:text-white mb-1">
            {issue.message}
          </p>
          {issue.details && (
            <p className="text-xs text-slate-600 dark:text-white/60">
              {issue.details}
            </p>
          )}
          {!issue.canProceed && (
            <Badge variant="destructive" className="text-xs mt-2">
              Blocking - Must fix
            </Badge>
          )}
        </div>
        {issue.location && onNavigate && (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
    </motion.div>
  );
}

// VALIDATION LOGIC
function performValidation({ basicInfo, fields, operations }: any): ValidationResult {
  const issues: ValidationIssue[] = [];
  let issueId = 1;

  // PHASE 1: BASIC INFO
  if (!basicInfo.name || basicInfo.name.trim().length === 0) {
    issues.push({
      id: `issue-${issueId++}`,
      phase: 'basic',
      severity: 'error',
      message: 'Resource Type name is required',
      details: 'Please provide a descriptive name for this resource type',
      location: 'tab:basic',
      canProceed: false
    });
  }

  if (basicInfo.name && basicInfo.name.length < 3) {
    issues.push({
      id: `issue-${issueId++}`,
      phase: 'basic',
      severity: 'warning',
      message: 'Resource Type name is too short',
      details: 'Name should be at least 3 characters for clarity',
      canProceed: true
    });
  }

  if (!basicInfo.category) {
    issues.push({
      id: `issue-${issueId++}`,
      phase: 'basic',
      severity: 'error',
      message: 'Category is required',
      details: 'Please select a category for organizational purposes',
      location: 'tab:basic',
      canProceed: false
    });
  }

  if (!basicInfo.description || basicInfo.description.trim().length === 0) {
    issues.push({
      id: `issue-${issueId++}`,
      phase: 'basic',
      severity: 'warning',
      message: 'Description is missing',
      details: 'Adding a description helps users understand the purpose of this resource type',
      canProceed: true
    });
  }

  // PHASE 2: FIELD INTEGRITY
  if (fields.length === 0) {
    issues.push({
      id: `issue-${issueId++}`,
      phase: 'fields',
      severity: 'error',
      message: 'No fields defined',
      details: 'Resource Type must have at least one field',
      location: 'tab:fields',
      canProceed: false
    });
  }

  const internalNames = new Set<string>();
  const displayNames = new Set<string>();

  fields.forEach((field: Field) => {
    // Check for empty names
    if (!field.name || field.name.trim().length === 0) {
      issues.push({
        id: `issue-${issueId++}`,
        phase: 'fields',
        severity: 'error',
        message: `Field "${field.id}" has no display name`,
        details: 'All fields must have a display name',
        location: `field:${field.id}`,
        canProceed: false
      });
    }

    if (!field.internalName || field.internalName.trim().length === 0) {
      issues.push({
        id: `issue-${issueId++}`,
        phase: 'fields',
        severity: 'error',
        message: `Field "${field.name}" has no internal name`,
        details: 'All fields must have a unique internal name (slug)',
        location: `field:${field.id}`,
        canProceed: false
      });
    }

    // Check for duplicate internal names
    if (field.internalName) {
      if (internalNames.has(field.internalName)) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Duplicate internal name: "${field.internalName}"`,
          details: 'Internal names must be unique across all fields',
          location: `field:${field.id}`,
          canProceed: false
        });
      }
      internalNames.add(field.internalName);
    }

    // Check for duplicate display names (warning)
    if (field.name) {
      if (displayNames.has(field.name)) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'warning',
          message: `Duplicate display name: "${field.name}"`,
          details: 'Having multiple fields with the same display name may confuse users',
          location: `field:${field.id}`,
          canProceed: true
        });
      }
      displayNames.add(field.name);
    }

    // Type-specific validation
    if (field.type === 'enum') {
      if (!field.enumValues || field.enumValues.length === 0) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Enum field "${field.name}" has no values`,
          details: 'Enum fields must have at least one value',
          location: `field:${field.id}`,
          canProceed: false
        });
      } else {
        const enumInternals = new Set<string>();
        field.enumValues.forEach((ev: any) => {
          if (enumInternals.has(ev.internal)) {
            issues.push({
              id: `issue-${issueId++}`,
              phase: 'fields',
              severity: 'error',
              message: `Duplicate enum value: "${ev.internal}" in field "${field.name}"`,
              details: 'Enum internal values must be unique',
              location: `field:${field.id}`,
              canProceed: false
            });
          }
          enumInternals.add(ev.internal);
        });
      }
    }

    if (field.type === 'relationship') {
      if (!field.relationship?.targetType) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Relationship field "${field.name}" has no target`,
          details: 'Relationship fields must specify a target resource type',
          location: `field:${field.id}`,
          canProceed: false
        });
      }
    }

    if (field.type === 'formula') {
      if (!field.formula || field.formula.trim().length === 0) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Formula field "${field.name}" has no formula`,
          details: 'Formula fields must have a formula expression',
          location: `field:${field.id}`,
          canProceed: false
        });
      }
    }

    // Validation rules
    if (field.validation?.pattern) {
      try {
        new RegExp(field.validation.pattern);
      } catch (e) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Invalid regex pattern in field "${field.name}"`,
          details: `Pattern "${field.validation.pattern}" is not a valid regular expression`,
          location: `field:${field.id}`,
          canProceed: false
        });
      }
    }

    if (field.validation?.min !== undefined && field.validation?.max !== undefined) {
      if (field.validation.min > field.validation.max) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'fields',
          severity: 'error',
          message: `Invalid range in field "${field.name}"`,
          details: `Min value (${field.validation.min}) cannot be greater than max value (${field.validation.max})`,
          location: `field:${field.id}`,
          canProceed: false
        });
      }
    }
  });

  // PHASE 3: OPERATIONS LOGIC (Basic)
  operations.forEach((op: any) => {
    if (!op.name || op.name.trim().length === 0) {
      issues.push({
        id: `issue-${issueId++}`,
        phase: 'operations',
        severity: 'error',
        message: `Operation "${op.id}" has no name`,
        details: 'All operations must have a name',
        location: `operation:${op.id}`,
        canProceed: false
      });
    }

    if (!op.description || op.description.trim().length === 0) {
      issues.push({
        id: `issue-${issueId++}`,
        phase: 'operations',
        severity: 'warning',
        message: `Operation "${op.name}" has no description`,
        details: 'Adding a description helps users understand what this operation does',
        location: `operation:${op.id}`,
        canProceed: true
      });
    }
  });

  // PHASE 4: AUTO-GEN PATTERNS
  fields.forEach((field: Field) => {
    if (field.autoGen) {
      const pattern = field.autoGen.pattern;
      
      if (!pattern || pattern.trim().length === 0) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'autogen',
          severity: 'error',
          message: `Auto-gen field "${field.name}" has empty pattern`,
          details: 'Auto-generation patterns cannot be empty',
          location: `field:${field.id}`,
          canProceed: false
        });
      }

      // Check for valid placeholders
      const validPlaceholders = ['{YYYY}', '{YY}', '{MM}', '{DD}', '{####}', '{###}', '{##}', '{VAR1}', '{VAR2}'];
      const usedPlaceholders = pattern.match(/{[^}]+}/g) || [];
      
      usedPlaceholders.forEach(placeholder => {
        if (!validPlaceholders.includes(placeholder) && !placeholder.match(/^{VAR\d+}$/)) {
          issues.push({
            id: `issue-${issueId++}`,
            phase: 'autogen',
            severity: 'warning',
            message: `Unknown placeholder "${placeholder}" in field "${field.name}"`,
            details: `Valid placeholders: ${validPlaceholders.join(', ')}`,
            location: `field:${field.id}`,
            canProceed: true
          });
        }
      });

      if (field.autoGen.padding < 1 || field.autoGen.padding > 8) {
        issues.push({
          id: `issue-${issueId++}`,
          phase: 'autogen',
          severity: 'error',
          message: `Invalid padding in field "${field.name}"`,
          details: 'Padding must be between 1 and 8',
          location: `field:${field.id}`,
          canProceed: false
        });
      }
    }
  });

  // PHASE 5: CROSS-REFERENCES
  fields.forEach((field: Field) => {
    if (field.type === 'formula' && field.formula) {
      const referencedFields = field.formula.match(/{([^}]+)}/g) || [];
      referencedFields.forEach(ref => {
        const fieldName = ref.slice(1, -1);
        const exists = fields.some(f => f.internalName === fieldName);
        if (!exists) {
          issues.push({
            id: `issue-${issueId++}`,
            phase: 'crossref',
            severity: 'error',
            message: `Formula field "${field.name}" references non-existent field "${fieldName}"`,
            details: 'All field references in formulas must exist',
            location: `field:${field.id}`,
            canProceed: false
          });
        }
      });
    }
  });

  // Determine if validation passed
  const blockingErrors = issues.filter(i => i.severity === 'error' && !i.canProceed);
  const passed = blockingErrors.length === 0;

  return {
    passed,
    issues,
    phasesCompleted: passed ? ['basic', 'fields', 'operations', 'autogen', 'crossref'] : [],
    timestamp: new Date().toISOString()
  };
}
