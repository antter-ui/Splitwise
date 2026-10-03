import React, { useState } from 'react';
import type { GroupMember } from '../../../types/group';
import { useCreateSettlement } from '../hooks/useSettlements';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettleUpModalProps {
  groupId: string;
  currency: string;
  members: GroupMember[];
  currentUserId: string;
  initialRecipientId?: string;
  initialAmount?: number;
  onClose: () => void;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  groupId,
  currency,
  members,
  currentUserId,
  initialRecipientId,
  initialAmount,
  onClose,
}) => {
  const createMutation = useCreateSettlement(groupId);

  const eligibleRecipients = members.filter((m) => m._id !== currentUserId);

  const [toUserId, setToUserId] = useState(
    initialRecipientId || eligibleRecipients[0]?._id || ''
  );
  const [amountStr, setAmountStr] = useState(
    initialAmount ? initialAmount.toFixed(2) : ''
  );
  const [note, setNote] = useState('Payment via cash / UPI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amount = parseFloat(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId) {
      setErrorMsg('Please select a recipient to settle with');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Settlement amount must be greater than zero');
      return;
    }

    setErrorMsg(null);

    try {
      await createMutation.mutateAsync({
        to: toUserId,
        amount,
        currency,
        note: note.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record settlement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Record a Settlement</h3>
        <p className="text-xs text-gray-400 mb-6">
          Log a direct payment to clear debt between you and a group member
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-snug">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Pay To
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {eligibleRecipients.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Settlement Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Payment Note
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via UPI, cash, bank transfer..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || amount <= 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
