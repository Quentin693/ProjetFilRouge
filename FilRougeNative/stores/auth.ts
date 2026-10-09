import { create } from "zustand";
import { authService } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await authService.login(email, password);
    if (res.error) return res.error;
    if (res.data) {
      set({ user: res.data.user, isAuthenticated: true });
    }
    return null;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    const token = await authService.getToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    const res = await authService.me();
    if (res.data) {
      set({ user: res.data, isAuthenticated: true });
    } else {
      await authService.logout();
      set({ isAuthenticated: false });
    }
    set({ isLoading: false });
  },
}));
