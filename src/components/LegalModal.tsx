import React, { useState } from 'react';
import { X, Shield, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'aup';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [tab, setTab] = useState<'terms' | 'privacy' | 'aup'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Legal & Compliance Documentation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50 dark:bg-slate-950/40 shrink-0">
          <button
            onClick={() => setTab('terms')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'terms'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setTab('aup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'aup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Acceptable Use (AUP)</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          {tab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Service Provision & Ephemeral Communications
              </h3>
              <p>
                TempShield provides temporary disposable email addresses and short-term virtual phone numbers strictly for account registration, software verification, quality assurance, and privacy protection. All addresses and numbers are ephemeral and subject to automatic expiration.
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Credit Wallet & Purchase Terms
              </h3>
              <p>
                Platform credits represent service access units. Credits do not expire while your account remains active. Because telecom bandwidth and carrier routes incur direct gateway expenses upon number provisioning, credit allocations are consumed at the moment a temporary number is reserved.
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Limitation of Liability
              </h3>
              <p>
                TempShield does not guarantee delivery of third-party SMS messages or emails that are blocked, filtered, or delayed by third-party sending services or telecom carriers. Users should not use temporary numbers for primary two-factor authentication on critical recovery accounts.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Zero-Log Ephemeral Architecture
              </h3>
              <p>
                We do not inspect or monetize your communications. Temporary inboxes and SMS logs are held in memory-managed storage and automatically purged following inbox expiration. We do not track sender IP addresses or correlate temporary identifiers with real-world identities.
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Payment Information Security
              </h3>
              <p>
                Payment card details are processed directly by certified PCI-DSS compliant third-party payment gateways (Stripe, PayPal). TempShield never receives, stores, or transmits credit card numbers on our application servers.
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Data Deletion
              </h3>
              <p>
                Users can permanently delete temporary inboxes and release active virtual numbers at any time from their dashboard. Deletion immediately invalidates the associated mail forwarding routes and purges stored messages.
              </p>
            </div>
          )}

          {tab === 'aup' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Prohibited Activities
              </h3>
              <p>
                You may not use TempShield temporary communication channels for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Financial fraud, phishing, identity theft, or unauthorized payment verification.</li>
                <li>Harassment, stalking, transmission of malicious payloads, or spam campaigns.</li>
                <li>Attempting to bypass legal sanctions or telecommunication regulations.</li>
                <li>Automated high-frequency scraping of carrier gateways outside authorized API limits.</li>
              </ul>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Enforcement & Suspension
              </h3>
              <p>
                Accounts suspected of violating this Acceptable Use Policy will be suspended immediately without credit refunds. We cooperate with law enforcement authorities in cases of verified illicit conduct.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
