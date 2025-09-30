
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
  const [activeTab, setActiveTab] = useState<GoalStatusFilter>("Live");

  const filteredGoals = goals.filter((goal) => {
    const progress = goal.goalAmount ? (goal.balance / goal.goalAmount) * 100 : 0;
    if (activeTab === "Live") return progress < 100;
    if (activeTab === "Finished") return progress >= 100;
    return false;
  });

  if (goals.length === 0) {
    return (
         <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Goals</h2>
            <Card className="bg-card/50">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">You haven't created any goals yet.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Goals</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "Live" ? "link" : "ghost"}
            onClick={() => setActiveTab("Live")}
            className={`font-semibold ${activeTab === 'Live' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Live
          </Button>
          <Button
            variant={activeTab === "Finished" ? "link" : "ghost"}
            onClick={() => setActiveTab("Finished")}
            className={`font-semibold ${activeTab === 'Finished' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Finished
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGoals.length > 0 ? filteredGoals.map((item: Goal) => {
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
                    <div>
                        <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(item.balance)}
                        {item.goalAmount && (
                             <span className="text-lg font-normal text-muted-foreground">
                                /{new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    notation: "compact"
                                }).format(item.goalAmount)}
                            </span>
                        )}
                        </p>
                    </div>
                    {item.goalAmount && <Progress value={progress} className="h-2" />}
                    {daysLeft !== null && (
                        <div className="flex justify-end text-xs text-muted-foreground">
                            <span>{daysLeft > 0 ? `${daysLeft} days left` : (progress >= 100 ? 'Completed' : 'Deadline passed')}</span>
                        </div>
                    )}
                </CardContent>
                </Card>
            </Link>
        )
        }) : (
            <p className="text-muted-foreground text-center pt-4">No {activeTab.toLowerCase()} goals.</p>
        )}
      </div>
    </div>
  );
}
