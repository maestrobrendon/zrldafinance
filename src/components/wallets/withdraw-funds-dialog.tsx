
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

type WithdrawFundsDialogProps = {
  trigger: React.ReactNode;
  walletBalance: number;
  walletName: string;
};

export function WithdrawFundsDialog({ trigger, walletBalance, walletName }: WithdrawFundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");

  const handleSuccess = () => {
    setStep("success");
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
                    <DialogTitle>Withdraw from {walletName}</DialogTitle>
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
                        {walletName} Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(walletBalance)}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance} onClick={handleSuccess}>
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
