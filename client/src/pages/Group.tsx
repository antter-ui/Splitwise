import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroup, useAddMember, useRemoveMember, useDeleteGroup } from '../features/groups/hooks/useGroups';
import { useGroupExpenses, useDeleteExpense } from '../features/expenses/hooks/useExpenses';
import { useMe } from '../features/auth/hooks/useAuth';
import { AddExpenseModal } from '../features/expenses/components/AddExpenseModal';
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
} from 'lucide-react';

export const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useMe();
  const { data: group, isLoading, error } = useGroup(id || '');
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id || '');

  const addMemberMutation = useAddMember(id || '');
  const removeMemberMutation = useRemoveMember(id || '');
  const deleteGroupMutation = useDeleteGroup();
  const deleteExpenseMutation = useDeleteExpense(id || '');

  const [inviteEmail, setInviteEmail] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

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
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10 space-y-8">
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
              <span className="text-xs text-gray-400 block mb-1">Expenses</span>
              <span className="text-xl font-bold text-purple-400">{expenses?.length || 0}</span>
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

        {/* Two-Column Grid: Members Management & Expenses Area */}
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

                      {/* Action buttons */}
                      {(isCreator || isCurrentUser) && !isMemberCreator && (
                        <button
                          onClick={() => handleRemoveMember(member._id, member.name)}
                          disabled={removeMemberMutation.isPending}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title={isCurrentUser ? 'Leave Group' : 'Remove Member'}
                        >
                          {isCurrentUser ? (
                            <LogOut className="w-3.5 h-3.5" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
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
                    Track shared costs, split bills, and compute net balances
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

              {/* Expense List */}
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
                    Click "Add Expense" above to record a bill and split it with group members.
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
    </div>
  );
};
