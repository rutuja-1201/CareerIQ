"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);
    setUser(userData);
  };

  const refreshUser = useCallback(async () => {
    let stored = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const { user: userData } = await api.me(stored);
      setToken(stored);
      setUser(userData);
    } catch {
      if (refresh) {
        try {
          const { accessToken } = await api.refreshToken(refresh);
          localStorage.setItem("accessToken", accessToken);
          const { user: userData } = await api.me(accessToken);
          setToken(accessToken);
          setUser(userData);
          setLoading(false);
          return;
        } catch {}
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onTokenRefreshed = (e: Event) => {
      const accessToken = (e as CustomEvent<string>).detail;
      if (accessToken) setToken(accessToken);
    };
    window.addEventListener("auth-token-refreshed", onTokenRefreshed);
    return () => window.removeEventListener("auth-token-refreshed", onTokenRefreshed);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    persistAuth(data.accessToken, data.refreshToken, data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    persistAuth(data.accessToken || data.access_token!, data.refreshToken, data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
