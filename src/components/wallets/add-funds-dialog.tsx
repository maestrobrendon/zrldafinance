
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
import { Separator } from "../ui/separator";

type AddFundsDialogProps = {
  trigger: React.ReactNode;
  mainBalance: number;
  walletName: string;
};

export function AddFundsDialog({ trigger, mainBalance, walletName }: AddFundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form"); // form, success

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
                    <DialogTitle>Add Funds to {walletName}</DialogTitle>
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
                    <Button type="button" disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > mainBalance} onClick={handleSuccess}>
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
                        You successfully added {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to your {walletName} wallet.
                    </p>
                </div>
                <Button onClick={handleClose} className="w-full">Done</Button>
             </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Icons } from "../icons";
