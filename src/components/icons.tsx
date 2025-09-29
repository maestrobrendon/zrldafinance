
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
  Lock,
  Flame,
  ArrowUp,
  X,
  Calendar,
  Image,
  Info,
  Copy,
  Share,
  QrCode,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal as MoreHorizontalIcon,
  Repeat,
  Leaf,
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
  transfer: (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  dashboard: LayoutDashboard,
  wallet: Wallet,
  users: Users,
  transactions: BarChart3,
  settings: Settings,
  more: MoreHorizontal,
  add: PlusCircle,
  'add-2': (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      <path d="M12 7.5V12h2.25" />
    </svg>
  ),
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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      <path d="M12 7.5V12h2.25" />
    </svg>
  ),
  'send-2': (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      <path d="M12 7.5V12h2.25" />
    </svg>
  ),
  receive: (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      <path d="M12 7.5V12h2.25" />
    </svg>
  ),
  withdraw: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      <path d="M12 7.5V12h2.25" />
    </svg>
  ),
  search: Search,
  notification: Bell,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
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
  scan: ScanLine,
  grid: Grid,
  filter: Filter,
  lock: Lock,
  flame: Flame,
  arrowUp: ArrowUp,
  x: X,
  calendar: Calendar,
  image: Image,
  info: Info,
  copy: Copy,
  share: Share,
  qrCode: QrCode,
  arrowLeft: ArrowLeft,
  'arrow-up-circle': (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m12 8 4 4-4 4" />
      <path d="M12 12h8" />
    </svg>
  ),
  'arrow-down-circle': (props: React.SVGProps<SVGSVGElement>) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m12 16-4-4 4-4" />
      <path d="M8 12h8" />
    </svg>
  ),
  'more-horizontal-circle': (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 12h.01" />
    </svg>
  ),
  'round-up': Leaf,
  'recurring-payment': Repeat,
  download: ArrowDownLeft,
};
