import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface BatchConfig {
  columns: Array<{ key: string; label: string; type: string }>;
  items: any[];
  allowBulkActions: boolean;
}

interface BatchFieldWidgetProps {
  config: BatchConfig;
  value: any;
  onChange: (value: any) => void;
}

export function BatchFieldWidget({ config, value = {}, onChange }: BatchFieldWidgetProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const itemsPerPage = viewMode === 'list' ? 10 : 6;

  const processedItems = value.processed || [];
  const processedCount = processedItems.length;
  const totalCount = config.items.length;
  const progressPercentage = Math.round((processedCount / totalCount) * 100);

  // Pagination
  const totalPages = Math.ceil(config.items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, config.items.length);
  const currentItems = config.items.slice(startIndex, endIndex);

  const handleProcessItem = (itemIndex: number, action: 'approve' | 'reject') => {
    const actualIndex = startIndex + itemIndex;
    const newProcessed = [...processedItems];
    
    // Check if already processed
    const existingIndex = newProcessed.findIndex((p: any) => p.index === actualIndex);
    
    if (existingIndex >= 0) {
      // Update existing
      newProcessed[existingIndex] = { index: actualIndex, action };
    } else {
      // Add new
      newProcessed.push({ index: actualIndex, action });
    }
    
    onChange({ ...value, processed: newProcessed });
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    const newProcessed = [...processedItems];
    
    currentItems.forEach((_, idx) => {
      const actualIndex = startIndex + idx;
      const existingIndex = newProcessed.findIndex((p: any) => p.index === actualIndex);
      
      if (existingIndex >= 0) {
        newProcessed[existingIndex] = { index: actualIndex, action };
      } else {
        newProcessed.push({ index: actualIndex, action });
      }
    });
    
    onChange({ ...value, processed: newProcessed });
  };

  const getItemStatus = (itemIndex: number) => {
    const actualIndex = startIndex + itemIndex;
    return processedItems.find((p: any) => p.index === actualIndex);
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <GlassCard className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-900 dark:text-white mb-1">
              Batch Processing Progress
            </p>
            <p className="text-xs text-slate-600 dark:text-white/60">
              {processedCount} of {totalCount} items processed
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-2xl text-purple-600 dark:text-purple-400">
              {progressPercentage}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
          />
        </div>
      </GlassCard>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-500 text-white' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-500 text-white' : ''}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>

        {config.allowBulkActions && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-white/60">Bulk:</span>
            <Button
              onClick={() => handleBulkAction('approve')}
              className="bg-green-500 hover:bg-green-600 text-white text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approve All
            </Button>
            <Button
              onClick={() => handleBulkAction('reject')}
              className="bg-red-500 hover:bg-red-600 text-white text-xs"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Items */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-2">
          {currentItems.map((item, idx) => {
            const status = getItemStatus(idx);
            
            return (
              <motion.div
                key={startIndex + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard
                  className={`p-4 ${
                    status?.action === 'approve'
                      ? 'bg-green-50 dark:bg-green-500/10 border-green-500/30'
                      : status?.action === 'reject'
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-500/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Item Data */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      {config.columns.map((col) => (
                        <div key={col.key}>
                          <p className="text-xs text-slate-600 dark:text-white/60 mb-1">
                            {col.label}
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {item[col.key]}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {status ? (
                        <Badge
                          className={
                            status.action === 'approve'
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                          }
                        >
                          {status.action === 'approve' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </>
                          )}
                        </Badge>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleProcessItem(idx, 'approve')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleProcessItem(idx, 'reject')}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-3 gap-4">
          {currentItems.map((item, idx) => {
            const status = getItemStatus(idx);
            
            return (
              <motion.div
                key={startIndex + idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard
                  className={`p-4 ${
                    status?.action === 'approve'
                      ? 'bg-green-50 dark:bg-green-500/10 border-green-500/30'
                      : status?.action === 'reject'
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-500/30'
                      : ''
                  }`}
                >
                  {/* Item Data */}
                  <div className="space-y-2 mb-4">
                    {config.columns.map((col) => (
                      <div key={col.key}>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          {col.label}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white truncate">
                          {item[col.key]}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {status ? (
                    <Badge
                      className={`w-full justify-center ${
                        status.action === 'approve'
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                      }`}
                    >
                      {status.action === 'approve' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleProcessItem(idx, 'approve')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleProcessItem(idx, 'reject')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-slate-600 dark:text-white/60">
            Page {currentPage + 1} of {totalPages} • Showing {startIndex + 1}-{endIndex} of {totalCount}
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
