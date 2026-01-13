import type { IndicatorDataPoint } from '../types/indicator';

/**
 * Generate realistic historical data for an indicator
 */
export function generateHistoricalData(
  indicatorId: string,
  valueKey: string,
  baseValue: number,
  days: number = 30,
  variance: number = 0.1
): IndicatorDataPoint[] {
  const dataPoints: IndicatorDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Add realistic variation
    const variation = (Math.random() - 0.5) * 2 * variance;
    const trendFactor = (days - i) / days * 0.05; // Slight upward trend
    const value = baseValue * (1 + variation + trendFactor);
    
    // Determine status based on value thresholds
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (valueKey.includes('defect') || valueKey.includes('error')) {
      // For defect-type metrics, higher is worse
      if (value > baseValue * 1.5) status = 'critical';
      else if (value > baseValue * 1.2) status = 'warning';
    } else {
      // For performance metrics, lower is worse
      if (value < baseValue * 0.7) status = 'critical';
      else if (value < baseValue * 0.85) status = 'warning';
    }
    
    dataPoints.push({
      id: `dp-${indicatorId}-${valueKey}-${i}`,
      indicatorId,
      valueKey,
      value: Number(value.toFixed(2)),
      timestamp,
      source: 'calculated',
      status
    });
  }
  
  return dataPoints;
}

/**
 * Simulate real-time data update
 */
export function simulateDataUpdate(
  prevValue: number,
  variance: number = 0.05
): number {
  const change = (Math.random() - 0.5) * 2 * variance;
  const newValue = prevValue * (1 + change);
  return Number(newValue.toFixed(2));
}

/**
 * Calculate indicator value from formula
 */
export function calculateValue(
  formula: any,
  context: Record<string, number>
): number | null {
  if (!formula || !formula.operator) return null;
  
  const { operator, operands } = formula;
  
  // Resolve operand values
  const values = operands.map((op: any) => {
    if (typeof op === 'number') return op;
    if (typeof op === 'string') {
      // Check if it's a reference to another value
      return context[op] ?? Number(op) ?? 0;
    }
    if (typeof op === 'object' && op.operator) {
      // Recursive calculation
      return calculateValue(op, context);
    }
    return 0;
  }).filter((v: any) => typeof v === 'number');
  
  if (values.length === 0) return null;
  
  // Perform calculation based on operator
  switch (operator) {
    case 'add':
      return values.reduce((sum: number, v: number) => sum + v, 0);
    
    case 'subtract':
      return values.reduce((diff: number, v: number, i: number) => 
        i === 0 ? v : diff - v, 0);
    
    case 'multiply':
      return values.reduce((product: number, v: number) => product * v, 1);
    
    case 'divide':
      if (values[1] === 0) return null; // Division by zero
      return values.reduce((quotient: number, v: number, i: number) => 
        i === 0 ? v : quotient / v, 0);
    
    case 'average':
      return values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
    
    case 'sum':
      return values.reduce((sum: number, v: number) => sum + v, 0);
    
    case 'min':
      return Math.min(...values);
    
    case 'max':
      return Math.max(...values);
    
    case 'count':
      return values.length;
    
    default:
      return null;
  }
}

/**
 * Generate sample indicators with varied data
 */
export function generateSampleDataPoints() {
  const now = new Date();
  
  return {
    'ind-proj-health': [
      ...generateHistoricalData('ind-proj-health', 'health_score', 85, 30, 0.08),
      ...generateHistoricalData('ind-proj-health', 'quality_score', 88, 30, 0.10),
      ...generateHistoricalData('ind-proj-health', 'schedule_performance', 82, 30, 0.12),
      ...generateHistoricalData('ind-proj-health', 'budget_health', 85, 30, 0.07)
    ],
    'ind-assign-efficiency': [
      ...generateHistoricalData('ind-assign-efficiency', 'efficiency_score', 1.2, 30, 0.15),
      ...generateHistoricalData('ind-assign-efficiency', 'tasks_completed', 45, 30, 0.20),
      ...generateHistoricalData('ind-assign-efficiency', 'hours_logged', 38, 30, 0.10)
    ],
    'ind-oper-defects': [
      ...generateHistoricalData('ind-oper-defects', 'defect_count', 5, 30, 0.30),
      ...generateHistoricalData('ind-oper-defects', 'defect_rate', 3.5, 30, 0.25),
      ...generateHistoricalData('ind-oper-defects', 'task_count', 142, 30, 0.15)
    ]
  };
}
