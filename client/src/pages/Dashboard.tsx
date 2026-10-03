import React, { useState } from 'react';
import { useMe, useLogout } from '../features/auth/hooks/useAuth';
import { useGroups, useCreateGroup } from '../features/groups/hooks/useGroups';
import { useGlobalBalances } from '../features/balances/hooks/useBalances';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Users,
  Receipt,
  TrendingDown,
  TrendingUp,
  Plus,
  Loader2,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: user } = useMe();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const { data: globalBalances } = useGlobalBalances();
  const createGroupMutation = useCreateGroup();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCurrency, setGroupCurrency] = useState(user?.currency || 'INR');
  const [createError, setCreateError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setCreateError(null);

    try {
      const newGroup = await createGroupMutation.mutateAsync({
        name: groupName.trim(),
        description: groupDesc.trim(),
        currency: groupCurrency,
      });
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
      navigate(`/groups/${newGroup._id}`);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create group');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/3 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-[#090d16]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SplitSync
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Phase 2 Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-gray-200">{user?.name}</p>
                <p className="text-[11px] text-gray-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-800 hover:border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Authentication Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name}! 👋
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              Organize your shared trips, apartments, and outings into Groups. Add members to start tracking expenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Currency</span>
              <span className="text-lg font-bold text-indigo-400">{user?.currency || 'INR'}</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Active Groups</span>
              <span className="text-lg font-bold text-purple-400">{groups?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <p
              className={`text-2xl font-bold ${
                (globalBalances?.totalBalance || 0) > 0
                  ? 'text-emerald-400'
                  : (globalBalances?.totalBalance || 0) < 0
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {(globalBalances?.totalBalance || 0) >= 0 ? '+' : ''}
              {user?.currency || 'INR'} {(globalBalances?.totalBalance || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Across all groups</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">You are owed</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              +{user?.currency || 'INR'} {(globalBalances?.totalOwed || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">From friends</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">You owe</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">
              -{user?.currency || 'INR'} {(globalBalances?.totalOwe || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">To friends</p>
          </div>
        </div>

        {/* Groups Section */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Your Groups</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage your groups and invite friends
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>

          {/* Group Cards Grid */}
          {groupsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="group p-5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/50 hover:bg-gray-900/90 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {group.name}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        {group.currency}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2">
                      {group.description || 'No description'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl bg-gray-900/30 border border-dashed border-gray-800">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-gray-300">You don't belong to any groups yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                Create a group for an apartment, trip, or event to start sharing expenses with friends.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Group</span>
              </button>
            </div>
          )}
        </div>

        {/* Phase Roadmap Progress Indicator */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Build Roadmap Progress
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Phase 2 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-900/60 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phase 1 — Auth</span>
              </div>
              <p className="text-sm font-semibold text-white">Full-Stack Auth</p>
              <p className="text-xs text-gray-400 mt-1">
                JWT cookies, Mongoose User model, Zod validation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/60 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phase 2 — Groups</span>
              </div>
              <p className="text-sm font-semibold text-white">Group Management</p>
              <p className="text-xs text-gray-400 mt-1">
                Create groups, add members by email, manage roles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 opacity-60">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-1">
                <Receipt className="w-3.5 h-3.5" />
                <span>Phase 3 — Queued</span>
              </div>
              <p className="text-sm font-semibold text-white">Expense Engine</p>
              <p className="text-xs text-gray-400 mt-1">
                Equal, unequal, percentage, and exact split methods.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Create New Group</h3>
            <p className="text-xs text-gray-400 mb-6">
              Start a new shared expense space for a trip or house
            </p>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-snug">{createError}</p>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip 2026, Flat 402"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Trip expenses and shared groceries..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <select
                  value={groupCurrency}
                  onChange={(e) => setGroupCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending || !groupName.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {createGroupMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
