
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wallets, budgets, goals } from "@/lib/data";

export default function WalletDetailPage({ params }: { params: { walletId: string } }) {
  const { walletId } = params;
  
  const allItems = [...wallets, ...budgets, ...goals];
  const item = allItems.find(w => w.id === walletId);

  if (!item) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Not Found</h1>
        <p className="text-muted-foreground">The wallet you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
        <p className="text-muted-foreground">
          Detailed view of your wallet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
          <p className="mt-4 text-muted-foreground">
            This is a placeholder page. More detailed components will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
