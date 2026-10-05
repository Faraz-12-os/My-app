import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1800,
}) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 400);
      return () => clearTimeout(hideTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950 text-white select-none transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-end pt-safe">
        <button
          onClick={() => {
            setFadingOut(true);
            setTimeout(() => {
              setVisible(false);
              if (onFinish) onFinish();
            }, 300);
          }}
          className="text-xs text-slate-500 hover:text-slate-300 py-1 px-2.5 rounded-lg active:bg-slate-900 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-5 -mt-12 animate-in fade-in zoom-in-95 duration-500">
        {/* App Logo Shield */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl border border-white/20">
            <span className="font-extrabold text-4xl tracking-tighter text-white font-mono">
              TS
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            TempShield
          </h1>
          <p className="text-xs text-slate-400 tracking-wide">
            Encrypted Ephemeral Communications
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>INITIALIZING CARRIER GATEWAYS</span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center space-y-3 pb-safe">
        <div className="w-36 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-[progress_1.6s_ease-in-out_infinite]"></div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          v2.4.0 Mobile Core · Tier-1 Telecom
        </div>
      </div>
    </div>
  );
};
