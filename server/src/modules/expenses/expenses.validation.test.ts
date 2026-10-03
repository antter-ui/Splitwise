import { describe, it, expect } from 'vitest';
import { createExpenseSchema } from './expenses.validation';

describe('Expense Validation & Split Type Rules', () => {
  it('should accept valid equal split with participants list', () => {
    const input = {
      description: 'Dinner at Italian Place',
      amount: 1500,
      paidBy: 'user123',
      splitType: 'equal' as const,
      participants: [{ userId: 'user123' }, { userId: 'user456' }, { userId: 'user789' }],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should accept exact split when participants sum equals total amount', () => {
    const input = {
      description: 'Movie tickets',
      amount: 1000,
      paidBy: 'user123',
      splitType: 'exact' as const,
      participants: [
        { userId: 'user123', amount: 600 },
        { userId: 'user456', amount: 400 },
      ],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject exact split when sum differs from total amount', () => {
    const input = {
      description: 'Movie tickets',
      amount: 1000,
      paidBy: 'user123',
      splitType: 'exact' as const,
      participants: [
        { userId: 'user123', amount: 500 },
        { userId: 'user456', amount: 300 }, // sum = 800 != 1000
      ],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Participant amounts or percentages');
    }
  });

  it('should accept percentage split when sum equals 100%', () => {
    const input = {
      description: 'Airbnb booking',
      amount: 6000,
      paidBy: 'user123',
      splitType: 'percentage' as const,
      participants: [
        { userId: 'user123', percentage: 50 },
        { userId: 'user456', percentage: 25 },
        { userId: 'user789', percentage: 25 },
      ],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject percentage split when sum does not equal 100%', () => {
    const input = {
      description: 'Airbnb booking',
      amount: 6000,
      paidBy: 'user123',
      splitType: 'percentage' as const,
      participants: [
        { userId: 'user123', percentage: 50 },
        { userId: 'user456', percentage: 20 }, // sum = 70% != 100%
      ],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject negative expense amounts', () => {
    const input = {
      description: 'Invalid negative',
      amount: -50,
      paidBy: 'user123',
      splitType: 'equal' as const,
      participants: [{ userId: 'user123' }],
    };

    const result = createExpenseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
