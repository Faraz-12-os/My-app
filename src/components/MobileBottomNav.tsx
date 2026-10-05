import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Home,
  Inbox,
  Smartphone,
  Coins,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openMoreDrawer: () => void;
  emailBadgeCount?: number;
  phoneBadgeCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openMoreDrawer,
  emailBadgeCount = 0,
  phoneBadgeCount = 0,
}) => {
  const { user } = useAuth();

  const isHomeOrDashActive =
    (user && currentTab === 'dashboard') || (!user && currentTab === 'home');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 pb-safe transition-colors">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Home / Dashboard */}
        <button
          type="button"
          onClick={() => setCurrentTab(user ? 'dashboard' : 'home')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isHomeOrDashActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {user ? (
            <LayoutDashboard className="w-5 h-5" />
          ) : (
            <Home className="w-5 h-5" />
          )}
          <span className="text-[10px] tracking-tight mt-1">
            {user ? 'Dashboard' : 'Home'}
          </span>
          {isHomeOrDashActive && (
            <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5"></span>
          )}
        </button>

        {/* Tab 2: Temporary Email */}
        <button
          type="button"
          onClick={() => setCurrentTab('email')}
          className={`min-h-[48px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'email'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {emailBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {emailBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Temp Mail</span>
          {currentTab === 'email' && (
            <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5"></span>
          )}
        </button>

        {/* Tab 3: Virtual SMS Number */}
        <button
          type="button"
          onClick={() => setCurrentTab('phone')}
          className={`min-h-[48px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'phone'
              ? 'text-violet-600 dark:text-violet-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Smartphone className="w-5 h-5" />
            {phoneBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                {phoneBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Virtual SIM</span>
          {currentTab === 'phone' && (
            <span className="w-1 h-1 rounded-full bg-violet-600 dark:bg-violet-400 mt-0.5"></span>
          )}
        </button>

        {/* Tab 4: Wallet */}
        <button
          type="button"
          onClick={() => setCurrentTab(user ? 'wallet' : 'pricing')}
          className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'wallet' || currentTab === 'pricing'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Wallet</span>
          {(currentTab === 'wallet' || currentTab === 'pricing') && (
            <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-400 mt-0.5"></span>
          )}
        </button>

        {/* Tab 5: More Drawer */}
        <button
          type="button"
          onClick={openMoreDrawer}
          className="min-h-[48px] flex flex-col items-center justify-center py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">More</span>
        </button>
      </div>
    </nav>
  );
};
