
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
  spent: number;
  leftToSpend: number;
  progress: number;
  warning?: string;
  savingRules?: SavingRule[];
  transactions?: Transaction[];
}

export type Goal = Wallet & {
  type: 'goal';
  daysLeft: number;
  progress: number;
  growth?: number;
  savingRules?: SavingRule[];
  transactions?: Transaction[];
}

// Default user data for new sign-ups
export const defaultUser: Omit<UserProfile, 'userId' | 'email' | 'balance' | 'KYC_status'> = {
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

// Seed initial transactions for a new user
export const seedInitialTransactions = async (userId: string) => {
    const transactionsRef = collection(db, 'transactions');
    const initialTransactions: Omit<Transaction, 'transactionId' | 'userId' | 'date' | 'timestamp'>[] = [
        { description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', type: 'expense', status: 'completed' },
        { description: 'Salary Deposit', amount: 3500.00, category: 'Income', type: 'income', status: 'completed' },
        { description: 'Grocery Shopping', amount: 124.50, category: 'Groceries', type: 'expense', status: 'completed' },
        { description: 'Starbucks Coffee', amount: 5.75, category: 'Restaurants', type: 'expense', status: 'completed' },
        { description: 'Electricity Bill', amount: 75.00, category: 'Utilities', type: 'expense', status: 'pending' },
    ];
    for (const trans of initialTransactions) {
        await addDoc(transactionsRef, {
            ...trans,
            userId: userId,
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


export const detailedTransactions: Omit<Transaction, 'userId' | 'transactionId' | 'timestamp' | 'from' | 'to'>[] = [
    { description: 'Diego', amount: 12.50, date: '2025-10-19T05:45:00Z', category: 'Other', type: 'expense', status: 'completed', avatarUrl: 'https://picsum.photos/seed/20/100/100' },
    { description: 'James contributed', amount: 540.00, date: '2025-10-15T21:10:00Z', category: 'Income', type: 'contribution', status: 'completed' },
    { description: 'Payment to Bar & Lounge', amount: 25.00, date: '2025-10-12T14:13:00Z', category: 'Restaurants', type: 'payment', status: 'completed' },
    { description: 'Payment to Club', amount: 10.50, date: '2025-10-07T21:10:00Z', category: 'Entertainment', type: 'payment', status: 'completed' },
    { description: 'Ibrahim contributed', amount: 800.00, date: '2025-10-02T01:19:00Z', category: 'Income', type: 'contribution', status: 'completed', avatarUrl: 'https://picsum.photos/seed/21/100/100' },
    { description: 'Payment to Cafe', amount: 13.00, date: '2024-09-28T21:10:00Z', category: 'Restaurants', type: 'payment', status: 'completed' },
    { description: 'Lilian contributed', amount: 20.00, date: '2024-09-25T20:00:00Z', category: 'Income', type: 'contribution', status: 'completed', avatarUrl: 'https://picsum.photos/seed/22/100/100' },
].map(t => ({...t, id: Math.random().toString()}));


export const transactions: Omit<Transaction, 'userId' | 'transactionId' | 'timestamp' | 'from' | 'to'>[] = [
  { description: 'Netflix Subscription', amount: 15.99, date: '2024-07-28', category: 'Entertainment', type: 'expense', status: 'completed' },
  { description: 'Salary Deposit', amount: 3500.00, date: '2024-07-25', category: 'Income', type: 'income', status: 'completed' },
  { description: 'Grocery Shopping', amount: 124.50, date: '2024-07-24', category: 'Groceries', type: 'expense', status: 'completed' },
  { description: 'Starbucks Coffee', amount: 5.75, date: '2024-07-24', category: 'Restaurants', type: 'expense', status: 'completed' },
  { description: 'Electricity Bill', amount: 75.00, date: '2024-07-22', category: 'Utilities', type: 'expense', status: 'pending' },
  { description: 'Concert Tickets', amount: 250.00, date: '2024-07-20', category: 'Entertainment', type: 'expense', status: 'completed' },
].map(t => ({...t, id: Math.random().toString()}));


export const walletActivities: WalletActivity[] = [
    { id: 'wa1', description: 'Created new wallet: "Car Savings"', date: '2024-07-29', category: 'Wallet' },
];

export const sharedExpenses: SharedExpense[] = [
  { id: 's1', description: 'Group Dinner', totalAmount: 180, yourShare: 45, date: '2024-07-26', circle: 'Foodie Friends' },
  { id: 's2', description: 'Weekend Trip Gas', totalAmount: 80, yourShare: 20, date: '2024-07-19', circle: 'Roadtrippers' },
  { id: 's3', description: 'Shared Streaming Service', totalAmount: 29.99, yourShare: 10, date: '2024-07-15', circle: 'Movie Buffs' },
];

export const mainBalance = {
  balance: 51440.43,
  currency: 'USD',
};

export const zcashBalance = {
  balance: 10000.00,
  currency: 'USD',
};

export const categories = [
  'Groceries', 'Restaurants', 'Utilities', 'Rent', 'Mortgage', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'Income', 'Investments', 'Other'
];

export const circles: Circle[] = [
  {
    id: "1",
    name: "Marriage Contribution",
    amount: 25000,
    contributed: 19562.00,
    progress: 88,
    daysLeft: 65,
    status: "ACTIVE",
    memberAvatars: [
        'https://picsum.photos/seed/10/100/100',
        'https://picsum.photos/seed/11/100/100',
        'https://picsum.photos/seed/12/100/100',
    ]
  },
  {
    id: "2",
    name: "Iye's Burial",
    amount: 5000,
    contributed: 2546.00,
    progress: 52,
    daysLeft: 15,
    status: "ACTIVE",
    memberAvatars: [
        'https://picsum.photos/seed/13/100/100',
        'https://picsum.photos/seed/14/100/100',
        'https://picsum.photos/seed/15/100/100',
    ]
  },
  {
    id: "3",
    name: "Nile's College Tuition",
    amount: 10000,
    contributed: 9562.00,
    progress: 98,
    daysLeft: 25,
    status: "ACTIVE",
    memberAvatars: [
        'https://picsum.photos/seed/16/100/100',
        'https://picsum.photos/seed/17/100/100',
        'https://picsum.photos/seed/18/100/100',
    ]
  },
   {
    id: "4",
    name: "Investor Buyback",
    amount: 23000000,
    contributed: 2249562.00,
    progress: 48,
    daysLeft: 65,
    status: "ACTIVE",
    memberAvatars: [
        'https://picsum.photos/seed/19/100/100',
        'https://picsum.photos/seed/20/100/100',
        'https://picsum.photos/seed/21/100/100',
    ]
  },
];
