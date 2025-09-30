
import { Timestamp } from 'firebase/firestore';
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
  deadline?: Date;
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
  deadline: Date;
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

export const wallets: (Budget | Goal)[] = [
  {
    id: 'budget-1',
    userId: 'user-1',
    type: 'budget',
    name: 'Monthly Groceries',
    balance: 175.50,
    status: 'open',
    limit: 400,
    frequency: 'monthly',
    createdAt: new Date('2024-07-01T00:00:00Z'),
    updatedAt: new Date(),
  },
  {
    id: 'budget-2',
    userId: 'user-1',
    type: 'budget',
    name: 'Coffee & Snacks',
    balance: 45.20,
    status: 'open',
    limit: 75,
    frequency: 'weekly',
    createdAt: new Date('2024-07-01T00:00:00Z'),
    updatedAt: new Date(),
  },
  {
    id: 'goal-1',
    userId: 'user-1',
    type: 'goal',
    name: 'Summer Vacation',
    balance: 1250.00,
    status: 'locked',
    goalAmount: 2500,
    deadline: new Date('2024-12-31T23:59:59Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date(),
  },
    {
    id: 'goal-2',
    userId: 'user-1',
    type: 'goal',
    name: 'New Laptop',
    balance: 800.00,
    status: 'open',
    goalAmount: 1500,
    deadline: new Date('2024-10-31T23:59:59Z'),
    createdAt: new Date('2024-03-01T00:00:00Z'),
    updatedAt: new Date(),
  },
  {
    id: 'goal-3',
    userId: 'user-1',
    type: 'goal',
    name: 'Down Payment',
    balance: 10500.00,
    status: 'locked',
    goalAmount: 20000,
    deadline: new Date('2025-12-31T23:59:59Z'),
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date(),
  },
];


export const budgets: Budget[] = wallets.filter(w => w.type === 'budget') as Budget[];
export const goals: Goal[] = wallets.filter(w => w.type === 'goal') as Goal[];

export const transactions: Transaction[] = [
    {
        id: '1',
        transactionId: 'txn_1',
        userId: 'user_1',
        amount: 3500.00,
        type: 'income',
        status: 'completed',
        timestamp: new Date('2024-07-28T09:00:00Z'),
        date: '2024-07-28T09:00:00Z',
        description: 'Salary Deposit',
        category: 'Income',
        icon: Icons.dollarSign,
    },
    {
        id: '2',
        transactionId: 'txn_2',
        userId: 'user_1',
        amount: 15.99,
        type: 'expense',
        status: 'completed',
        timestamp: new Date('2024-07-27T18:30:00Z'),
        date: '2024-07-27T18:30:00Z',
        description: 'Netflix Subscription',
        category: 'Entertainment',
        icon: Icons.entertainment,
    },
    {
        id: '3',
        transactionId: 'txn_3',
        userId: 'user_1',
        amount: 124.50,
        type: 'expense',
        status: 'completed',
        timestamp: new Date('2024-07-27T12:45:00Z'),
        date: '2024-07-27T12:45:00Z',
        description: 'Grocery Shopping',
        category: 'Groceries',
        icon: Icons.shoppingCart,
    },
    {
        id: '4',
        transactionId: 'txn_4',
        userId: 'user_1',
        amount: 5.75,
        type: 'expense',
        status: 'completed',
        timestamp: new Date('2024-07-26T08:15:00Z'),
        date: '2024-07-26T08:15:00Z',
        description: 'Starbucks Coffee',
        category: 'Restaurants',
        icon: Icons.utensils,
    },
    {
        id: '5',
        transactionId: 'txn_5',
        userId: 'user_1',
        amount: 75.00,
        type: 'expense',
        status: 'pending',
        timestamp: new Date('2024-07-25T10:00:00Z'),
        date: '2024-07-25T10:00:00Z',
        description: 'Electricity Bill',
        category: 'Utilities',
        icon: Icons.bolt,
    },
    {
        id: '6',
        transactionId: 'txn_6',
        userId: 'user_1',
        amount: 450.00,
        type: 'expense',
        status: 'completed',
        timestamp: new Date('2024-07-24T14:20:00Z'),
        date: '2024-07-24T14:20:00Z',
        description: 'Flight to New York',
        category: 'Travel',
        icon: Icons.plane,
    },
     {
        id: '7',
        transactionId: 'txn_7',
        userId: 'user_1',
        amount: 250.00,
        type: 'transfer',
        status: 'completed',
        timestamp: new Date('2024-07-23T11:00:00Z'),
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

export const zcashBalance = 10000;

export const defaultUser: Omit<UserProfile, 'userId' | 'email' | 'balance' | 'KYC_status'> = {
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

// Seed initial transactions for a new user
export const seedInitialTransactions = async (userId: string) => {
    // This function can be left empty or adapted if needed for a hybrid approach later.
};

    