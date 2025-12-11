import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Bank } from "@/types/bank";
import { useBalanceStore } from "@/store/useBalanceStore";

const genId = () =>
  "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);

type BankState = {
  banks: Bank[];
  addBank: (b: Omit<Bank, "id" | "updatedAt">) => void;
  updateBank: (id: string, patch: Partial<Bank>) => void;
  removeBank: (id: string) => void;
  setBanks: (banks: Bank[]) => void;
  totalBalance: () => number;
};

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      banks: [],

      addBank: (b) =>
        set((s) => {
          const newBanks = [
            ...s.banks,
            {
              ...b,
              id: genId(),
              updatedAt: new Date().toISOString(),
            },
          ];

          const total = newBanks.reduce((acc, x) => acc + x.balance, 0);
          useBalanceStore.getState().setBankBalance(total);

          return { banks: newBanks };
        }),

      updateBank: (id, patch) =>
        set((s) => {
          const newBanks = s.banks.map((bk) =>
            bk.id === id
              ? { ...bk, ...patch, updatedAt: new Date().toISOString() }
              : bk
          );

          const total = newBanks.reduce((acc, x) => acc + x.balance, 0);
          useBalanceStore.getState().setBankBalance(total);

          return { banks: newBanks };
        }),

      removeBank: (id) =>
        set((s) => {
          const newBanks = s.banks.filter((b) => b.id !== id);

          const total = newBanks.reduce((acc, x) => acc + x.balance, 0);
          useBalanceStore.getState().setBankBalance(total);

          return { banks: newBanks };
        }),

      setBanks: (banks) =>
        set(() => {
          const total = banks.reduce((acc, x) => acc + x.balance, 0);
          useBalanceStore.getState().setBankBalance(total);

          return { banks };
        }),

      totalBalance: () =>
        get().banks.reduce((acc, b) => acc + b.balance, 0),
    }),
    {
      name: "bank-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
