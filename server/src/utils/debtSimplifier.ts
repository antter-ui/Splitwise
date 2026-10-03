export interface SimplifiedDebt {
  from: string; // debtor userId
  to: string;   // creditor userId
  amount: number;
}

export interface BalanceItem {
  userId: string;
  netBalance: number; // positive = owed money, negative = owes money
}

export class DebtSimplifier {
  /**
   * Computes the net balance for each user from a list of expenses and optional settlements.
   * Net Balance = (Total Amount Paid) - (Total Amount Owed)
   */
  static calculateNetBalances(
    expenses: Array<{
      paidBy: any;
      amount: number;
      participants: Array<{ user: any; amount: number }>;
    }>,
    settlements: Array<{
      from: any;
      to: any;
      amount: number;
    }> = []
  ): Map<string, number> {
    const balances = new Map<string, number>();

    const getUserId = (u: any): string => {
      if (!u) return '';
      return typeof u === 'string' ? u : u._id ? u._id.toString() : u.toString();
    };

    // 1. Process Expenses
    for (const exp of expenses) {
      const payerId = getUserId(exp.paidBy);
      const currentPayerBalance = balances.get(payerId) || 0;
      balances.set(payerId, currentPayerBalance + exp.amount);

      for (const p of exp.participants) {
        const participantId = getUserId(p.user);
        const currentPartBalance = balances.get(participantId) || 0;
        balances.set(participantId, currentPartBalance - p.amount);
      }
    }

    // 2. Process Settlements
    for (const s of settlements) {
      const fromId = getUserId(s.from);
      const toId = getUserId(s.to);

      // 'from' paid 'to', so 'from' reduces debt (positive adjustment)
      const currentFrom = balances.get(fromId) || 0;
      balances.set(fromId, currentFrom + s.amount);

      // 'to' received payment from 'from' (negative adjustment)
      const currentTo = balances.get(toId) || 0;
      balances.set(toId, currentTo - s.amount);
    }

    // Round all balances to 2 decimal places to prevent floating point inaccuracies
    for (const [userId, amount] of balances.entries()) {
      balances.set(userId, Math.round(amount * 100) / 100);
    }

    return balances;
  }

  /**
   * Greedy debt simplification algorithm.
   * Minimizes the total number of transactions needed to settle all debts in a group.
   */
  static simplifyDebts(netBalances: Map<string, number>): SimplifiedDebt[] {
    const creditors: Array<{ userId: string; amount: number }> = [];
    const debtors: Array<{ userId: string; amount: number }> = [];

    for (const [userId, balance] of netBalances.entries()) {
      if (balance > 0.01) {
        creditors.push({ userId, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ userId, amount: -balance }); // store debt as positive number
      }
    }

    // Sort descending by amount for greedy matching
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions: SimplifiedDebt[] = [];

    let cIndex = 0;
    let dIndex = 0;

    while (cIndex < creditors.length && dIndex < debtors.length) {
      const creditor = creditors[cIndex];
      const debtor = debtors[dIndex];

      const transferAmount = Math.min(creditor.amount, debtor.amount);
      const roundedAmount = Math.round(transferAmount * 100) / 100;

      if (roundedAmount > 0.01) {
        transactions.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: roundedAmount,
        });
      }

      creditor.amount = Math.round((creditor.amount - transferAmount) * 100) / 100;
      debtor.amount = Math.round((debtor.amount - transferAmount) * 100) / 100;

      if (creditor.amount <= 0.01) cIndex++;
      if (debtor.amount <= 0.01) dIndex++;
    }

    return transactions;
  }
}
