import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import type { GroupAnalyticsResponse } from '../../../types/analytics';

export const useGroupAnalytics = (groupId: string) => {
  return useQuery<GroupAnalyticsResponse, Error>({
    queryKey: ['analytics', groupId],
    queryFn: () => analyticsApi.getGroupAnalytics(groupId),
    enabled: Boolean(groupId),
  });
};
