import type { GroupMember } from './group';

export interface Settlement {
  _id: string;
  groupId: string;
  from: GroupMember;
  to: GroupMember;
  amount: number;
  currency: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettlementPayload {
  to: string;
  amount: number;
  currency?: string;
  note?: string;
}
