import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../api.ts';
import {
  CountryConfig,
  ServiceConfig,
  TemporaryPhoneNumber,
  SMSMessage,
} from '../types.ts';
import {
  Smartphone,
  Globe,
  Coins,
  Copy,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  KeyRound,
  AlertCircle,
  X,
  Search,
  Radio,
} from 'lucide-react';

interface TemporaryPhonePageProps {
  openAuthModal: (mode?: 'login' | 'register') => void;
  openWalletModal: () => void;
}

export const TemporaryPhonePage: React.FC<TemporaryPhonePageProps> = ({
  openAuthModal,
  openWalletModal,
}) => {
  const { user, wallet, updateWalletBalance } = useAuth();
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('wa');
  const [countrySearch, setCountrySearch] = useState<string>('');

  const [activeNumbers, setActiveNumbers] = useState<TemporaryPhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);

  const [renting, setRenting] = useState(false);
  const [refreshingSms, setRefreshingSms] = useState(false);
  const [simulatingSms, setSimulatingSms] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // Time remaining string for currently selected phone
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  const currentPhone = activeNumbers.find(p => p.id === selectedPhoneId) || activeNumbers[0] || null;

  // Load countries & services
  useEffect(() => {
    Promise.all([
      apiRequest<{ countries: CountryConfig[] }>('/api/numbers/countries'),
      apiRequest<{ services: ServiceConfig[] }>('/api/numbers/services'),
    ])
      .then(([cRes, sRes]) => {
        setCountries(cRes.countries || []);
        setServices(sRes.services || []);
      })
      .catch(err => {
        console.error('Failed to load countries/services:', err);
      });
  }, []);

  // Load active numbers for user
  const loadActiveNumbers = async () => {
    if (!user) return;
    try {
      const res = await apiRequest<{ numbers: TemporaryPhoneNumber[] }>('/api/numbers/active');
      setActiveNumbers(res.numbers || []);
      if (res.numbers.length > 0 && !selectedPhoneId) {
        setSelectedPhoneId(res.numbers[0].id);
      }
    } catch (err) {
      console.error('Failed to load user numbers:', err);
    }
  };

  useEffect(() => {
    loadActiveNumbers();
  }, [user]);

  // Load SMS messages for selected number
  const loadSMS = async (phoneId: string) => {
    setRefreshingSms(true);
    try {
      const res = await apiRequest<{ messages: SMSMessage[] }>(`/api/numbers/${phoneId}/messages`);
      setSmsMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load SMS messages:', err);
    } finally {
      setRefreshingSms(false);
    }
  };

  useEffect(() => {
    if (currentPhone) {
      loadSMS(currentPhone.id);
    } else {
      setSmsMessages([]);
    }
  }, [currentPhone?.id]);

  // Rental timer countdown
  useEffect(() => {
    if (!currentPhone) {
      setTimeLeftStr('');
      return;
    }

    const updateTimer = () => {
      const diff = new Date(currentPhone.expiresAt).getTime() - Date.now();
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
  }, [currentPhone?.expiresAt]);

  const selectedCountry = countries.find(c => c.code === selectedCountryCode);
  const selectedService = services.find(s => s.code === selectedServiceCode);
  const totalCost = Math.max(selectedCountry?.baseCreditCost || 6, selectedService?.creditCost || 5);

  const handleRentNumber = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if ((wallet?.balance ?? 0) < totalCost) {
      setError(`Insufficient credits. You need ${totalCost} credits, but have ${wallet?.balance ?? 0}. Please top up your wallet.`);
      openWalletModal();
      return;
    }

    setRenting(true);
    setError(null);
    setSuccessNote(null);

    try {
      const res = await apiRequest<{
        phone: TemporaryPhoneNumber;
        walletBalance: number;
        message: string;
      }>('/api/numbers/rent', {
        method: 'POST',
        body: JSON.stringify({
          countryCode: selectedCountryCode,
          serviceCode: selectedServiceCode,
        }),
      });

      updateWalletBalance(res.walletBalance);
      setActiveNumbers(prev => [res.phone, ...prev]);
      setSelectedPhoneId(res.phone.id);
      setSuccessNote(`Number ${res.phone.number} successfully assigned! Waiting for SMS verification code.`);
    } catch (err: any) {
      setError(err.message || 'Failed to activate number');
    } finally {
      setRenting(false);
    }
  };

  const handleReleaseNumber = async (id: string) => {
    if (!user) return;
    try {
      await apiRequest(`/api/numbers/${id}/release`, { method: 'POST' });
      setActiveNumbers(prev =>
        prev.map(p => (p.id === id ? { ...p, status: 'released' } : p))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to release number');
    }
  };

  const handleSimulateSMS = async () => {
    if (!currentPhone) return;
    setSimulatingSms(true);
    try {
      await apiRequest(`/api/numbers/${currentPhone.id}/simulate-sms`, {
        method: 'POST',
      });
      await loadSMS(currentPhone.id);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch test SMS');
    } finally {
      setSimulatingSms(false);
    }
  };

  const copyPhoneNumber = () => {
    if (!currentPhone) return;
    navigator.clipboard.writeText(currentPhone.number);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const copyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.prefix.includes(countrySearch)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-violet-500" />
            <span>Virtual Phone Numbers for SMS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rent verified national carrier lines. Receive WhatsApp, Telegram, Google, and OpenAI verification codes in seconds.
          </p>
        </div>

        {user && currentPhone && currentPhone.status === 'active' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSMS(currentPhone.id)}
              disabled={refreshingSms}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingSms ? 'animate-spin' : ''}`} />
              <span>Refresh SMS</span>
            </button>
            <button
              onClick={() => handleReleaseNumber(currentPhone.id)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs font-semibold transition-colors"
            >
              Release Number
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successNote && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successNote}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Number Provisioning Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Number Display (if any) */}
          {currentPhone && (
            <div className="p-6 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-md space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">
                    Assigned Virtual SIM
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                    {currentPhone.serviceName}
                  </span>
                </div>
                {currentPhone.status === 'active' ? (
                  <div className="flex items-center gap-1.5 font-mono text-amber-600 dark:text-amber-400 font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>{timeLeftStr || '20:00'}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Released</span>
                )}
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-inner">
                <div>
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-white block">
                    {currentPhone.number}
                  </span>
                  <span className="text-xs text-slate-500">
                    {currentPhone.countryName} · Carrier Line
                  </span>
                </div>
                <button
                  onClick={copyPhoneNumber}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedPhone ? (
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

              {/* Instant Test SMS Trigger */}
              {currentPhone.status === 'active' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Testing in development? Trigger simulated OTP:
                  </div>
                  <button
                    type="button"
                    disabled={simulatingSms}
                    onClick={handleSimulateSMS}
                    className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Send Test OTP</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reservation Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-violet-500" />
              <span>Rent a Virtual Number</span>
            </h3>

            {/* Step 1: Select Country */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  1. Select Country
                </label>
                <span className="text-slate-400 font-mono text-[11px]">
                  {countries.length} Nations
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter country or dial prefix..."
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredCountries.map(c => {
                  const isSelected = selectedCountryCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountryCode(c.code)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{c.flag}</span>
                        <div className="truncate">
                          <div className="text-xs truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.prefix}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {c.baseCreditCost}cr
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Service */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                2. Select Target Service / Platform
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {services.map(s => {
                  const isSelected = selectedServiceCode === s.code;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => setSelectedServiceCode(s.code)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs truncate">{s.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums ml-1">
                        {s.creditCost}cr
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cost Summary & Activation Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Service Cost:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{totalCost} Credits</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Your Balance:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                  {wallet?.balance ?? 0} Credits
                </span>
              </div>

              <button
                type="button"
                disabled={renting}
                onClick={handleRentNumber}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {renting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Activate Virtual Number ({totalCost} cr)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live SMS Feed */}
        <div className="lg:col-span-7">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Incoming SMS Messages
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[11px] font-mono font-semibold">
                  {smsMessages.length}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {currentPhone?.status === 'active' ? 'Active SMS Route' : 'Idle'}
              </div>
            </div>

            {/* SMS Feed List */}
            <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto">
              {!currentPhone ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Select a country and service on the left to activate your temporary phone line.
                  </p>
                </div>
              ) : smsMessages.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto animate-pulse">
                    <Radio className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Listening for incoming SMS...
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Enter <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{currentPhone.number}</span> into {currentPhone.serviceName}. The message will appear here automatically.
                    </p>
                  </div>
                </div>
              ) : (
                smsMessages.map(sms => (
                  <div
                    key={sms.id}
                    className="py-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sms.sender}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(sms.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {sms.otpCode && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Detected Code:</span>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-sm font-extrabold tracking-wider">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{sms.otpCode}</span>
                            <button
                              onClick={() => copyOtp(sms.otpCode!)}
                              className="ml-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
                              title="Copy code"
                            >
                              {copiedOtp === sms.otpCode ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 leading-relaxed">
                      {sms.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
