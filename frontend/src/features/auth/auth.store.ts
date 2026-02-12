import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  phone: string;
  firstName: string;
  isAdmin: boolean;
  selectedStoreId?: number | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  setStore: (storeId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      setStore: (storeId) =>
        set((state) => ({
          user: state.user ? { ...state.user, selectedStoreId: storeId } : null,
        })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "psa-auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
