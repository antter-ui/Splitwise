import { Request, Response, NextFunction } from 'express';
import { GroupsService } from './groups.service';

export class GroupsController {
  static async createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await GroupsService.createGroup(req.user!._id.toString(), req.body);
      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groups = await GroupsService.getUserGroups(req.user!._id.toString());
      res.status(200).json({
        success: true,
        data: { groups },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await GroupsService.getGroupById(req.params.id as string, req.user!._id.toString());
      res.status(200).json({
        success: true,
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await GroupsService.addMemberByEmail(
        req.params.id as string,
        req.user!._id.toString(),
        req.body.email
      );
      res.status(200).json({
        success: true,
        message: 'Member added successfully',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await GroupsService.removeMember(
        req.params.id as string,
        req.user!._id.toString(),
        req.params.memberId as string
      );
      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await GroupsService.updateGroup(
        req.params.id as string,
        req.user!._id.toString(),
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Group updated successfully',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await GroupsService.deleteGroup(req.params.id as string, req.user!._id.toString());
      res.status(200).json({
        success: true,
        message: 'Group deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
