import { api } from '../../../lib/api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../../types/auth';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data.data.user;
  },

  login: async (payload: LoginPayload): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    return res.data.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<AuthResponse>('/auth/me');
    return res.data.data.user;
  },
};
