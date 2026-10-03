import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

const groupAnalyticsRouter = Router({ mergeParams: true });
const userAnalyticsRouter = Router();

groupAnalyticsRouter.use(authenticate);
userAnalyticsRouter.use(authenticate);

groupAnalyticsRouter.get('/', AnalyticsController.getGroupAnalytics);
userAnalyticsRouter.get('/', AnalyticsController.getUserAnalytics);

export { groupAnalyticsRouter, userAnalyticsRouter };
