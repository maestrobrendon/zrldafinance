
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { type Transaction, type Wallet, type Budget, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { auth, db } from "@/lib/firebase";
import type { User } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, orderBy, limit, setDoc } from "firebase/firestore";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";

const quickActions = [
    { label: "Send To", icon: Icons['send-2'], href: "/send" },
    { label: "Top Up", icon: Icons['add-2'], href: "/top-up" },
    { label: "Budget", icon: Icons.target, isDialog: true },
    { label: "Withdraw", icon: Icons.withdraw, href: "/withdraw" },
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

export default function DashboardPage() {
  const [showBanner, setShowBanner] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [mainBalance, setMainBalance] = useState<number | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
            // Main balance listener
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.balance === undefined || data.balance === null) {
                        // One-time fix for existing users with no balance
                        setDoc(userDocRef, { balance: 50000 }, { merge: true });
                        setMainBalance(50000);
                    } else {
                        setMainBalance(data.balance);
                    }
                } else {
                    // This case should ideally not happen for a logged-in user
                    // but as a fallback, we can create the doc.
                    setDoc(userDocRef, { balance: 50000 }, { merge: true });
                    setMainBalance(50000);
                }
            });

            // Wallets listener
            const walletsQuery = query(
                collection(db, "wallets"), 
                where("userId", "==", firebaseUser.uid), 
                orderBy("createdAt", "desc"), 
                limit(6)
            );
            const unsubscribeWallets = onSnapshot(walletsQuery, (querySnapshot) => {
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
            }, (error) => {
                console.error("Error fetching wallets:", error);
                 if (error.code === 'permission-denied') {
                    console.error("Firestore security rules are blocking the query.");
                }
            });

            // Transactions listener
            const transactionsQuery = query(
                collection(db, "transactions"), 
                where("userId", "==", firebaseUser.uid), 
                orderBy("timestamp", "desc"), 
                limit(4)
            );
            const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
                const transactions: Transaction[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    transactions.push({
                        id: doc.id,
                        ...data,
                        timestamp: data.timestamp.toDate(),
                        date: data.timestamp.toDate().toISOString(),
                    } as Transaction);
});
                setRecentTransactions(transactions);
            }, (error) => {
                console.error("Error fetching transactions:", error);
                 if (error.code === 'permission-denied') {
                    console.error("Firestore security rules are blocking the transactions query.");
                }
            });

            return () => {
                unsubscribeUser();
                unsubscribeWallets();
                unsubscribeTransactions();
            };
        } else {
            setWallets([]);
            setMainBalance(0);
            setRecentTransactions([]);
        }
    });
    
    return () => unsubscribeAuth();
  }, []);

  const displayName = user?.displayName || "User";
  const photoURL = user?.photoURL;

  const budgets = wallets.filter(w => w.type === 'budget') as Budget[];
  const goals = wallets.filter(w => w.type === 'goal') as Goal[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <Link href="/settings">
            <Avatar className="h-10 w-10">
            <AvatarImage src={photoURL || undefined} alt={displayName} data-ai-hint="avatar" />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Icons.notification className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-background"></span>
            </span>
        </Button>
      </div>

      <Card className="shadow-lg bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full -mt-8 -mr-8"></div>
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-white/10 rounded-full -mb-16 -ml-16"></div>
          <CardContent className="pt-6 text-center">
              <p className="text-sm text-primary-foreground/80 mb-1">
              Total balance
              </p>
              <div className="flex items-baseline justify-center gap-2">
                {mainBalance === null || typeof mainBalance !== 'number' ? (
                    <p className="text-4xl font-bold tracking-tighter">Loading...</p>
                ) : (
                    <p className="text-4xl font-bold tracking-tighter">
                        {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        }).format(mainBalance)}
                    </p>
                )}
              </div>
          </CardContent>
      </Card>
      
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action) => (
            <div key={action.label} className="flex flex-col items-center gap-2">
            {action.isDialog ? (
              <CreateWalletDialog 
                trigger={
                  <Button
                      variant="outline"
                      size="icon"
                      className="w-16 h-16 rounded-full bg-card hover:bg-primary/10"
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
                        className="w-16 h-16 rounded-full bg-card hover:bg-primary/10"
                    >
                        <action.icon className="h-6 w-6 text-primary" />
                    </Button>
                </Link>
            )}
            <span className="text-sm font-medium">{action.label}</span>
            </div>
        ))}
      </div>

      {showBanner && (
        <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center gap-4 relative">
          <div className="bg-blue-700 p-2 rounded-lg">
            <Icons.flame className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm">
              You are doing <span className="font-bold">great</span> this month with{' '}
              <span className="font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(450.97)}
              </span>{' '}
              saved.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setShowBanner(false)}
          >
            <Icons.x className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      )}
      
      <Separator className="my-6" />

       <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">My Wallets</h2>
            <div className="flex items-center gap-2">
                <Button variant="link" asChild>
                    <Link href="/wallets">View All</Link>
                </Button>
                 <CreateWalletDialog 
                    trigger={
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                            <Icons.add className="h-4 w-4" />
                        </Button>
                    }
                 />
            </div>
        </div>
        <Tabs defaultValue="budget" className="w-full">
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
      </div>

       <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="link" asChild>
            <Link href="/transactions">View All</Link>
          </Button>
        </div>
        <Card className="bg-card/50">
          <CardContent className="pt-6 space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((activity, index) => {
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
                      {index < recentTransactions.length - 1 && <Separator className="mt-4 bg-border/50" />}
                  </div>
                 )
              })
            ) : (
                <p className="text-muted-foreground text-center">No recent transactions found.</p>
            )}
          </CardContent>
        </Card>
      </div>

       <AnalyticsSection wallets={wallets} />
    </div>
  );
}

    