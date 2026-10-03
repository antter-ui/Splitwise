import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroup, useAddMember, useRemoveMember, useDeleteGroup } from '../features/groups/hooks/useGroups';
import { useGroupExpenses, useDeleteExpense } from '../features/expenses/hooks/useExpenses';
import { useGroupBalances } from '../features/balances/hooks/useBalances';
import { useGroupSettlements } from '../features/settlements/hooks/useSettlements';
import { useMe } from '../features/auth/hooks/useAuth';
import { AddExpenseModal } from '../features/expenses/components/AddExpenseModal';
import { SettleUpModal } from '../features/settlements/components/SettleUpModal';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  LogOut,
  Loader2,
  AlertCircle,
  Crown,
  Receipt,
  PlusCircle,
  Tag,
  Calendar,
  Scale,
  ArrowRight,
  HandCoins,
  CheckCircle2,
} from 'lucide-react';

export const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useMe();
  const { data: group, isLoading, error } = useGroup(id || '');
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id || '');
  const { data: balanceData, isLoading: balancesLoading } = useGroupBalances(id || '');
  const { data: settlements } = useGroupSettlements(id || '');

  const addMemberMutation = useAddMember(id || '');
  const removeMemberMutation = useRemoveMember(id || '');
  const deleteGroupMutation = useDeleteGroup();
  const deleteExpenseMutation = useDeleteExpense(id || '');

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Settle up modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleRecipientId, setSettleRecipientId] = useState<string | undefined>();
  const [settleAmount, setSettleAmount] = useState<number | undefined>();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Group Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">
            {error?.message || "You don't have access to this group or it doesn't exist."}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = group.createdBy?._id === currentUser?._id;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setActionError(null);
    try {
      await addMemberMutation.mutateAsync(inviteEmail.trim());
      setInviteEmail('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const isSelf = memberId === currentUser?._id;
    const confirmMessage = isSelf
      ? 'Are you sure you want to leave this group?'
      : `Remove ${memberName} from this group?`;

    if (!window.confirm(confirmMessage)) return;

    setActionError(null);
    try {
      await removeMemberMutation.mutateAsync(memberId);
      if (isSelf) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove member.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? All records will be removed.')) return;
    try {
      await deleteGroupMutation.mutateAsync(group._id);
      navigate('/dashboard');
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete group.');
    }
  };

  const handleDeleteExpense = async (expenseId: string, desc: string) => {
    if (!window.confirm(`Delete expense "${desc}"?`)) return;
    try {
      await deleteExpenseMutation.mutateAsync(expenseId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete expense.');
    }
  };

  const openSettleModal = (recipientId?: string, amount?: number) => {
    setSettleRecipientId(recipientId);
    setSettleAmount(amount);
    setShowSettleModal(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-30 right-1/4 w-[500px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-20 left-10 w-[450px] h-[300px] bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-[#090d16]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openSettleModal()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Settle Up</span>
            </button>

            {isCreator && (
              <button
                onClick={handleDeleteGroup}
                disabled={deleteGroupMutation.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Group</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10 space-y-6">
        {/* Group Hero Banner */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{group.members.length} Members</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{group.name}</h1>
            <p className="text-sm text-gray-400">
              {group.description || 'No description provided'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Your Net</span>
              <span
                className={`text-xl font-bold ${
                  (balanceData?.currentUserSummary.netBalance || 0) > 0
                    ? 'text-emerald-400'
                    : (balanceData?.currentUserSummary.netBalance || 0) < 0
                    ? 'text-rose-400'
                    : 'text-gray-400'
                }`}
              >
                {(balanceData?.currentUserSummary.netBalance || 0) >= 0 ? '+' : ''}
                {group.currency} {(balanceData?.currentUserSummary.netBalance || 0).toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Currency</span>
              <span className="text-xl font-bold text-indigo-400">{group.currency}</span>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-snug">{actionError}</p>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-gray-800/80 pb-1">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'expenses'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses ({expenses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('balances')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'balances'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balances & Debt Simplifier</span>
            {balanceData?.simplifiedDebts && balanceData.simplifiedDebts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                {balanceData.simplifiedDebts.length}
              </span>
            )}
          </button>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === 'expenses' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card rounded-2xl p-5 border border-gray-800/80">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Members ({group.members.length})</span>
                </h3>

                {/* Add Member Form */}
                <form onSubmit={handleAddMember} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-900/80 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                      type="submit"
                      disabled={addMemberMutation.isPending || !inviteEmail.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {addMemberMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                {/* Member List */}
                <div className="space-y-2">
                  {group.members.map((member) => {
                    const isMemberCreator = member._id === group.createdBy?._id;
                    const isCurrentUser = member._id === currentUser?._id;
                    const mBalance = balanceData?.balances.find((b) => b.user._id === member._id);

                    return (
                      <div
                        key={member._id}
                        className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isMemberCreator && (
                                <span title="Group Creator">
                                  <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          {mBalance && (
                            <span
                              className={`text-xs font-bold ${
                                mBalance.netBalance > 0
                                  ? 'text-emerald-400'
                                  : mBalance.netBalance < 0
                                  ? 'text-rose-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {mBalance.netBalance > 0 ? '+' : ''}
                              {group.currency} {mBalance.netBalance.toFixed(2)}
                            </span>
                          )}

                          {(isCreator || isCurrentUser) && !isMemberCreator && (
                            <button
                              onClick={() => handleRemoveMember(member._id, member.name)}
                              disabled={removeMemberMutation.isPending}
                              className="block ml-auto mt-1 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title={isCurrentUser ? 'Leave Group' : 'Remove Member'}
                            >
                              {isCurrentUser ? <LogOut className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Expenses Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-400" />
                      <span>Group Expenses</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Track shared costs and bills
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                </div>

                {expensesLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : expenses && expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => {
                      const isExpensePayer = expense.paidBy?._id === currentUser?._id;
                      const myShare = expense.participants.find(
                        (p) => p.user?._id === currentUser?._id
                      );

                      return (
                        <div
                          key={expense._id}
                          className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Tag className="w-5 h-5 text-indigo-400" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{expense.description}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
                                  {expense.category}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                                <span>
                                  Paid by{' '}
                                  <strong className="text-gray-200">
                                    {isExpensePayer ? 'you' : expense.paidBy?.name}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span className="capitalize">{expense.splitType} split</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-500" />
                                  <span>{formatDate(expense.createdAt)}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800/60">
                            <div className="text-right">
                              <p className="text-base font-bold text-white">
                                {expense.currency} {expense.amount.toFixed(2)}
                              </p>
                              {myShare && (
                                <p className="text-[11px] text-gray-400">
                                  Your share: {expense.currency} {myShare.amount.toFixed(2)}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteExpense(expense._id, expense.description)}
                              disabled={deleteExpenseMutation.isPending}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-xl bg-gray-900/30 border border-dashed border-gray-800">
                    <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-gray-300">No expenses recorded yet</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                      Record a shared bill to automatically compute balances.
                    </p>
                    <button
                      onClick={() => setShowAddExpense(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Record First Expense</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Balances & Debt Simplifier View */
          <div className="space-y-6">
            {/* Simplified Debts Box */}
            <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-400" />
                    <span>Simplified Debts (Minimum Transfers)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Algorithm computes optimal direct transfers to settle all group debts with fewest transactions.
                  </p>
                </div>

                <button
                  onClick={() => openSettleModal()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <HandCoins className="w-3.5 h-3.5" />
                  <span>Settle a Debt</span>
                </button>
              </div>

              {balancesLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : balanceData?.simplifiedDebts && balanceData.simplifiedDebts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {balanceData.simplifiedDebts.map((debt, index) => {
                    const isFromMe = debt.from._id === currentUser?._id;
                    const isToMe = debt.to._id === currentUser?._id;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isFromMe
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : isToMe
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-gray-900/60 border-gray-800/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <span>{isFromMe ? 'You' : debt.from.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                            <span>{isToMe ? 'You' : debt.to.name}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {isFromMe
                              ? `You owe ${debt.to.name}`
                              : isToMe
                              ? `${debt.from.name} owes you`
                              : `${debt.from.name} pays ${debt.to.name}`}
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <span className="text-base font-bold text-white">
                            {group.currency} {debt.amount.toFixed(2)}
                          </span>

                          {isFromMe && (
                            <button
                              onClick={() => openSettleModal(debt.to._id, debt.amount)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl bg-gray-900/30 border border-dashed border-gray-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-200">All settled up!</p>
                  <p className="text-xs text-gray-500 mt-0.5">No outstanding balances in this group.</p>
                </div>
              )}
            </div>

            {/* Individual Member Balances */}
            <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
              <h3 className="text-base font-bold text-white mb-4">Member Net Balance Ledger</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {balanceData?.balances.map((b) => (
                  <div
                    key={b.user._id}
                    className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                        {getInitials(b.user.name)}
                      </div>
                      <span className="text-xs font-semibold text-white">{b.user.name}</span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        b.netBalance > 0
                          ? 'text-emerald-400'
                          : b.netBalance < 0
                          ? 'text-rose-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {b.netBalance > 0 ? '+' : ''}
                      {group.currency} {b.netBalance.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recorded Settlements History */}
            {settlements && settlements.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
                <h3 className="text-base font-bold text-white mb-4">Settlement History</h3>
                <div className="space-y-2">
                  {settlements.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <HandCoins className="w-4 h-4 text-emerald-400" />
                        <span>
                          <strong className="text-white">{s.from.name}</strong> paid{' '}
                          <strong className="text-white">{s.to.name}</strong>
                          {s.note ? ` (${s.note})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">
                          {s.currency} {s.amount.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-[11px]">{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && currentUser && (
        <AddExpenseModal
          groupId={group._id}
          currency={group.currency}
          members={group.members}
          currentUserId={currentUser._id}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* Settle Up Modal */}
      {showSettleModal && currentUser && (
        <SettleUpModal
          groupId={group._id}
          currency={group.currency}
          members={group.members}
          currentUserId={currentUser._id}
          initialRecipientId={settleRecipientId}
          initialAmount={settleAmount}
          onClose={() => setShowSettleModal(false)}
        />
      )}
    </div>
  );
};
