import { Types } from 'mongoose';
import { Notification, INotification } from '../../models/Notification';
import { emitToUser } from '../../socket/socket';

export interface CreateNotificationInput {
  userId: string;
  type: 'expense_added' | 'settlement_recorded' | 'member_added' | 'general';
  title: string;
  message: string;
  link?: string;
}

export class NotificationsService {
  static async createNotification(input: CreateNotificationInput): Promise<INotification> {
    const notification = await Notification.create({
      userId: new Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link || '',
    });

    // Real-time delivery
    emitToUser(input.userId, 'notification:new', notification);

    return notification;
  }

  static async getUserNotifications(userId: string): Promise<{
    notifications: INotification[];
    unreadCount: number;
  }> {
    const notifications = await Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });

    return { notifications, unreadCount };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { read: true },
      { returnDocument: 'after' }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true }
    );
  }
}
