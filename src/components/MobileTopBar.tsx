import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { Coins, Sun, Moon, ArrowLeft, Plus } from 'lucide-react';

interface MobileTopBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openWalletModal: () => void;
  openAuthModal: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentTab,
  setCurrentTab,
  openWalletModal,
  openAuthModal,
}) => {
  const { user, wallet } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isHomeOrDash = currentTab === 'home' || currentTab === 'dashboard';

  const getTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'TempShield';
      case 'dashboard':
        return 'Workspace';
      case 'email':
        return 'Disposable Inboxes';
      case 'phone':
        return 'Virtual Phone Lines';
      case 'wallet':
      case 'pricing':
        return 'Wallet & Packages';
      case 'support':
        return 'Help & Support';
      case 'admin':
        return 'Admin Portal';
      default:
        return 'TempShield';
    }
  };

  return (
    <header className="sticky top-0 z-30 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 pt-safe transition-colors">
      <div className="flex items-center justify-between px-3 h-14">
        {/* Left Slot: Back button or Brand logo */}
        <div className="flex items-center min-w-[70px]">
          {!isHomeOrDash ? (
            <button
              onClick={() => setCurrentTab(user ? 'dashboard' : 'home')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1 text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab(user ? 'dashboard' : 'home')}
              className="flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <span className="font-bold text-xs tracking-tighter font-mono">TS</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                TempShield
              </span>
            </button>
          )}
        </div>

        {/* Center Slot: Page Title */}
        <div className="flex-1 text-center px-1 truncate">
          {!isHomeOrDash && (
            <div className="flex items-center justify-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {getTitle()}
              </span>
            </div>
          )}
        </div>

        {/* Right Slot: Wallet Pill / Profile / Theme */}
        <div className="flex items-center justify-end gap-1.5 min-w-[70px]">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:scale-95"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              onClick={openWalletModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono tabular-nums">{wallet?.balance ?? 0}</span>
              <Plus className="w-3 h-3 text-indigo-500" />
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
