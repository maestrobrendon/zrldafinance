
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, writeBatch, collection } from "firebase/firestore";
import type { User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const linkedBanks = [
    { id: 'b1', name: 'Guaranty Trust Bank', account: '0123456789' },
]

export default function WithdrawPage() {
    const { toast } = useToast();
    const [step, setStep] = useState('form'); // form, review, success
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [mainBalance, setMainBalance] = useState<number | null>(null);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
            setUser(firebaseUser);
            if(firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setMainBalance(doc.data().balance || 0);
                    } else {
                        setMainBalance(0);
                    }
                });
                return () => unsubscribeUser();
            } else {
                setMainBalance(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleWithdrawal = async () => {
        if (!user || !amount) return;

        setIsSubmitting(true);
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount' });
            setIsSubmitting(false);
            return;
        }

        if (mainBalance === null || withdrawAmount > mainBalance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds' });
            setIsSubmitting(false);
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);
        const newBalance = mainBalance - withdrawAmount;

        batch.update(userDocRef, { balance: newBalance });

        const transactionRef = doc(collection(db, "transactions"));
        const newTransactionId = `TXW${Date.now()}`;
        batch.set(transactionRef, {
            userId: user.uid,
            amount: withdrawAmount,
            type: 'expense',
            status: 'completed',
            timestamp: new Date(),
            description: `Withdrawal to ${linkedBanks[0].name}`,
            category: 'Wallet',
            transactionId: newTransactionId
        });
        
        setTransactionId(newTransactionId);

        try {
            await batch.commit();
            setMainBalance(newBalance);
            setStep('success');
        } catch (error) {
            console.error("Withdraw error:", error);
            toast({ variant: 'destructive', title: 'Withdrawal Failed', description: 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderForm = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Withdraw Funds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Withdraw to</Label>
                        <Card className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{linkedBanks[0].name}</p>
                                <p className="text-sm text-muted-foreground">{linkedBanks[0].account}</p>
                            </div>
                            <Button variant="ghost" size="sm">Change</Button>
                        </Card>
                         <Button variant="link" className="p-0">
                            <Icons.add className="mr-2 h-4 w-4" /> Add new bank account
                        </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Withdraw</Label>
                        <Input id="amount" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setStep('review')} disabled={!amount}>Review Withdrawal</Button>
        </div>
    );

    const renderReview = () => {
        const withdrawAmount = parseFloat(amount) || 0;
        const fee = 50;
        const total = withdrawAmount > 0 ? withdrawAmount - fee : 0;

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Review Withdrawal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">You are withdrawing</span>
                            <span className="text-2xl font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(withdrawAmount)}</span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">To</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <Icons.wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{linkedBanks[0].name}</p>
                                    <p className="text-sm text-muted-foreground">{linkedBanks[0].account}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Fee</span>
                            <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(fee)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>You will receive</span>
                            <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</span>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex gap-4">
                    <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                    <Button className="w-full" onClick={handleWithdrawal} disabled={isSubmitting}>
                        {isSubmitting && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Withdraw
                    </Button>
                </div>
            </div>
        );
    }
    
    const renderSuccess = () => (
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icons.withdraw className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Withdrawal Successful!</h2>
                <p className="text-muted-foreground">Your withdrawal of {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} is being processed.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Receiving Bank</span>
                        <span className="font-medium">{linkedBanks[0].name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">{transactionId}</span>
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" asChild>
              <Link href="/dashboard">Done</Link>
            </Button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/dashboard"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Withdraw</h1>
                    <p className="text-sm text-muted-foreground">
                        Your current balance: {' '}
                        <span className="font-bold text-primary">
                             {mainBalance === null ? (
                                'Loading...'
                            ) : (
                                new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mainBalance)
                            )}
                        </span>
                    </p>
                </div>
                <div className="w-9"></div>
            </div>

            {step === 'form' && renderForm()}
            {step === 'review' && renderReview()}
            {step === 'success' && renderSuccess()}
        </div>
    );
}
