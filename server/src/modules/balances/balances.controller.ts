import { Request, Response, NextFunction } from 'express';
import { BalancesService } from './balances.service';

export class BalancesController {
  static async getGroupBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await BalancesService.getGroupBalances(
        req.params.groupId as string,
        req.user!._id.toString()
      );
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserGlobalBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await BalancesService.getUserGlobalBalances(req.user!._id.toString());
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
