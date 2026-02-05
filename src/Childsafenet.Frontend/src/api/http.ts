import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:7047",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("csn_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});