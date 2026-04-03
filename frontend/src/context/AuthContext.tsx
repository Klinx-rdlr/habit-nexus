'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/lib/api/auth';
import { setTokens, clearTokens } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  username: string;
  timezone: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((data) => {
        setUser({
          id: data.id,
          email: data.email,
          username: data.username,
          timezone: data.timezone,
          createdAt: data.createdAt,
        });
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      await queryClient.invalidateQueries();
      router.push('/today');
      // Fetch full profile in background to get createdAt
      authApi.getMe().then((me) => setUser({ ...res.user, createdAt: me.createdAt })).catch(() => {});
    },
    [router, queryClient],
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await authApi.register({ email, username, password, timezone });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      await queryClient.invalidateQueries();
      router.push('/today');
      // Fetch full profile in background to get createdAt
      authApi.getMe().then((me) => setUser({ ...res.user, createdAt: me.createdAt })).catch(() => {});
    },
    [router, queryClient],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    queryClient.clear();
    router.push('/login');
  }, [router, queryClient]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
