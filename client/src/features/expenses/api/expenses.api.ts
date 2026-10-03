import { api } from '../../../lib/api';
import type { Expense, CreateExpensePayload } from '../../../types/expense';

export const expensesApi = {
  listByGroup: async (groupId: string): Promise<Expense[]> => {
    const res = await api.get<{ success: boolean; data: { expenses: Expense[] } }>(
      `/groups/${groupId}/expenses`
    );
    return res.data.data.expenses;
  },

  create: async (groupId: string, payload: CreateExpensePayload): Promise<Expense> => {
    const res = await api.post<{ success: boolean; data: { expense: Expense } }>(
      `/groups/${groupId}/expenses`,
      payload
    );
    return res.data.data.expense;
  },

  delete: async (expenseId: string): Promise<void> => {
    await api.delete(`/expenses/${expenseId}`);
  },
};
