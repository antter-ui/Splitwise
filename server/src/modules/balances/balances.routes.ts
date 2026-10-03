import { Router } from 'express';
import { BalancesController } from './balances.controller';
import { authenticate } from '../../middleware/auth';

const groupBalancesRouter = Router({ mergeParams: true });
const userBalancesRouter = Router();

groupBalancesRouter.use(authenticate);
userBalancesRouter.use(authenticate);

groupBalancesRouter.get('/', BalancesController.getGroupBalances);
userBalancesRouter.get('/', BalancesController.getUserGlobalBalances);

export { groupBalancesRouter, userBalancesRouter };
