import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '../api/settlements.api';
import type { Settlement, CreateSettlementPayload } from '../../../types/settlement';

export const useGroupSettlements = (groupId: string) => {
  return useQuery<Settlement[], Error>({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsApi.listByGroup(groupId),
    enabled: Boolean(groupId),
  });
};

export const useCreateSettlement = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Settlement, Error, CreateSettlementPayload>({
    mutationFn: (payload: CreateSettlementPayload) => settlementsApi.create(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', 'global'] });
    },
  });
};
