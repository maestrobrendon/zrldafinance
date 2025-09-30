

import { auth, db } from '@/lib/firebase';
import { Timestamp, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Icons } from '@/components/icons';

// Main User Profile Schema
export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  balance: number;
  KYC_status: 'Not Verified' | 'Pending' | 'Verified';
  avatarUrl: string;
};

// Transaction Schema
export type Transaction = {
  id?: string; // from firestore
  transactionId: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'contribution' | 'payment' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Timestamp; // Use Firestore Timestamp
  date: string; // Keep ISO string for client-side rendering
  description: string;
  from?: string;
  to?: string;
  category: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  avatarUrl?: string; // for user-to-user transactions
};

export type Wallet = {
  id: string; // Document ID from Firestore
  userId: string;
  type: 'budget' | 'goal';
  name: string;
  balance: number;
  status: 'open' | 'locked';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Goal-specific fields
  goalAmount?: number;
  deadline?: Timestamp;
  // Budget-specific fields
  limit?: number; // The budget amount
  frequency?: 'daily' | 'weekly' | 'monthly';
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
}

export type Goal = Wallet & {
  type: 'goal';
}

// Default user data for new sign-ups
export const defaultUser: Omit<UserProfile, 'userId' | 'email' | 'balance' | 'KYC_status'> = {
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

// Seed initial transactions for a new user
export const seedInitialTransactions = async (userId: string) => {
    const transactionsRef = collection(db, 'transactions');
    const initialTransactions: Omit<Transaction, 'transactionId' | 'id' |'userId' | 'date' | 'timestamp'>[] = [
        { description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', type: 'expense', status: 'completed' },
        { description: 'Salary Deposit', amount: 3500.00, category: 'Income', type: 'income', status: 'completed' },
        { description: 'Grocery Shopping', amount: 124.50, category: 'Groceries', type: 'expense', status: 'completed' },
        { description: 'Starbucks Coffee', amount: 5.75, category: 'Restaurants', type: 'expense', status: 'completed' },
        { description: 'Electricity Bill', amount: 75.00, category: 'Utilities', type: 'expense', status: 'pending' },
    ];
    for (const trans of initialTransactions) {
        const transactionId = `TX${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        await addDoc(transactionsRef, {
            ...trans,
            userId: userId,
            transactionId: transactionId,
            timestamp: serverTimestamp(),
        });
    }
};


export const getUser = () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        return {
            name: firebaseUser.displayName || defaultUser.name,
            email: firebaseUser.email || "alex.doe@example.com",
            avatarUrl: firebaseUser.photoURL || defaultUser.avatarUrl
        }
    }
    return {
        name: defaultUser.name,
        email: "alex.doe@example.com",
        avatarUrl: defaultUser.avatarUrl,
    };
}

export let user = getUser();

auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        user = {
            name: firebaseUser.displayName || defaultUser.name,
            email: firebaseUser.email || "alex.doe@example.com",
            avatarUrl: firebaseUser.photoURL || defaultUser.avatarUrl
        };
    } else {
        user = {
            name: defaultUser.name,
            email: "alex.doe@example.com",
            avatarUrl: defaultUser.avatarUrl,
        };
    }
});

export const mainBalance = {
  balance: 51440.43,
  currency: 'USD',
};

export const categories = [
  'Groceries', 'Restaurants', 'Utilities', 'Rent', 'Mortgage', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'Income', 'Investments', 'Other'
];
