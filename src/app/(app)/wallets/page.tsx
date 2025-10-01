
"use client";

import * as React from "react";
import { type Wallet, type Budget, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";
import TopGoals from "@/components/wallets/top-goals";
import Link from "next/link";


const quickActions = [
    { label: "Add", icon: Icons.add, href: "/top-up" },
    { label: "Transfer", icon: Icons['send-2'], href: "/send" },
    { label: "Move", icon: Icons.move, href: "/move" },
];


export default function WalletsPage() {
  const [wallets, setWallets] = React.useState<Wallet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mainBalance, setMainBalance] = React.useState(0);
  
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // Main balance listener
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setMainBalance(doc.data().balance || 0);
            }
        });
        
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

        return () => {
            unsubscribeUser();
            unsubscribeWallets();
        };
      } else {
        setWallets([]);
        setMainBalance(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const budgets = wallets.filter(w => w.type === 'budget') as Budget[];
  const goals = wallets.filter(w => w.type === 'goal') as Goal[];
  
  const renderContent = () => {
    if (loading) {
      return (
          <div className="space-y-4 pt-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
          </div>
      )
    }

    if (error) {
      return (
          <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
          </Card>
      )
    }
    
    return (
        <div className="space-y-8">
            <TopGoals goals={goals} />
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Your Budget</h2>
                    <Button variant="link">View all</Button>
                </div>
                <YourBudget budgets={budgets} />
            </div>

            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Your Goal</h2>
                </div>
                <YourGoals goals={goals} />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        </div>

        <Card className="shadow-lg bg-card/50">
            <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                Total balance
                </p>
                <div className="flex items-baseline justify-center gap-2">
                <p className="text-4xl font-bold tracking-tighter">
                    {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    }).format(mainBalance)}
                </p>
                 <p className="text-lg font-semibold text-muted-foreground">USD</p>
                </div>
            </CardContent>
        </Card>

         <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
                <Link href={action.href} key={action.label} className="flex flex-col items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-16 h-16 rounded-full bg-card hover:bg-primary/10"
                    >
                        <action.icon className="h-6 w-6 text-primary" />
                    </Button>
                    <span className="text-sm font-medium">{action.label}</span>
                </Link>
            ))}
        </div>

      {renderContent()}
    </div>
  );
}
