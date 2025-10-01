
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "../icons";
import { type Wallet } from "@/lib/data";
import { doc, writeBatch, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type AddFundsDialogProps = {
  trigger: React.ReactNode;
  mainBalance: number;
  wallet: Wallet;
};

export function AddFundsDialog({ trigger, mainBalance, wallet }: AddFundsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form"); // form, success
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFunds = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount' });
      return;
    }
    if (addAmount > mainBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Not enough funds in main wallet.' });
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(db);

    // Debit from main balance
    const userDocRef = doc(db, "users", user.uid);
    batch.update(userDocRef, { balance: mainBalance - addAmount });

    // Credit to wallet
    const walletDocRef = doc(db, 'wallets', wallet.id);
    batch.update(walletDocRef, { balance: wallet.balance + addAmount });
    
    // Create a transaction record
    const transactionRef = doc(collection(db, "transactions"));
    batch.set(transactionRef, {
        userId: user.uid,
        walletId: wallet.id,
        amount: addAmount,
        type: 'contribution',
        status: 'completed',
        timestamp: new Date(),
        description: `Contribution to ${wallet.name}`,
        category: 'Wallet',
        to: wallet.id,
    });

    try {
        await batch.commit();
        setStep("success");
    } catch (error) {
        console.error("Add funds error:", error);
        toast({ variant: 'destructive', title: 'Transaction Failed', description: 'An error occurred while adding funds.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("form");
      setAmount("");
    }, 200);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "form" && (
            <>
                <DialogHeader>
                    <DialogTitle>Add Funds to {wallet.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Add</Label>
                        <Input
                        id="amount"
                        type="number"
                        placeholder="$0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                     <div className="text-sm text-muted-foreground">
                        Main Wallet Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mainBalance)}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > mainBalance} onClick={handleAddFunds}>
                        {isSubmitting && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                        Add Funds
                    </Button>
                </DialogFooter>
            </>
        )}
        {step === "success" && (
             <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Icons.arrowUp className="h-8 w-8 text-green-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Funds Added!</h2>
                    <p className="text-muted-foreground">
                        You successfully added {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to your {wallet.name} wallet.
                    </p>
                </div>
                <Button onClick={handleClose} className="w-full">Done</Button>
             </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
