
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { mainBalance, Wallet, budgets as initialBudgets, goals as initialGoals } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
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
import TopGoals from "@/components/wallets/top-goals";
import YourBudget from "@/components/wallets/your-budget";
import YourGoals from "@/components/wallets/your-goals";

const quickActions = [
  { label: "Add", icon: Icons.add, isDialog: true },
  { label: "Transfer", icon: Icons.transfer },
  { label: "Move", icon: Icons.move },
];

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
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
        <h1 className="text-3xl font-bold tracking-tight text-center">My Wallet</h1>
      </div>

      <Card className="bg-card/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-4xl font-bold tracking-tighter">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
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
      
      <TopGoals />
      <YourBudget />
      <YourGoals />

    </div>
  );
}
