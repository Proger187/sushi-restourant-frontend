import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomerInfo {
  id: string;
  email: string;
  full_name: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: CustomerInfo | null;
  login: (token: string, refreshToken: string, customer: CustomerInfo) => void;
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

      login: (token, refreshToken, customer) => {
        set({ token, refreshToken, user: customer });
      },

      logout: () => {
        set({ token: null, refreshToken: null, user: null });
      },

      setToken: (token) => {
        set({ token });
      },

      isLoggedIn: () => !!get().token,
    }),
    { name: "sushi-auth" }
  )
);
