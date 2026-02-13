import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LoginRequest } from "../api/client";
import { loginApi } from "../api/client";
import { getRoleFromToken, isTokenExpired } from "./jwt";

export type Role = "admin" | "parent";

type AuthState = {
  token: string | null;
  role: Role | null;
  isAuthed: boolean;

  login: (payload: LoginRequest) => Promise<void>;

  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("csn_token"));
  const [role, setRole] = useState<Role | null>(() => {
    const t = localStorage.getItem("csn_token");
    return t ? (getRoleFromToken(t) as Role | null) : null;
  });

  const setToken = (t: string | null) => {
    if (!t) {
      localStorage.removeItem("csn_token");
      setTokenState(null);
      setRole(null);
      return;
    }
    localStorage.setItem("csn_token", t);
    setTokenState(t);
    setRole((getRoleFromToken(t) as Role | null) ?? null);
  };

  const logout = () => setToken(null);

  const login = async (payload: LoginRequest) => {
    const res = await loginApi(payload); // { token, role? }
    if (!res?.token) throw new Error("Missing token from server");
    setToken(res.token);
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthed: !!token && !isTokenExpired(token),
      login,
      setToken,
      logout,
    }),
    [token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
