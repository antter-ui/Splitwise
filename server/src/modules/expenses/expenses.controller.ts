import { Request, Response, NextFunction } from 'express';
import { ExpensesService } from './expenses.service';

export class ExpensesController {
  static async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpensesService.createExpense(
        req.params.groupId as string,
        req.user!._id.toString(),
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await ExpensesService.getGroupExpenses(
        req.params.groupId as string,
        req.user!._id.toString()
      );
      res.status(200).json({
        success: true,
        data: { expenses },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpensesService.getExpenseById(
        req.params.id as string,
        req.user!._id.toString()
      );
      res.status(200).json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ExpensesService.deleteExpense(req.params.id as string, req.user!._id.toString());
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
