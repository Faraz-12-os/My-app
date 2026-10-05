import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import { Package, WalletTransaction } from '../types.ts';
import {
  Coins,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Plus,
} from 'lucide-react';

interface WalletPageProps {
  openWalletModal: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  openWalletModal,
  openAuthModal,
}) => {
  const { user, wallet, refreshUser } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pkgRes, txRes] = await Promise.all([
        apiRequest<{ packages: Package[] }>('/api/wallet/packages'),
        apiRequest<{ transactions: WalletTransaction[] }>('/api/wallet/transactions'),
      ]);
      setPackages(pkgRes.packages || []);
      setTransactions(txRes.transactions || []);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>Wallet & Balance Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deposit credits on-demand. Track real-time debit usage for temporary emails and virtual SMS lines.
          </p>
        </div>

        {user && (
          <button
            onClick={openWalletModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Credits</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 max-w-xl mx-auto space-y-4">
          <Coins className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sign In to Manage Your Wallet
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create an account to purchase flexible credits, review complete ledger history, and access tier-1 carrier activations.
          </p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            Get Started with 15 Free Credits
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Balance Spotlight Banner */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">
                Current Available Balance
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums">
                  {wallet?.balance ?? 0}
                </span>
                <span className="text-indigo-200 text-sm font-semibold">Credits</span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-2">
                Approximately {Math.floor((wallet?.balance ?? 0) / 7)} virtual carrier SMS verifications or unlimited temporary inboxes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openWalletModal}
                className="px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Top Up Funds</span>
              </button>
            </div>
          </div>

          {/* Available Packages Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Available Credit Packages
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map(pkg => {
                const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
                return (
                  <div
                    key={pkg.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      pkg.isPopular
                        ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      {pkg.isPopular && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white mb-2">
                          POPULAR
                        </span>
                      )}
                      <div className="text-xs font-semibold text-slate-500">
                        {pkg.name}
                      </div>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          ${pkg.priceUsd.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">USD</span>
                      </div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono mb-4">
                        {totalCredits} Credits{' '}
                        {pkg.bonusCredits > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                            (+{pkg.bonusCredits} Bonus)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={openWalletModal}
                      className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Purchase Package
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-950/40">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transaction & Usage Ledger
                </h3>
                <p className="text-[11px] text-slate-500">
                  Immutable record of deposits, deductions, and credit allocations.
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'credit'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Deposits
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'debit'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Usage
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/40 dark:bg-slate-950/20">
                    <th className="py-3 px-4 sm:px-6">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No transactions found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
                          <div>{tx.description}</div>
                          {tx.referenceId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {tx.referenceId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              tx.type === 'credit'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {tx.type === 'credit' ? (
                              <>
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>Credit</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-rose-500" />
                                <span>Debit</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                            tx.type === 'credit'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                          {tx.balanceAfter} cr
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
