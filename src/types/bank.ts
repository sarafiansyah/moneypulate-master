// types/bank.ts
export type Bank = {
  id: string;
  name: string;
  account: string;
  currency: string;
  balance: number; // stored in base currency (we'll assume IDR for display)
  updatedAt?: string;
};
