
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { type Wallet, type Budget, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import TopGoals from "@/components/wallets/top-goals";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import Link from 'next/link';
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const quickActions = [
  { label: "Add", icon: Icons['add-2'], isDialog: true },
  { label: "Send", icon: Icons['send-2'], href: '/send' },
  { label: "Move", icon: Icons.move, href: '/move' },
  { label: "Withdraw", icon: Icons.withdraw, href: '/withdraw' },
];

export default function WalletsPage() {
  const [wallets, setWallets] = React.useState<Wallet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(
            collection(db, "wallets"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const unsubscribeWallets = onSnapshot(q, (querySnapshot) => {
            const userWallets: Wallet[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                userWallets.push({
                    id: doc.id,
                    ...data,
                     // Convert Firestore Timestamps to JS Date objects
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                    deadline: data.deadline?.toDate(),
                } as Wallet);
            });
            setWallets(userWallets);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching wallets:", err);
            setError("Failed to load wallets. Please try again.");
            setLoading(false);
        });
        return () => unsubscribeWallets();
      } else {
        setWallets([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const budgets = wallets.filter(w => w.type === 'budget') as Budget[];
  const goals = wallets.filter(w => w.type === 'goal') as Goal[];
  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-48 w-full" />
            <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="flex gap-4">
                    <Skeleton className="h-32 flex-1" />
                    <Skeleton className="h-32 flex-1" />
                    <Skeleton className="h-32 flex-1" />
                </div>
            </div>
             <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="text-center py-10">
            <p className="text-destructive">{error}</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-center">My Wallet</h1>
      </div>

      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Wallets Balance</p>
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-4xl font-bold tracking-tighter">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalBalance)}
            </p>
            <p className="text-lg font-semibold text-muted-foreground">
              USD
            </p>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-2">
                 {action.isDialog ? (
                   <CreateWalletDialog 
                      trigger={
                         <Button
                            variant="outline"
                            size="icon"
                            className="w-16 h-16 rounded-full bg-background/50 border-primary/50 hover:bg-primary/10"
                          >
                            <action.icon className="h-6 w-6 text-primary" />
                          </Button>
                      }
                   />
                 ) : (
                   <Link href={action.href || '#'}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-16 h-16 rounded-full bg-background/50 border-primary/50 hover:bg-primary/10"
                    >
                      <action.icon className="h-6 w-6 text-primary" />
                    </Button>
                  </Link>
                 )}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <TopGoals goals={goals} />
      <YourBudget budgets={budgets} />
      <YourGoals goals={goals} />
    </div>
  );
}
