export type Role = "admin" | "parent";

export type AuthState = {
  token: string | null;
  role: Role | null;
  isAuthed: boolean;
  setToken: (t: string | null) => void;
  logout: () => void;
};