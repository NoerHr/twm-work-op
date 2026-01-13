import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AutoUpdateBadgeProps {
  indicatorId: string;
}

export function AutoUpdateBadge({ indicatorId }: AutoUpdateBadgeProps) {
  const [showPulse, setShowPulse] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleIndicatorUpdate = (e: any) => {
      const { indicatorId: updatedId } = e.detail;
      
      if (updatedId === indicatorId) {
        setLastUpdate(new Date());
        setShowPulse(true);
        
        setTimeout(() => {
          setShowPulse(false);
        }, 2000);
      }
    };

    window.addEventListener('indicator-auto-updated', handleIndicatorUpdate);

    return () => {
      window.removeEventListener('indicator-auto-updated', handleIndicatorUpdate);
    };
  }, [indicatorId]);

  if (!lastUpdate) return null;

  const timeAgo = (() => {
    const updateDate = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate;
    const diff = Date.now() - updateDate.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  })();

  return (
    <AnimatePresence>
      {showPulse && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-500"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-3 h-3" />
          </motion.div>
          <span>Auto-updated {timeAgo}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
