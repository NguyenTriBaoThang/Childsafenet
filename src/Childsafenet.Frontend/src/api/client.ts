import { http } from "./http";

export type LoginRequest = { email: string; password: string };
export type AuthResponse = { token: string };

export type ScanRequest = {
  url: string;
  title?: string;
  text?: string;
  source: "Web" | "Extension";
};

export type ScanResult = {
  riskLevel: string;
  label: string;
  score: number;
  action: "ALLOW" | "WARN" | "BLOCK";
  explanation: string[];
  meta?: Record<string, any>;
};

export type LogsResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: any[];
};

export async function loginApi(payload: LoginRequest) {
  const res = await http.post<AuthResponse>("/api/auth/login", payload);
  return res.data;
}

export async function scanApi(payload: ScanRequest) {
  const res = await http.post<ScanResult>("/api/scan", payload);
  return res.data;
}

export async function getLogsApi(page = 1, pageSize = 10) {
  const res = await http.get<LogsResponse>(`/api/logs?page=${page}&pageSize=${pageSize}`);
  return res.data;
}