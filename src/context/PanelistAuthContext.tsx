import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest, type LoginResponse } from '../api/auth';
import { ApiError } from '../api/ApiError';
import {
  clearPanelistSession,
  getPanelistSession,
  savePanelistSession,
  type PanelistUser,
} from '../utils/panelistSession';

interface PanelistAuthContextValue {
  user: PanelistUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  updateUser: (user: PanelistUser) => void;
}

const PanelistAuthContext = createContext<PanelistAuthContextValue | null>(null);

export function PanelistAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => getPanelistSession());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const syncSession = () => setSession(getPanelistSession());
    window.addEventListener('panelist-auth-changed', syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener('panelist-auth-changed', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginRequest({ email, password });
      if (!response.token || !response.data) {
        throw new ApiError('Login failed. Please try again.', 400);
      }

      const nextSession = {
        token: response.token,
        user: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          balance_point: Number(response.data.balance_point ?? 0),
          questionnaire: response.data.questionnaire,
          questionnaire_url: response.data.questionnaire_url,
          profile_image: response.data.profile_image ?? null,
        },
      };

      savePanelistSession(nextSession);
      setSession(nextSession);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearPanelistSession();
    setSession(null);
  }, []);

  const updateUser = useCallback((user: PanelistUser) => {
    setSession((current) => {
      if (!current) return current;
      const nextSession = { ...current, user };
      savePanelistSession(nextSession);
      return nextSession;
    });
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [session, isLoading, login, logout, updateUser]
  );

  return <PanelistAuthContext.Provider value={value}>{children}</PanelistAuthContext.Provider>;
}

export function usePanelistAuth() {
  const context = useContext(PanelistAuthContext);
  if (!context) {
    throw new Error('usePanelistAuth must be used within PanelistAuthProvider');
  }
  return context;
}
