import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { deleteToken, getToken, setToken } from '../services/tokenStorage';
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
        const token = await getToken();
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          await deleteToken();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSession = async (data: { token: string; user: User }) => {
    await setToken(data.token);
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
    await deleteToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, pendingEmail, loading, login, register, verify, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}