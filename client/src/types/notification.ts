export interface NotificationItem {
  _id: string;
  userId: string;
  type: 'expense_added' | 'settlement_recorded' | 'member_added' | 'general';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}
