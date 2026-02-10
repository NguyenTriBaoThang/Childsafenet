export type JwtPayload = {
  sub?: string;
  nameid?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json = decodeURIComponent(
      atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): "admin" | "parent" | null {
  const payload = parseJwt(token);
  const role = (payload?.role || "").toLowerCase();
  if (role === "admin" || role === "parent") return role;
  return null;
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}