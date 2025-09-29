
"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { topGoals } from "@/lib/data"
import Link from "next/link"
import { Progress } from "../ui/progress"

export default function TopGoals() {
  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Top Goals</h2>
        <Carousel
        opts={{
            align: "start",
        }}
        className="w-full"
        >
        <CarouselContent>
            {topGoals.map((goal) => (
            <CarouselItem key={goal.id} className="basis-2/3 md:basis-1/3">
                <Link href={`/wallets/${goal.id}`}>
                    <Card className="bg-card/50 hover:bg-card/80 transition-colors">
                        <CardContent className="p-4 space-y-2">
                             <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{goal.name}</span>
                                <span>{goal.daysLeft} days left</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(goal.balance)}
                            </p>
                            <Progress value={(goal.balance / goal.goal) * 100} className="h-1" />
                            <p className="text-sm text-muted-foreground text-right">
                                / {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    notation: "compact"
                                }).format(goal.goal)}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </CarouselItem>
            ))}
        </CarouselContent>
        </Carousel>
    </div>
  )
}
