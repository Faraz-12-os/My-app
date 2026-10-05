import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'terms' | 'privacy' | 'aup') => void;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                TS
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                TempShield
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Enterprise temporary email addresses and carrier virtual SMS numbers for private OTP verification and automated testing.
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Log Ephemeral Routing</span>
            </div>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
              Services
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('email')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Temporary Inboxes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('phone')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Virtual SMS Numbers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Credit Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Help Desk & FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
              Compliance & Legal
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('aup')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  Acceptable Use Policy
                </button>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-600">GDPR & CCPA Compliant</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
              Integration & Security
            </div>
            <p className="text-slate-500 mb-2 leading-relaxed">
              Provider API credentials are encrypted server-side. Numbers and inboxes auto-expire with zero residual persistence.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} TempShield Communications Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>256-bit TLS</span>
            <span>·</span>
            <span>Carrier Grade Tier-1</span>
            <span>·</span>
            <span>Privacy First</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
