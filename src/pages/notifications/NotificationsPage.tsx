import React, { useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  ShieldAlert,
  GitPullRequest,
  GitBranch,
  Cpu,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !item.read;
    return item.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical_bug':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'pr_reviewed':
        return <GitPullRequest className="w-5 h-5 text-emerald-500" />;
      case 'scan_complete':
        return <GitBranch className="w-5 h-5 text-amber-500" />;
      case 'system':
        return <Cpu className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications & Activity Stream
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time alerts from AI code scanners, pull request checks, and security advisories
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-xs text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-primary text-white font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'unread'
              ? 'bg-primary text-white font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType('critical_bug')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'critical_bug'
              ? 'bg-primary text-white font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Critical Bugs
        </button>
        <button
          onClick={() => setFilterType('scan_complete')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'scan_complete'
              ? 'bg-primary text-white font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Scans
        </button>
        <button
          onClick={() => setFilterType('system')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterType === 'system'
              ? 'bg-primary text-white font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          System Updates
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No notifications in this view.
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-muted/40 cursor-pointer group ${
                !item.read ? 'bg-primary/5' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs flex-shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm ${
                      !item.read
                        ? 'font-bold text-foreground'
                        : 'font-medium text-foreground/80'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>

                {item.linkUrl && (
                  <div className="pt-1">
                    <Link
                      to={item.linkUrl}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      Investigate issue <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-muted transition-all"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

