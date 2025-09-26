import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  currency: string;
}

export default function BalanceCard({ balance, currency }: BalanceCardProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">
          Main Wallet Balance
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold tracking-tighter">
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(balance)}
          </p>
          <p className="text-lg font-semibold text-muted-foreground">{currency}</p>
        </div>
      </CardContent>
    </Card>
  );
}
