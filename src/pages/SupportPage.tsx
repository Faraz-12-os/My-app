import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import { SupportTicket, TicketMessage } from '../types.ts';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Search,
  ChevronDown,
} from 'lucide-react';

interface SupportPageProps {
  onOpenLegal: (tab: 'terms' | 'privacy' | 'aup') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({
  onOpenLegal,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // New ticket state
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'service' | 'billing' | 'sms_issue' | 'email_issue' | 'other'>('service');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [initialMessage, setInitialMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // FAQ search
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const loadTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiRequest<{ tickets: SupportTicket[] }>('/api/tickets');
      setTickets(res.tickets || []);
      if (res.tickets.length > 0 && !selectedTicket) {
        setSelectedTicket(res.tickets[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const res = await apiRequest<{ ticket: SupportTicket; messages: TicketMessage[] }>(
        `/api/tickets/${ticketId}`
      );
      setMessages(res.messages || []);
      setSelectedTicket(res.ticket);
    } catch (err) {
      console.error('Failed to load ticket conversation:', err);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setCreating(true);

    try {
      const res = await apiRequest<{ ticket: SupportTicket }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          category,
          priority,
          message: initialMessage,
        }),
      });

      setTickets(prev => [res.ticket, ...prev]);
      setSelectedTicket(res.ticket);
      setShowNewModal(false);
      setSubject('');
      setInitialMessage('');
      setSuccessNote('Support ticket created. Our team typically responds within 15 minutes.');
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !user) return;

    try {
      const res = await apiRequest<{ message: TicketMessage; messages: TicketMessage[] }>(
        `/api/tickets/${selectedTicket.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ message: replyText.trim() }),
        }
      );
      setMessages(res.messages);
      setReplyText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    }
  };

  const faqs = [
    {
      q: 'Why didn’t my temporary SMS arrive immediately?',
      a: 'Most verification SMS messages arrive in 5–15 seconds. If a code does not appear within 2 minutes, the external sender may have throttled the attempt or requires an alternate national carrier route. You can release the number without penalty and try another national pool.',
    },
    {
      q: 'Can I extend my disposable email address duration?',
      a: 'Yes. Simply click the "Extend +60m" button inside the temporary email view to extend retention for as long as you need.',
    },
    {
      q: 'Are unused credits refundable?',
      a: 'Because telecom carrier routing bandwidth is reserved dynamically upon provisioning, credits are final once purchased. However, if a temporary number receives zero SMS messages, the activation costs can be refunded upon request to support.',
    },
    {
      q: 'Can I integrate TempShield via REST API into my own automated tests?',
      a: 'Yes. Enterprise Agency Pro accounts include full API keys to provision numbers and retrieve inbound verification codes programmatically.',
    },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            <span>Support Desk & Help Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            24/7 Operations support for telecom carrier routing, billing questions, and verification inquiries.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Support Ticket</span>
          </button>
        )}
      </div>

      {successNote && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Ticket Management Split */}
      {user ? (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Tickets List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Your Inquiries ({tickets.length})
              </h2>
            </div>

            {tickets.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 bg-white dark:bg-slate-900/60">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No open support tickets.</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Create Inquiry
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {tickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors space-y-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {ticket.subject}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ticket.status === 'open'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : ticket.status === 'in_progress'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Category: {ticket.category}</span>
                        <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Ticket Conversation */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedTicket.subject}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ticket #{selectedTicket.id.slice(-6)} · Priority: {selectedTicket.priority}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Conversation History */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {messages.map(msg => {
                    const isStaff = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                      >
                        <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
                          <span>{msg.senderName}</span>
                          {isStaff && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold">
                              STAFF
                            </span>
                          )}
                          <span>·</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            isStaff
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Composer */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your response to support..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 h-[600px] flex items-center justify-center p-8 text-center text-xs text-slate-400">
                Select an inquiry from the list to view the full dialogue.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 max-w-lg mx-auto text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-indigo-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Sign In to Open a Ticket
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to track support requests, talk directly with platform technicians, and view resolution logs.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Sign In to Account
          </button>
        </div>
      )}

      {/* FAQ Search & Accordion */}
      <div className="max-w-4xl mx-auto space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Knowledge Base & Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Instant answers for common telecommunication and ephemeral mailbox questions.
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={faqSearch}
            onChange={e => setFaqSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Policies Banner */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Legal & Compliance Documents
          </h3>
          <p className="text-xs text-slate-500">
            Review our Terms of Service, Privacy Policy, and Acceptable Use Policy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenLegal('terms')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Terms of Service
          </button>
          <button
            onClick={() => onOpenLegal('privacy')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onOpenLegal('aup')}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            AUP
          </button>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Support Ticket
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delayed SMS code for Telegram"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="service">Carrier SMS Service</option>
                    <option value="email_issue">Disposable Email Issue</option>
                    <option value="billing">Wallet & Credits</option>
                    <option value="other">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Message Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide context, such as target service name or phone line number..."
                  value={initialMessage}
                  onChange={e => setInitialMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
