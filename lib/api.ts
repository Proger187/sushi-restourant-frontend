import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const url = config.url ?? "";
    if (url.includes("/admin/") || url === "/api/auth/token/" || url === "/api/auth/token/refresh/") {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } else if (
      url.includes("/api/orders") ||
      url.includes("/api/auth/customer/")
    ) {
      const token = localStorage.getItem("customer_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
