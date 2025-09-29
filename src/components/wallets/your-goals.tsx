
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { goals, Goal } from "@/lib/data";
import { Icons } from "../icons";

type GoalStatus = "Live" | "Finished";

export default function YourGoals() {
  const [activeTab, setActiveTab] = useState<GoalStatus>("Live");

  const filteredGoals = goals.filter((goal) => goal.status === activeTab);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Goal</h2>
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
            Finish
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGoals.map((item: Goal) => (
          <Link href={`/wallets/${item.id}`} key={item.id} className="block">
            <Card className="bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <p className="font-semibold">{item.name}</p>
                    {item.growth && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none">
                            +{item.growth}% <Icons.arrowUp className="ml-1 h-3 w-3" />
                        </Badge>
                    )}
                    {item.progress && !item.growth && (
                        <p className="text-sm font-medium text-muted-foreground">{item.progress}%</p>
                    )}
                </div>
                <div>
                     <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(item.balance)}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            notation: "compact"
                          }).format(item.goal)}
                      </span>
                    </p>
                </div>
                <Progress value={item.progress} className="h-2" />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Completed'}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
