import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', NotificationsController.listNotifications);
router.patch('/:id/read', NotificationsController.markAsRead);
router.post('/read-all', NotificationsController.markAllAsRead);

export const notificationRoutes = router;
