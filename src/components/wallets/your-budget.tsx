
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { budgets } from "@/lib/data";

export default function YourBudget() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Budget</h2>
        <Button variant="link" asChild>
          <Link href="/wallets">View All</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {budgets.map((item) => (
          <Link href={`/wallets/${item.id}`} key={item.id} className="block">
            <Card className="bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground">{item.name}</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(item.amount)}
                    </p>
                  </div>
                  {item.status === 'Available' ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none">
                      {item.status}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none">
                      <Icons.lock className="mr-1 h-3 w-3" />
                      {item.status}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                    <Progress value={item.progress} className="h-2" />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.spent)}</span>
                        <span>Left: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.leftToSpend)}</span>
                        <span>Limit: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.limit)}</span>
                    </div>
                </div>
                {item.warning && (
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Icons.flame className="h-4 w-4 text-orange-400" />
                        <span>{item.warning}</span>
                    </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
