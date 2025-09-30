
"use client";

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
        <Card className="bg-card/50">
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven't created any budgets yet.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((item) => {
          const limit = item.limit || 0;
          const balance = item.balance || 0;
          const spent = limit > 0 ? limit - balance : 0;
          const progress = limit > 0 ? (balance / limit) * 100 : 0;
          
          return (
              <Link href={`/wallets/${item.id}`} key={item.id} className="block">
                  <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                         <p className="font-semibold text-lg">{item.name}</p>
                         <Badge variant={item.status === 'open' ? 'secondary' : 'outline'} className={item.status === 'open' ? 'bg-green-500/20 text-green-400 border-none' : 'bg-yellow-500/20 text-yellow-400 border-none'}>
                              {item.status === 'locked' && <Icons.lock className="mr-1 h-3 w-3" />}
                              {item.status === 'open' ? 'Available' : 'Locked'}
                          </Badge>
                      </div>
                      <p className="text-3xl font-bold tracking-tight">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(limit)}
                      </p>
                      
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between items-center text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Spent</p>
                                <p className="font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(spent)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">Left to Spend</p>
                                <p className="font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Limit</p>
                                <p className="font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(limit)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                            {progress < 80 ? <Icons.flame className="h-4 w-4 text-green-500" /> : <Icons.flame className="h-4 w-4 text-orange-500" />}
                            <span>{progress < 80 ? 'Your limit is on track' : 'Whoops! You almost touched your budget'}</span>
                        </div>
                      </div>
                  </CardContent>
                  </Card>
              </Link>
          )
      })}
    </div>
  );
}
