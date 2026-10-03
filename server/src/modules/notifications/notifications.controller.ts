import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  static async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await NotificationsService.getUserNotifications(req.user!._id.toString());
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await NotificationsService.markAsRead(
        req.params.id as string,
        req.user!._id.toString()
      );
      res.status(200).json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationsService.markAllAsRead(req.user!._id.toString());
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}
