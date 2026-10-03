import type { GroupMember } from './group';

export interface PopulatedDebt {
  from: GroupMember;
  to: GroupMember;
  amount: number;
}

export interface MemberBalance {
  user: GroupMember;
  netBalance: number;
}

export interface GroupBalanceResponse {
  groupId: string;
  currency: string;
  balances: MemberBalance[];
  simplifiedDebts: PopulatedDebt[];
  currentUserSummary: {
    netBalance: number;
    owedToYou: number;
    youOwe: number;
  };
}

export interface UserGlobalBalances {
  totalBalance: number;
  totalOwed: number;
  totalOwe: number;
}
