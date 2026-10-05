import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import {
  AdminStats,
  Package,
  CountryConfig,
  ProviderConfig,
  SupportTicket,
  AuditLog,
  WalletTransaction,
} from '../types.ts';
import {
  ShieldAlert,
  Users,
  Coins,
  Package as PackageIcon,
  Radio,
  Globe,
  MessageSquare,
  FileCode,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  Key,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface SafeUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  emailVerified: boolean;
  createdAt: string;
  balance: number;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'transactions' | 'packages' | 'providers' | 'countries' | 'tickets' | 'logs' | 'settings'
  >('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Balance adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<SafeUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustNote, setAdjustNote] = useState('');

  // Ticket reply modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Package edit state
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [isNewPkg, setIsNewPkg] = useState(false);

  // Provider edit state
  const [editingProvider, setEditingProvider] = useState<ProviderConfig | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        txRes,
        pkgRes,
        provRes,
        cRes,
        tktRes,
        logsRes,
        setRes,
      ] = await Promise.all([
        apiRequest<{ stats: AdminStats }>('/api/admin/stats'),
        apiRequest<{ users: SafeUser[] }>('/api/admin/users'),
        apiRequest<{ transactions: WalletTransaction[] }>('/api/admin/transactions'),
        apiRequest<{ packages: Package[] }>('/api/admin/packages'),
        apiRequest<{ providers: ProviderConfig[] }>('/api/admin/providers'),
        apiRequest<{ countries: CountryConfig[] }>('/api/admin/countries'),
        apiRequest<{ tickets: SupportTicket[] }>('/api/admin/tickets'),
        apiRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs'),
        apiRequest<{ settings: any }>('/api/admin/settings'),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setTransactions(txRes.transactions || []);
      setPackages(pkgRes.packages || []);
      setProviders(provRes.providers || []);
      setCountries(cRes.countries || []);
      setTickets(tktRes.tickets || []);
      setAuditLogs(logsRes.logs || []);
      setSiteSettings(setRes.settings || null);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setActionError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // User Actions
  const toggleUserStatus = async (targetUser: SafeUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await apiRequest(`/api/admin/users/${targetUser.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus }),
      });
      setUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
      );
      notify(`User ${targetUser.email} is now ${nextStatus}`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    try {
      const res = await apiRequest<{ success: boolean; newBalance: number }>(
        `/api/admin/users/${adjustingUser.id}/adjust-balance`,
        {
          method: 'POST',
          body: JSON.stringify({
            amount: adjustAmount,
            type: adjustType,
            note: adjustNote,
          }),
        }
      );
      setUsers(prev =>
        prev.map(u => (u.id === adjustingUser.id ? { ...u, balance: res.newBalance } : u))
      );
      setAdjustingUser(null);
      setAdjustNote('');
      notify(`Updated balance for ${adjustingUser.email} to ${res.newBalance} credits`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Package Save/Delete
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      if (isNewPkg) {
        const res = await apiRequest<{ package: Package }>('/api/admin/packages', {
          method: 'POST',
          body: JSON.stringify(editingPkg),
        });
        setPackages(prev => [...prev, res.package]);
      } else {
        const res = await apiRequest<{ package: Package }>(`/api/admin/packages/${editingPkg.id}`, {
          method: 'PUT',
          body: JSON.stringify(editingPkg),
        });
        setPackages(prev => prev.map(p => (p.id === editingPkg.id ? res.package : p)));
      }
      setEditingPkg(null);
      notify('Package saved successfully');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await apiRequest(`/api/admin/packages/${id}`, { method: 'DELETE' });
      setPackages(prev => prev.filter(p => p.id !== id));
      notify('Package deleted');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Provider Save
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    try {
      const res = await apiRequest<{ provider: ProviderConfig }>(
        `/api/admin/providers/${editingProvider.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editingProvider),
        }
      );
      setProviders(prev => prev.map(p => (p.id === editingProvider.id ? res.provider : p)));
      setEditingProvider(null);
      notify('Provider configuration updated');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Country Toggle & Cost
  const handleToggleCountry = async (c: CountryConfig) => {
    const nextEnabled = !c.isEnabled;
    try {
      const res = await apiRequest<{ country: CountryConfig }>(`/api/admin/countries/${c.code}`, {
        method: 'PUT',
        body: JSON.stringify({ isEnabled: nextEnabled }),
      });
      setCountries(prev => prev.map(item => (item.code === c.code ? res.country : item)));
      notify(`Country ${c.name} ${nextEnabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Ticket Operations
  const openTicketViewer = async (tkt: SupportTicket) => {
    setSelectedTicket(tkt);
    try {
      const res = await apiRequest<{ messages: any[] }>(`/api/tickets/${tkt.id}`);
      setTicketMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleAdminReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    try {
      const res = await apiRequest<{ messages: any[]; ticket: SupportTicket }>(
        `/api/admin/tickets/${selectedTicket.id}/reply`,
        {
          method: 'POST',
          body: JSON.stringify({ message: adminReplyText.trim() }),
        }
      );
      setTicketMessages(res.messages);
      setSelectedTicket(res.ticket);
      setTickets(prev => prev.map(t => (t.id === selectedTicket.id ? res.ticket : t)));
      setAdminReplyText('');
      notify('Staff reply sent');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/api/admin/tickets/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setTickets(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus as any } : t))
      );
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }
      notify(`Ticket status set to ${newStatus}`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ settings: any }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings),
      });
      setSiteSettings(res.settings);
      notify('Website settings saved');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.id.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>TempShield Administration Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global management portal for users, telecom gateways, package rates, and security audit logs.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
          Admin: {user?.email}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'stats', label: 'Overview', icon: ShieldAlert },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'transactions', label: 'Transactions', icon: Coins },
          { id: 'packages', label: 'Pricing Packages', icon: PackageIcon },
          { id: 'providers', label: 'Telecom Gateways', icon: Radio },
          { id: 'countries', label: 'Countries & Stock', icon: Globe },
          { id: 'tickets', label: 'Support Desk', icon: MessageSquare },
          { id: 'logs', label: 'Audit Logs', icon: FileCode },
          { id: 'settings', label: 'Platform Config', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Registered Users</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {stats.totalUsers}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Active Temp Emails</span>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums mt-1">
                {stats.activeEmails}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Active Rented SIMs</span>
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 font-mono tabular-nums mt-1">
                {stats.activePhones}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Total Processed Revenue</span>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                ${stats.totalRevenueUsd.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Delivered Carrier SMS</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {stats.totalSmsReceived}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Emails Processed</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {stats.totalEmailsReceived}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs text-slate-500">Open Tickets</span>
              <div className="text-2xl font-bold text-amber-500 font-mono tabular-nums mt-1">
                {stats.openTickets}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden space-y-4">
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-950/40">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform User Accounts ({filteredUsers.length})
              </h2>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 sm:px-6">User Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold uppercase">{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {u.balance} cr
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setAdjustingUser(u);
                          setAdjustAmount(50);
                          setAdjustType('credit');
                        }}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded text-xs font-semibold"
                      >
                        Adjust Credits
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          u.status === 'active'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS AUDIT */}
      {activeTab === 'transactions' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform Transaction Ledger ({transactions.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Description</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {tx.userId}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-400'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                        tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right font-mono tabular-nums">
                      {tx.balanceAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRICING PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Credit Packages Configuration
            </h2>
            <button
              onClick={() => {
                setEditingPkg({
                  id: `pkg_${Date.now()}`,
                  name: 'Custom Package',
                  credits: 50,
                  priceUsd: 4.0,
                  bonusCredits: 5,
                  isPopular: false,
                  isActive: true,
                  sortOrder: packages.length + 1,
                });
                setIsNewPkg(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{pkg.name}</span>
                    {pkg.isPopular && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono my-2 text-slate-900 dark:text-white tabular-nums">
                    ${pkg.priceUsd.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    {pkg.credits} Credits (+{pkg.bonusCredits} Bonus)
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingPkg(pkg);
                      setIsNewPkg(false);
                    }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TELECOM PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Carrier & Virtual Line Gateways
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {providers.map(prov => (
              <div
                key={prov.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {prov.label}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Type: {prov.type.toUpperCase()} · Priority: {prov.priority}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      prov.isEnabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {prov.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="truncate">Endpoint: {prov.apiEndpoint}</div>
                  <div>API Key: {prov.apiKey ? '••••••••••••' + prov.apiKey.slice(-4) : '(None - Simulation mode)'}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingProvider({ ...prov })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Configure Provider</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COUNTRIES & NUMBER STOCK */}
      {activeTab === 'countries' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Supported Country Routes & Line Availability
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Country</th>
                  <th className="py-3 px-4">Prefix</th>
                  <th className="py-3 px-4">Base Cost</th>
                  <th className="py-3 px-4">Available Numbers</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Toggle Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {countries.map(c => (
                  <tr key={c.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 sm:px-6 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{c.prefix}</td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">{c.baseCreditCost} cr</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{c.availableNumbersCount} lines</td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleToggleCountry(c)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          c.isEnabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SUPPORT DESK */}
      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              All Tickets ({tickets.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map(tkt => (
                <button
                  key={tkt.id}
                  onClick={() => openTicketViewer(tkt)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-colors space-y-1.5 ${
                    selectedTicket?.id === tkt.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {tkt.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                      {tkt.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    User: {tkt.userEmail} · Category: {tkt.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 h-[600px] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedTicket.subject}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      From: {selectedTicket.userEmail}
                    </div>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={e => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {ticketMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs max-w-[85%] ${
                        msg.senderRole === 'admin'
                          ? 'bg-indigo-600 text-white ml-auto'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="font-bold text-[10px] opacity-80 mb-1">
                        {msg.senderName} ({msg.senderRole})
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleAdminReplyTicket}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Staff reply to user..."
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Reply
                  </button>
                </form>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl h-[600px] flex items-center justify-center text-xs text-slate-400">
                Select a ticket to review conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Immutable System Security Audit Trail ({auditLogs.length})
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4 sm:px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 sm:px-6 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{log.actorEmail}</td>
                    <td className="py-3 px-4 font-bold text-indigo-500">{log.action}</td>
                    <td className="py-3 px-4 text-slate-400">{log.resource}</td>
                    <td className="py-3 px-4 sm:px-6 text-slate-600 dark:text-slate-300 font-sans text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: PLATFORM SETTINGS */}
      {activeTab === 'settings' && siteSettings && (
        <form
          onSubmit={handleSaveSettings}
          className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 p-6 space-y-4 max-w-2xl"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            General Website Configuration
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Site Title
              </label>
              <input
                type="text"
                value={siteSettings.siteTitle}
                onChange={e => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={siteSettings.supportEmail}
                onChange={e => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  New User Signup Bonus Credits
                </label>
                <input
                  type="number"
                  value={siteSettings.signupBonusCredits}
                  onChange={e =>
                    setSiteSettings({ ...siteSettings, signupBonusCredits: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Virtual Number Max Rental (Minutes)
                </label>
                <input
                  type="number"
                  value={siteSettings.maxRentalMinutes}
                  onChange={e =>
                    setSiteSettings({ ...siteSettings, maxRentalMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* Adjust Balance Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Adjust Credits for {adjustingUser.email}
            </h3>

            <form onSubmit={handleAdjustBalance} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    adjustType === 'credit'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  + Add Credits
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    adjustType === 'debit'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  - Deduct Credits
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Credit Amount
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP goodwill bonus"
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isNewPkg ? 'Add Credit Package' : 'Edit Credit Package'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPkg.name}
                  onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPkg.priceUsd}
                    onChange={e => setEditingPkg({ ...editingPkg, priceUsd: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Base Credits
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPkg.credits}
                    onChange={e => setEditingPkg({ ...editingPkg, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bonus Credits
                </label>
                <input
                  type="number"
                  value={editingPkg.bonusCredits}
                  onChange={e => setEditingPkg({ ...editingPkg, bonusCredits: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={Boolean(editingPkg.isPopular)}
                  onChange={e => setEditingPkg({ ...editingPkg, isPopular: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="popularCheck" className="text-xs text-slate-700 dark:text-slate-300">
                  Mark as Popular (Highlighted in UI)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provider Edit Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configure {editingProvider.label}
            </h3>

            <form onSubmit={handleSaveProvider} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  API Endpoint URL
                </label>
                <input
                  type="text"
                  value={editingProvider.apiEndpoint}
                  onChange={e =>
                    setEditingProvider({ ...editingProvider, apiEndpoint: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  API Secret Key (Stored Encrypted on Server)
                </label>
                <input
                  type="password"
                  placeholder="Enter provider API secret key"
                  value={editingProvider.apiKey}
                  onChange={e =>
                    setEditingProvider({ ...editingProvider, apiKey: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Leaves blank or keep default to utilize zero-latency carrier simulated relay.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingProvider.isEnabled}
                    onChange={e =>
                      setEditingProvider({ ...editingProvider, isEnabled: e.target.checked })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Enable Provider</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingProvider.isDefault}
                    onChange={e =>
                      setEditingProvider({ ...editingProvider, isDefault: e.target.checked })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Default Gateway</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save Provider Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
