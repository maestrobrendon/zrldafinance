
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { type Transaction } from "@/lib/data";
import Link from "next/link";
import { format } from "date-fns";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import type { User } from "firebase/auth";


const favoritePeople = [
    { id: 'fav1', name: 'Grace L.', avatarUrl: 'https://picsum.photos/seed/grace/100/100', flag: '🇬🇭' },
    { id: 'fav2', name: 'Lawrence A.', fallback: 'LA', flag: '🇬🇭' },
    { id: 'fav3', name: 'Tunde O.', avatarUrl: 'https://picsum.photos/seed/tunde/100/100', flag: '🇳🇬' },
    { id: 'fav4', name: 'Maria S.', avatarUrl: 'https://picsum.photos/seed/maria/100/100', flag: '🇪🇸' },
    { id: 'fav5', name: 'Ken J.', fallback: 'KJ', flag: '🇯🇵' },
]

export default function ZCashPage() {
  const [showRequest, setShowRequest] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [zcashBalance, setZcashBalance] = useState(10000); // Placeholder

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
        // Query for recent transactions.
        const transactionsQuery = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            limit(10) // Fetch a bit more to ensure we get non-income ones
        );

        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const transactionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().timestamp.toDate().toISOString(),
            })) as unknown as Transaction[];
            
            // Sort by date descending on the client
            const sortedTransactions = transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Filter out 'income' transactions on the client side and take the first 5
            const filteredTransactions = sortedTransactions.filter(tx => tx.type !== 'income').slice(0, 5);
            
            setRecentTransactions(filteredTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching ZCash transactions: ", error);
            setLoading(false);
        });

        return () => {
            unsubscribeTransactions();
        }
    }
  }, [user]);


  const moneyRequest = {
    name: 'Liz Dizon',
    amount: 37.24,
    reason: 'Sunday Brunch',
    expires: 'Tomorrow',
    avatarUrl: 'https://picsum.photos/seed/liz/100/100'
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">ZCash</h1>
        <p className="text-muted-foreground">Send and receive money instantly.</p>
      </div>

      <Card className="shadow-lg bg-slate-900 text-white relative overflow-hidden border-0">
         <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full opacity-50"></div>
         <div className="absolute -bottom-16 -left-10 h-40 w-40 bg-primary/20 rounded-full opacity-50"></div>
        <CardContent className="pt-6 text-center relative z-10">
            <p className="text-sm text-white/70 mb-1">
                ZCash Balance
            </p>
            <div className="flex items-baseline justify-center gap-2">
                <p className="text-5xl font-bold tracking-tighter">
                    {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    }).format(zcashBalance)}
                </p>
            </div>
             <p className="text-xs text-white/50 mt-1">From your Main Wallet</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" className="h-14" asChild>
            <Link href="/send?source=zcash">
                <Icons.send className="mr-2 h-5 w-5" />
                Send
            </Link>
        </Button>
         <Button size="lg" variant="secondary" className="h-14" asChild>
            <Link href="/request">
                <Icons.receive className="mr-2 h-5 w-5" />
                Request
            </Link>
        </Button>
      </div>

      {showRequest && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={moneyRequest.avatarUrl} alt={moneyRequest.name} data-ai-hint="avatar" />
                  <AvatarFallback>{moneyRequest.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{moneyRequest.name}</p>
                  <p className="font-semibold text-lg">Requested {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(moneyRequest.amount)}</p>
                  <p className="text-sm text-muted-foreground">{moneyRequest.reason}</p>
                  <p className="text-sm text-muted-foreground">Expires {moneyRequest.expires}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowRequest(false)}>
                <Icons.x className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="my-4" />
            <Link href="/send?source=zcash" className="flex justify-between items-center w-full text-primary">
              <span className="font-semibold">Send Money</span>
              <Icons.chevronRight className="h-5 w-5" />
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Your favorite people</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" className="w-16 h-16 rounded-full bg-card hover:bg-primary/10">
                    <Icons.add className="h-6 w-6 text-primary" />
                </Button>
                <span className="text-sm font-medium">Add</span>
            </div>
            {favoritePeople.map((person) => (
                <div key={person.id} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                    <div className="relative">
                        <Avatar className="w-16 h-16">
                            {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt={person.name} />}
                            <AvatarFallback>{person.fallback || person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 text-xl border-2 border-background rounded-full">{person.flag}</span>
                    </div>
                    <span className="text-sm font-medium text-center truncate w-full">{person.name}</span>
                </div>
            ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <Card>
            <CardContent className="p-0">
               {loading ? (
                 <div className="flex justify-center items-center h-24">
                    <Icons.logo className="h-6 w-6 animate-spin" />
                </div>
               ) : recentTransactions.length > 0 ? (
                <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                    <div key={transaction.id}>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://picsum.photos/seed/${transaction.id}/100/100`} alt={transaction.description} data-ai-hint="avatar" />
                                    <AvatarFallback>{transaction.description.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{transaction.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                            <p className="font-medium">
                                -{new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(transaction.amount)}
                            </p>
                        </div>
                         {index < recentTransactions.length - 1 && <Separator />}
                    </div>
                ))}
                </div>
               ) : (
                <div className="p-6 text-center">
                    <p className="text-muted-foreground">No recent activity.</p>
                </div>
               )}
            </CardContent>
        </Card>
      </div>

       <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Special Offers</h2>
        <Card>
            <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-500">
                        <Icons.logo className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Get Up to $200 Daily Cash for Your Family</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Add a new Co-Owner and they can get $100, add new Participants and each can get $25. Spend requirements apply. Ends June 17.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    