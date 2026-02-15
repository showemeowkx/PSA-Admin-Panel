import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  phone: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  chosenStoreId?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User) => void;

  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  setChosenStore: (storeId: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => set({ token: null, user: null, isAuthenticated: false }),

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      setChosenStore: (storeId) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, chosenStoreId: storeId } });
        }
      },
    }),
    {
      name: "psa-auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
