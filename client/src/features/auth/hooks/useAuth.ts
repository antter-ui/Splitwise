import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { LoginPayload, RegisterPayload, User } from '../../../types/auth';

export const AUTH_QUERY_KEY = ['auth', 'me'];

export const useMe = () => {
  return useQuery<User, Error>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, LoginPayload>({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, RegisterPayload>({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });
};
