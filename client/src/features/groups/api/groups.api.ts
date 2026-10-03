import { api } from '../../../lib/api';
import type { Group, CreateGroupPayload } from '../../../types/group';

export const groupsApi = {
  list: async (): Promise<Group[]> => {
    const res = await api.get<{ success: boolean; data: { groups: Group[] } }>('/groups');
    return res.data.data.groups;
  },

  get: async (id: string): Promise<Group> => {
    const res = await api.get<{ success: boolean; data: { group: Group } }>(`/groups/${id}`);
    return res.data.data.group;
  },

  create: async (payload: CreateGroupPayload): Promise<Group> => {
    const res = await api.post<{ success: boolean; data: { group: Group } }>('/groups', payload);
    return res.data.data.group;
  },

  addMember: async (groupId: string, email: string): Promise<Group> => {
    const res = await api.post<{ success: boolean; data: { group: Group } }>(`/groups/${groupId}/members`, {
      email,
    });
    return res.data.data.group;
  },

  removeMember: async (groupId: string, memberId: string): Promise<Group> => {
    const res = await api.delete<{ success: boolean; data: { group: Group } }>(
      `/groups/${groupId}/members/${memberId}`
    );
    return res.data.data.group;
  },

  delete: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },
};
