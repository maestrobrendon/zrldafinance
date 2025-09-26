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
  send: ArrowUpRight,
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
  history: History,
  entertainment: BarChart3,
  shoppingCart: ShoppingCart,
  utensils: Utensils,
  bolt: Bolt,
  plane: Plane,
  shoppingBag: Wallet,
  move: Replace,
  scan: ScanLine
};

    