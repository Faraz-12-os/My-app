import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  HelpCircle,
  ShieldAlert,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  LogOut,
  LogIn,
  Coins,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MobileActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenLegal: (tab: 'terms' | 'privacy' | 'aup') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openWalletModal: () => void;
  onTriggerInstall: () => void;
  isInstallable: boolean;
  isIOS: boolean;
}

export const MobileActionDrawer: React.FC<MobileActionDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenLegal,
  openAuthModal,
  openWalletModal,
  onTriggerInstall,
  isInstallable,
  isIOS,
}) => {
  const { user, wallet, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 md:hidden">
      <div
        className="w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col pb-safe animate-in slide-in-from-bottom duration-300"
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              TS
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                TempShield Menu
              </div>
              <div className="text-[11px] text-slate-500">
                {user ? user.email : 'Guest Session'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* User Status / Wallet Banner */}
          {user ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Account Balance</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {wallet?.balance ?? 0}
                  </span>
                  <span className="text-xs text-slate-500">credits</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  openWalletModal();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Top Up
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  New Account Bonus
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Sign up now for 15 free verification credits.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('register');
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shrink-0"
              >
                Claim Free
              </button>
            </div>
          )}

          {/* Quick Nav Rows */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onClose();
                onNavigate('support');
              }}
              className="w-full min-h-[52px] px-3.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>Help Desk & Ticket Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('admin');
                }}
                className="w-full min-h-[52px] px-3.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Control Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {(isInstallable || isIOS) && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerInstall();
                }}
                className="w-full min-h-[52px] px-3.5 rounded-xl flex items-center justify-between text-left bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200 dark:border-indigo-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Install App on Home Screen</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenLegal('terms');
              }}
              className="w-full min-h-[52px] px-3.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLegal('privacy');
              }}
              className="w-full min-h-[52px] px-3.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Privacy & Ephemeral Retention</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Auth Action */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 active:scale-98 transition-transform"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal('register');
                  }}
                  className="min-h-[48px] rounded-xl flex items-center justify-center text-xs font-semibold text-white bg-indigo-600 active:scale-98"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
