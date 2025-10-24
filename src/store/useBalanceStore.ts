import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface Limit {
    title: string;
    value: number;
}

interface BalanceState {
    totalIncome: number;
    currentBalance: number;
    limits: Limit[];

    addIncome: (amount: number) => void;
    addLimit: (title: string, value: number) => void;
    removeLimit: (title: string) => void;
    editLimit: (oldTitle: string, newTitle: string, newValue: number) => void;

    setBalance: (newBalance: number) => void;
    setTotalIncome: (newTotal: number) => void;
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
    (set, get) => ({
      totalIncome: 0,
      currentBalance: 0,
      limits: [],

      // ➕ Add income
      addIncome: (amount) =>
        set((state) => ({
          totalIncome: state.totalIncome + amount,
          currentBalance: state.currentBalance + amount,
        })),

      // ➕ Add normal limit
      addLimit: (title, value) =>
        set((state) => ({
          limits: [...state.limits, { title, value }],
          currentBalance: state.currentBalance - value,
        })),

      // ❌ Remove limit
      removeLimit: (title) =>
        set((state) => {
          const limitToRemove = state.limits.find((l) => l.title === title);
          if (!limitToRemove) return state;
          return {
            limits: state.limits.filter((l) => l.title !== title),
            currentBalance: state.currentBalance + limitToRemove.value,
          };
        }),

      // ✏️ Edit limit
      editLimit: (oldTitle, newTitle, newValue) =>
        set((state) => {
          const target = state.limits.find((l) => l.title === oldTitle);
          if (!target) return state;

          const valueDiff = newValue - target.value;
          const updatedLimits = state.limits.map((l) =>
            l.title === oldTitle ? { title: newTitle, value: newValue } : l
          );

          return {
            limits: updatedLimits,
            currentBalance: state.currentBalance - valueDiff,
          };
        }),

      // 🔧 Special Heirlooms limit update
      setHeirloomsTotal: (heirloomsTotal: number) =>
        set((state) => {
          const otherLimits = state.limits.filter(l => l.title !== "Heirlooms");
          const updatedLimits = [...otherLimits, { title: "Heirlooms", value: heirloomsTotal }];

          return {
            limits: updatedLimits,
            currentBalance: state.totalIncome - updatedLimits.reduce((sum, l) => sum + l.value, 0),
          };
        }),

      // ⚙️ Set balance manually
      setBalance: (newBalance) =>
        set(() => ({ currentBalance: newBalance })),

      setTotalIncome: (newTotal) =>
        set((state) => ({
          totalIncome: newTotal,
          currentBalance:
            newTotal - state.limits.reduce((sum, l) => sum + l.value, 0),
        })),

      // 🔄 Reset all
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
