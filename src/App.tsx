import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { WalletModal } from './components/WalletModal.tsx';
import { LegalModal } from './components/LegalModal.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { MobileTopBar } from './components/MobileTopBar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { MobileActionDrawer } from './components/MobileActionDrawer.tsx';
import { PWAInstallPrompt } from './components/PWAInstallPrompt.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { usePWAInstall } from './hooks/usePWAInstall.ts';
import { apiRequest } from './api.ts';

import { HomePage } from './pages/HomePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { TemporaryEmailPage } from './pages/TemporaryEmailPage.tsx';
import { TemporaryPhonePage } from './pages/TemporaryPhonePage.tsx';
import { WalletPage } from './pages/WalletPage.tsx';
import { SupportPage } from './pages/SupportPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals & Drawers state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'aup'>('terms');
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // Badge counts for mobile bottom tabs
  const [emailCount, setEmailCount] = useState<number>(0);
  const [phoneCount, setPhoneCount] = useState<number>(0);

  // PWA install hook
  const { isInstallable, isIOS, install } = usePWAInstall();

  // Load active badges
  useEffect(() => {
    if (!user) {
      setEmailCount(0);
      setPhoneCount(0);
      return;
    }

    const fetchCounts = async () => {
      try {
        const [eRes, pRes] = await Promise.all([
          apiRequest<{ emails: any[] }>('/api/emails'),
          apiRequest<{ numbers: any[] }>('/api/numbers/active'),
        ]);
        setEmailCount(eRes.emails?.length || 0);
        const activePhones = (pRes.numbers || []).filter((p: any) => p.status === 'active');
        setPhoneCount(activePhones.length);
      } catch {
        // Silently ignore background badge errors
      }
    };

    fetchCounts();
  }, [user, currentTab]);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const openLegal = (tab: 'terms' | 'privacy' | 'aup') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Brand Splash Screen on Initial App Boot */}
      <SplashScreen minDurationMs={1800} />

      {/* Network Connectivity Indicator */}
      <OfflineIndicator />

      {/* PWA In-App Install Prompt Banner */}
      <PWAInstallPrompt />

      {/* Mobile Top Bar (Visible on mobile viewports < md) */}
      <MobileTopBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openWalletModal={() => setWalletModalOpen(true)}
        openAuthModal={() => openAuth('login')}
      />

      {/* Desktop Top Bar Contract (Visible on viewports >= md) */}
      <div className="hidden md:block">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openAuthModal={openAuth}
          openWalletModal={() => setWalletModalOpen(true)}
        />
      </div>

      {/* Main Viewport Container with safe bottom padding for fixed mobile nav */}
      <main className="flex-1 pb-24 md:pb-0">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={setCurrentTab}
            openAuthModal={openAuth}
            openWalletModal={() => setWalletModalOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentTab}
            openWalletModal={() => setWalletModalOpen(true)}
          />
        )}

        {currentTab === 'email' && (
          <TemporaryEmailPage openAuthModal={openAuth} />
        )}

        {currentTab === 'phone' && (
          <TemporaryPhonePage
            openAuthModal={openAuth}
            openWalletModal={() => setWalletModalOpen(true)}
          />
        )}

        {(currentTab === 'pricing' || currentTab === 'wallet') && (
          <WalletPage
            openWalletModal={() => setWalletModalOpen(true)}
            openAuthModal={openAuth}
          />
        )}

        {currentTab === 'support' && (
          <SupportPage
            onOpenLegal={openLegal}
            openAuthModal={openAuth}
          />
        )}

        {currentTab === 'admin' && (
          user?.role === 'admin' ? (
            <AdminPage />
          ) : (
            <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin Privileges Required
              </h2>
              <p className="text-xs text-slate-500">
                Please sign in with administrator credentials (e.g. admin@tempshield.io) to access this control suite.
              </p>
              <button
                onClick={() => openAuth('login')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Sign In with Admin Account
              </button>
            </div>
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed thumb zone on mobile < md) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openMoreDrawer={() => setMoreDrawerOpen(true)}
        emailBadgeCount={emailCount}
        phoneBadgeCount={phoneCount}
      />

      {/* Mobile Action Drawer (Bottom Sheet) */}
      <MobileActionDrawer
        isOpen={moreDrawerOpen}
        onClose={() => setMoreDrawerOpen(false)}
        onNavigate={setCurrentTab}
        onOpenLegal={openLegal}
        openAuthModal={openAuth}
        openWalletModal={() => setWalletModalOpen(true)}
        onTriggerInstall={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
      />

      {/* Quiet Footer (hidden on mobile when bottom nav is active to prevent clutter) */}
      <div className="hidden md:block">
        <Footer onOpenLegal={openLegal} onNavigate={setCurrentTab} />
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
