import { api } from '../../../lib/api';
import type { Settlement, CreateSettlementPayload } from '../../../types/settlement';

export const settlementsApi = {
  listByGroup: async (groupId: string): Promise<Settlement[]> => {
    const res = await api.get<{ success: boolean; data: { settlements: Settlement[] } }>(
      `/groups/${groupId}/settlements`
    );
    return res.data.data.settlements;
  },

  create: async (groupId: string, payload: CreateSettlementPayload): Promise<Settlement> => {
    const res = await api.post<{ success: boolean; data: { settlement: Settlement } }>(
      `/groups/${groupId}/settlements`,
      payload
    );
    return res.data.data.settlement;
  },
};
