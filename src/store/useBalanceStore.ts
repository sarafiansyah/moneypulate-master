// store/useBalanceStore.ts
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface BalanceState {
    balance: number;
    addIncome: (amount: number) => void;
    spendMoney: (amount: number) => void;
    resetBalance: () => void;
}

// create a wrapper for localStorage that matches PersistStorage type
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
            balance: 0,
            addIncome: (amount) =>
                set((state) => ({ balance: state.balance + amount })),
            spendMoney: (amount) =>
                set((state) => ({ balance: state.balance - amount })),
            resetBalance: () => set({ balance: 0 }),
        }),
        {
            name: "balance-storage",
            storage: localStorageAdapter,
        }
    )
);
