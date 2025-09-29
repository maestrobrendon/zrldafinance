
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { mainBalance, transactions } from "@/lib/data";
import Link from "next/link";
import { format } from "date-fns";

export default function ZCashPage() {
  const recentTransactions = transactions
    .filter(t => t.type !== 'income')
    .slice(0, 5);

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
                    currency: mainBalance.currency,
                    }).format(mainBalance.balance)}
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
         <Button size="lg" variant="secondary" className="h-14">
            <Icons.receive className="mr-2 h-5 w-5" />
            Request
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <Card>
            <CardContent className="p-0">
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
