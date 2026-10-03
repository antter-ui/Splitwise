import { Types } from 'mongoose';
import { Group } from '../../models/Group';
import { Expense } from '../../models/Expense';
import { Settlement } from '../../models/Settlement';
import { ApiError } from '../../middleware/errorHandler';
import { DebtSimplifier, SimplifiedDebt } from '../../utils/debtSimplifier';

export interface PopulatedDebt {
  from: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  to: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
}

export interface GroupBalanceResponse {
  groupId: string;
  currency: string;
  balances: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    netBalance: number;
  }>;
  simplifiedDebts: PopulatedDebt[];
  currentUserSummary: {
    netBalance: number;
    owedToYou: number;
    youOwe: number;
  };
}

export class BalancesService {
  static async getGroupBalances(
    groupId: string,
    requestingUserId: string
  ): Promise<GroupBalanceResponse> {
    const group = await Group.findById(groupId).populate('members', 'name email avatar');
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some((m: any) => m._id.toString() === requestingUserId);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    const [expenses, settlements] = await Promise.all([
      Expense.find({ groupId: new Types.ObjectId(groupId) }),
      Settlement.find({ groupId: new Types.ObjectId(groupId) }),
    ]);

    const netBalancesMap = DebtSimplifier.calculateNetBalances(expenses, settlements);
    const rawDebts: SimplifiedDebt[] = DebtSimplifier.simplifyDebts(netBalancesMap);

    // Map member balances with user details
    const memberMap = new Map<string, any>();
    for (const m of group.members as any[]) {
      memberMap.set(m._id.toString(), {
        _id: m._id.toString(),
        name: m.name,
        email: m.email,
        avatar: m.avatar,
      });
    }

    const balancesList = Array.from(memberMap.entries()).map(([userId, userObj]) => ({
      user: userObj,
      netBalance: netBalancesMap.get(userId) || 0,
    }));

    // Populate simplified debts
    const populatedDebts: PopulatedDebt[] = [];
    for (const debt of rawDebts) {
      const fromUser = memberMap.get(debt.from);
      const toUser = memberMap.get(debt.to);
      if (fromUser && toUser) {
        populatedDebts.push({
          from: fromUser,
          to: toUser,
          amount: debt.amount,
        });
      }
    }

    // Current user perspective
    const userNet = netBalancesMap.get(requestingUserId) || 0;
    let owedToYou = 0;
    let youOwe = 0;

    for (const d of populatedDebts) {
      if (d.to._id === requestingUserId) {
        owedToYou += d.amount;
      } else if (d.from._id === requestingUserId) {
        youOwe += d.amount;
      }
    }

    return {
      groupId: group._id.toString(),
      currency: group.currency,
      balances: balancesList,
      simplifiedDebts: populatedDebts,
      currentUserSummary: {
        netBalance: userNet,
        owedToYou: Math.round(owedToYou * 100) / 100,
        youOwe: Math.round(youOwe * 100) / 100,
      },
    };
  }

  static async getUserGlobalBalances(userId: string): Promise<{
    totalBalance: number;
    totalOwed: number;
    totalOwe: number;
  }> {
    const groups = await Group.find({ members: new Types.ObjectId(userId) }).select('_id');

    let totalBalance = 0;
    let totalOwed = 0;
    let totalOwe = 0;

    for (const g of groups) {
      const gBalances = await this.getGroupBalances(g._id.toString(), userId);
      totalBalance += gBalances.currentUserSummary.netBalance;
      totalOwed += gBalances.currentUserSummary.owedToYou;
      totalOwe += gBalances.currentUserSummary.youOwe;
    }

    return {
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalOwe: Math.round(totalOwe * 100) / 100,
    };
  }
}
