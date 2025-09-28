import {
  type LucideIcon,
  LayoutDashboard,
  Wallet,
  Users,
  BarChart3,
  Settings,
  MoreHorizontal,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  DollarSign,
  LogOut,
  User as UserIcon,
  Menu,
  Target,
  History,
  ShoppingCart,
  Utensils,
  Bolt,
  Plane,
  Replace,
  ScanLine,
  Grid,
  Filter,
  Lock
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16v4L4 20v-4h16" />
    </svg>
  ),
  dashboard: LayoutDashboard,
  wallet: Wallet,
  users: Users,
  transactions: BarChart3,
  settings: Settings,
  more: MoreHorizontal,
  add: PlusCircle,
  send: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm2.24 14.28L12 14.54l-2.24 1.74a1 1 0 0 1-1.42-1.21l.84-2.73-1.95-1.9a1 1 0 0 1 .55-1.7h2.8l1.34-2.46a1 1 0 0 1 1.78 0l1.34 2.46h2.8a1 1 0 0 1 .55 1.7l-1.95 1.9.84 2.73a1 1 0 0 1-1.42 1.21z" />
       <path d="M12 7.5V12" />
    </svg>
  ),
  receive: ArrowDownLeft,
  search: Search,
  notification: Bell,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  logout: LogOut,
  user: UserIcon,
  menu: Menu,
  target: Target,
  history: ArrowDownLeft,
  entertainment: BarChart3,
  shoppingCart: ShoppingCart,
  utensils: Utensils,
  bolt: Bolt,
  plane: Plane,
  shoppingBag: Wallet,
  move: Replace,
  scan: ScanLine,
  grid: Grid,
  filter: Filter,
  lock: Lock,
};
