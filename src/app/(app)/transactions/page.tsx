import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage your spending history.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The full transaction management and AI categorization feature is currently under development. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
