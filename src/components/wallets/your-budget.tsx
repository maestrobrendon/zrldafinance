
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Budget } from "@/lib/data";

interface YourBudgetProps {
    budgets: Budget[];
}

export default function YourBudget({ budgets }: YourBudgetProps) {
  if (budgets.length === 0) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Budgets</h2>
            <Card className="bg-card/50">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">You haven't created any budgets yet.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Budgets</h2>
        <Button variant="link" asChild>
          <Link href="/wallets">View All</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {budgets.map((item) => {
            const limit = item.limit || 0;
            const balance = item.balance || 0;
            const spent = limit - balance;
            const progress = limit > 0 ? (spent / limit) * 100 : 0;
            
            return (
                <Link href={`/wallets/${item.id}`} key={item.id} className="block">
                    <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-lg">{item.name}</p>
                                <p className="text-3xl font-bold">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(balance)}
                                </p>
                            </div>
                            <Badge variant={item.status === 'open' ? 'secondary' : 'outline'} className={item.status === 'open' ? 'bg-green-500/20 text-green-400 border-none' : 'bg-yellow-500/20 text-yellow-400 border-none'}>
                                {item.status === 'locked' && <Icons.lock className="mr-1 h-3 w-3" />}
                                {item.status === 'open' ? 'Available' : 'Locked'}
                            </Badge>
                        </div>
                        
                        {limit > 0 && (
                            <div className="space-y-3">
                                <Progress value={progress} className="h-2" />
                                <div className="grid grid-cols-3 text-center">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Spent</p>
                                        <p className="text-sm font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(spent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Left to Spend</p>
                                        <p className="text-sm font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Limit</p>
                                        <p className="text-sm font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(limit)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Icons.flame className="h-4 w-4 text-orange-400 mr-2" />
                                    <span>Your limit for {item.name} is on track.</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    </Card>
                </Link>
            )
        })}
      </div>
    </div>
  );
}
