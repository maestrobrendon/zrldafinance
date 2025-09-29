

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
  type: 'income' | 'expense' | 'contribution' | 'payment';
  status: 'completed' | 'pending' | 'failed';
  avatarUrl?: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
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
  id: string;
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

export type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  leftToSpend: number;
  limit: number;
  progress: number;
  status: string; // e.g. 'Available', 'Locked 3 months ago'
  warning?: string;
  savingRules?: SavingRule[];
  transactions?: Transaction[];
}

export type Goal = {
  id: string;
  name: string;
  balance: number;
  goal: number;
  daysLeft: number;
  progress: number;
  growth?: number;
  status: 'Live' | 'Finished';
  savingRules?: SavingRule[];
  transactions?: Transaction[];
  locked?: boolean;
  deadline?: string;
}

export const user: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

export const wallets: Wallet[] = [
  { id: 'w1', name: 'Investment', balance: 1640.23, goal: 23468.00, currency: 'USD', color: 'bg-blue-500' },
  { id: 'w2', name: 'Emergency Funds', balance: 3500.00, goal: 5000, currency: 'USD', color: 'bg-red-500' },
  { id: 'w3', name: 'Car Purchase', balance: 30500.00, goal: 400500.00, currency: 'USD', color: 'bg-purple-500' },
  { id: 'w4', name: 'Investments', balance: 15800.20, currency: 'USD', color: 'bg-green-500' },
];

export const detailedTransactions: Transaction[] = [
    { id: 'dt1', description: 'Diego', amount: 12.50, date: '2025-10-19T05:45:00Z', category: 'Other', type: 'expense', status: 'completed', avatarUrl: 'https://picsum.photos/seed/20/100/100' },
    { id: 'dt2', description: 'James contributed', amount: 540.00, date: '2025-10-15T21:10:00Z', category: 'Income', type: 'contribution', status: 'completed' },
    { id: 'dt3', description: 'Payment to Bar & Lounge', amount: 25.00, date: '2025-10-12T14:13:00Z', category: 'Restaurants', type: 'payment', status: 'completed' },
    { id: 'dt4', description: 'Payment to Club', amount: 10.50, date: '2025-10-07T21:10:00Z', category: 'Entertainment', type: 'payment', status: 'completed' },
    { id: 'dt5', description: 'Ibrahim contributed', amount: 800.00, date: '2025-10-02T01:19:00Z', category: 'Income', type: 'contribution', status: 'completed', avatarUrl: 'https://picsum.photos/seed/21/100/100' },
    { id: 'dt6', description: 'Payment to Cafe', amount: 13.00, date: '2024-09-28T21:10:00Z', category: 'Restaurants', type: 'payment', status: 'completed' },
    { id: 'dt7', description: 'Lilian contributed', amount: 20.00, date: '2024-09-25T20:00:00Z', category: 'Income', type: 'contribution', status: 'completed', avatarUrl: 'https://picsum.photos/seed/22/100/100' },
];

export const transactions: Transaction[] = [
  { id: 't1', description: 'Netflix Subscription', amount: 15.99, date: '2024-07-28', category: 'Entertainment', type: 'expense', status: 'completed' },
  { id: 't2', description: 'Salary Deposit', amount: 3500.00, date: '2024-07-25', category: 'Income', type: 'income', status: 'completed' },
  { id: 't3', description: 'Grocery Shopping', amount: 124.50, date: '2024-07-24', category: 'Groceries', type: 'expense', status: 'completed' },
  { id: 't4', description: 'Starbucks Coffee', amount: 5.75, date: '2024-07-24', category: 'Restaurants', type: 'expense', status: 'completed' },
  { id: 't5', description: 'Electricity Bill', amount: 75.00, date: '2024-07-22', category: 'Utilities', type: 'expense', status: 'pending' },
  { id: 't6', description: 'Concert Tickets', amount: 250.00, date: '2024-07-20', category: 'Entertainment', type: 'expense', status: 'completed' },
];

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

export const categories = [
  'Groceries', 'Restaurants', 'Utilities', 'Rent', 'Mortgage', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'Income', 'Investments', 'Other'
];

export const budgets: Budget[] = [
  { id: 'b1', name: 'Monthly Coffee', amount: 250.00, spent: 328, leftToSpend: 392, limit: 720, progress: 45, status: 'Available', warning: 'Your limit for Food & Drinks is on track', savingRules: [{id: 'sr1', name: 'Spare change', description: 'Round-Up', icon: 'round-up'}, {id: 'sr2', name: 'Recurring payment', description: '€10.00 / 8th day of the month', icon: 'recurring-payment'}], transactions: detailedTransactions },
  { id: 'b2', name: 'Vehicle Fuel', amount: 400.00, spent: 328, leftToSpend: 392, limit: 720, progress: 87.5, status: 'Locked 3 months ago', warning: 'Whoops! You almost touch your budget.', savingRules: [{id: 'sr1', name: 'Spare change', description: 'Round-Up', icon: 'round-up'}], transactions: detailedTransactions },
  { id: 'b3', name: 'Gym Membership', amount: 50.00, spent: 50, leftToSpend: 0, limit: 50, progress: 100, status: 'Available', transactions: detailedTransactions.slice(0, 3) },
];


export const goals: Goal[] = [
    { id: 'g1', name: 'Trip to Utah', balance: 2150, goal: 23468.00, daysLeft: 65, progress: 9, growth: 12, status: 'Live', locked: true, deadline: '2025-12-25T00:00:00Z', savingRules: [{id: 'sr1', name: 'Spare change', description: 'Round-Up', icon: 'round-up'}, {id: 'sr2', name: 'Recurring payment', description: '€10.00 / 8th day of the month', icon: 'recurring-payment'}], transactions: detailedTransactions },
    { id: 'g2', name: 'Emergency Funds', balance: 3500.00, goal: 5000, daysLeft: 25, progress: 75, status: 'Live', locked: true, transactions: detailedTransactions.slice(2,5) },
    { id: 'g3', name: 'Car Purchase', balance: 30500, goal: 400500, daysLeft: 35, progress: 15, status: 'Live', locked: true, deadline: '2026-06-01T00:00:00Z', transactions: detailedTransactions.slice(1,4) },
    { id: 'g4', name: 'House Downpayment', balance: 50000, goal: 50000, daysLeft: 0, progress: 100, status: 'Finished', transactions: detailedTransactions.slice(4,7) },
    { id: 'g5', name: 'Vacation', balance: 2500, goal: 2500, daysLeft: 0, progress: 100, status: 'Finished' },

];

const staticDaysLeft = [65, 25, 35, 12, 48];
export const topGoals = wallets
  .filter(wallet => wallet.goal)
  .map((wallet, index) => ({
    id: wallet.id,
    name: wallet.name,
    balance: wallet.balance,
    goal: wallet.goal || 0,
    daysLeft: staticDaysLeft[index % staticDaysLeft.length],
}));


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
