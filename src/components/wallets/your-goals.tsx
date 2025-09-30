
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Goal } from "@/lib/data";
import { differenceInDays } from "date-fns";

type GoalStatusFilter = "Live" | "Finished";

interface YourGoalsProps {
    goals: Goal[];
}

export default function YourGoals({ goals }: YourGoalsProps) {
  const [filter, setFilter] = useState<GoalStatusFilter>("Live");

  const filteredGoals = goals.filter(goal => {
      const progress = goal.goalAmount ? (goal.balance / goal.goalAmount) * 100 : 0;
      if (filter === 'Finished') {
          return progress >= 100;
      }
      return progress < 100;
  })
  
  if (goals.length === 0) {
    return (
        <Card className="bg-card/50">
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven't created any goals yet.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end gap-2">
            <Button variant={filter === 'Live' ? 'link' : 'ghost'} onClick={() => setFilter('Live')}>Live</Button>
            <Button variant={filter === 'Finished' ? 'link' : 'ghost'} onClick={() => setFilter('Finished')}>Finished</Button>
        </div>
        {filteredGoals.map((item: Goal) => {
            const progress = item.goalAmount ? (item.balance / item.goalAmount) * 100 : 0;
            const daysLeft = item.deadline ? differenceInDays(item.deadline, new Date()) : null;

          return (
              <Link href={`/wallets/${item.id}`} key={item.id} className="block">
                <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</p>
                    </div>
                    
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between items-center">
                             <div>
                                <p className="text-xl font-bold">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(item.balance)}
                                </p>
                             </div>
                             <div className="text-right">
                                {item.goalAmount && (
                                    <p className="text-sm font-normal text-muted-foreground">
                                        of {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            notation: "compact"
                                        }).format(item.goalAmount)}
                                    </p>
                                )}
                             </div>
                        </div>
                    </div>
                    
                    {daysLeft !== null && (
                        <div className="flex justify-end text-xs text-muted-foreground">
                            <span>{daysLeft > 0 ? `${daysLeft} days left` : (progress >= 100 ? 'Completed' : 'Deadline passed')}</span>
                        </div>
                    )}
                </CardContent>
                </Card>
            </Link>
        )
        })}
    </div>
  );
}
