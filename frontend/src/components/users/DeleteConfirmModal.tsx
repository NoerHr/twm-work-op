import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';

interface DeleteConfirmModalProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ userName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-slate-900 dark:text-white mb-2">
                Delete User
              </h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}