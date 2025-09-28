
export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

export type Wallet = {
  id: string;
  name: string;
  balance: number;
  goal?: number;
  currency: string;
  color: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
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
  id: string;
  name: string;
  amount: number;
  contributed: number;
  progress: number;
  daysLeft: number;
  status: "ACTIVE" | "UPCOMING" | "PAST";
  memberAvatars: string[];
};

export const user: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

export const wallets: Wallet[] = [
  { id: 'w1', name: 'Vacation Fund', balance: 1250.75, goal: 3000, currency: 'USD', color: 'bg-blue-500' },
  { id: 'w2', name: 'Emergency', balance: 5040.00, goal: 10000, currency: 'USD', color: 'bg-red-500' },
  { id: 'w3', name: 'New Gadgets', balance: 450.00, goal: 1000, currency: 'USD', color: 'bg-purple-500' },
  { id: 'w4', name: 'Investments', balance: 15800.20, currency: 'USD', color: 'bg-green-500' },
  { id: 'b1', name: 'Monthly Coffee', balance: 150, goal: 250, currency: 'USD', color: 'bg-yellow-500' },
  { id: 'b2', name: 'Vehicle Fuel', balance: 50, goal: 400, currency: 'USD', color: 'bg-orange-500' },
  { id: 'b3', name: 'Gym Membership', balance: 50, goal: 50, currency: 'USD', color: 'bg-cyan-500' },
];

export const transactions: Transaction[] = [
  { id: 't1', description: 'Netflix Subscription', amount: 15.99, date: '2024-07-28', category: 'Entertainment', type: 'expense', status: 'completed' },
  { id: 't2', description: 'Salary Deposit', amount: 3500.00, date: '2024-07-25', category: 'Income', type: 'income', status: 'completed' },
  { id: 't3', description: 'Grocery Shopping', amount: 124.50, date: '2024-07-24', category: 'Groceries', type: 'expense', status: 'completed' },
  { id: 't4', description: 'Starbucks Coffee', amount: 5.75, date: '2024-07-24', category: 'Restaurants', type: 'expense', status: 'completed' },
  { id: 't5', description: 'Electricity Bill', amount: 75.00, date: '2024-07-22', category: 'Utilities', type: 'expense', status: 'pending' },
  { id: 't6', description: 'Concert Tickets', amount: 250.00, date: '2024-07-20', category: 'Entertainment', type: 'expense', status: 'completed' },
];

export const sharedExpenses: SharedExpense[] = [
  { id: 's1', description: 'Group Dinner', totalAmount: 180, yourShare: 45, date: '2024-07-26', circle: 'Foodie Friends' },
  { id: 's2', description: 'Weekend Trip Gas', totalAmount: 80, yourShare: 20, date: '2024-07-19', circle: 'Roadtrippers' },
  { id: 's3', description: 'Shared Streaming Service', totalAmount: 29.99, yourShare: 10, date: '2024-07-15', circle: 'Movie Buffs' },
];

export const mainBalance = {
  balance: 22315.55,
  currency: 'USD',
};

export const categories = [
  'Groceries', 'Restaurants', 'Utilities', 'Rent', 'Mortgage', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'Income', 'Investments', 'Other'
];

export const budgets = [
  { id: 'b1', name: 'Monthly Coffee', amount: 250.00, left: 100.00, progress: 60, status: 'Available' },
  { id: 'b2', name: 'Vehicle Fuel', amount: 400.00, left: 50.00, progress: 87.5, status: 'Locked 3 months ago' },
  { id: 'b3', name: 'Gym Membership', amount: 50.00, left: 0.00, progress: 100, status: 'Available' },
];

export const goals = [
    { id: 'w1', name: 'Vacation Fund', amount: 3000, saved: 1250.75, progress: 41.69 },
    { id: 'w2', name: 'Emergency', amount: 10000, saved: 5040.00, progress: 50.4 },
    { id: 'w3', name: 'New Gadgets', amount: 1000, saved: 450.00, progress: 45 },
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
