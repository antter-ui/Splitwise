import { Router } from 'express';
import { SettlementsController } from './settlements.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createSettlementSchema } from './settlements.validation';

const settlementRouter = Router({ mergeParams: true });

settlementRouter.use(authenticate);

settlementRouter.post('/', validateRequest(createSettlementSchema), SettlementsController.createSettlement);
settlementRouter.get('/', SettlementsController.listSettlements);

export { settlementRouter };
