
import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { NotificationItem } from '../types';

interface NotificationApiItem {
  id: string;
  title: string;
  message: string;
  type: NotificationItem['type'];
  timestamp: string;
  read: boolean;
  link_url?: string | null;
  linkUrl?: string;
}

interface NotificationApiResponse {
  notifications: NotificationApiItem[];
  count: number;
  unread_count: number;
  limit: number;
  offset: number;
}

type NewNotification = Omit<
  NotificationItem,
  'id' | 'timestamp' | 'read'
>;

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (item: NewNotification) => Promise<void>;
  startSimulation: () => void;
}

const toNotificationItem = (
  item: NotificationApiItem,
): NotificationItem => ({
  id: item.id,
  title: item.title,
  message: item.message,
  type: item.type,
  timestamp: item.timestamp,
  read: item.read,
  linkUrl: item.linkUrl ?? item.link_url ?? undefined,
});

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: { data?: { detail?: string } };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  return 'Unable to complete the notification request. Please try again.';
};

const syncUnreadCount = (notifications: NotificationItem[]) =>
  notifications.filter((item) => !item.read).length;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get<NotificationApiResponse>(
        '/notifications',
        { params: { limit: 100, offset: 0 } },
      );

      const notifications = response.data.notifications.map(
        toNotificationItem,
      );

      set({
        notifications,
        unreadCount: response.data.unread_count,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
    }
  },

  markAsRead: async (id) => {
    const notification = get().notifications.find((item) => item.id === id);

    if (!notification || notification.read) return;

    try {
      await apiClient.patch(
        `/notifications/${encodeURIComponent(id)}/read`,
      );

      const notifications = get().notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      );

      set({
        notifications,
        unreadCount: syncUnreadCount(notifications),
        error: null,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  markAllAsRead: async () => {
    const previousNotifications = get().notifications;

    if (!previousNotifications.some((item) => !item.read)) return;

    try {
      await apiClient.patch('/notifications/read-all');

      const notifications = get().notifications.map((item) => ({
        ...item,
        read: true,
      }));

      set({
        notifications,
        unreadCount: 0,
        error: null,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      await apiClient.delete(
        `/notifications/${encodeURIComponent(id)}`,
      );

      const notifications = get().notifications.filter(
        (item) => item.id !== id,
      );

      set({
        notifications,
        unreadCount: syncUnreadCount(notifications),
        error: null,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  addNotification: async (item) => {
    try {
      const response = await apiClient.post<NotificationApiItem>(
        '/notifications',
        {
          title: item.title,
          message: item.message,
          type: item.type,
          link_url: item.linkUrl ?? null,
        },
      );

      const notification = toNotificationItem(response.data);

      const notifications = [
        notification,
        ...get().notifications.filter(
          (existing) => existing.id !== notification.id,
        ),
      ];

      set({
        notifications,
        unreadCount: syncUnreadCount(notifications),
        error: null,
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  // Kept temporarily for compatibility with existing components.
  // It deliberately does not generate simulated notifications.
  startSimulation: () => {},
}));
