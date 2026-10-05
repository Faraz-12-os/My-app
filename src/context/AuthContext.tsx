import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Wallet } from '../types.ts';
import { apiRequest, getStoredToken, setStoredToken, removeStoredToken } from '../api.ts';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<{ phoneNumber?: string; resendAvailableAt: number; expiresInSeconds: number; provider?: string }>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<void>;
  resendOTP: (phoneNumber: string) => Promise<{ phoneNumber?: string; resendAvailableAt: number; expiresInSeconds: number }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  wallet: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  sendOTP: async () => ({ resendAvailableAt: 0, expiresInSeconds: 300 }),
  verifyOTP: async () => {},
  resendOTP: async () => ({ resendAvailableAt: 0, expiresInSeconds: 300 }),
  logout: () => {},
  refreshUser: async () => {},
  updateWalletBalance: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User; wallet: Wallet }>('/api/auth/me');
      setUser(data.user);
      setWallet(data.wallet);
    } catch (err) {
      console.warn('Failed to load user session:', err);
      removeStoredToken();
      setToken(null);
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    const data = await apiRequest<{ token: string; user: User; wallet: Wallet }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);
  };

  const register = async (email: string, pass: string) => {
    const data = await apiRequest<{ token: string; user: User; wallet: Wallet }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);
  };

  const sendOTP = async (phoneNumber: string) => {
    return apiRequest<{
      success: boolean;
      phoneNumber: string;
      resendAvailableAt: number;
      expiresInSeconds: number;
      provider?: string;
    }>('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  };

  const verifyOTP = async (phoneNumber: string, code: string) => {
    const data = await apiRequest<{
      token: string;
      user: User;
      wallet: Wallet;
      message: string;
    }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
    });

    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);
  };

  const resendOTP = async (phoneNumber: string) => {
    return apiRequest<{
      success: boolean;
      phoneNumber: string;
      resendAvailableAt: number;
      expiresInSeconds: number;
    }>('/api/auth/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const updateWalletBalance = (newBalance: number) => {
    setWallet(prev => (prev ? { ...prev, balance: newBalance } : { balance: newBalance }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        login,
        register,
        sendOTP,
        verifyOTP,
        resendOTP,
        logout,
        refreshUser,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
