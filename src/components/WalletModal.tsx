import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Package } from '../types.ts';
import { apiRequest } from '../api.ts';
import { X, Coins, CreditCard, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { user, wallet, updateWalletBalance } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [provider, setProvider] = useState<'stripe' | 'paypal' | 'crypto'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ credits: number; txId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessInfo(null);
      apiRequest<{ packages: Package[] }>('/api/wallet/packages')
        .then(res => {
          setPackages(res.packages);
          if (res.packages.length > 0) {
            const popular = res.packages.find(p => p.isPopular) || res.packages[1] || res.packages[0];
            setSelectedPkgId(popular.id);
          }
        })
        .catch(err => {
          console.error('Failed to load packages:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPkg = packages.find(p => p.id === selectedPkgId);

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in first to purchase credits');
      return;
    }
    if (!selectedPkgId) {
      setError('Please select a credit package');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Order
      const orderRes = await apiRequest<{ order: { id: string } }>('/api/wallet/create-order', {
        method: 'POST',
        body: JSON.stringify({
          packageId: selectedPkgId,
          provider,
        }),
      });

      // 2. Simulate Secure Gateway Confirmation
      const confirmRes = await apiRequest<{
        success: boolean;
        balance: number;
        order: { creditsGranted: number; transactionReference: string };
      }>('/api/wallet/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderRes.order.id,
          reference: `TXN_${Date.now()}`,
        }),
      });

      updateWalletBalance(confirmRes.balance);
      setSuccessInfo({
        credits: confirmRes.order.creditsGranted,
        txId: confirmRes.order.transactionReference,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Top Up Verification Wallet
              </h2>
              <p className="text-xs text-slate-500">
                Current balance:{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {wallet?.balance ?? 0} credits
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successInfo ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment Confirmed!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Successfully added <span className="font-bold text-indigo-600 dark:text-indigo-400">+{successInfo.credits} credits</span> to your wallet.
              </p>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Transaction ID: {successInfo.txId}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Package Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Credit Package
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {packages.map(pkg => {
                  const isSelected = selectedPkgId === pkg.id;
                  const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded">
                          POPULAR
                        </span>
                      )}
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {pkg.name}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                          ${pkg.priceUsd}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        <Coins className="w-3 h-3" />
                        <span>{totalCredits} Credits</span>
                        {pkg.bonusCredits > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                            (+{pkg.bonusCredits})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payment Processor (Zero Card Storage)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'stripe', label: 'Stripe / Card', icon: CreditCard },
                  { id: 'paypal', label: 'PayPal', icon: CheckCircle2 },
                  { id: 'crypto', label: 'Crypto (USDT)', icon: Sparkles },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProvider(item.id as any)}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      provider === item.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                <span>Total to pay: </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  ${selectedPkg?.priceUsd.toFixed(2) || '0.00'} USD
                </span>
              </div>
              <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL Encrypted Checkout</span>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={processing || !selectedPkg}
              onClick={handleCheckout}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>
                  Confirm & Deposit ${(selectedPkg?.priceUsd || 0).toFixed(2)} USD
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
