import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEY } from '../services/api';
import type { User } from '../types';

type AuthContextType = {
  user: User | null;
  pendingEmail: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  verify: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as unknown as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Відновлення сесії при старті
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSession = async (data: { token: string; user: User }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email: string, password: string) =>
    saveSession((await api.post('/auth/login', { email, password })).data);

  const register = async (full_name: string, email: string, password: string) => {
    await api.post('/auth/register', { full_name, email, password });
    setPendingEmail(email.trim().toLowerCase());
  };

  const verify = async (code: string) => {
    const { data } = await api.post('/auth/verify', { email: pendingEmail, code });
    await saveSession(data);
    setPendingEmail(null);
  };

  const resendCode = async () => {
    await api.post('/auth/resend-code', { email: pendingEmail });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, pendingEmail, loading, login, register, verify, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}