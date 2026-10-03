import { Router } from 'express';
import { ExpensesController } from './expenses.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createExpenseSchema } from './expenses.validation';

const groupExpenseRouter = Router({ mergeParams: true });
const individualExpenseRouter = Router();

// Require authentication for all expense endpoints
groupExpenseRouter.use(authenticate);
individualExpenseRouter.use(authenticate);

groupExpenseRouter.post('/', validateRequest(createExpenseSchema), ExpensesController.createExpense);
groupExpenseRouter.get('/', ExpensesController.listExpenses);

individualExpenseRouter.get('/:id', ExpensesController.getExpense);
individualExpenseRouter.delete('/:id', ExpensesController.deleteExpense);

export { groupExpenseRouter, individualExpenseRouter };
