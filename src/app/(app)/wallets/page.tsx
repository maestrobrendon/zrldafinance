
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, transactions, wallets as initialWallets, Wallet } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const quickActions = [
  { label: "Add", icon: Icons.add, isDialog: true },
  { label: "Transfer", icon: Icons.send },
  { label: "Move", icon: Icons.move },
];

export default function WalletsPage() {
  const [wallets, setWallets] = useState(initialWallets);
  const [open, setOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [newWalletGoal, setNewWalletGoal] = useState("");

  const handleAddWallet = () => {
    if (!newWalletName || !newWalletBalance) {
      // Basic validation
      return;
    }
    const newWallet: Wallet = {
      id: `w${wallets.length + 1}`,
      name: newWalletName,
      balance: parseFloat(newWalletBalance),
      goal: newWalletGoal ? parseFloat(newWalletGoal) : undefined,
      currency: 'USD',
      color: 'bg-gray-500' // Default color
    };
    setWallets([...wallets, newWallet]);
    setOpen(false); // Close dialog
    // Reset form
    setNewWalletName("");
    setNewWalletBalance("");
    setNewWalletGoal("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
      </div>

      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-4xl font-bold tracking-tighter">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(mainBalance.balance)}
            </p>
            <p className="text-lg font-semibold text-muted-foreground">
              {mainBalance.currency}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-2">
                 {action.isDialog ? (
                   <Dialog open={open} onOpenChange={setOpen}>
                     <DialogTrigger asChild>
                       <Button
                         variant="outline"
                         size="icon"
                         className="w-16 h-16 rounded-full bg-background/50 border-primary/50 hover:bg-primary/10"
                       >
                         <action.icon className="h-6 w-6 text-primary" />
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                         <DialogTitle>Create New Wallet</DialogTitle>
                         <DialogDescription>
                           Enter the details for your new wallet. Click save when you're done.
                         </DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="name" className="text-right">
                             Name
                           </Label>
                           <Input
                             id="name"
                             value={newWalletName}
                             onChange={(e) => setNewWalletName(e.target.value)}
                             className="col-span-3"
                             placeholder="e.g. Vacation Fund"
                           />
                         </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="balance" className="text-right">
                             Balance
                           </Label>
                           <Input
                             id="balance"
                             type="number"
                             value={newWalletBalance}
                             onChange={(e) => setNewWalletBalance(e.target.value)}
                             className="col-span-3"
                             placeholder="0.00"
                           />
                         </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="goal" className="text-right">
                             Goal
                           </Label>
                           <Input
                             id="goal"
                             type="number"
                             value={newWalletGoal}
                             onChange={(e) => setNewWalletGoal(e.target.value)}
                             className="col-span-3"
                             placeholder="Optional"
                           />
                         </div>
                       </div>
                       <DialogFooter>
                         <Button type="submit" onClick={handleAddWallet}>Save changes</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                 ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full bg-background/50 border-primary/50 hover:bg-primary/10"
                  >
                    <action.icon className="h-6 w-6 text-primary" />
                  </Button>
                 )}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Wallets</h2>
          <Button variant="link" asChild>
            <Link href="/wallets">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 text-primary p-3 rounded-lg">
                      <Icons.wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">{wallet.name}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: wallet.currency,
                            minimumFractionDigits: 2,
                          }).format(wallet.balance)}
                        </p>
                         <p className="text-sm font-semibold text-muted-foreground">{wallet.currency}</p>
                      </div>
                    </div>
                  </div>
                  <Icons.chevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
        </div>
        <Card className="bg-card/50">
          <CardContent className="pt-6 space-y-4">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), 'PPp')}
                        </p>
                    </div>
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : ''}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(transaction.amount)}
                    </p>
                </div>
                {index < transactions.slice(0, 5).length - 1 && <Separator className="mt-4 bg-border/50" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
