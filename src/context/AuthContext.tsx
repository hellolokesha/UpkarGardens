import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  loginWithOtp: (siteNumber: string, mobileNumber: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isCommittee: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      } else {
        authStorage.clearToken();
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify session token:', err);
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      setUser(res.user);
    }
  };

  const loginWithOtp = async (siteNumber: string, mobileNumber: string, otp: string) => {
    const res = await api.verifyOwnerOtp(siteNumber, mobileNumber, otp);
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ASSOCIATION_ADMIN' || user?.role === 'TREASURER' || user?.role === 'SECRETARY';
  const isCommittee = isAdmin || user?.role === 'COMMITTEE_MEMBER' || user?.role === 'STAFF';
  const isOwner = user?.role === 'OWNER';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, logout, refreshUser, isAdmin, isCommittee, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
