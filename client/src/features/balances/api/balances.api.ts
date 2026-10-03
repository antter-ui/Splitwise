import { api } from '../../../lib/api';
import type { GroupBalanceResponse, UserGlobalBalances } from '../../../types/balance';

export const balancesApi = {
  getGroupBalances: async (groupId: string): Promise<GroupBalanceResponse> => {
    const res = await api.get<{ success: boolean; data: GroupBalanceResponse }>(
      `/groups/${groupId}/balances`
    );
    return res.data.data;
  },

  getUserGlobalBalances: async (): Promise<UserGlobalBalances> => {
    const res = await api.get<{ success: boolean; data: UserGlobalBalances }>(
      '/users/balances'
    );
    return res.data.data;
  },
};
