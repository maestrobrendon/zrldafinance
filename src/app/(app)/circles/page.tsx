
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

const circles = [
  {
    id: "1",
    name: "Night Out w/the Boys!",
    date: "April 19",
    amount: 1500,
    members: 5,
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Girl's Trip",
    date: "June 2",
    amount: 0,
    members: 4,
    status: "UPCOMING",
  },
  {
    id: "3",
    name: "Beach Hangout",
    date: "September 19",
    amount: 12000,
    members: 15,
    status: "PAST",
  },
];

const recentActivity = {
  name: "Friday Night",
  balance: 12000,
  members: ["NW", "SH", "JW"],
  activities: [
    { user: "NW", description: "Added", amount: 200 },
    { user: "SH", description: "Drinks", amount: 35 },
    { user: "JW", description: "Added", amount: 500 },
  ],
};

export default function CirclesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Groups/Circles</h1>
      </div>

      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">My Circles</h2>
        </div>
        <TabsList className="grid w-full grid-cols-4 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">All</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Active</TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Button className="w-full justify-center" variant="secondary">
            <Icons.add className="mr-2 h-4 w-4" />
            Create New Circle
          </Button>

          <div className="space-y-4 mt-4">
            {circles.map((circle) => (
              <Card key={circle.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{circle.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {circle.date} &middot;{" "}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(circle.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {circle.members} Members
                      </p>
                    </div>
                    <Badge variant={
                        circle.status === 'ACTIVE' ? 'default' :
                        circle.status === 'UPCOMING' ? 'secondary' : 'outline'
                    }>{circle.status}</Badge>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="link" className="p-0 h-auto">View &gt;</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
        
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Recent</h2>
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-lg">{recentActivity.name}</p>
                        <Button>Contribute</Button>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Wallet balance</p>
                        <p className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            }).format(recentActivity.balance)}
                        </p>
                    </div>

                    <div className="flex items-center">
                        {recentActivity.members.map((member) => (
                            <Avatar key={member} className="h-8 w-8 -ml-2 border-2 border-background">
                                <AvatarFallback>{member}</AvatarFallback>
                            </Avatar>
                        ))}
                        <Avatar className="h-8 w-8 -ml-2 border-2 border-background">
                            <AvatarFallback>+3</AvatarFallback>
                        </Avatar>
                    </div>

                    <div>
                        <p className="font-medium mb-2">Group Activity</p>
                        <div className="space-y-2">
                            {recentActivity.activities.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">{activity.user}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm">{activity.description}</p>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        }).format(activity.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-semibold">Add Expense to Circle</p>
                        <p className="text-sm text-muted-foreground">Manually or Scan Reciept</p>
                    </div>
                    <Icons.scan className="h-6 w-6 text-primary" />
                </CardContent>
            </Card>
        </div>

    </div>
  );
}

    