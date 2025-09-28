

"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import Link from "next/link";
import { wallets as allWallets, Wallet } from "@/lib/data";

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

const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const viewModes = ["By Size", "By Goal"];
const filters = ["All", "With Goals", "No Goals"];

export default function AnalyticsSection() {
    const [activeViewMode, setActiveViewMode] = React.useState("By Size");
    const [activeFilter, setActiveFilter] = React.useState("All");
    const [chartData, setChartData] = React.useState<any[]>([]);

    React.useEffect(() => {
        let filteredWallets: Wallet[] = [...allWallets];

        if (activeFilter === "With Goals") {
            filteredWallets = allWallets.filter(w => w.goal);
        } else if (activeFilter === "No Goals") {
            filteredWallets = allWallets.filter(w => !w.goal);
        }

        if (activeViewMode === "By Goal") {
            filteredWallets = filteredWallets.filter(w => w.goal);
        }
        
        let sortedWallets = filteredWallets;
        if (activeViewMode === 'By Goal') {
            sortedWallets = [...filteredWallets].sort((a, b) => (b.goal || 0) - (a.goal || 0));
        } else { // By Size
            sortedWallets = [...filteredWallets].sort((a, b) => b.balance - a.balance);
        }

        const data = sortedWallets.map((wallet, index) => ({
            name: wallet.name,
            value: activeViewMode === 'By Goal' ? wallet.goal : wallet.balance,
            fill: chartColors[index % chartColors.length],
            locked: !!wallet.goal,
        }));
        
        setChartData(data);
    }, [activeViewMode, activeFilter]);

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0)

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
                    {viewModes.map((mode) => (
                        <Button 
                            key={mode}
                            size="sm" 
                            variant={activeViewMode === mode ? "default" : "ghost"} 
                            className="rounded-full"
                            onClick={() => setActiveViewMode(mode)}
                        >
                            {mode}
                        </Button>
                    ))}
                </div>
            </div>
             <div>
                <p className="text-sm font-medium">Filter</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {filters.map((filter) => (
                         <Button 
                            key={filter}
                            size="sm" 
                            variant={activeFilter === filter ? "default" : "ghost"} 
                            className="rounded-full"
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>
        </div>

        {chartData.length > 0 ? (
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
        ) : (
            <div className="mx-auto aspect-square h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">No data to display for this filter.</p>
            </div>
        )}

         <div className="space-y-2">
          {chartData.slice(0, 5).map((entry) => (
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
                {totalValue > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {((entry.value / totalValue) * 100).toFixed(1)}%
                    </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
