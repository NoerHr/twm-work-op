import { useEffect, useRef } from 'react';
import { useIndicatorStore } from '../store/indicatorStore';
import { simulateDataUpdate } from '../utils/generateIndicatorData';

/**
 * Hook to simulate real-time data updates for indicators
 * Updates data every 5 seconds to simulate live monitoring
 */
export function useRealTimeData(enabled: boolean = true, intervalMs: number = 5000) {
  const addDataPoint = useIndicatorStore((state) => state.addDataPoint);
  const getLatestData = useIndicatorStore((state) => state.getLatestData);
  const checkAlerts = useIndicatorStore((state) => state.checkAlerts);
  // ✅ FIX: Don't subscribe to indicators directly to avoid infinite loop
  // We'll get fresh indicators from store on each interval tick
  
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const updateData = () => {
      // ✅ FIX: Get fresh indicators from store on each tick, not from closure
      const currentIndicators = useIndicatorStore.getState().indicators;
      const now = new Date();
      
      currentIndicators.forEach((indicator) => {
        indicator.values.forEach((value) => {
          // Get the latest data point
          const latest = getLatestData(indicator.id, value.key);
          
          if (latest) {
            // Simulate a small variation
            const newValue = simulateDataUpdate(latest.value);
            
            // Determine status
            let status: 'normal' | 'warning' | 'critical' = 'normal';
            
            // For percentage/health metrics
            if (value.type === 'percentage' || value.key.includes('health') || value.key.includes('score')) {
              if (newValue < 60) status = 'critical';
              else if (newValue < 80) status = 'warning';
            }
            // For defect/error metrics (inverted logic)
            else if (value.key.includes('defect') || value.key.includes('error')) {
              if (newValue > latest.value * 1.5) status = 'critical';
              else if (newValue > latest.value * 1.2) status = 'warning';
            }
            // For efficiency metrics
            else if (value.key.includes('efficiency')) {
              if (newValue < latest.value * 0.7) status = 'critical';
              else if (newValue < latest.value * 0.85) status = 'warning';
            }
            
            // Add new data point
            addDataPoint({
              id: `dp-${indicator.id}-${value.key}-${Date.now()}`,
              indicatorId: indicator.id,
              valueKey: value.key,
              value: newValue,
              timestamp: now,
              source: value.source === 'manual' ? 'manual' : 'calculated',
              status,
              metadata: {
                calculationTime: Math.random() * 100,
                dependencies: []
              }
            });
          }
        });
        
        // Check alerts after updating
        checkAlerts(indicator.id);
      });
    };

    // Initial update
    updateData();
    
    // Set up interval
    intervalRef.current = setInterval(updateData, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs]); // ✅ FIX: Remove indicators dependency to break loop

  return {
    isSimulating: enabled
  };
}