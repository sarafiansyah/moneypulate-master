import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface Limit {
  title: string;
  value: number;
}

interface BalanceState {
  totalIncome: number; // 🪙 Original total income (never decreases)
  currentBalance: number; // 💸 Remaining after limits
  limits: Limit[];

  addIncome: (amount: number) => void;
  addLimit: (title: string, value: number) => void;
  removeLimit: (title: string) => void;
  resetAll: () => void;
}

// Custom localStorage adapter
const localStorageAdapter: PersistStorage<BalanceState> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useBalanceStore = create(
  persist<BalanceState>(
    (set) => ({
      totalIncome: 0,
      currentBalance: 0,
      limits: [],

      // Add income — updates both total and current balance
      addIncome: (amount) =>
        set((state) => ({
          totalIncome: state.totalIncome + amount,
          currentBalance: state.currentBalance + amount,
        })),

      // Add a limit — subtracts from current balance only
      addLimit: (title, value) =>
        set((state) => ({
          limits: [...state.limits, { title, value }],
          currentBalance: state.currentBalance - value,
        })),

      // Remove a limit — restores the balance
      removeLimit: (title) =>
        set((state) => {
          const limitToRemove = state.limits.find((l) => l.title === title);
          if (!limitToRemove) return state;
          return {
            limits: state.limits.filter((l) => l.title !== title),
            currentBalance: state.currentBalance + limitToRemove.value,
          };
        }),

      // Reset everything
      resetAll: () =>
        set({
          totalIncome: 0,
          currentBalance: 0,
          limits: [],
        }),
    }),
    {
      name: "balance-storage",
      storage: localStorageAdapter,
    }
  )
);
