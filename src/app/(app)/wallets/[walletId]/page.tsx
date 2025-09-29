
"use client"

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { wallets, budgets, goals, Transaction, mainBalance } from "@/lib/data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddFundsDialog } from "@/components/wallets/add-funds-dialog";
import { WithdrawFundsDialog } from "@/components/wallets/withdraw-funds-dialog";

const chartData = [
  { month: "Oct", desktop: 186 },
  { month: "Nov", desktop: 305 },
  { month: "Dec", desktop: 237 },
  { month: "Jan", desktop: 273 },
  { month: "Feb", desktop: 209 },
]

const chartConfig = {
  desktop: {
    label: "Spending",
    color: "hsl(var(--chart-1))",
  },
}

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
  contribution: Icons.download,
  payment: Icons.move
};

const groupTransactionsByMonth = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    const month = format(parseISO(transaction.date), 'MMMM, yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);
};

export default function WalletDetailPage({ params: { walletId } }: { params: { walletId: string } }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const allItems = [...wallets, ...budgets, ...goals];
  const item = allItems.find(w => w.id === walletId);

  if (!item) {
    return (
      <div className="space-y-8 p-4">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Not Found</h1>
        <p className="text-muted-foreground">The wallet you are looking for does not exist.</p>
      </div>
    );
  }

  const isWallet = 'balance' in item && !('spent' in item) && !('goal' in item);
  const isBudget = 'spent' in item;
  const isGoal = 'goal' in item && 'balance' in item;
  const typedItem = item as any;


  const itemTransactions = (item as any).transactions || [];
  const groupedTransactions = groupTransactionsByMonth(itemTransactions);


  return (
    <div className="space-y-6 pb-12">
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/wallets"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <h1 className="text-xl font-bold tracking-tight">{item.name}</h1>
            </div>
            
            {isGoal && typedItem.locked && (
                <div className="text-center">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none">
                        <Icons.lock className="mr-1 h-3 w-3" />
                         {typedItem.deadline ? `Locked until ${format(new Date(typedItem.deadline), 'MMM d, yyyy')}` : 'Locked until target is met'}
                    </Badge>
                </div>
            )}
             {isBudget && item.status !== 'Available' && (
                <div className="text-center">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none">
                        <Icons.lock className="mr-1 h-3 w-3" />
                        {item.status}
                    </Badge>
                </div>
            )}
            
            <div className="text-center">
                <p className="text-5xl font-bold tracking-tighter">
                    {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: 'USD',
                    }).format((item as any).balance || (item as any).amount)}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <AddFundsDialog 
                    trigger={
                        <div className="flex flex-col items-center gap-2 cursor-pointer">
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-primary/10 border-primary/20 text-primary">
                                <Icons.arrowUp className="h-6 w-6" />
                            </Button>
                            <span className="text-sm font-medium">Add Funds</span>
                        </div>
                    }
                    mainBalance={mainBalance.balance}
                    walletName={item.name}
                />
                <WithdrawFundsDialog 
                    trigger={
                        <div className="flex flex-col items-center gap-2 cursor-pointer">
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-primary/10 border-primary/20 text-primary">
                                <Icons.move className="h-5 w-5" />
                            </Button>
                            <span className="text-sm font-medium">Withdraw</span>
                        </div>
                    }
                    walletBalance={(item as any).balance || (item as any).amount}
                    walletName={item.name}
                />
                <div className="flex flex-col items-center gap-2">
                     <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-primary/10 border-primary/20 text-primary">
                        <Icons.more className="h-6 w-6" />
                    </Button>
                    <span className="text-sm font-medium">More</span>
                </div>
            </div>
        </div>

        {isBudget && (
            <div className="px-4 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.spent)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Left to Spend</p>
                        <p className="font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.leftToSpend)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Limit</p>
                        <p className="font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.limit)}</p>
                    </div>
                </div>
                <div>
                    <Progress value={item.progress} className="h-2" />
                    {item.warning && (
                        <div className="flex items-center text-xs text-orange-400 gap-2 mt-2">
                            <Icons.flame className="h-4 w-4" />
                            <span>{item.warning}</span>
                        </div>
                    )}
                </div>
            </div>
        )}

         {isGoal && (
            <div className="px-4">
                <Progress value={item.progress} className="h-2" />
                <div className="flex justify-between text-sm mt-2">
                    <p>
                        <span className="font-bold">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.balance)}
                        </span>
                        {' '} of {' '}
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.goal)}
                    </p>
                    <p className="text-muted-foreground">{item.daysLeft} days left</p>
                </div>
            </div>
      )}


        {isBudget && (item as any).savingRules && (item as any).savingRules.length > 0 && (
             <div className="px-4 space-y-3">
                <h2 className="text-lg font-bold tracking-tight">Saving rules</h2>
                <Card>
                    <CardContent className="p-4 space-y-4">
                       {(item as any).savingRules.map((rule: any, index: number) => {
                           const Icon = Icons[rule.icon as keyof typeof Icons] as React.ElementType || Icons.grid;
                           return (
                             <div key={rule.id}>
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/20 text-primary p-3 rounded-lg">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{rule.name}</p>
                                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                                    </div>
                                </div>
                                {index < (item as any).savingRules.length - 1 && <Separator className="my-4" />}
                             </div>
                           )
                       })}
                    </CardContent>
                </Card>
            </div>
        )}

        {isGoal && (
             <div className="px-4 space-y-3">
                <h2 className="text-lg font-bold tracking-tight">Details</h2>
                <Card>
                    <CardContent className="p-4 space-y-4">
                       <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Amount</span>
                            <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(typedItem.goal)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deadline</span>
                            <span className="font-medium">{typedItem.deadline ? format(new Date(typedItem.deadline), 'MMM d, yyyy') : 'Not set'}</span>
                        </div>
                         <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Left</span>
                            <span className="font-medium">{typedItem.daysLeft}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        <div className="px-4 space-y-2">
            <h2 className="text-lg font-bold tracking-tight">This Month</h2>
            <p className="text-sm text-muted-foreground">You Spent $8.95 more than last month</p>
             <Card>
                <CardContent className="p-2">
                <ChartContainer config={chartConfig} className="aspect-auto h-[150px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 10,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-muted-foreground/30" />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                        dataKey="desktop"
                        type="natural"
                        fill="var(--color-desktop)"
                        fillOpacity={0.4}
                        stroke="var(--color-desktop)"
                        stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>


        <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight px-4">Transaction Details</h2>
            {Object.entries(groupedTransactions).map(([month, transactions]) => (
                <div key={month}>
                    <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">{month}</h3>
                     <Card>
                        <CardContent className="p-4 space-y-2">
                            {transactions.map((activity, index) => {
                               const Icon = activity.icon || categoryIcons[activity.type] || categoryIcons[activity.category] || Icons.grid;
                               const isIncome = activity.type === 'income' || activity.type === 'contribution';
                                return (
                                <div key={activity.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {activity.avatarUrl ? (
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={activity.avatarUrl} />
                                                    <AvatarFallback>{activity.description.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="bg-primary/20 text-primary p-2.5 rounded-full">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <p className="font-medium">{activity.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {isClient ? format(parseISO(activity.date), 'MMM d, hh:mm a') : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-medium ${isIncome ? 'text-green-500' : ''}`}>
                                            {isIncome ? '+' : '-'}
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            }).format(activity.amount)}
                                        </p>
                                    </div>
                                    {index < transactions.length - 1 && <Separator className="mt-4 bg-border/50" />}
                                </div>
                               )
                            })}
                        </CardContent>
                     </Card>
                </div>
            ))}
      </div>
    </div>
  );
}
