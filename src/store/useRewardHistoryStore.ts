import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RewardHistoryRow {
    key: string;
    no: number;
    name: string;
    type: string;
    price: number;
    date: string;
}

interface RewardHistoryState {
    rewardHistoryData: RewardHistoryRow[];
    setRewardHistoryData: (data: RewardHistoryRow[]) => void;
    clearRewardHistoryData: () => void;
}

export const useRewardHistoryStore = create<RewardHistoryState>()(
    persist(
        (set) => ({
            rewardHistoryData: [],
            setRewardHistoryData: (data) => set({ rewardHistoryData: data }),
            clearRewardHistoryData: () => set({ rewardHistoryData: [] }),
        }),
        {
            name: "reward-history-storage", // localStorage key
            partialize: (state) => ({
                rewardHistoryData: state.rewardHistoryData,
            }),
        }
    )
);
