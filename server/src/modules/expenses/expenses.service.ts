import { Types } from 'mongoose';
import { Expense, IExpense, IParticipant } from '../../models/Expense';
import { Group } from '../../models/Group';
import { ApiError } from '../../middleware/errorHandler';
import { CreateExpenseInput } from './expenses.validation';

export class ExpensesService {
  private static calculateParticipantAmounts(
    totalAmount: number,
    splitType: 'equal' | 'exact' | 'percentage' | 'shares',
    participants: CreateExpenseInput['participants']
  ): IParticipant[] {
    const count = participants.length;
    if (count === 0) {
      throw ApiError.badRequest('No participants specified');
    }

    if (splitType === 'exact') {
      return participants.map((p) => ({
        user: new Types.ObjectId(p.userId),
        amount: Math.round((p.amount || 0) * 100) / 100,
      }));
    }

    if (splitType === 'equal') {
      const perPerson = Math.floor((totalAmount / count) * 100) / 100;
      const remainder = Math.round((totalAmount - perPerson * count) * 100) / 100;

      return participants.map((p, index) => ({
        user: new Types.ObjectId(p.userId),
        amount: index === 0 ? Math.round((perPerson + remainder) * 100) / 100 : perPerson,
      }));
    }

    if (splitType === 'percentage') {
      let accumulated = 0;
      const result: IParticipant[] = [];

      for (let i = 0; i < count; i++) {
        const p = participants[i];
        const pct = p.percentage || 0;
        let amt = Math.round(totalAmount * (pct / 100) * 100) / 100;
        if (i === count - 1) {
          amt = Math.round((totalAmount - accumulated) * 100) / 100;
        } else {
          accumulated += amt;
        }
        result.push({
          user: new Types.ObjectId(p.userId),
          amount: amt,
          percentage: pct,
        });
      }
      return result;
    }

    if (splitType === 'shares') {
      const totalShares = participants.reduce((sum, p) => sum + (p.share || 1), 0);
      let accumulated = 0;
      const result: IParticipant[] = [];

      for (let i = 0; i < count; i++) {
        const p = participants[i];
        const share = p.share || 1;
        let amt = Math.round(totalAmount * (share / totalShares) * 100) / 100;
        if (i === count - 1) {
          amt = Math.round((totalAmount - accumulated) * 100) / 100;
        } else {
          accumulated += amt;
        }
        result.push({
          user: new Types.ObjectId(p.userId),
          amount: amt,
          share,
        });
      }
      return result;
    }

    throw ApiError.badRequest(`Unsupported split type: ${splitType}`);
  }

  static async createExpense(
    groupId: string,
    requestingUserId: string,
    input: CreateExpenseInput
  ): Promise<IExpense> {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some((m) => m.toString() === requestingUserId);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    // Verify paidBy is a group member
    const isPaidByMember = group.members.some((m) => m.toString() === input.paidBy);
    if (!isPaidByMember) {
      throw ApiError.badRequest('Payer must be a member of the group');
    }

    // Verify all participants are group members
    for (const p of input.participants) {
      const isParticipantMember = group.members.some((m) => m.toString() === p.userId);
      if (!isParticipantMember) {
        throw ApiError.badRequest(`Participant ${p.userId} is not a member of this group`);
      }
    }

    const calculatedParticipants = this.calculateParticipantAmounts(
      input.amount,
      input.splitType,
      input.participants
    );

    const expense = await Expense.create({
      groupId: new Types.ObjectId(groupId),
      description: input.description,
      amount: input.amount,
      currency: input.currency || group.currency,
      paidBy: new Types.ObjectId(input.paidBy),
      splitType: input.splitType,
      participants: calculatedParticipants,
      category: input.category || 'General',
      notes: input.notes || '',
      createdBy: new Types.ObjectId(requestingUserId),
    });

    return expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'participants.user', select: 'name email avatar' },
    ]);
  }

  static async getGroupExpenses(groupId: string, requestingUserId: string): Promise<IExpense[]> {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some((m) => m.toString() === requestingUserId);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return Expense.find({ groupId: new Types.ObjectId(groupId) })
      .populate('paidBy', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  static async getExpenseById(expenseId: string, requestingUserId: string): Promise<IExpense> {
    const expense = await Expense.findById(expenseId)
      .populate('paidBy', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    const group = await Group.findById(expense.groupId);
    if (!group || !group.members.some((m) => m.toString() === requestingUserId)) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return expense;
  }

  static async deleteExpense(expenseId: string, requestingUserId: string): Promise<void> {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    const group = await Group.findById(expense.groupId);
    if (!group) {
      throw ApiError.notFound('Associated group not found');
    }

    const isCreator = expense.createdBy.toString() === requestingUserId;
    const isPayer = expense.paidBy.toString() === requestingUserId;
    const isGroupAdmin = group.createdBy.toString() === requestingUserId;

    if (!isCreator && !isPayer && !isGroupAdmin) {
      throw ApiError.forbidden('Only the creator, payer, or group admin can delete this expense');
    }

    await Expense.findByIdAndDelete(expenseId);
  }
}
