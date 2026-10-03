import { useQuery } from '@tanstack/react-query';
import { balancesApi } from '../api/balances.api';
import type { GroupBalanceResponse, UserGlobalBalances } from '../../../types/balance';

export const useGroupBalances = (groupId: string) => {
  return useQuery<GroupBalanceResponse, Error>({
    queryKey: ['balances', groupId],
    queryFn: () => balancesApi.getGroupBalances(groupId),
    enabled: Boolean(groupId),
  });
};

export const useGlobalBalances = () => {
  return useQuery<UserGlobalBalances, Error>({
    queryKey: ['balances', 'global'],
    queryFn: balancesApi.getUserGlobalBalances,
  });
};
