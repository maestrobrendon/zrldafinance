
"use client"

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { type Wallet, type Transaction, mainBalance } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, differenceInDays } from "date-fns";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddFundsDialog } from "@/components/wallets/add-funds-dialog";
import { WithdrawFundsDialog } from "@/components/wallets/withdraw-funds-dialog";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


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
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  
  React.useEffect(() => {
    if (walletId) {
      const walletDocRef = doc(db, 'wallets', walletId);
      const unsubscribe = onSnapshot(walletDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setWallet({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            deadline: data.deadline?.toDate(),
          } as Wallet);
        } else {
          setWallet(null);
        }
      });
      return () => unsubscribe();
    }
  }, [walletId]);

  if (!wallet) {
    return (
      <div className="space-y-8 p-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">Wallet not found or loading...</h1>
        <Button asChild>
            <Link href="/wallets">Go Back to Wallets</Link>
        </Button>
      </div>
    );
  }

  const isGoal = wallet.type === 'goal';
  const isBudget = wallet.type === 'budget';
  const progress = isGoal && wallet.goalAmount ? (wallet.balance / wallet.goalAmount) * 100 :
                   isBudget && wallet.limit ? (wallet.balance / wallet.limit) * 100 : 0;
  const daysLeft = isGoal && wallet.deadline ? differenceInDays(wallet.deadline, new Date()) : null;


  // Mock data for transactions - replace with actual transaction fetching logic
  const itemTransactions: Transaction[] = [
    {
      id: "t1",
      transactionId: 't1',
      userId: 'u1',
      date: "2024-07-28T10:00:00.000Z",
      description: "Contribution",
      amount: 100,
      type: "contribution",
      status: "completed",
      category: "Wallet",
      timestamp: new Date()
    },
    {
      id: "t2",
      transactionId: 't2',
      userId: 'u1',
      date: "2024-07-25T14:30:00.000Z",
      description: "Payment for concert tickets",
      amount: 75,
      type: "payment",
      status: "completed",
      category: "Entertainment",
      timestamp: new Date()
    },
  ];
  const groupedTransactions = groupTransactionsByMonth(itemTransactions);


  return (
    <div className="space-y-6 pb-12">
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/wallets"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <h1 className="text-xl font-bold tracking-tight">{wallet.name}</h1>
            </div>
            
            {wallet.status === 'locked' && (
                <div className="text-center">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none">
                        <Icons.lock className="mr-1 h-3 w-3" />
                         {isGoal && wallet.deadline ? `Locked until ${format(wallet.deadline, 'MMM d, yyyy')}` : 'Locked'}
                    </Badge>
                </div>
            )}
            
            <div className="text-center">
                <p className="text-5xl font-bold tracking-tighter">
                    {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: 'USD',
                    }).format(wallet.balance)}
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
                    walletName={wallet.name}
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
                    walletBalance={wallet.balance}
                    walletName={wallet.name}
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
                 <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Current Balance</p>
                        <p className="font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.balance)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Budget Limit</p>
                        <p className="font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.limit || 0)}</p>
                    </div>
                </div>
            </div>
        )}

         {isGoal && (
            <div className="px-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm mt-2">
                    <p>
                        <span className="font-bold">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.balance)}
                        </span>
                        {' '} of {' '}
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.goalAmount || 0)}
                    </p>
                    {daysLeft !== null && <p className="text-muted-foreground">{daysLeft > 0 ? `${daysLeft} days left` : 'Finished'}</p>}
                </div>
            </div>
      )}

      {isGoal && (
             <div className="px-4 space-y-3">
                <h2 className="text-lg font-bold tracking-tight">Details</h2>
                <Card>
                    <CardContent className="p-4 space-y-4">
                       <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Amount</span>
                            <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.goalAmount || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deadline</span>
                            <span className="font-medium">{wallet.deadline ? format(wallet.deadline, 'MMM d, yyyy') : 'Not set'}</span>
                        </div>
                         {daysLeft !== null && (
                            <>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Days Left</span>
                                    <span className="font-medium">{daysLeft > 0 ? daysLeft : 0}</span>
                                </div>
                            </>
                         )}
                    </CardContent>
                </Card>
            </div>
        )}

        <div className="space-y-4 pt-8">
            <h2 className="text-lg font-bold tracking-tight px-4">Transaction History</h2>
            {Object.keys(groupedTransactions).length > 0 ? Object.entries(groupedTransactions).map(([month, transactions]) => (
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
                                                    {format(parseISO(activity.date), 'MMM d, hh:mm a')}
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
            )) : (
                 <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No transactions for this wallet yet.</p>
                    </CardContent>
                </Card>
            )}
      </div>
    </div>
  );
}
