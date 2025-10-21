// store/useHeirloomStore.ts
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

export interface Heirloom {
    key: string;
    name: string;
    type: string;
    price: number;
    date: string;
}

interface HeirloomState {
    heirlooms: Heirloom[];
    addHeirloom: (item: Heirloom) => void;
    editHeirloom: (item: Heirloom) => void;
    deleteHeirloom: (key: string) => void;
    resetHeirlooms: () => void;
}

// wrap localStorage so TypeScript is happy
const localStorageAdapter: PersistStorage<HeirloomState> = {
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

export const useHeirloomStore = create(
    persist<HeirloomState>(
        (set) => ({
            heirlooms: [],
            addHeirloom: (item) =>
                set((state) => ({ heirlooms: [...state.heirlooms, item] })),
            editHeirloom: (item) =>
                set((state) => ({
                    heirlooms: state.heirlooms.map((h) =>
                        h.key === item.key ? item : h
                    ),
                })),
            deleteHeirloom: (key) =>
                set((state) => ({
                    heirlooms: state.heirlooms.filter((h) => h.key !== key),
                })),
            resetHeirlooms: () => set({ heirlooms: [] }),
        }),
        {
            name: "heirloom-storage",
            storage: localStorageAdapter, // use adapter instead of raw localStorage
        }
    )
);
