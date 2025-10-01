
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
import { doc, writeBatch, getDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type WithdrawFundsDialogProps = {
  trigger: React.ReactNode;
  wallet: Wallet;
};

export function WithdrawFundsDialog({ trigger, wallet }: WithdrawFundsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount' });
      return;
    }
    if (withdrawAmount > wallet.balance) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Not enough funds in ${wallet.name}.` });
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(db);
    const userDocRef = doc(db, "users", user.uid);

    // Debit from wallet
    const walletDocRef = doc(userDocRef, 'wallets', wallet.id);
    batch.update(walletDocRef, { balance: wallet.balance - withdrawAmount });

    // Credit to main balance
    const userDoc = await getDoc(userDocRef);
    const currentMainBalance = userDoc.data()?.balance || 0;
    batch.update(userDocRef, { balance: currentMainBalance + withdrawAmount });

     // Create a transaction record
    const transactionRef = doc(collection(userDocRef, "transactions"));
    batch.set(transactionRef, {
        walletId: wallet.id,
        amount: withdrawAmount,
        type: 'transfer',
        status: 'completed',
        timestamp: new Date(),
        description: `Withdraw from ${wallet.name}`,
        category: 'Wallet',
        from: wallet.id,
    });
    
    try {
        await batch.commit();
        setStep("success");
    } catch (error) {
        console.error("Withdraw funds error:", error);
        toast({ variant: 'destructive', title: 'Transaction Failed', description: 'An error occurred while withdrawing funds.' });
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
                    <DialogTitle>Withdraw from {wallet.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Withdraw</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="$0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                     <div className="text-sm text-muted-foreground">
                        {wallet.name} Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.balance)}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet.balance} onClick={handleWithdraw}>
                        {isSubmitting && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                        Withdraw
                    </Button>
                </DialogFooter>
            </>
        )}
        {step === "success" && (
             <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Icons.move className="h-8 w-8 text-green-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Withdrawal Successful!</h2>
                    <p className="text-muted-foreground">
                        You successfully withdrew {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to your main wallet.
                    </p>
                </div>
                <Button onClick={handleClose} className="w-full">Done</Button>
             </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
