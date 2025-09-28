
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { budgets, goals, circles } from "@/lib/data";

type Tab = "budget" | "goals" | "circles";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("budget");

  return (
    <div>
      <div className="flex justify-center items-center gap-2 mb-6">
        <Button
          variant={activeTab === "budget" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("budget")}
          className="rounded-full"
        >
          Budget
        </Button>
        <Button
          variant={activeTab === "goals" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("goals")}
          className="rounded-full"
        >
          Goals
        </Button>
        <Button
          variant={activeTab === "circles" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("circles")}
          className="rounded-full"
        >
          Circles
        </Button>
      </div>

      <div>
        {activeTab === "budget" && (
          <div className="space-y-4">
            {budgets.map((item) => (
              <Link href={`/wallets#${item.id}`} key={item.id} className="block">
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
                            <Icons.lock className="mr-1 h-3 w-3" />
                            {item.status}
                          </Badge>
                        ) : (
                           <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none">
                            <Icons.lock className="mr-1 h-3 w-3" />
                            {item.status}
                          </Badge>
                        )}
                    </div>
                    <Progress value={item.progress} className="h-2 [&>div]:bg-purple-600" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>You have {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.left)} left</span>
                        <span>{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {activeTab === "goals" && (
           <div className="space-y-4">
            {goals.map((item) => (
              <Link href={`/wallets#${item.id}`} key={item.id} className="block">
                <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-muted-foreground">{item.name}</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(item.amount)}
                    </p>
                    <Progress value={item.progress} className="h-2 [&>div]:bg-purple-600" />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Saved {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.saved)}</span>
                        <span>Target: {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {activeTab === "circles" && (
           <div className="space-y-4">
            {circles.map((item) => (
              <Link href="/circles" key={item.id} className="block">
                <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                     <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.date} &middot;{" "}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.members} Members
                        </p>
                      </div>
                      <Badge variant={
                          item.status === 'ACTIVE' ? 'default' :
                          item.status === 'UPCOMING' ? 'secondary' : 'outline'
                      }>{item.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
