
"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import { Button } from "../ui/button"
import { Icons } from "../icons"

const chartData = [
  { name: "Data", value: 70000.00, fill: "hsl(var(--chart-1))", locked: true },
  { name: "Groceries", value: 65000.00, fill: "hsl(var(--chart-2))" },
  { name: "Others1", value: 15000.00, fill: "hsl(var(--chart-3))" },
  { name: "Others2", value: 10000.00, fill: "hsl(var(--chart-4))" },
  { name: "Others3", value: 5000.00, fill: "hsl(var(--chart-5))" },
]

const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0)

export default function AnalyticsSection() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full items-center justify-between">
            <CardTitle>Analytics</CardTitle>
            <Button variant="link" asChild>
                <Link href="/analytics">View All</Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium">View Mode</p>
                <div className="flex gap-2 mt-2">
                    <Button size="sm" className="rounded-full">By Size</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">By Time</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">By Status</Button>
                </div>
            </div>
             <div>
                <p className="text-sm font-medium">Filter</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" className="rounded-full">All</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">Locked</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">Unlocked</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">Shared</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">With Goals</Button>
                </div>
            </div>
        </div>

        <ChartContainer
          config={{}}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="focus:outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

         <div className="space-y-2">
          {chartData.slice(0, 2).map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
                {entry.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(entry.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((entry.value / totalValue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
