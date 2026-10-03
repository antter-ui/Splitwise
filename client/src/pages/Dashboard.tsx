import React from 'react';
import { useMe, useLogout } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Users,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: user } = useMe();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
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
                Phase 1 Active
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
              You are securely signed in with an HTTP-only JWT session. Your balances, groups, and settlements will automatically synchronize in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Currency</span>
              <span className="text-lg font-bold text-indigo-400">{user?.currency || 'INR'}</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block mb-1">Timezone</span>
              <span className="text-xs font-semibold text-purple-400 truncate max-w-[110px] block">
                {user?.timezone || 'Asia/Kolkata'}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Overview Mockup (Ready for Phase 3/4) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹0.00</p>
            <p className="text-[11px] text-gray-500 mt-1">All settled up</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">You are owed</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">₹0.00</p>
            <p className="text-[11px] text-gray-500 mt-1">From 0 members</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-800/80">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">You owe</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">₹0.00</p>
            <p className="text-[11px] text-gray-500 mt-1">To 0 members</p>
          </div>
        </div>

        {/* Phase Roadmap Progress Indicator */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Build Roadmap Progress
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Phase 1 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-900/60 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phase 1 — Auth</span>
              </div>
              <p className="text-sm font-semibold text-white">Full-Stack Authentication</p>
              <p className="text-xs text-gray-400 mt-1">
                JWT cookies, Mongoose User model, Zod validation, TanStack Query hooks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 opacity-75">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Phase 2 — Next Up</span>
              </div>
              <p className="text-sm font-semibold text-white">Groups Management</p>
              <p className="text-xs text-gray-400 mt-1">
                Create groups, add & invite members, member permissions & group details.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 opacity-60">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1">
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
    </div>
  );
};
