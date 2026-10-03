import React, { useState, useMemo } from 'react';
import type { GroupMember } from '../../../types/group';
import type { SplitType } from '../../../types/expense';
import { useCreateExpense } from '../hooks/useExpenses';
import { X, Loader2, AlertCircle, Calculator } from 'lucide-react';

interface AddExpenseModalProps {
  groupId: string;
  currency: string;
  members: GroupMember[];
  currentUserId: string;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  groupId,
  currency,
  members,
  currentUserId,
  onClose,
}) => {
  const createMutation = useCreateExpense(groupId);

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [category, setCategory] = useState('Food & Drink');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Equal split: which members are included
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>(() =>
    members.reduce((acc, m) => ({ ...acc, [m._id]: true }), {})
  );

  // Exact amounts per member
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  // Percentages per member
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  // Shares per member
  const [shares, setShares] = useState<Record<string, string>>(() =>
    members.reduce((acc, m) => ({ ...acc, [m._id]: '1' }), {})
  );

  const amount = parseFloat(amountStr) || 0;

  // Split calculation summaries for UI feedback
  const splitSummary = useMemo(() => {
    if (splitType === 'equal') {
      const activeCount = Object.values(selectedMembers).filter(Boolean).length;
      const perPerson = activeCount > 0 ? (amount / activeCount).toFixed(2) : '0.00';
      return { valid: activeCount > 0, info: `${activeCount} people · ${currency} ${perPerson} each` };
    }

    if (splitType === 'exact') {
      const sum = Object.values(exactAmounts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      const diff = Math.round((amount - sum) * 100) / 100;
      return {
        valid: Math.abs(diff) < 0.05 && amount > 0,
        info: diff === 0 ? 'Exact match' : `${currency} ${Math.abs(diff).toFixed(2)} ${diff > 0 ? 'left to allocate' : 'over allocated'}`,
      };
    }

    if (splitType === 'percentage') {
      const sumPct = Object.values(percentages).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      const diff = Math.round((100 - sumPct) * 10) / 10;
      return {
        valid: Math.abs(diff) < 0.5 && amount > 0,
        info: diff === 0 ? '100% allocated' : `${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'remaining' : 'over 100%'}`,
      };
    }

    if (splitType === 'shares') {
      const totalShares = Object.values(shares).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      return { valid: totalShares > 0 && amount > 0, info: `Total ${totalShares} shares` };
    }

    return { valid: true, info: '' };
  }, [splitType, selectedMembers, exactAmounts, percentages, shares, amount, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please enter an expense description');
      return;
    }
    if (amount <= 0) {
      setFormError('Amount must be greater than zero');
      return;
    }
    if (!splitSummary.valid) {
      setFormError(`Split allocation is not valid: ${splitSummary.info}`);
      return;
    }

    setFormError(null);

    // Prepare participants payload
    let participantsPayload: { userId: string; amount?: number; share?: number; percentage?: number }[] = [];

    if (splitType === 'equal') {
      participantsPayload = members
        .filter((m) => selectedMembers[m._id])
        .map((m) => ({ userId: m._id }));
    } else if (splitType === 'exact') {
      participantsPayload = members.map((m) => ({
        userId: m._id,
        amount: parseFloat(exactAmounts[m._id]) || 0,
      }));
    } else if (splitType === 'percentage') {
      participantsPayload = members.map((m) => ({
        userId: m._id,
        percentage: parseFloat(percentages[m._id]) || 0,
      }));
    } else if (splitType === 'shares') {
      participantsPayload = members.map((m) => ({
        userId: m._id,
        share: parseFloat(shares[m._id]) || 1,
      }));
    }

    try {
      await createMutation.mutateAsync({
        description: description.trim(),
        amount,
        currency,
        paidBy,
        splitType,
        category,
        notes: notes.trim(),
        participants: participantsPayload,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record expense');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Add Expense</h3>
        <p className="text-xs text-gray-400 mb-6">
          Record a shared cost and choose how it is split
        </p>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-snug">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="Dinner, groceries, taxi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m._id === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                <option value="Food & Drink">🍽️ Food & Drink</option>
                <option value="Transportation">🚕 Transportation</option>
                <option value="Accommodation">🏨 Accommodation</option>
                <option value="Entertainment">🎟️ Entertainment</option>
                <option value="Utilities">💡 Utilities</option>
                <option value="General">📦 General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via UPI / includes tip"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Split Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Split Method
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">{splitSummary.info}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['equal', 'exact', 'percentage', 'shares'] as SplitType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSplitType(type)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                    splitType === type
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Split Participants Configuration */}
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2.5 max-h-44 overflow-y-auto">
            {splitType === 'equal' && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-400 mb-2">Select members included in this split:</p>
                {members.map((m) => (
                  <label
                    key={m._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-900/80 border border-gray-800/80 cursor-pointer hover:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedMembers[m._id])}
                        onChange={(e) =>
                          setSelectedMembers({ ...selectedMembers, [m._id]: e.target.checked })
                        }
                        className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-white font-medium">{m.name}</span>
                    </div>
                    {selectedMembers[m._id] && amount > 0 && (
                      <span className="text-xs font-semibold text-indigo-400">
                        {currency}{' '}
                        {(
                          amount / Object.values(selectedMembers).filter(Boolean).length
                        ).toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {splitType === 'exact' && (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-white truncate max-w-[150px]">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={exactAmounts[m._id] || ''}
                        onChange={(e) =>
                          setExactAmounts({ ...exactAmounts, [m._id]: e.target.value })
                        }
                        className="w-24 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {splitType === 'percentage' && (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-white truncate max-w-[150px]">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={percentages[m._id] || ''}
                        onChange={(e) =>
                          setPercentages({ ...percentages, [m._id]: e.target.value })
                        }
                        className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {splitType === 'shares' && (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-white truncate max-w-[150px]">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        value={shares[m._id] || '1'}
                        onChange={(e) =>
                          setShares({ ...shares, [m._id]: e.target.value })
                        }
                        className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500">share(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || amount <= 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Calculator className="w-3.5 h-3.5" />
              )}
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
