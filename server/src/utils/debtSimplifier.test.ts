import { describe, it, expect } from 'vitest';
import { DebtSimplifier } from './debtSimplifier';

describe('DebtSimplifier Engine', () => {
  it('should correctly compute net balances for equal splits', () => {
    const expenses = [
      {
        paidBy: 'userA',
        amount: 300,
        participants: [
          { user: 'userA', amount: 100 },
          { user: 'userB', amount: 100 },
          { user: 'userC', amount: 100 },
        ],
      },
    ];

    const balances = DebtSimplifier.calculateNetBalances(expenses);

    expect(balances.get('userA')).toBe(200);
    expect(balances.get('userB')).toBe(-100);
    expect(balances.get('userC')).toBe(-100);
  });

  it('should simplify debts to minimum transactions (2 debtors -> 1 creditor)', () => {
    const balances = new Map<string, number>([
      ['userA', 200],
      ['userB', -100],
      ['userC', -100],
    ]);

    const simplified = DebtSimplifier.simplifyDebts(balances);

    expect(simplified).toHaveLength(2);
    expect(simplified).toContainEqual({ from: 'userB', to: 'userA', amount: 100 });
    expect(simplified).toContainEqual({ from: 'userC', to: 'userA', amount: 100 });
  });

  it('should eliminate cyclic debts completely (transitive zero-sum)', () => {
    // A pays 100 for B
    // B pays 100 for C
    // C pays 100 for A
    const expenses = [
      {
        paidBy: 'userA',
        amount: 100,
        participants: [{ user: 'userB', amount: 100 }],
      },
      {
        paidBy: 'userB',
        amount: 100,
        participants: [{ user: 'userC', amount: 100 }],
      },
      {
        paidBy: 'userC',
        amount: 100,
        participants: [{ user: 'userA', amount: 100 }],
      },
    ];

    const balances = DebtSimplifier.calculateNetBalances(expenses);

    expect(balances.get('userA')).toBe(0);
    expect(balances.get('userB')).toBe(0);
    expect(balances.get('userC')).toBe(0);

    const simplified = DebtSimplifier.simplifyDebts(balances);
    expect(simplified).toHaveLength(0);
  });

  it('should correctly offset balances when settlements are recorded', () => {
    // A pays 300 for A, B, C (B & C owe A 100 each)
    const expenses = [
      {
        paidBy: 'userA',
        amount: 300,
        participants: [
          { user: 'userA', amount: 100 },
          { user: 'userB', amount: 100 },
          { user: 'userC', amount: 100 },
        ],
      },
    ];

    // B pays A 100 directly
    const settlements = [
      {
        from: 'userB',
        to: 'userA',
        amount: 100,
      },
    ];

    const balances = DebtSimplifier.calculateNetBalances(expenses, settlements);

    expect(balances.get('userA')).toBe(100);
    expect(balances.get('userB')).toBe(0);
    expect(balances.get('userC')).toBe(-100);

    const simplified = DebtSimplifier.simplifyDebts(balances);
    expect(simplified).toHaveLength(1);
    expect(simplified[0]).toEqual({ from: 'userC', to: 'userA', amount: 100 });
  });

  it('should handle decimal splits with roundings accurately', () => {
    const expenses = [
      {
        paidBy: 'userA',
        amount: 100,
        participants: [
          { user: 'userA', amount: 33.34 },
          { user: 'userB', amount: 33.33 },
          { user: 'userC', amount: 33.33 },
        ],
      },
    ];

    const balances = DebtSimplifier.calculateNetBalances(expenses);
    expect(balances.get('userA')).toBe(66.66);
    expect(balances.get('userB')).toBe(-33.33);
    expect(balances.get('userC')).toBe(-33.33);

    const simplified = DebtSimplifier.simplifyDebts(balances);
    expect(simplified).toHaveLength(2);
    const totalTransferred = simplified.reduce((acc, curr) => acc + curr.amount, 0);
    expect(Math.round(totalTransferred * 100) / 100).toBe(66.66);
  });
});
