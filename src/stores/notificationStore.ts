import { create } from 'zustand';
import { NotificationItem } from '../types';
import { mockNotifications } from '../api/mockData';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isSimulatingWs: boolean;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  startSimulation: () => void;
}

const randomLiveAlerts = [
  {
    title: 'High Risk Branch Push: fix/cache-eviction',
    message: 'Sarah pushed 3 commits to core-payment-gateway. 2 high complexity functions identified.',
    type: 'critical_bug' as const,
    linkUrl: '/github'
  },
  {
    title: 'Model Retraining Checkpoint',
    message: 'DeepCode-BugPredictor-v4 validation loss decreased to 0.041. Test F1 reached 95.1%.',
    type: 'system' as const,
    linkUrl: '/admin'
  },
  {
    title: 'New Bug Assignment: ISSUE-1048',
    message: 'Marcus Chen assigned "Unchecked Type Coercion in JWT claim parser" to your queue.',
    type: 'issue_assigned' as const,
    linkUrl: '/issues'
  },
  {
    title: 'Automated PR Review Finished',
    message: 'PR #110 "refactor: simplify token cache" passed all 18 security heuristics.',
    type: 'pr_reviewed' as const,
    linkUrl: '/github'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  isSimulatingWs: false,

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  addNotification: (item) => {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Math.random().toString(36).substring(2, 8),
      timestamp: 'Just now',
      read: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  startSimulation: () => {
    if (get().isSimulatingWs) return;
    set({ isSimulatingWs: true });

    // Periodically emit real-time WebSocket alerts
    let idx = 0;
    const interval = window.setInterval(() => {
      const nextAlert = randomLiveAlerts[idx % randomLiveAlerts.length];
      get().addNotification(nextAlert);
      idx++;
    }, 45000); // every 45s a realistic notification pops up

    // Clean up if window closes
    window.addEventListener('beforeunload', () => clearInterval(interval));
  },
}));

