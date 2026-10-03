import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups.api';
import type { Group, CreateGroupPayload } from '../../../types/group';

export const GROUPS_QUERY_KEY = ['groups'];

export const useGroups = () => {
  return useQuery<Group[], Error>({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: groupsApi.list,
  });
};

export const useGroup = (id: string) => {
  return useQuery<Group, Error>({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.get(id),
    enabled: Boolean(id),
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, CreateGroupPayload>({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useAddMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, string>({
    mutationFn: (email: string) => groupsApi.addMember(groupId, email),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(['groups', groupId], updatedGroup);
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useRemoveMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Group, Error, string>({
    mutationFn: (memberId: string) => groupsApi.removeMember(groupId, memberId),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(['groups', groupId], updatedGroup);
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (groupId: string) => groupsApi.delete(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};
