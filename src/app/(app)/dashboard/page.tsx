
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, user as initialUser, transactions, walletActivities } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { CreateWalletDialog } from "@/components/wallets/create-wallet-dialog";
import { auth } from "@/lib/firebase";
import type { User } from 'firebase/auth';

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const combinedActivity = [...transactions, ...walletActivities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayName = user?.displayName || initialUser.name;
  const photoURL = user?.photoURL || initialUser.avatarUrl;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <Link href="/settings">
            <Avatar className="h-10 w-10">
            <AvatarImage src={photoURL} alt={displayName} data-ai-hint="avatar" />
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
              <p className="text-4xl font-bold tracking-tighter">
                  {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: mainBalance.currency,
                  }).format(mainBalance.balance)}
              </p>
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

      <DashboardTabs />

      <AnalyticsSection />

       <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="link" asChild>
            <Link href="/transactions">View All</Link>
          </Button>
        </div>
        <Card className="bg-card/50">
          <CardContent className="pt-6 space-y-4">
            {combinedActivity.slice(0, 4).map((activity, index) => {
               const Icon = categoryIcons[activity.category] || Icons.grid;
               const isTransaction = 'amount' in activity;

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
                        {isTransaction && (
                          <p className={`font-medium ${activity.type === 'income' ? 'text-green-500' : ''}`}>
                            {activity.type === 'income' ? '+' : '-'}
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(activity.amount)}
                          </p>
                        )}
                    </div>
                    {index < combinedActivity.slice(0, 4).length - 1 && <Separator className="mt-4 bg-border/50" />}
                </div>
               )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
