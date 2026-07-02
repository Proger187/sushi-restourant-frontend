import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  id: number;
  phone: string;
  name: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  login: (token: string, refreshToken: string, user: UserInfo) => void;
  logout: () => void;
  setToken: (token: string) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,

      login: (token, refreshToken, user) => {
        localStorage.setItem("customer_token", token);
        localStorage.setItem("customer_refresh_token", refreshToken);
        set({ token, refreshToken, user });
      },

      logout: () => {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_refresh_token");
        set({ token: null, refreshToken: null, user: null });
      },

      setToken: (token) => {
        localStorage.setItem("customer_token", token);
        set({ token });
      },

      isLoggedIn: () => !!get().token,
    }),
    { name: "sushi-customer-auth" }
  )
);
