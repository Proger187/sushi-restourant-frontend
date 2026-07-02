import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const url = config.url ?? "";
    if (
      url.includes("/admin/") ||
      url === "/api/auth/token/" ||
      url === "/api/auth/token/refresh/"
    ) {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Customer token from Zustand store (persisted in localStorage as sushi-auth)
      try {
        const raw = localStorage.getItem("sushi-auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          const token = parsed?.state?.token;
          if (token) config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/api/accounts/token/refresh/") &&
      !original.url?.includes("/api/auth/token/")
    ) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = (async () => {
            const raw = localStorage.getItem("sushi-auth");
            const refreshToken = raw ? JSON.parse(raw)?.state?.refreshToken : null;
            if (!refreshToken) throw new Error("No refresh token");
            const { data } = await axios.post(
              `${api.defaults.baseURL}/api/accounts/token/refresh/`,
              { refresh: refreshToken }
            );
            // Update store
            const { useAuthStore } = await import("@/store/auth");
            useAuthStore.getState().setToken(data.access);
            return data.access;
          })().finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        const { useAuthStore } = await import("@/store/auth");
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
