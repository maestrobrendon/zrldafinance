
"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { type Wallet, type Goal, type Budget } from "@/lib/data"
import Link from "next/link"
import { Button } from "../ui/button"

interface YourWalletsProps {
  wallets: Wallet[];
}

export default function YourWallets({ wallets }: YourWalletsProps) {
  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Wallets</h2>
        <Button variant="link" asChild>
          <Link href="/wallets">View All</Link>
        </Button>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {wallets.map((wallet) => {
            const isGoal = wallet.type === 'goal';
            const goal = wallet as Goal;
            const budget = wallet as Budget;
            const progress = isGoal 
              ? goal.goalAmount && goal.goalAmount > 0 ? (goal.balance / goal.goalAmount) * 100 : 0
              : budget.limit && budget.limit > 0 ? (budget.balance / budget.limit) * 100 : 0;
            const Icon = wallet.type === 'goal' ? '🎯' : '💰';

            return (
              <CarouselItem key={wallet.id} className="md:basis-1/2 lg:basis-1/3">
                 <Link href={`/wallets/${wallet.id}`} className="block">
                    <div className="p-1">
                    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/50">
                        <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                             <span className="text-lg">{Icon}</span>
                            <p className="font-semibold text-base truncate">{wallet.name}</p>
                        </div>
                        
                        <div>
                            <p className="text-2xl font-bold tracking-tight">
                                {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: 'USD',
                                }).format(wallet.balance)}
                            </p>
                             <p className="text-xs text-muted-foreground">
                                {isGoal ? 'saved' : 'left'}
                            </p>
                        </div>

                        {(isGoal && goal.goalAmount) || (!isGoal && budget.limit) ? (
                            <div>
                                <Progress value={progress} className="h-2"/>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{Math.round(progress)}%</span>
                                    <span>
                                        of {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: 'USD',
                                            notation: 'compact'
                                        }).format(isGoal ? goal.goalAmount || 0 : budget.limit || 0)}
                                    </span>
                                </div>
                            </div>
                        ) : null}
                        </CardContent>
                    </Card>
                    </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
