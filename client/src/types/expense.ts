import type { GroupMember } from './group';

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Participant {
  user: GroupMember;
  amount: number;
  share?: number;
  percentage?: number;
}

export interface Expense {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: GroupMember;
  splitType: SplitType;
  participants: Participant[];
  category: string;
  notes?: string;
  createdBy: GroupMember;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  currency?: string;
  paidBy: string;
  splitType: SplitType;
  category?: string;
  notes?: string;
  participants: {
    userId: string;
    amount?: number;
    share?: number;
    percentage?: number;
  }[];
}
