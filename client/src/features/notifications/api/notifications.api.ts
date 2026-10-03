import { api } from '../../../lib/api';
import type { NotificationsResponse, NotificationItem } from '../../../types/notification';

export const notificationsApi = {
  list: async (): Promise<NotificationsResponse> => {
    const res = await api.get<{ success: boolean; data: NotificationsResponse }>(
      '/notifications'
    );
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.patch<{ success: boolean; data: { notification: NotificationItem } }>(
      `/notifications/${id}/read`
    );
    return res.data.data.notification;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
