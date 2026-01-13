import type { ResourceInstance, OperationDefinition, FieldChange } from '../types/resource';

export interface ExecutionResult {
  success: boolean;
  updatedInstance?: ResourceInstance;
  changes: FieldChange[];
  error?: string;
  executionLog: string[];
}

/**
 * Logic Engine - Executes operations on resource instances
 * This is a simplified execution engine that processes logic blocks sequentially
 */
export class LogicEngine {
  /**
   * Execute an operation on a resource instance
   */
  static execute(
    instance: ResourceInstance,
    operation: OperationDefinition,
    parameters: Record<string, any> = {}
  ): ExecutionResult {
    const executionLog: string[] = [];
    const changes: FieldChange[] = [];
    
    try {
      executionLog.push(`🚀 Starting operation: ${operation.name}`);
      executionLog.push(`📦 Instance ID: ${instance.id}`);
      executionLog.push(`🔧 Blocks to execute: ${operation.blocks.length}`);
      
      // Create a working copy of the instance data
      let workingData = { ...instance.data };
      const blockResults = new Map<string, any>();
      
      // Execute blocks in order (simplified - doesn't follow connections)
      for (const block of operation.blocks) {
        executionLog.push(`⚙️ Executing block: ${block.label} (${block.type})`);
        
        try {
          switch (block.type) {
            case 'getItemId':
              blockResults.set(block.id, instance.id);
              executionLog.push(`  ✓ Retrieved item ID: ${instance.id}`);
              break;
              
            case 'getValue':
              if (block.config.fieldName) {
                const value = workingData[block.config.fieldName];
                blockResults.set(block.id, value);
                executionLog.push(`  ✓ Got field '${block.config.fieldName}' = ${value}`);
              } else {
                executionLog.push(`  ⚠️ No field name configured`);
              }
              break;
              
            case 'setValue':
            case 'updateFieldValue':
              if (block.config.fieldName) {
                const oldValue = workingData[block.config.fieldName];
                const newValue = block.config.value || 'checked_out'; // Default value
                
                workingData[block.config.fieldName] = newValue;
                
                changes.push({
                  field: block.config.fieldName,
                  oldValue,
                  newValue
                });
                
                executionLog.push(`  ✓ Updated field '${block.config.fieldName}': ${oldValue} → ${newValue}`);
              } else {
                executionLog.push(`  ⚠️ No field name configured`);
              }
              break;
              
            case 'createItem':
              executionLog.push(`  ✓ Create item operation (would create new instance)`);
              break;
              
            case 'deleteItem':
              executionLog.push(`  ✓ Delete item operation (would delete instance)`);
              break;
              
            case 'router':
              const condition = block.config.condition || 'true';
              const conditionResult = this.evaluateCondition(condition, workingData);
              blockResults.set(block.id, conditionResult);
              executionLog.push(`  ✓ Router condition '${condition}' = ${conditionResult}`);
              break;
              
            case 'parenthesis':
              executionLog.push(`  ✓ Grouping block (logical group)`);
              break;
              
            default:
              executionLog.push(`  ⚠️ Unknown block type: ${block.type}`);
          }
        } catch (blockError: any) {
          executionLog.push(`  ❌ Block error: ${blockError.message}`);
          throw new Error(`Block '${block.label}' failed: ${blockError.message}`);
        }
      }
      
      // Create updated instance
      const updatedInstance: ResourceInstance = {
        ...instance,
        data: workingData,
        updatedAt: new Date()
      };
      
      executionLog.push(`✅ Operation completed successfully`);
      executionLog.push(`📝 Total changes: ${changes.length}`);
      
      return {
        success: true,
        updatedInstance,
        changes,
        executionLog
      };
      
    } catch (error: any) {
      executionLog.push(`❌ Operation failed: ${error.message}`);
      
      return {
        success: false,
        changes,
        error: error.message,
        executionLog
      };
    }
  }
  
  /**
   * Simple condition evaluator
   * Supports basic comparisons like: value > 10, status === 'available', etc.
   */
  private static evaluateCondition(condition: string, data: Record<string, any>): boolean {
    try {
      // Very basic evaluation - in production, use a proper expression parser
      // This is simplified for demo purposes
      
      // Replace field names with actual values
      let evalString = condition;
      Object.keys(data).forEach(key => {
        const value = data[key];
        const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
        evalString = evalString.replace(new RegExp(`\\b${key}\\b`, 'g'), valueStr);
      });
      
      // Evaluate (Note: eval is dangerous in production - use a proper parser)
      return eval(evalString);
    } catch {
      return false;
    }
  }
  
  /**
   * Validate an operation definition
   * Checks for disconnected blocks, missing configurations, etc.
   */
  static validate(operation: OperationDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if operation has blocks
    if (operation.blocks.length === 0) {
      errors.push('Operation has no blocks defined');
    }
    
    // Check for blocks with missing configuration
    operation.blocks.forEach(block => {
      if ((block.type === 'getValue' || block.type === 'setValue' || block.type === 'updateFieldValue') && 
          !block.config.fieldName) {
        errors.push(`Block '${block.label}' is missing field name configuration`);
      }
      
      if (block.type === 'router' && !block.config.condition) {
        errors.push(`Router block '${block.label}' is missing condition`);
      }
    });
    
    // Check for disconnected blocks (blocks with required inputs but no connections)
    const connectedBlocks = new Set<string>();
    operation.connections.forEach(conn => {
      connectedBlocks.add(conn.targetBlockId);
    });
    
    operation.blocks.forEach(block => {
      const hasRequiredInputs = block.inputs.some(input => input.required);
      if (hasRequiredInputs && !connectedBlocks.has(block.id) && block.type !== 'getItemId') {
        errors.push(`Block '${block.label}' has required inputs but no connections`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Simulate an operation with mock data
   * Used for testing operations before publishing
   */
  static simulate(
    mockData: Record<string, any>,
    operation: OperationDefinition,
    parameters: Record<string, any> = {}
  ): ExecutionResult {
    // Create a mock instance
    const mockInstance: ResourceInstance = {
      id: 'mock-instance',
      typeId: 'mock-type',
      typeName: 'Mock Type',
      data: mockData,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: []
    };
    
    return this.execute(mockInstance, operation, parameters);
  }
}
