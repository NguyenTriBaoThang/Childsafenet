import React, { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  isAuthed: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("csn_token"));

  const value = useMemo<AuthState>(() => ({
    token,
    isAuthed: !!token,
    login: (t: string) => {
      localStorage.setItem("csn_token", t);
      setToken(t);
    },
    logout: () => {
      localStorage.removeItem("csn_token");
      setToken(null);
    },
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}