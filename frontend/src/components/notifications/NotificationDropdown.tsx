import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading,
    error,
  } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical_bug':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'pr_reviewed':
        return <GitPullRequest className="w-4 h-4 text-emerald-500" />;
      case 'scan_complete':
        return <GitBranch className="w-4 h-4 text-amber-500" />;
      case 'system':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch {
      // The store retains the API error for display.
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch {
      // The store retains the API error for display.
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.stopPropagation();

    try {
      await deleteNotification(id);
    } catch {
      // The store retains the API error for display.
    }
  };

  const visibleNotifications = notifications.slice(0, 6);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="View notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-card text-card-foreground rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Notifications</h4>

              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Loading notifications…
              </div>
            ) : error && notifications.length === 0 ? (
              <div className="p-5 text-center">
                <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                <p className="text-sm text-foreground">
                  Couldn't load notifications
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => void fetchNotifications()}
                  className="text-xs text-primary hover:underline mt-3"
                >
                  Try again
                </button>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications right now
              </div>
            ) : (
              visibleNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) {
                      void handleMarkAsRead(item.id);
                    }
                  }}
                  className={`p-3 text-left transition-colors flex gap-3 items-start group hover:bg-muted/50 ${
                    !item.read ? 'bg-primary/5 cursor-pointer' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-card border border-border flex-shrink-0">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${
                          !item.read
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/80'
                        }`}
                      >
                        {item.title}
                      </p>

                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {item.message}
                    </p>

                    {item.linkUrl && (
                      <Link
                        to={item.linkUrl}
                        onClick={() => {
                          setIsOpen(false);
                          if (!item.read) {
                            void handleMarkAsRead(item.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 font-medium"
                      >
                        View details
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => void handleDelete(e, item.id)}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 rounded transition-opacity"
                    title="Delete notification"
                    aria-label={`Delete notification: ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/20 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary font-medium hover:underline block py-1"
            >
              View all notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
