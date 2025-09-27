import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, sharedExpenses, transactions, user, wallets } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const iconMap: { [key: string]: React.FC<any> } = {
  Entertainment: Icons.entertainment,
  Income: Icons.dollarSign,
  Groceries: Icons.shoppingCart,
  Restaurants: Icons.utensils,
  Utilities: Icons.bolt,
  Travel: Icons.plane,
  Shopping: Icons.shoppingBag,
  Other: Icons.more,
};

const quickActions = [
    { label: "Send to", icon: Icons.send },
    { label: "Request", icon: Icons.dollarSign },
    { label: "Top up", icon: Icons.creditCard },
    { label: "More", icon: Icons.grid },
];

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

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">My Budgets</h2>
          <Button variant="link" asChild>
            <Link href="/wallets">View All</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {wallets.slice(0, 3).map((wallet) => (
              <div key={wallet.id}>
                <div className="flex justify-between mb-1">
                  <p className="font-medium">{wallet.name}</p>
                  {wallet.goal && (
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: wallet.currency,
                      }).format(wallet.balance)} of {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: wallet.currency,
                      }).format(wallet.goal)}
                    </p>
                  )}
                </div>
                 {wallet.goal ? (
                  <Progress
                    value={(wallet.balance / wallet.goal) * 100}
                    className="h-2 [&>div]:bg-primary"
                  />
                ) : (
                    <Progress
                    value={100}
                    className="h-2 [&>div]:bg-primary"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">My Circles</h2>
          <Button variant="link" asChild>
            <Link href="/circles">View All</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            {sharedExpenses.slice(0, 1).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary p-3 rounded-full">
                    <Icons.users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{expense.circle}</p>
                    <p className="text-sm text-muted-foreground">{expense.date}</p>
                  </div>
                </div>
                <p className="font-bold text-lg">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(expense.totalAmount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="link" asChild>
            <Link href="/transactions">View All</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {transactions.slice(0, 5).map((transaction) => {
              const Icon = iconMap[transaction.category] || Icons.more;
              return (
              <div key={transaction.id} className="flex items-center gap-4">
                <div className="bg-primary/20 text-primary p-3 rounded-full">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </p>
                </div>
                <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : ''}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(transaction.amount)}
                </p>
              </div>
            )})}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
