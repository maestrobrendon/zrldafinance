import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, transactions, wallets } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const quickActions = [
  { label: "Add", icon: Icons.add },
  { label: "Transfer", icon: Icons.send },
  { label: "Move", icon: Icons.move },
];

export default function WalletsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
      </div>

      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-4xl font-bold tracking-tighter">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(mainBalance.balance)}
            </p>
            <p className="text-lg font-semibold text-muted-foreground">
              {mainBalance.currency}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-background/50 border-primary/50 hover:bg-primary/10"
                >
                  <action.icon className="h-6 w-6 text-primary" />
                </Button>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Wallets</h2>
          <Button variant="link" asChild>
            <Link href="/wallets">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 text-primary p-3 rounded-lg">
                      <Icons.wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">{wallet.name}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: wallet.currency,
                            minimumFractionDigits: 2,
                          }).format(wallet.balance)}
                        </p>
                         <p className="text-sm font-semibold text-muted-foreground">{wallet.currency}</p>
                      </div>
                    </div>
                  </div>
                  <Icons.chevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
        </div>
        <Card className="bg-card/50">
          <CardContent className="pt-6 space-y-4">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), 'PPp')}
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
                {index < transactions.slice(0, 5).length - 1 && <Separator className="mt-4 bg-border/50" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
