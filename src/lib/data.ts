

import { Timestamp, collection, writeBatch, doc } from 'firebase/firestore';
import { Icons } from '@/components/icons';
import { db } from './firebase';

// Main User Profile Schema
export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  balance: number;
  zcashBalance: number;
  KYC_status: 'Not Verified' | 'Pending' | 'Verified';
  avatarUrl: string;
};

// Transaction Schema
export type Transaction = {
  id: string;
  transactionId: string;
  userId: string;
  walletId?: string; // Link to the wallet
  amount: number;
  type: 'income' | 'expense' | 'contribution' | 'payment' | 'transfer' | 'topup';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date | Timestamp;
  date: string; // ISO string for client-side rendering
  description: string;
  from?: string;
  to?: string;
  category: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  avatarUrl?: string; // for user-to-user transactions
};

export type Wallet = {
  id: string;
  type: 'budget' | 'goal';
  name: string;
  balance: number;
  status: 'open' | 'locked';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  
  // Goal-specific fields
  goalAmount?: number;
  deadline?: Date | Timestamp;
  fundingSource?: 'manual' | 'auto';
  contributionAmount?: number;
  contributionFrequency?: string;
  lockOption?: 'until-target' | 'until-date';
  goalImage?: string;
  smartReminders?: boolean;
  flexContributions?: boolean;
  
  // Budget-specific fields
  limit?: number;
  spendLimit?: number;
  isLocked?: boolean;
  lockDuration?: number; // in days
  disbursementFrequency?: 'daily' | 'weekly' | 'monthly';
  disbursementDayOfWeek?: string;
  disbursementDayOfMonth?: number;
  automaticAllocation?: boolean;
  allocationFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  allocationDayOfWeek?: string;
  allocationDayOfMonth?: number;
  rollover?: boolean;
  customNotifications?: boolean;
};


export type WalletActivity = {
  id: string;
  description: string;
  date: string;
  category: 'Wallet';
};

export type SharedExpense = {
  id: string;
  description: string;
  totalAmount: number;
  yourShare: number;
  date: string;
  circle: string;
};

export type Circle = {
  id:string;
  name: string;
  amount: number;
  contributed: number;
  progress: number;
  daysLeft: number;
  status: "ACTIVE" | "UPCOMING" | "PAST";
  memberAvatars: string[];
};

export type SavingRule = {
    id: string;
    name: string;
    description: string;
    icon: 'round-up' | 'recurring-payment';
};

export type Budget = Wallet & {
  type: 'budget';
  limit: number;
}

export type Goal = Wallet & {
  type: 'goal';
  goalAmount: number;
  deadline?: Date | Timestamp;
}


export const user = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

export const mainBalance = {
  balance: 50000,
  currency: 'USD',
};

export const sharedExpenses: SharedExpense[] = [
  {
    id: "1",
    description: "Team Lunch",
    totalAmount: 150,
    yourShare: 30,
    date: "2024-07-22",
    circle: "Work Friends",
  },
  {
    id: "2",
    description: "Movie Tickets",
    totalAmount: 45,
    yourShare: 15,
    date: "2024-07-20",
    circle: "Weekend Hangout",
  },
];

export const categories = [
  'Groceries', 'Restaurants', 'Utilities', 'Rent', 'Mortgage', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'Income', 'Investments', 'Other'
];

export const defaultUser: Omit<UserProfile, 'userId' | 'email' | 'balance' | 'KYC_status' | 'zcashBalance'> = {
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};
