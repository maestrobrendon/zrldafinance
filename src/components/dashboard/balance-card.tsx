import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface BalanceCardProps {
  balance: number;
  currency: string;
}

export default function BalanceCard({ balance, currency }: BalanceCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground shadow-lg">
      <CardHeader>
        <CardDescription className="text-primary-foreground/80">
          Main Account Balance
        </CardDescription>
        <CardTitle className="text-4xl font-bold tracking-tighter">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
          }).format(balance)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-xs">
          <Icons.creditCard className="mr-2 h-4 w-4" />
          <span>**** **** **** 1234</span>
        </div>
      </CardContent>
    </Card>
  );
}
