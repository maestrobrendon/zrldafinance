import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
        <p className="text-muted-foreground">
          Create, manage, and track your financial goals.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The wallet management feature is currently under development. You will soon be able to create wallets, set goals, and track your progress. Stay tuned!</p>
        </CardContent>
      </Card>
    </div>
  );
}
