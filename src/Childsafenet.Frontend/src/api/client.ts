import { http } from "./http";

export type LoginRequest = { email: string; password: string };
export type AuthResponse = { token: string };

export type RegisterRequest = {
  email: string;
  password: string;
  fullName?: string;
};

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

export type DatasetItem = {
  id?: string;
  url: string;
  host?: string;
  predictedLabel?: string;
  predictedScore?: number;
  status?: string;
  source?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  seenCount?: number;
};

export type PendingDatasetResponse = {
  items: DatasetItem[];
};

export type TrainJob = {
  id?: string;
  status?: string;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  modelVersion?: string;
  note?: string;
};

export type SettingsResponse = {
  childAge: number;
  mode: "Strict" | "Balanced" | "Relaxed";
  whitelist: string[];
  blacklist: string[];
  blockAdult: boolean;
  blockGambling: boolean;
  blockPhishing: boolean;
  warnSuspicious: boolean;
};

export type UpdateSettingsRequest = SettingsResponse;

export async function loginApi(payload: LoginRequest) {
  const res = await http.post<AuthResponse>("/api/auth/login", payload);
  return res.data;
}

export async function registerApi(payload: RegisterRequest) {
  const res = await http.post<AuthResponse>("/api/auth/register", payload);
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

export async function getDatasetPendingApi() {
  const res = await http.get<PendingDatasetResponse | DatasetItem[]>("/api/dataset/pending");
  // support both {items:[]} or []
  const data: any = res.data;
  return Array.isArray(data) ? (data as DatasetItem[]) : (data.items ?? []);
}

export async function approveDatasetApi(ids: string[]) {
  const res = await http.post("/api/dataset/approve", { ids });
  return res.data;
}

export async function rejectDatasetApi(ids: string[]) {
  const res = await http.post("/api/dataset/reject", { ids });
  return res.data;
}

export async function exportDatasetApi() {
  const res = await http.get("/api/dataset/export", { responseType: "blob" });
  return res.data as Blob;
}

export async function getTrainJobsApi() {
  const res = await http.get<{ items: TrainJob[] } | TrainJob[]>("/api/train/jobs");
  const data: any = res.data;
  return Array.isArray(data) ? (data as TrainJob[]) : (data.items ?? []);
}

export async function triggerTrainApi() {
  const res = await http.post("/api/train/trigger", {});
  return res.data;
}

export async function getSettingsApi() {
  const res = await http.get<SettingsResponse>("/api/settings");
  return res.data;
}

export async function updateSettingsApi(payload: UpdateSettingsRequest) {
  const res = await http.put<SettingsResponse>("/api/settings", payload);
  return res.data;
}