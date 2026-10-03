import { Types } from 'mongoose';
import { Settlement, ISettlement } from '../../models/Settlement';
import { Group } from '../../models/Group';
import { ApiError } from '../../middleware/errorHandler';
import { CreateSettlementInput } from './settlements.validation';
import { emitToGroup } from '../../socket/socket';
import { NotificationsService } from '../notifications/notifications.service';

export class SettlementsService {
  static async createSettlement(
    groupId: string,
    fromUserId: string,
    input: CreateSettlementInput
  ): Promise<ISettlement> {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isFromMember = group.members.some((m) => m.toString() === fromUserId);
    const isToMember = group.members.some((m) => m.toString() === input.to);

    if (!isFromMember || !isToMember) {
      throw ApiError.badRequest('Both sender and recipient must be members of the group');
    }

    if (fromUserId === input.to) {
      throw ApiError.badRequest('You cannot settle debt with yourself');
    }

    const settlement = await Settlement.create({
      groupId: new Types.ObjectId(groupId),
      from: new Types.ObjectId(fromUserId),
      to: new Types.ObjectId(input.to),
      amount: input.amount,
      currency: input.currency || group.currency,
      note: input.note || 'Settled balance',
      createdBy: new Types.ObjectId(fromUserId),
    });

    await settlement.populate([
      { path: 'from', select: 'name email avatar' },
      { path: 'to', select: 'name email avatar' },
    ]);

    // Real-time broadcast
    emitToGroup(groupId, 'settlement:created', settlement);

    // Notify recipient
    const fromName = (settlement.from as any)?.name || 'Someone';
    NotificationsService.createNotification({
      userId: input.to,
      type: 'settlement_recorded',
      title: 'Payment Received',
      message: `${fromName} recorded a payment of ${settlement.currency} ${settlement.amount} to you`,
      link: `/groups/${groupId}`,
    }).catch((err) => console.error('Notification error:', err));

    return settlement;
  }

  static async getGroupSettlements(groupId: string, requestingUserId: string): Promise<ISettlement[]> {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some((m) => m.toString() === requestingUserId);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return Settlement.find({ groupId: new Types.ObjectId(groupId) })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });
  }
}
