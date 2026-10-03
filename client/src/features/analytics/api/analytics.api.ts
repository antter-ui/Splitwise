import { api } from '../../../lib/api';
import type { GroupAnalyticsResponse } from '../../../types/analytics';

export const analyticsApi = {
  getGroupAnalytics: async (groupId: string): Promise<GroupAnalyticsResponse> => {
    const res = await api.get<{ success: boolean; data: GroupAnalyticsResponse }>(
      `/groups/${groupId}/analytics`
    );
    return res.data.data;
  },
};
