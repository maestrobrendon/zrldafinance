
import { Timestamp, collection, writeBatch } from 'firebase/firestore';
import { Icons } from '@/components/icons';
import { db } from './firebase';

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
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'contribution' | 'payment' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
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
  userId: string;
  type: 'budget' | 'goal';
  name: string;
  balance: number;
  status: 'open' | 'locked';
  createdAt: Date;
  updatedAt: Date;
  // Goal-specific fields
  goalAmount?: number;
  deadline?: Date | Timestamp;
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
  limit: number;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export type Goal = Wallet & {
  type: 'goal';
  goalAmount: number;
  deadline: Date | Timestamp;
}


export const user = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

export const mainBalance = {
  balance: 51440.43,
  currency: 'USD',
};

export const initialWallets: Omit<Wallet, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deadline'>[] & { deadline?: Date } = [
  {
    type: 'budget',
    name: 'Monthly Groceries',
    balance: 175.50,
    status: 'open',
    limit: 400,
    frequency: 'monthly',
  },
  {
    type: 'budget',
    name: 'Coffee & Snacks',
    balance: 45.20,
    status: 'open',
    limit: 75,
    frequency: 'weekly',
  },
  {
    type: 'goal',
    name: 'Summer Vacation',
    balance: 1250.00,
    status: 'locked',
    goalAmount: 2500,
    deadline: new Date('2024-12-31T23:59:59Z'),
  },
    {
    type: 'goal',
    name: 'New Laptop',
    balance: 800.00,
    status: 'open',
    goalAmount: 1500,
    deadline: new Date('2024-10-31T23:59:59Z'),
  },
  {
    type: 'goal',
    name: 'Down Payment',
    balance: 10500.00,
    status: 'locked',
    goalAmount: 20000,
    deadline: new Date('2025-12-31T23:59:59Z'),
  },
];

export const initialTransactions: Omit<Transaction, 'id'|'transactionId'|'userId'|'timestamp'>[] = [
    {
        amount: 3500.00,
        type: 'income',
        status: 'completed',
        date: '2024-07-28T09:00:00Z',
        description: 'Salary Deposit',
        category: 'Income',
        icon: Icons.dollarSign,
    },
    {
        amount: 15.99,
        type: 'expense',
        status: 'completed',
        date: '2024-07-27T18:30:00Z',
        description: 'Netflix Subscription',
        category: 'Entertainment',
        icon: Icons.entertainment,
    },
    {
        amount: 124.50,
        type: 'expense',
        status: 'completed',
        date: '2024-07-27T12:45:00Z',
        description: 'Grocery Shopping',
        category: 'Groceries',
        icon: Icons.shoppingCart,
    },
    {
        amount: 5.75,
        type: 'expense',
        status: 'completed',
        date: '2024-07-26T08:15:00Z',
        description: 'Starbucks Coffee',
        category: 'Restaurants',
        icon: Icons.utensils,
    },
    {
        amount: 75.00,
        type: 'expense',
        status: 'pending',
        date: '2024-07-25T10:00:00Z',
        description: 'Electricity Bill',
        category: 'Utilities',
        icon: Icons.bolt,
    },
    {
        amount: 450.00,
        type: 'expense',
        status: 'completed',
        date: '2024-07-24T14:20:00Z',
        description: 'Flight to New York',
        category: 'Travel',
        icon: Icons.plane,
    },
     {
        amount: 250.00,
        type: 'transfer',
        status: 'completed',
        date: '2024-07-23T11:00:00Z',
        description: 'Sent to Jane Doe',
        category: 'Wallet',
        icon: Icons.wallet,
    },
];

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

export const defaultUser: Omit<UserProfile, 'userId' | 'email' | 'balance' | 'KYC_status'> = {
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

// Seed initial data for a new user
export const seedInitialData = async (userId: string) => {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    // Seed Wallets
    const walletsCollection = collection(db, 'wallets');
    initialWallets.forEach(wallet => {
        const docRef = collection(walletsCollection).doc();
        batch.set(docRef, {
            ...wallet,
            userId: userId,
            createdAt: now,
            updatedAt: now,
            deadline: wallet.deadline ? Timestamp.fromDate(wallet.deadline) : undefined,
        });
    });

    // Seed Transactions
    const transactionsCollection = collection(db, 'transactions');
    initialTransactions.forEach(tx => {
        const docRef = collection(transactionsCollection).doc();
        batch.set(docRef, {
            ...tx,
            userId: userId,
            transactionId: `txn_${docRef.id}`,
            timestamp: Timestamp.fromDate(new Date(tx.date)),
        });
    });

    await batch.commit();
};
