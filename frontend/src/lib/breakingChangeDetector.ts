/**
 * Breaking Change Detection System
 * Analyzes schema changes and determines version impact
 */

export interface ChangeAnalysis {
  hasBreakingChanges: boolean;
  breakingChanges: ChangeItem[];
  nonBreakingChanges: ChangeItem[];
  recommendedVersion: string;
  impactLevel: 'MAJOR' | 'MINOR' | 'PATCH';
  summary: string;
}

export interface ChangeItem {
  type: 'field' | 'operation' | 'metadata';
  action: 'added' | 'removed' | 'modified';
  severity: 'breaking' | 'non-breaking';
  field?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface SchemaSnapshot {
  fields: any[];
  operations: any[];
}

/**
 * Detect breaking changes between two versions
 */
export function detectBreakingChanges(
  previousSnapshot: SchemaSnapshot | null,
  currentSnapshot: SchemaSnapshot,
  currentVersion: string
): ChangeAnalysis {
  const changes: ChangeItem[] = [];
  
  // If no previous version, this is initial version
  if (!previousSnapshot) {
    return {
      hasBreakingChanges: false,
      breakingChanges: [],
      nonBreakingChanges: [],
      recommendedVersion: '1.0.0',
      impactLevel: 'MAJOR',
      summary: 'Initial version - no breaking changes'
    };
  }
  
  // Analyze field changes
  const fieldChanges = analyzeFieldChanges(previousSnapshot.fields, currentSnapshot.fields);
  changes.push(...fieldChanges);
  
  // Analyze operation changes
  const operationChanges = analyzeOperationChanges(previousSnapshot.operations, currentSnapshot.operations);
  changes.push(...operationChanges);
  
  // Classify changes
  const breakingChanges = changes.filter(c => c.severity === 'breaking');
  const nonBreakingChanges = changes.filter(c => c.severity === 'non-breaking');
  
  // Determine version increment
  const { recommendedVersion, impactLevel } = calculateVersionIncrement(
    currentVersion,
    breakingChanges.length > 0,
    nonBreakingChanges.length > 0
  );
  
  // Generate summary
  const summary = generateChangeSummary(breakingChanges, nonBreakingChanges);
  
  return {
    hasBreakingChanges: breakingChanges.length > 0,
    breakingChanges,
    nonBreakingChanges,
    recommendedVersion,
    impactLevel,
    summary
  };
}

/**
 * Analyze field schema changes
 */
function analyzeFieldChanges(oldFields: any[], newFields: any[]): ChangeItem[] {
  const changes: ChangeItem[] = [];
  
  // Create maps for easy lookup
  const oldFieldMap = new Map(oldFields.map(f => [f.id, f]));
  const newFieldMap = new Map(newFields.map(f => [f.id, f]));
  
  // Check for removed fields (BREAKING)
  oldFields.forEach(oldField => {
    if (!newFieldMap.has(oldField.id)) {
      changes.push({
        type: 'field',
        action: 'removed',
        severity: 'breaking',
        field: oldField.name,
        oldValue: oldField,
        description: `Field "${oldField.name}" was removed`
      });
    }
  });
  
  // Check for added fields
  newFields.forEach(newField => {
    if (!oldFieldMap.has(newField.id)) {
      // Added required field is BREAKING
      if (newField.required) {
        changes.push({
          type: 'field',
          action: 'added',
          severity: 'breaking',
          field: newField.name,
          newValue: newField,
          description: `Required field "${newField.name}" was added (existing items won't have this field)`
        });
      } else {
        // Added optional field is NON-BREAKING
        changes.push({
          type: 'field',
          action: 'added',
          severity: 'non-breaking',
          field: newField.name,
          newValue: newField,
          description: `Optional field "${newField.name}" was added`
        });
      }
    }
  });
  
  // Check for modified fields
  newFields.forEach(newField => {
    const oldField = oldFieldMap.get(newField.id);
    if (!oldField) return;
    
    // Type change (BREAKING)
    if (oldField.type !== newField.type) {
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'breaking',
        field: newField.name,
        oldValue: { type: oldField.type },
        newValue: { type: newField.type },
        description: `Field "${newField.name}" type changed from ${oldField.type} to ${newField.type}`
      });
    }
    
    // Required flag change
    if (!oldField.required && newField.required) {
      // Optional → Required (BREAKING)
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'breaking',
        field: newField.name,
        oldValue: { required: false },
        newValue: { required: true },
        description: `Field "${newField.name}" is now required (was optional)`
      });
    } else if (oldField.required && !newField.required) {
      // Required → Optional (NON-BREAKING)
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'non-breaking',
        field: newField.name,
        oldValue: { required: true },
        newValue: { required: false },
        description: `Field "${newField.name}" is now optional (was required)`
      });
    }
    
    // Internal name change (BREAKING - affects API)
    if (oldField.internalName !== newField.internalName) {
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'breaking',
        field: newField.name,
        oldValue: { internalName: oldField.internalName },
        newValue: { internalName: newField.internalName },
        description: `Field "${newField.name}" internal name changed from "${oldField.internalName}" to "${newField.internalName}"`
      });
    }
    
    // Validation changes
    const validationChanges = analyzeValidationChanges(oldField, newField);
    changes.push(...validationChanges);
    
    // Display name change (NON-BREAKING)
    if (oldField.name !== newField.name && oldField.internalName === newField.internalName) {
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'non-breaking',
        field: newField.name,
        oldValue: { name: oldField.name },
        newValue: { name: newField.name },
        description: `Field display name changed from "${oldField.name}" to "${newField.name}"`
      });
    }
    
    // Description/help text change (NON-BREAKING)
    if (oldField.description !== newField.description || oldField.helpText !== newField.helpText) {
      changes.push({
        type: 'field',
        action: 'modified',
        severity: 'non-breaking',
        field: newField.name,
        description: `Field "${newField.name}" documentation updated`
      });
    }
  });
  
  return changes;
}

/**
 * Analyze validation rule changes
 */
function analyzeValidationChanges(oldField: any, newField: any): ChangeItem[] {
  const changes: ChangeItem[] = [];
  
  if (!oldField.validation && !newField.validation) return changes;
  
  const oldVal = oldField.validation || {};
  const newVal = newField.validation || {};
  
  // Min value decreased or max value increased (NON-BREAKING - more permissive)
  // Min value increased or max value decreased (BREAKING - more restrictive)
  
  if (oldField.type === 'number' || oldField.type === 'text') {
    // Min constraint
    if (oldVal.min !== undefined && newVal.min !== undefined) {
      if (newVal.min > oldVal.min) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'breaking',
          field: newField.name,
          oldValue: { min: oldVal.min },
          newValue: { min: newVal.min },
          description: `Field "${newField.name}" minimum value increased from ${oldVal.min} to ${newVal.min} (existing data may violate this)`
        });
      } else if (newVal.min < oldVal.min) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'non-breaking',
          field: newField.name,
          description: `Field "${newField.name}" minimum value decreased (more permissive)`
        });
      }
    }
    
    // Max constraint
    if (oldVal.max !== undefined && newVal.max !== undefined) {
      if (newVal.max < oldVal.max) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'breaking',
          field: newField.name,
          oldValue: { max: oldVal.max },
          newValue: { max: newVal.max },
          description: `Field "${newField.name}" maximum value decreased from ${oldVal.max} to ${newVal.max} (existing data may violate this)`
        });
      } else if (newVal.max > oldVal.max) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'non-breaking',
          field: newField.name,
          description: `Field "${newField.name}" maximum value increased (more permissive)`
        });
      }
    }
  }
  
  // Enum values
  if (oldField.type === 'enum' && newField.type === 'enum') {
    const oldValues = new Set((oldField.enumValues || []).map((v: any) => v.internal));
    const newValues = new Set((newField.enumValues || []).map((v: any) => v.internal));
    
    // Removed enum values (BREAKING)
    oldField.enumValues?.forEach((val: any) => {
      if (!newValues.has(val.internal)) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'breaking',
          field: newField.name,
          description: `Enum value "${val.display}" removed from field "${newField.name}"`
        });
      }
    });
    
    // Added enum values (NON-BREAKING)
    newField.enumValues?.forEach((val: any) => {
      if (!oldValues.has(val.internal)) {
        changes.push({
          type: 'field',
          action: 'modified',
          severity: 'non-breaking',
          field: newField.name,
          description: `Enum value "${val.display}" added to field "${newField.name}"`
        });
      }
    });
  }
  
  return changes;
}

/**
 * Analyze operation changes
 */
function analyzeOperationChanges(oldOperations: any[], newOperations: any[]): ChangeItem[] {
  const changes: ChangeItem[] = [];
  
  const oldOpMap = new Map(oldOperations.map(op => [op.id, op]));
  const newOpMap = new Map(newOperations.map(op => [op.id, op]));
  
  // Removed operations (BREAKING)
  oldOperations.forEach(oldOp => {
    if (!newOpMap.has(oldOp.id)) {
      changes.push({
        type: 'operation',
        action: 'removed',
        severity: 'breaking',
        field: oldOp.name,
        description: `Operation "${oldOp.name}" was removed`
      });
    }
  });
  
  // Added operations (NON-BREAKING)
  newOperations.forEach(newOp => {
    if (!oldOpMap.has(newOp.id)) {
      changes.push({
        type: 'operation',
        action: 'added',
        severity: 'non-breaking',
        field: newOp.name,
        description: `Operation "${newOp.name}" was added`
      });
    }
  });
  
  // Modified operations
  newOperations.forEach(newOp => {
    const oldOp = oldOpMap.get(newOp.id);
    if (!oldOp) return;
    
    // Parameter changes
    const paramChanges = analyzeParameterChanges(oldOp, newOp);
    changes.push(...paramChanges);
    
    // Return type change (BREAKING)
    if (oldOp.type !== newOp.type) {
      changes.push({
        type: 'operation',
        action: 'modified',
        severity: 'breaking',
        field: newOp.name,
        oldValue: { type: oldOp.type },
        newValue: { type: newOp.type },
        description: `Operation "${newOp.name}" return type changed from ${oldOp.type} to ${newOp.type}`
      });
    }
    
    // Logic change (consider BREAKING if signature changed, else NON-BREAKING)
    if (oldOp.logic !== newOp.logic && paramChanges.length === 0) {
      changes.push({
        type: 'operation',
        action: 'modified',
        severity: 'non-breaking',
        field: newOp.name,
        description: `Operation "${newOp.name}" logic was updated (signature unchanged)`
      });
    }
  });
  
  return changes;
}

/**
 * Analyze parameter changes in operations
 */
function analyzeParameterChanges(oldOp: any, newOp: any): ChangeItem[] {
  const changes: ChangeItem[] = [];
  
  const oldParams = oldOp.parameters || [];
  const newParams = newOp.parameters || [];
  
  const oldParamMap = new Map(oldParams.map((p: any) => [p.name, p]));
  const newParamMap = new Map(newParams.map((p: any) => [p.name, p]));
  
  // Removed parameters (BREAKING)
  oldParams.forEach((param: any) => {
    if (!newParamMap.has(param.name)) {
      changes.push({
        type: 'operation',
        action: 'modified',
        severity: 'breaking',
        field: `${newOp.name}.${param.name}`,
        description: `Parameter "${param.name}" removed from operation "${newOp.name}"`
      });
    }
  });
  
  // Added required parameters (BREAKING)
  newParams.forEach((param: any) => {
    if (!oldParamMap.has(param.name)) {
      if (param.required) {
        changes.push({
          type: 'operation',
          action: 'modified',
          severity: 'breaking',
          field: `${newOp.name}.${param.name}`,
          description: `Required parameter "${param.name}" added to operation "${newOp.name}"`
        });
      } else {
        changes.push({
          type: 'operation',
          action: 'modified',
          severity: 'non-breaking',
          field: `${newOp.name}.${param.name}`,
          description: `Optional parameter "${param.name}" added to operation "${newOp.name}"`
        });
      }
    }
  });
  
  // Parameter type changes (BREAKING)
  newParams.forEach((newParam: any) => {
    const oldParam = oldParamMap.get(newParam.name);
    if (oldParam && oldParam.type !== newParam.type) {
      changes.push({
        type: 'operation',
        action: 'modified',
        severity: 'breaking',
        field: `${newOp.name}.${newParam.name}`,
        oldValue: { type: oldParam.type },
        newValue: { type: newParam.type },
        description: `Parameter "${newParam.name}" type changed from ${oldParam.type} to ${newParam.type} in operation "${newOp.name}"`
      });
    }
  });
  
  return changes;
}

/**
 * Calculate recommended version based on changes
 */
function calculateVersionIncrement(
  currentVersion: string,
  hasBreaking: boolean,
  hasNonBreaking: boolean
): { recommendedVersion: string; impactLevel: 'MAJOR' | 'MINOR' | 'PATCH' } {
  // Parse semantic version
  const parts = currentVersion.split('.').map(p => parseInt(p) || 0);
  while (parts.length < 3) parts.push(0);
  
  let [major, minor, patch] = parts;
  let impactLevel: 'MAJOR' | 'MINOR' | 'PATCH';
  
  if (hasBreaking) {
    // Breaking changes → MAJOR version bump
    major += 1;
    minor = 0;
    patch = 0;
    impactLevel = 'MAJOR';
  } else if (hasNonBreaking) {
    // Non-breaking changes → MINOR version bump
    minor += 1;
    patch = 0;
    impactLevel = 'MINOR';
  } else {
    // No changes or only patches → PATCH version bump
    patch += 1;
    impactLevel = 'PATCH';
  }
  
  return {
    recommendedVersion: `${major}.${minor}.${patch}`,
    impactLevel
  };
}

/**
 * Generate human-readable summary
 */
function generateChangeSummary(breaking: ChangeItem[], nonBreaking: ChangeItem[]): string {
  const parts: string[] = [];
  
  if (breaking.length > 0) {
    parts.push(`${breaking.length} breaking change${breaking.length > 1 ? 's' : ''} detected`);
  }
  
  if (nonBreaking.length > 0) {
    parts.push(`${nonBreaking.length} non-breaking change${nonBreaking.length > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
    return 'No significant changes detected';
  }
  
  return parts.join(', ');
}

/**
 * Get impact description for UI
 */
export function getImpactDescription(impactLevel: 'MAJOR' | 'MINOR' | 'PATCH'): string {
  switch (impactLevel) {
    case 'MAJOR':
      return 'Breaking changes - may require updates to existing projects using this resource type';
    case 'MINOR':
      return 'New features added - backward compatible with existing projects';
    case 'PATCH':
      return 'Minor updates or fixes - fully backward compatible';
  }
}
