'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: read token from localStorage and validate
  useEffect(() => {
    const storedToken = localStorage.getItem('nyayasetu_token');

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Validate token with /api/auth/me
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token invalid — clear storage
          localStorage.removeItem('nyayasetu_token');
          localStorage.removeItem('nyayasetu_user');
        }
      })
      .catch(() => {
        localStorage.removeItem('nyayasetu_token');
        localStorage.removeItem('nyayasetu_user');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nyayasetu_token', data.token);
        localStorage.setItem('nyayasetu_user', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, message: data.message || 'Login failed.' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nyayasetu_token');
    localStorage.removeItem('nyayasetu_user');

    // Fire-and-forget logout API call
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
