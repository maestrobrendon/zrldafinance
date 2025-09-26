import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mainBalance, sharedExpenses, transactions, user, wallets } from "@/lib/data";
import BalanceCard from "@/components/dashboard/balance-card";
import QuickActions from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">KYC: Level 1</p>
        </div>
      </div>
      
      <BalanceCard balance={mainBalance.balance} currency={mainBalance.currency} />
      <QuickActions />

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
