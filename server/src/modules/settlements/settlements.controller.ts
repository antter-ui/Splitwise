import { Request, Response, NextFunction } from 'express';
import { SettlementsService } from './settlements.service';

export class SettlementsController {
  static async createSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlement = await SettlementsService.createSettlement(
        req.params.groupId as string,
        req.user!._id.toString(),
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Settlement recorded successfully',
        data: { settlement },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listSettlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlements = await SettlementsService.getGroupSettlements(
        req.params.groupId as string,
        req.user!._id.toString()
      );
      res.status(200).json({
        success: true,
        data: { settlements },
      });
    } catch (error) {
      next(error);
    }
  }
}
