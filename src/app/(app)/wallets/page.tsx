
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Wallet, type Budget, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";


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
            unsubscribeWallets();
        };
      } else {
        setWallets([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const budgets = wallets.filter(w => w.type === 'budget') as Budget[];
  const goals = wallets.filter(w => w.type === 'goal') as Goal[];
  
  if (loading) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-24" />
                 <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
         <CreateWalletDialog 
            trigger={
                <Button variant="outline" size="icon" className="rounded-full">
                    <Icons.add className="h-5 w-5" />
                </Button>
            }
         />
      </div>

      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="circles">Circles</TabsTrigger>
        </TabsList>
        <TabsContent value="budget" className="mt-6">
          <YourBudget budgets={budgets} />
        </TabsContent>
        <TabsContent value="goals" className="mt-6">
          <YourGoals goals={goals} />
        </TabsContent>
        <TabsContent value="circles" className="mt-6">
            <Card className="bg-card/50">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Circles are coming soon!</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
