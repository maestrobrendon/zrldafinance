
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wallets, budgets, goals, transactions } from "@/lib/data";
import {
  ChartContainer,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from 'recharts'
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
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
  Wallet: Icons.wallet,
};

export default function WalletDetailPage({ params }: { params: { walletId: string } }) {
  const { walletId } = params;
  
  const allItems = [...wallets, ...budgets, ...goals];
  const item = allItems.find(w => w.id === walletId);

  if (!item) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Not Found</h1>
        <p className="text-muted-foreground">The wallet you are looking for does not exist.</p>
      </div>
    );
  }

  const isWallet = 'balance' in item;
  const isBudget = 'spent' in item;
  const isGoal = 'goal' in item && 'balance' in item;

  const chartData = isBudget ? [
    { name: 'Spent', value: item.spent, fill: chartColors[0] },
    { name: 'Remaining', value: item.limit - item.spent, fill: chartColors[1] },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
        <p className="text-muted-foreground">
          Detailed view of your {isBudget ? 'budget' : isGoal ? 'goal' : 'wallet'}.
        </p>
      </div>

        {isWallet && (
            <Card className="shadow-lg bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full -mt-8 -mr-8"></div>
                <div className="absolute bottom-0 left-0 h-32 w-32 bg-white/10 rounded-full -mb-16 -ml-16"></div>
                <CardContent className="pt-6 text-center">
                    <p className="text-sm text-primary-foreground/80 mb-1">
                    Current Balance
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                    <p className="text-4xl font-bold tracking-tighter">
                        {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: 'USD',
                        }).format((item as any).balance)}
                    </p>
                    </div>
                </CardContent>
            </Card>
        )}

      {isBudget && (
         <Card>
            <CardHeader>
                <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <ChartContainer
                    config={{}}
                    className="mx-auto aspect-square h-[150px]"
                >
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} strokeWidth={5}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.spent)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.limit - item.spent)}</span>
                    </div>
                     <div className="flex justify-between font-bold">
                        <span>Total Budget</span>
                        <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.limit)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {isGoal && (
        <Card>
            <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-3">
                    <p className="text-center text-muted-foreground">
                        <span className="text-2xl font-bold text-foreground">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.balance)}
                        </span>
                        {' '} of {' '}
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.goal)}
                    </p>
                    <Progress value={item.progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.progress}% complete</span>
                        <span>{item.daysLeft} days left</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
            {transactions.slice(0, 3).map((activity, index) => {
               const Icon = categoryIcons[activity.category] || Icons.grid;
               return (
                <div key={activity.id}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 text-primary p-3 rounded-lg">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">{activity.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(activity.date), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <p className={`font-medium ${activity.type === 'income' ? 'text-green-500' : ''}`}>
                            {activity.type === 'income' ? '+' : '-'}
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(activity.amount)}
                          </p>
                    </div>
                    {index < transactions.slice(0, 3).length - 1 && <Separator className="mt-4 bg-border/50" />}
                </div>
               )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
