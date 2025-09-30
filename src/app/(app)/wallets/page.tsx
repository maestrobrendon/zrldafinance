
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Wallet, Budget, Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import TopGoals from "@/components/wallets/top-goals";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import Link from 'next/link'
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import type { User } from 'firebase/auth';

const quickActions = [
  { label: "Add", icon: Icons['add-2'], isDialog: true },
  { label: "Send", icon: Icons['send-2'], href: '/send' },
  { label: "Move", icon: Icons.move, href: '/move' },
  { label: "Withdraw", icon: Icons.withdraw, href: '/withdraw' },
];

export default function WalletsPage() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(
        collection(db, "wallets"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const walletsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallet[];
        setWallets(walletsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setWallets([]);
      setLoading(false);
    }
  }, [user]);

  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

  const budgetWallets = wallets.filter(w => w.type === 'budget') as Budget[];
  const goalWallets = wallets.filter(w => w.type === 'goal') as Goal[];

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
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
            <Icons.logo className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
            <TopGoals goals={goalWallets} />
            <YourBudget budgets={budgetWallets} />
            <YourGoals goals={goalWallets} />
        </>
      )}

    </div>
  );
}
