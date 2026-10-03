import { Types } from 'mongoose';
import { Expense } from '../../models/Expense';
import { Settlement } from '../../models/Settlement';
import { Group } from '../../models/Group';
import { ApiError } from '../../middleware/errorHandler';

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement';
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  actor: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

export class AnalyticsService {
  static async getGroupAnalytics(
    groupId: string,
    requestingUserId: string
  ): Promise<{
    totalSpent: number;
    categoryBreakdown: CategoryBreakdown[];
    recentActivities: ActivityItem[];
  }> {
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    if (!group.members.some((m) => m.toString() === requestingUserId)) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    const gId = new Types.ObjectId(groupId);

    // 1. Aggregation for category breakdown
    const categoryStats = await Expense.aggregate([
      { $match: { groupId: gId } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalSpent = categoryStats.reduce((sum, item) => sum + item.totalAmount, 0);

    const categoryBreakdown: CategoryBreakdown[] = categoryStats.map((item) => ({
      category: item._id || 'General',
      totalAmount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage: totalSpent > 0 ? Math.round((item.totalAmount / totalSpent) * 100) : 0,
    }));

    // 2. Activities: merge recent expenses and settlements
    const [recentExpenses, recentSettlements] = await Promise.all([
      Expense.find({ groupId: gId })
        .populate('paidBy', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
      Settlement.find({ groupId: gId })
        .populate('from', 'name avatar')
        .populate('to', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const activities: ActivityItem[] = [];

    for (const exp of recentExpenses) {
      activities.push({
        id: exp._id.toString(),
        type: 'expense',
        title: exp.description,
        subtitle: `Paid by ${(exp.paidBy as any)?.name || 'Someone'} (${exp.splitType} split)`,
        amount: exp.amount,
        currency: exp.currency,
        actor: {
          name: (exp.paidBy as any)?.name || 'User',
          avatar: (exp.paidBy as any)?.avatar,
        },
        createdAt: exp.createdAt,
      });
    }

    for (const s of recentSettlements) {
      activities.push({
        id: s._id.toString(),
        type: 'settlement',
        title: `Settlement: ${(s.from as any)?.name} → ${(s.to as any)?.name}`,
        subtitle: s.note || 'Payment recorded',
        amount: s.amount,
        currency: s.currency,
        actor: {
          name: (s.from as any)?.name || 'User',
          avatar: (s.from as any)?.avatar,
        },
        createdAt: s.createdAt,
      });
    }

    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      categoryBreakdown,
      recentActivities: activities.slice(0, 15),
    };
  }

  static async getUserGlobalAnalytics(userId: string): Promise<{
    totalExpensesCount: number;
    categoryBreakdown: CategoryBreakdown[];
  }> {
    const userGroups = await Group.find({ members: new Types.ObjectId(userId) }).select('_id');
    const groupIds = userGroups.map((g) => g._id);

    const categoryStats = await Expense.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalSpent = categoryStats.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalExpensesCount = categoryStats.reduce((sum, item) => sum + item.count, 0);

    const categoryBreakdown: CategoryBreakdown[] = categoryStats.map((item) => ({
      category: item._id || 'General',
      totalAmount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage: totalSpent > 0 ? Math.round((item.totalAmount / totalSpent) * 100) : 0,
    }));

    return {
      totalExpensesCount,
      categoryBreakdown,
    };
  }
}
