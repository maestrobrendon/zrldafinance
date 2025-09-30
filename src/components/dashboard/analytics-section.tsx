

"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import Link from "next/link";
import { Wallet, Goal } from "@/lib/data";

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
const filters = ["All", "Budgets", "Goals"];

interface AnalyticsSectionProps {
    wallets: Wallet[];
}

export default function AnalyticsSection({ wallets }: AnalyticsSectionProps) {
    const [activeViewMode, setActiveViewMode] = React.useState("By Size");
    const [activeFilter, setActiveFilter] = React.useState("All");
    const [chartData, setChartData] = React.useState<any[]>([]);

    React.useEffect(() => {
        let filteredWallets: Wallet[] = [...wallets];

        if (activeFilter === "Budgets") {
            filteredWallets = wallets.filter(w => w.type === 'budget');
        } else if (activeFilter === "Goals") {
            filteredWallets = wallets.filter(w => w.type === 'goal');
        }

        if (activeViewMode === "By Goal") {
            filteredWallets = filteredWallets.filter(w => w.type === 'goal');
        }
        
        let sortedWallets = filteredWallets;
        if (activeViewMode === 'By Goal') {
            sortedWallets = [...filteredWallets].sort((a, b) => ((b as Goal).goalAmount || 0) - ((a as Goal).goalAmount || 0));
        } else { // By Size
            sortedWallets = [...filteredWallets].sort((a, b) => b.balance - a.balance);
        }

        const data = sortedWallets.map((wallet, index) => ({
            name: wallet.name,
            value: activeViewMode === 'By Goal' && wallet.type === 'goal' ? (wallet as Goal).goalAmount : wallet.balance,
            fill: chartColors[index % chartColors.length],
            isGoal: wallet.type === 'goal',
        }));
        
        setChartData(data);
    }, [wallets, activeViewMode, activeFilter]);

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
            <Button variant="link" asChild>
                <Link href="/analytics">View All</Link>
            </Button>
        </div>
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
                        {entry.isGoal && <Lock className="h-3 w-3 text-muted-foreground" />}
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
    </div>
  )
}
