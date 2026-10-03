import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses.api';
import type { Expense, CreateExpensePayload } from '../../../types/expense';

export const useGroupExpenses = (groupId: string) => {
  return useQuery<Expense[], Error>({
    queryKey: ['expenses', groupId],
    queryFn: () => expensesApi.listByGroup(groupId),
    enabled: Boolean(groupId),
  });
};

export const useCreateExpense = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, CreateExpensePayload>({
    mutationFn: (payload: CreateExpensePayload) => expensesApi.create(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
    },
  });
};

export const useDeleteExpense = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (expenseId: string) => expensesApi.delete(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
    },
  });
};
