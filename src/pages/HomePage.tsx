import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Smartphone,
  Zap,
  ArrowRight,
  Lock,
  Globe,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Inbox,
  Clock,
  KeyRound,
} from 'lucide-react';
import heroImg from '../assets/images/hero_secure_telecom_1791180149627.jpg';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openWalletModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  openAuthModal,
  openWalletModal,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoTab, setDemoTab] = useState<'email' | 'sms'>('email');

  const faqs = [
    {
      q: 'How quickly do temporary emails and virtual numbers receive OTPs?',
      a: 'Incoming messages arrive in near real-time. Temporary emails process incoming SMTP packets in 1 to 3 seconds. Virtual phone numbers receive carrier SMS payloads typically within 5 to 15 seconds.',
    },
    {
      q: 'Are the phone numbers real mobile carrier lines or VoIP?',
      a: 'We connect directly to tier-1 mobile carrier routes across 12+ countries. These physical and authorized SIM lines pass strict anti-VoIP screening on major platforms like WhatsApp, Telegram, Google, OpenAI, and Uber.',
    },
    {
      q: 'How long do temporary emails and numbers stay active?',
      a: 'Temporary emails remain active for 60 minutes by default and can be extended with a single click. Virtual phone number verification windows stay open for 20 minutes, allowing ample time for multiple OTP attempts.',
    },
    {
      q: 'How do wallet credits work?',
      a: 'Credits allow on-demand activation without recurring subscriptions. 1 credit equals flexible micro-access. Starter email inboxes are free, while premium carrier SMS activations cost between 4 and 8 credits depending on country and service.',
    },
    {
      q: 'Is my personal information stored or tracked?',
      a: 'No. TempShield operates on a zero-log ephemeral architecture. Messages and rented numbers are automatically purged upon expiration, and payments are handled securely without storing sensitive card details.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Temporary Telecom & Disposable Mail</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Private SMS & Disposable Email for Instant Verification.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Receive one-time passwords, bypass phone verification firewalls, and keep your primary inbox spam-free. Backed by real carrier lines across 12+ countries.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('email')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 group whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  <span>Create Temporary Email</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('phone')}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-slate-700/60 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Get Temporary Number</span>
                </button>
              </div>

              {/* Trust proof metrics */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-8 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    99.8%
                  </div>
                  <div>Carrier Delivery Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    &lt; 3.2s
                  </div>
                  <div>Avg OTP Inbound Speed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    12+
                  </div>
                  <div>Global Tier-1 Nations</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual & Interactive Demo Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900 text-white">
                {/* Hero Backing Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={heroImg}
                    alt="Encrypted global communication stream"
                    className="w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback container if image loading fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>CARRIER GATEWAYS ONLINE</span>
                  </div>
                </div>

                {/* Interactive Demo Preview Switcher */}
                <div className="p-5 space-y-4">
                  <div className="flex p-1 bg-slate-800/80 rounded-lg text-xs">
                    <button
                      onClick={() => setDemoTab('email')}
                      className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        demoTab === 'email'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Disposable Email</span>
                    </button>
                    <button
                      onClick={() => setDemoTab('sms')}
                      className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        demoTab === 'sms'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Virtual Number</span>
                    </button>
                  </div>

                  {demoTab === 'email' ? (
                    <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Generated Address</span>
                        <span className="font-mono text-indigo-400">59:42 left</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-sm text-slate-200 border border-slate-800 flex items-center justify-between">
                        <span className="truncate">dev.shield982@tempinbox.net</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          READY
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Latest: GitHub Security</span>
                        <span className="font-mono text-indigo-300 font-bold tracking-wider">
                          OTP: 839201
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">United States WhatsApp SIM</span>
                        <span className="font-mono text-amber-400">18:15 left</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-sm text-slate-200 border border-slate-800 flex items-center justify-between">
                        <span>+1 (415) 890-4812</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                          ACTIVE
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Incoming SMS</span>
                        <span className="font-mono text-emerald-300 font-bold tracking-wider">
                          CODE: 492-184
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate(demoTab === 'email' ? 'email' : 'phone')}
                    className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition-colors text-center"
                  >
                    Open Live Service Panel &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-balance">
            Engineered for Privacy, Reliability, and Zero Spam.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Everything you need to sign up for global services, isolate temporary identities, and verify accounts without giving away personal numbers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Virtual SMS */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Carrier Virtual Numbers
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated temporary numbers from verified national carriers. Perfect for WhatsApp, Telegram, Google, OpenAI, Discord, and Uber verification codes.
            </p>
            <div className="pt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Auto-refreshing SMS feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Disposable Inboxes */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Self-Destructing Inboxes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate instant temporary email addresses across multiple clean domains. Read rich HTML emails, preview verification links, and auto-purge with zero traces.
            </p>
            <div className="pt-2 text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1">
              <span>Custom handle support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Instant OTP Parser */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant OTP Extraction
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our parser automatically detects 4, 6, and 8-digit verification codes in incoming emails and text messages, giving you a 1-click copy button right in the feed.
            </p>
            <div className="pt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>One-click clipboard copy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="max-w-2xl mb-12 space-y-2">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Step-by-step Flow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Three Simple Steps to Ephemeral Verification
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Choose Country & Channel
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pick a temporary email or select a national phone number with your target service (WhatsApp, Telegram, Google, etc.).
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Receive Inbound Verification
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The live inbox listens continuously. As soon as the service sends your code, it appears in your feed with highlighted digits.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Complete Sign-Up & Discard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste your OTP into the registration form. Release the temporary number or let the inbox expire naturally with zero residue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            Predictable Credit Packages
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Pay Only For What You Use. No Subscriptions.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Purchase credits that never expire. Spend them freely on disposable inboxes or dedicated carrier SMS activations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Starter Tier',
              price: '$1',
              credits: '10 Credits',
              bonus: 'Basic access',
              features: ['1-2 SMS Activations', 'Unlimited basic emails', 'Standard carriers', 'Web support'],
              popular: false,
            },
            {
              name: 'Standard Saver',
              price: '$5',
              credits: '60 Credits',
              bonus: '+10 Bonus Credits',
              features: ['8-12 SMS Activations', 'Multi-country routes', 'High-priority delivery', 'Email retention extension'],
              popular: true,
            },
            {
              name: 'Power Verifier',
              price: '$10',
              credits: '140 Credits',
              bonus: '+40 Bonus Credits',
              features: ['20-25 SMS Activations', 'Access to all 12+ nations', 'Priority OTP routing', 'Support ticket priority'],
              popular: false,
            },
            {
              name: 'Agency Pro',
              price: '$25',
              credits: '400 Credits',
              bonus: '+150 Bonus Credits',
              features: ['60+ SMS Activations', 'Full API access', 'Dedicated carrier pools', '24/7 Priority Support'],
              popular: false,
            },
          ].map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                tier.popular
                  ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                  BEST VALUE
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {tier.price}
                  </span>
                  <span className="text-xs text-slate-500">one-time</span>
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold mb-4">
                  {tier.credits} <span className="text-[11px] font-normal">({tier.bonus})</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openWalletModal}
                className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                  tier.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                Deposit Credits
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Common Inquiries & Guidelines
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
      </section>

      {/* Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to protect your communication privacy?
            </h2>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Create an account now and get 15 free verification credits automatically added to your wallet.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-950 font-bold text-sm rounded-xl shadow-lg transition-colors whitespace-nowrap"
            >
              Sign Up with 15 Free Credits
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
