// Notification Center Component - Manages system notifications
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Trash2, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionPath?: string;
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      title: 'Project Approved',
      message: 'Your project "Mobile App Redesign" has been approved by the Board of Directors',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionLabel: 'View Project',
      actionPath: '/projects'
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'New Assignment',
      message: 'You have been assigned as leader for "Backend Development" in Project Alpha',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      actionLabel: 'View Assignment',
      actionPath: '/my-assignments'
    },
    {
      id: 'notif-3',
      type: 'warning',
      title: 'Approval Needed',
      message: 'Project "E-commerce Platform" is awaiting your approval vote',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      actionLabel: 'Review',
      actionPath: '/approvals'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for custom notification events
  useEffect(() => {
    const handleProjectDecision = (e: any) => {
      const { projectName, decision, comments } = e.detail;
      
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: decision === 'approved' ? 'success' : 'error',
        title: decision === 'approved' ? 'Project Approved' : 'Project Rejected',
        message: `Your project "${projectName}" has been ${decision}. ${comments}`,
        timestamp: new Date(),
        read: false,
        actionLabel: 'View Project',
        actionPath: '/projects'
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleProjectSubmitted = (e: any) => {
      const { projectName, pmName } = e.detail;
      
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'New Project Submission',
        message: `${pmName} has submitted "${projectName}" for your review`,
        timestamp: new Date(),
        read: false,
        actionLabel: 'Review',
        actionPath: '/approvals'
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    // ⚡ PHASE 5: Listen for indicator automation events
    const handleIndicatorAutoUpdated = (e: any) => {
      const { taskName, indicatorCount } = e.detail;
      
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Indicators Auto-Updated',
        message: `Task "${taskName}" completed. ${indicatorCount} indicator${indicatorCount !== 1 ? 's' : ''} automatically updated.`,
        timestamp: new Date(),
        read: false,
        actionLabel: 'View Indicators',
        actionPath: '/indicators'
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleThresholdBreached = (e: any) => {
      const { indicatorName, currentValue, threshold } = e.detail;
      
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'warning',
        title: 'Indicator Threshold Breach',
        message: `Indicator "${indicatorName}" is at ${currentValue}% (threshold: ${threshold}%). Action may be required.`,
        timestamp: new Date(),
        read: false,
        actionLabel: 'View Indicator',
        actionPath: '/indicators'
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleHierarchyAggregated = (e: any) => {
      const { parentName, childCount, newValue } = e.detail;
      
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'Hierarchy Auto-Aggregated',
        message: `Parent indicator "${parentName}" updated to ${newValue}% based on ${childCount} child indicators.`,
        timestamp: new Date(),
        read: false,
        actionLabel: 'View Indicators',
        actionPath: '/indicators'
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    window.addEventListener('project-decision', handleProjectDecision);
    window.addEventListener('project-submitted', handleProjectSubmitted);
    window.addEventListener('indicator-auto-updated', handleIndicatorAutoUpdated);
    window.addEventListener('indicator-threshold-breached', handleThresholdBreached);
    window.addEventListener('hierarchy-aggregated', handleHierarchyAggregated);

    return () => {
      window.removeEventListener('project-decision', handleProjectDecision);
      window.removeEventListener('project-submitted', handleProjectSubmitted);
      window.removeEventListener('indicator-auto-updated', handleIndicatorAutoUpdated);
      window.removeEventListener('indicator-threshold-breached', handleThresholdBreached);
      window.removeEventListener('hierarchy-aggregated', handleHierarchyAggregated);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionPath) {
      navigate(notification.actionPath);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date | string) => {
    const timestampDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(timestampDate, { addSuffix: true });
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 p-4"
            >
              <GlassCard className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-500" />
                      <h2 className="text-slate-900 dark:text-white">Notifications</h2>
                      {unreadCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600 dark:text-white/60" />
                    </button>
                  </div>

                  {unreadCount > 0 && (
                    <button 
                      variant="ghost" 
                      size="sm"
                      onClick={markAllAsRead}
                      className="w-full"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          notification.read
                            ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                            : 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-sm text-slate-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 dark:text-white/40">
                                {getTimeAgo(notification.timestamp)}
                              </span>

                              {notification.actionLabel && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(notification);
                                  }}
                                  className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
                                >
                                  {notification.actionLabel} →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-slate-400 dark:text-white/40 mx-auto mb-4" />
                      <p className="text-sm text-slate-600 dark:text-white/60">
                        No notifications yet
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}