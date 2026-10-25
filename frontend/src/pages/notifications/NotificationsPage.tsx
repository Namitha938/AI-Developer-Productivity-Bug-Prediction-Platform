
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  ShieldAlert,
  GitPullRequest,
  GitBranch,
  Cpu,
  AlertCircle,
  Trash2,
  RefreshCw,
  Inbox,
  Users,
  Clock,
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import type { NotificationItem } from '../../types';

type NotificationTab = 'Unread' | 'All' | 'Assigned to me';

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

const getNotificationIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'critical_bug':
      return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    case 'pr_reviewed':
      return <GitPullRequest className="w-4 h-4 text-emerald-500" />;
    case 'scan_complete':
      return <GitBranch className="w-4 h-4 text-amber-500" />;
    case 'issue_assigned':
      return <Users className="w-4 h-4 text-blue-500" />;
    case 'system':
      return <Cpu className="w-4 h-4 text-violet-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-primary" />;
  }
};

const getTypeLabel = (type: NotificationItem['type']) => {
  switch (type) {
    case 'critical_bug':
      return 'Critical bug';
    case 'scan_complete':
      return 'Scan completed';
    case 'issue_assigned':
      return 'Issue assigned';
    case 'pr_reviewed':
      return 'Pull request';
    case 'system':
      return 'System';
    default:
      return 'Notification';
  }
};

export const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<NotificationTab>('Unread');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const assignedCount = notifications.filter(
    (item) => item.type === 'issue_assigned',
  ).length;

  const criticalBugCount = notifications.filter(
    (item) => item.type === 'critical_bug',
  ).length;

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      if (tab === 'Unread' && item.read) {
        return false;
      }

      if (tab === 'Assigned to me' && item.type !== 'issue_assigned') {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        getTypeLabel(item.type).toLowerCase().includes(query)
      );
    });
  }, [notifications, tab, searchQuery]);

  const latestNotifications = notifications.slice(0, 5);

  const handleMarkAsRead = async (id: string) => {
    setActionError(null);

    try {
      await markAsRead(id);
    } catch {
      setActionError('Could not mark this notification as read. Please try again.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionError(null);

    try {
      await markAllAsRead();
    } catch {
      setActionError('Could not mark notifications as read. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);

    try {
      await deleteNotification(id);
    } catch {
      setActionError('Could not delete this notification. Please try again.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review code alerts, scan updates, assignments, and account events.
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchNotifications()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Tabs and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-5 text-xs font-semibold">
          {(['Unread', 'All', 'Assigned to me'] as const).map((itemTab) => {
            const active = tab === itemTab;

            const count =
              itemTab === 'Unread'
                ? unreadCount
                : itemTab === 'All'
                  ? notifications.length
                  : assignedCount;

            return (
              <button
                key={itemTab}
                type="button"
                onClick={() => setTab(itemTab)}
                className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
                }`}
              >
                {itemTab}
                <span className="text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Action feedback */}
      {(actionError || (error && notifications.length > 0)) && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300"
        >
          <span>{actionError || error}</span>
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              void fetchNotifications();
            }}
            className="shrink-0 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notification list */}
        <div className="lg:col-span-8 space-y-5">
          {/* Live queue summary */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notification overview
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Counts are based on notifications returned by your account.
                </p>
              </div>

              <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {unreadCount} unread
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  TOTAL
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {notifications.length}
                </div>
                <p className="text-[11px] text-slate-400">Loaded notifications</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  CRITICAL BUGS
                </span>
                <div className="text-xl font-bold text-rose-500 mt-1">
                  {criticalBugCount}
                </div>
                <p className="text-[11px] text-slate-400">Bug-related notifications</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  ASSIGNMENTS
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {assignedCount}
                </div>
                <p className="text-[11px] text-slate-400">Assignment notifications</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {tab === 'Assigned to me'
                    ? 'Assignment notifications'
                    : tab === 'Unread'
                      ? 'Unread notifications'
                      : 'All notifications'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {filteredNotifications.length} result
                  {filteredNotifications.length === 1 ? '' : 's'}
                </p>
              </div>

              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            {isLoading && notifications.length === 0 ? (
              <div className="p-10 text-center">
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Loading notifications...
                </p>
              </div>
            ) : error && notifications.length === 0 ? (
              <div className="p-10 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Could not load notifications
                </p>
                <p className="text-xs text-slate-500 mt-2">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchNotifications()}
                  className="mt-4 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {searchQuery
                    ? 'No matching notifications'
                    : tab === 'Unread'
                      ? 'You are all caught up'
                      : tab === 'Assigned to me'
                        ? 'No assignment notifications'
                        : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {searchQuery
                    ? 'Try another search term.'
                    : 'Notifications from your account will appear here when available.'}
                </p>
                {tab !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('All');
                      setSearchQuery('');
                    }}
                    className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotifications.map((item) => (
                  <article
                    key={item.id}
                    className={`p-4 sm:p-5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40 ${
                      !item.read ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          )}

                          <h4 className={`text-sm text-slate-900 dark:text-white ${
                            !item.read ? 'font-bold' : 'font-semibold'
                          }`}>
                            {item.title}
                          </h4>

                          {!item.read && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              Unread
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 whitespace-pre-wrap break-words">
                          {item.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-[10px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            {getNotificationIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>

                        {item.linkUrl && (
                          <Link
                            to={item.linkUrl}
                            onClick={() => {
                              if (!item.read) {
                                void handleMarkAsRead(item.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View details
                            <span aria-hidden="true">→</span>
                          </Link>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {!item.read && (
                            <button
                              type="button"
                              onClick={() => void handleMarkAsRead(item.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDelete(item.id)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Account notification summary */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notification status
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">Unread</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {unreadCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">Read</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {notifications.filter((item) => item.read).length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">Critical bug alerts</span>
                <span className="font-bold text-rose-500">{criticalBugCount}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">Assignment events</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {assignedCount}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                disabled={unreadCount === 0}
                className="w-full inline-flex justify-center items-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent notifications
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            {latestNotifications.length === 0 ? (
              <p className="text-xs text-slate-500">
                Recent activity will appear here when notifications are available.
              </p>
            ) : (
              <div className="space-y-4">
                {latestNotifications.map((item) => (
                  <div key={item.id} className="flex gap-2.5 items-start">
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setTab('All');
                setSearchQuery('');
              }}
              className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all notifications
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
