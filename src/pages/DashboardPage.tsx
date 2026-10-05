import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import { TemporaryEmail, TemporaryPhoneNumber, WalletTransaction } from '../types.ts';
import {
  Coins,
  Inbox,
  Smartphone,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  openWalletModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  openWalletModal,
}) => {
  const { user, wallet, refreshUser } = useAuth();
  const [emails, setEmails] = useState<TemporaryEmail[]>([]);
  const [numbers, setNumbers] = useState<TemporaryPhoneNumber[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [emailRes, numberRes, txRes] = await Promise.all([
        apiRequest<{ emails: TemporaryEmail[] }>('/api/emails'),
        apiRequest<{ numbers: TemporaryPhoneNumber[] }>('/api/numbers/active'),
        apiRequest<{ transactions: WalletTransaction[] }>('/api/wallet/transactions'),
      ]);
      setEmails(emailRes.emails || []);
      setNumbers(numberRes.numbers || []);
      setTransactions(txRes.transactions || []);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const activeNumbers = numbers.filter(n => n.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Workspace Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('email')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Email</span>
          </button>
          <button
            onClick={() => onNavigate('phone')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700/60 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Number</span>
          </button>
          <button
            onClick={openWalletModal}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
          <button
            onClick={loadDashboardData}
            title="Refresh dashboard"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Available Balance</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {wallet?.balance ?? 0}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Credits</span>
          </div>
          <button
            onClick={openWalletModal}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
          >
            <span>Add Credits</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Active Disposable Inboxes */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Temp Inboxes</span>
            <Inbox className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {emails.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Inboxes</span>
          </div>
          <button
            onClick={() => onNavigate('email')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
          >
            <span>Manage Inboxes</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Active Virtual Numbers */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Virtual Numbers</span>
            <Smartphone className="w-4 h-4 text-violet-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeNumbers.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Active SIMs</span>
          </div>
          <button
            onClick={() => onNavigate('phone')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
          >
            <span>View Numbers</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Verification Speed Status */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Carrier Connection</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Zero Latency
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Global relays online
          </div>
        </div>
      </div>

      {/* Main Content Split: Active Channels & Recent Ledger */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Active Temporary Channels */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Emails Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Temporary Inboxes
                </h3>
              </div>
              <button
                onClick={() => onNavigate('email')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open Full Inbox &rarr;
              </button>
            </div>

            {emails.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <p className="text-xs text-slate-500">No temporary inboxes currently active.</p>
                <button
                  onClick={() => onNavigate('email')}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Generate First Address
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {emails.map(email => (
                  <div
                    key={email.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {email.address}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Expires {new Date(email.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(email.address)}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedAddress === email.address ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onNavigate('email')}
                        className="p-1 text-slate-400 hover:text-indigo-500 rounded"
                        title="Open email viewer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Rented Phone Numbers */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Virtual Numbers
                </h3>
              </div>
              <button
                onClick={() => onNavigate('phone')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Rent Another Number &rarr;
              </button>
            </div>

            {activeNumbers.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <p className="text-xs text-slate-500">No active virtual phone numbers reserved.</p>
                <button
                  onClick={() => onNavigate('phone')}
                  className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Reserve Temporary SIM
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeNumbers.map(phone => (
                  <div
                    key={phone.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {phone.number}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                          {phone.serviceName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {phone.countryName} · Active rental
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(phone.number)}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedAddress === phone.number ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onNavigate('phone')}
                        className="p-1 text-slate-400 hover:text-indigo-500 rounded"
                        title="Open SMS viewer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Transactions & Activity */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Ledger History
                </h3>
              </div>
              <button
                onClick={() => onNavigate('wallet')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Transactions &rarr;
              </button>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No transactions recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-bold tabular-nums ${
                          tx.type === 'credit'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        bal: {tx.balanceAfter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
