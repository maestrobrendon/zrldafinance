
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import type { User } from 'firebase/auth';
import type { Transaction } from "@/lib/data";

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

const groupTransactionsByDate = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), 'MMMM d, yyyy');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);
};

export default function TransactionsPage() {
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const q = query(
                collection(db, "transactions"),
                where("userId", "==", user.uid)
            );

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const transactionsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().timestamp.toDate().toISOString(),
                })) as unknown as Transaction[];

                const sortedTransactions = transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setTransactions(sortedTransactions);
                setLoading(false);
            }, (err) => {
                console.error(err);
                setError("Failed to fetch transactions. Please try again later.");
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        } else {
            setLoading(false);
        }
    }, [user]);

    const groupedTransactions = groupTransactionsByDate(transactions);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">
                View and manage your spending history.
                </p>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <Icons.logo className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {error && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && Object.keys(groupedTransactions).length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">You don't have any transactions yet.</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && Object.keys(groupedTransactions).length > 0 && (
                <div className="space-y-6">
                    {Object.entries(groupedTransactions).map(([date, transactionsOnDate]) => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold text-muted-foreground mb-3">{date}</h2>
                            <Card>
                                <CardContent className="divide-y divide-border/50 p-0">
                                {transactionsOnDate.map((activity) => {
                                    const Icon = categoryIcons[activity.category] || Icons.grid;
                                    const isIncome = activity.type === 'income';
                                    return (
                                        <div key={activity.transactionId} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-primary/20 text-primary p-3 rounded-lg">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{activity.description}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(activity.date), 'p')}
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
                                        </div>
                                    )
                                })}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
