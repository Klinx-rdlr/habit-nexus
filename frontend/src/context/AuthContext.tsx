'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { setTokens, clearTokens } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  username: string;
  timezone: string;
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
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      router.push('/today');
    },
    [router],
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await authApi.register({ email, username, password, timezone });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      router.push('/today');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
