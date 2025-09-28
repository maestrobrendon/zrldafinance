
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, user, transactions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WalletBreakdown from "@/components/dashboard/wallet-breakdown";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const quickActions = [
    { label: "Send to", icon: Icons.send },
    { label: "Top up", icon: Icons.add },
    { label: "Budget", icon: Icons.target },
    { label: "Withdraw", icon: Icons.history },
];

const categoryIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Entertainment: Icons.entertainment,
  Shopping: Icons.shoppingBag,
  Groceries: Icons.shoppingCart,
  Restaurants: Icons.utensils,
  Utilities: Icons.bolt,
  Travel: Icons.plane,
  Income: Icons.dollarSign,
  Other: Icons.grid,
};


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <Link href="/settings">
            <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Icons.notification className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-background"></span>
            </span>
        </Button>
      </div>

      <Card className="shadow-lg bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full -mt-8 -mr-8"></div>
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-white/10 rounded-full -mb-16 -ml-16"></div>
          <CardContent className="pt-6 text-center">
              <p className="text-sm text-primary-foreground/80 mb-1">
              Total balance
              </p>
              <div className="flex items-baseline justify-center gap-2">
              <p className="text-4xl font-bold tracking-tighter">
                  {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: mainBalance.currency,
                  }).format(mainBalance.balance)}
              </p>
              </div>
          </CardContent>
      </Card>
      
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action) => (
            <div key={action.label} className="flex flex-col items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full bg-card hover:bg-primary/10"
            >
                <action.icon className="h-6 w-6 text-primary" />
            </Button>
            <span className="text-sm font-medium">{action.label}</span>
            </div>
        ))}
        </div>

      <DashboardTabs />

      <WalletBreakdown />

       <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="link" asChild>
            <Link href="/transactions">View All</Link>
          </Button>
        </div>
        <Card className="bg-card/50">
          <CardContent className="pt-6 space-y-4">
            {transactions.slice(0, 3).map((transaction, index) => {
               const Icon = categoryIcons[transaction.category] || Icons.grid;
               return (
                <div key={transaction.id}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 text-primary p-3 rounded-lg">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : ''}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(transaction.amount)}
                        </p>
                    </div>
                    {index < transactions.slice(0, 3).length - 1 && <Separator className="mt-4 bg-border/50" />}
                </div>
               )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
