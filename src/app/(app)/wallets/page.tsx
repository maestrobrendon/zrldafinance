
"use client";

import * as React from "react";
import { type Wallet, type Budget, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";


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
  
  const renderContent = () => {
    if (loading) {
      return (
          <div className="space-y-4 pt-6">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
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
        <Tabs defaultValue="budget" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="budget" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Budget</TabsTrigger>
                <TabsTrigger value="goals" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Goals</TabsTrigger>
                <TabsTrigger value="circles" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Circles</TabsTrigger>
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
                        <p className="text-muted-foreground">You are not part of any circles yet.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Wallets</h1>
         <CreateWalletDialog 
            trigger={
                <Button variant="outline" size="icon" className="rounded-full">
                    <Icons.add className="h-5 w-5" />
                </Button>
            }
         />
      </div>

      {renderContent()}
    </div>
  );
}
