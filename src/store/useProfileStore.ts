import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface ProfileState {
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    status: string;
    joinedAt: string;
    setProfile: (data: Partial<ProfileState>) => void;
    resetProfile: () => void;
}

// Custom adapter for localStorage
const localStorageAdapter: PersistStorage<ProfileState> = {
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

export const useProfileStore = create(
    persist<ProfileState>(
        (set) => ({
            firstName: "",
            lastName: "",
            username: "",
            phoneNumber: "",
            status: "offline",
            joinedAt: new Date().toISOString(),

            setProfile: (data) =>
                set((state) => ({
                    ...state,
                    ...data,
                })),

            resetProfile: () =>
                set({
                    firstName: "",
                    lastName: "",
                    username: "",
                    phoneNumber: "",
                    status: "offline",
                    joinedAt: new Date().toISOString(),
                }),
        }),
        {
            name: "profile-storage",
            storage: localStorageAdapter,
        }
    )
);
