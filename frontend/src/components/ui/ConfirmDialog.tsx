import { ReactNode } from 'react';
import { X, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  variant = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  children
}: ConfirmDialogProps) {
  
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      iconBg: 'bg-red-500/10',
      confirmButton: 'danger' as const
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      iconBg: 'bg-amber-500/10',
      confirmButton: 'primary' as const
    },
    info: {
      icon: <Info className="w-12 h-12 text-blue-500" />,
      iconBg: 'bg-blue-500/10',
      confirmButton: 'primary' as const
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      iconBg: 'bg-emerald-500/10',
      confirmButton: 'primary' as const
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, type: 'spring', damping: 25 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <GlassCard className="p-6 rounded-2xl">
                {/* Close Button */}
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentVariant.iconBg}`}>
                    {currentVariant.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-slate-600 dark:text-white/60 text-sm">
                      {description}
                    </p>
                  )}
                  {children && (
                    <div className="mt-4">
                      {children}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={currentVariant.confirmButton}
                    className="flex-1"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick delete confirmation dialog
 */
export function DeleteConfirmDialog({
  open,
  itemName,
  itemType = 'item',
  onConfirm,
  onCancel,
  isLoading = false,
  warningMessage
}: {
  open: boolean;
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  warningMessage?: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      title={`Delete ${itemType}?`}
      description={warningMessage || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      variant="danger"
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}