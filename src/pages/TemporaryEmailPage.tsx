import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import { TemporaryEmail, EmailMessage } from '../types.ts';
import {
  Inbox,
  Copy,
  CheckCircle2,
  RefreshCw,
  Clock,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface TemporaryEmailPageProps {
  openAuthModal: (mode?: 'login' | 'register') => void;
}

export const TemporaryEmailPage: React.FC<TemporaryEmailPageProps> = ({ openAuthModal }) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<TemporaryEmail[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [domains, setDomains] = useState<string[]>(['tempinbox.net', 'dispostar.io', 'securemail.dev', 'quickdrop.co']);
  const [selectedDomain, setSelectedDomain] = useState<string>('tempinbox.net');
  const [customHandle, setCustomHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [testSimulating, setTestSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time remaining calculator
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  const currentEmail = emails.find(e => e.id === selectedEmailId) || emails[0] || null;

  // Load emails
  const loadEmails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiRequest<{ emails: TemporaryEmail[] }>('/api/emails');
      setEmails(res.emails);
      if (res.emails.length > 0 && !selectedEmailId) {
        setSelectedEmailId(res.emails[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load emails:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load domains
  useEffect(() => {
    apiRequest<{ domains: string[] }>('/api/emails/domains')
      .then(res => {
        if (res.domains && res.domains.length > 0) {
          setDomains(res.domains);
          setSelectedDomain(res.domains[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadEmails();
  }, [user]);

  // Load messages for current email
  const loadMessages = async (emailId: string) => {
    setRefreshing(true);
    try {
      const res = await apiRequest<{ messages: EmailMessage[] }>(`/api/emails/${emailId}/messages`);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentEmail) {
      loadMessages(currentEmail.id);
    } else {
      setMessages([]);
    }
  }, [currentEmail?.id]);

  // Countdown timer calculation
  useEffect(() => {
    if (!currentEmail) {
      setTimeLeftStr('');
      return;
    }

    const updateTimer = () => {
      const diff = new Date(currentEmail.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentEmail?.expiresAt]);

  const handleGenerateEmail = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setError(null);
    try {
      const res = await apiRequest<{ email: TemporaryEmail }>('/api/emails/generate', {
        method: 'POST',
        body: JSON.stringify({
          customUsername: customHandle.trim() || undefined,
          domain: selectedDomain,
          durationMinutes: 60,
        }),
      });

      setEmails(prev => [res.email, ...prev]);
      setSelectedEmailId(res.email.id);
      setCustomHandle('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate address');
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!user) return;
    try {
      await apiRequest(`/api/emails/${id}`, { method: 'DELETE' });
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selectedEmailId === id) {
        const next = emails.find(e => e.id !== id);
        setSelectedEmailId(next ? next.id : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete email');
    }
  };

  const handleExtendEmail = async (id: string) => {
    if (!user) return;
    try {
      const res = await apiRequest<{ email: TemporaryEmail }>(`/api/emails/${id}/extend`, {
        method: 'POST',
      });
      setEmails(prev => prev.map(e => (e.id === id ? res.email : e)));
    } catch (err: any) {
      setError(err.message || 'Failed to extend email');
    }
  };

  const handleSendTestMessage = async (serviceName: string) => {
    if (!currentEmail) return;
    setTestSimulating(true);
    try {
      await apiRequest(`/api/emails/${currentEmail.id}/simulate-test`, {
        method: 'POST',
        body: JSON.stringify({ serviceName }),
      });
      await loadMessages(currentEmail.id);
    } catch (err: any) {
      setError(err.message || 'Failed to send test email');
    } finally {
      setTestSimulating(false);
    }
  };

  const copyAddress = () => {
    if (!currentEmail) return;
    navigator.clipboard.writeText(currentEmail.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const copyOtpCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(code);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-indigo-500" />
            <span>Disposable Email Inbox</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate self-destructing addresses. Inboxes auto-purge with zero traces after expiration.
          </p>
        </div>

        {user && currentEmail && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMessages(currentEmail.id)}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
            <button
              onClick={() => handleExtendEmail(currentEmail.id)}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Extend +60m</span>
            </button>
            <button
              onClick={() => handleDeleteEmail(currentEmail.id)}
              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Delete this address"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!user ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sign In to Manage Temporary Inboxes
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Create an account or sign in to generate unlimited disposable addresses, extract verification codes, and keep your personal email private.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Get Started with 15 Free Credits
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Active Address Hub & Generator */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Active Address Card */}
            {currentEmail ? (
              <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-md space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">
                    Current Active Mailbox
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>{timeLeftStr || '60:00'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-inner">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white truncate">
                    {currentEmail.address}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedAddress ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instant Verification Test Trigger */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Send Simulated Verification Code (Instant Test)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['GitHub Security', 'Netflix', 'OpenAI'].map(svc => (
                      <button
                        key={svc}
                        type="button"
                        disabled={testSimulating}
                        onClick={() => handleSendTestMessage(svc)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors text-center disabled:opacity-50"
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No Temporary Email Active
                </p>
                <p className="text-xs text-slate-500">
                  Use the generator below to create a disposable mailbox.
                </p>
              </div>
            )}

            {/* Address Generator */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Create New Temporary Email</span>
              </h3>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Custom Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={customHandle}
                    onChange={e => setCustomHandle(e.target.value)}
                    placeholder="e.g. dev.project99"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={e => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  >
                    {domains.map(d => (
                      <option key={d} value={d}>
                        @{d}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateEmail}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate New Address</span>
                </button>
              </div>
            </div>

            {/* Email Switcher (if user has multiple) */}
            {emails.length > 1 && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Your Active Addresses ({emails.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {emails.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEmailId(e.id)}
                      className={`w-full p-2 rounded-lg text-left text-xs font-mono truncate flex items-center justify-between transition-colors ${
                        e.id === currentEmail?.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{e.address}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(e.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inbound Messages Feed */}
          <div className="lg:col-span-7">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col h-full min-h-[500px]">
              {/* Inbox Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Incoming Messages
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-semibold">
                    {messages.length}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {refreshing ? 'Polling gateway...' : 'Listening for mail'}
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Inbox is empty
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Send an email or click one of the simulated test buttons above to see instant OTP extraction in action.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {msg.senderName || msg.sender}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {msg.subject}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {msg.bodyText}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {msg.otpCode && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
                            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{msg.otpCode}</span>
                            <button
                              onClick={() => copyOtpCode(msg.otpCode!)}
                              className="ml-1 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Copy code"
                            >
                              {copiedOtp === msg.otpCode ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                  {selectedMessage.subject}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span>From: {selectedMessage.senderName} &lt;{selectedMessage.sender}&gt;</span>
                  <span>·</span>
                  <span>{new Date(selectedMessage.receivedAt).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedMessage.otpCode && (
              <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Detected One-Time Password:</span>
                  <span className="font-mono text-base font-bold tracking-widest">{selectedMessage.otpCode}</span>
                </div>
                <button
                  onClick={() => copyOtpCode(selectedMessage.otpCode!)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {copiedOtp === selectedMessage.otpCode ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {selectedMessage.bodyHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
                />
              ) : (
                <div className="whitespace-pre-wrap font-sans">
                  {selectedMessage.bodyText}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
