import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const url = config.url ?? "";
    if (token && (url.includes("/admin/") || url.includes("/auth/"))) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
