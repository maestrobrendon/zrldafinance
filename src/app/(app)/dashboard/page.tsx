import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mainBalance } from "@/lib/data";
import { format } from "date-fns";
import BalanceCard from "@/components/dashboard/balance-card";
import WalletCarousel from "@/components/dashboard/wallet-carousel";
import QuickActions from "@/components/dashboard/quick-actions";
import SharedExpenses from "@/components/dashboard/shared-expenses";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{`Today is ${format(new Date(), "EEEE, MMMM do")}`}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard balance={mainBalance.balance} currency={mainBalance.currency} />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Wallets</h2>
        <WalletCarousel />
      </div>

      <div>
        <SharedExpenses />
      </div>
    </div>
  );
}
