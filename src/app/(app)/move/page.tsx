
"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useUser, useFirestore } from "@/firebase";
import { collection, onSnapshot, query, where, doc, writeBatch, getDoc } from "firebase/firestore";
import { type Wallet } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function MovePage() {
    const { toast } = useToast();
    const [step, setStep] = useState('form'); // form, review, success
    const [fromWalletId, setFromWalletId] = useState<string | null>(null);
    const [toWalletId, setToWalletId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useUser();
    const firestore = useFirestore();
    const [mainBalance, setMainBalance] = useState(0);
    const [allWallets, setAllWallets] = useState<Wallet[]>([]);

    useEffect(() => {
        if (!user || !firestore) return;

        const userDocRef = doc(firestore, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            setMainBalance(doc.data()?.balance || 0);
        });

        const walletsQuery = query(collection(userDocRef, "wallets"));
        const unsubscribeWallets = onSnapshot(walletsQuery, (snapshot) => {
            const wallets: Wallet[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                wallets.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                    deadline: data.deadline?.toDate(),
                } as Wallet);
            });
            setAllWallets(wallets);
        });

        return () => {
            unsubscribeUser();
            unsubscribeWallets();
        }
    }, [user, firestore]);

    const fromWallets = allWallets.filter(w => w.status !== 'locked');
    const fromWallet = fromWalletId === 'main' ? { id: 'main', name: 'Main Wallet', balance: mainBalance } : fromWallets.find(w => w.id === fromWalletId);
    const toWallet = toWalletId === 'main' ? { id: 'main', name: 'Main Wallet', balance: mainBalance } : allWallets.find(w => w.id === toWalletId);

    const handleMove = async () => {
        if (!user || !fromWallet || !toWallet || !amount || !firestore) return;
        
        setIsSubmitting(true);
        const moveAmount = parseFloat(amount);
        if (isNaN(moveAmount) || moveAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount' });
            setIsSubmitting(false);
            return;
        }

        const batch = writeBatch(firestore);
        const userDocRef = doc(firestore, "users", user.uid);
        
        const fromBalance = fromWallet.id === 'main' ? mainBalance : fromWallet.balance;
         if (fromBalance < moveAmount) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: `Not enough balance in ${fromWallet.name}.` });
            setIsSubmitting(false);
            return;
        }

        // Debit from source
        if (fromWallet.id === 'main') {
            batch.update(userDocRef, { balance: mainBalance - moveAmount });
        } else {
            const fromWalletRef = doc(userDocRef, 'wallets', fromWallet.id);
            batch.update(fromWalletRef, { balance: fromWallet.balance - moveAmount });
        }

        // Credit to destination
        if (toWallet.id === 'main') {
             const userDoc = await getDoc(userDocRef);
             const currentMainBalance = userDoc.data()?.balance || 0;
            batch.update(userDocRef, { balance: currentMainBalance + moveAmount });
        } else {
            const toWalletRef = doc(userDocRef, 'wallets', toWallet.id);
            const toWalletDoc = await getDoc(toWalletRef);
            const currentToBalance = toWalletDoc.data()?.balance || 0;
            batch.update(toWalletRef, { balance: currentToBalance + moveAmount });
        }
        
        try {
            await batch.commit();
            setStep('success');
        } catch (error) {
            console.error("Move error:", error);
            toast({ variant: 'destructive', title: 'Move Failed', description: 'An error occurred during the transfer.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderForm = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Move Funds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>From</Label>
                        <Select onValueChange={setFromWalletId} value={fromWalletId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="main">Main Wallet ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mainBalance)})</SelectItem>
                                {fromWallets.map(wallet => (
                                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name} ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.balance)})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {fromWallet && <p className="text-sm text-muted-foreground">Available balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(fromWallet.id === 'main' ? mainBalance : fromWallet.balance)}</p>}
                    <div className="space-y-2">
                        <Label>To</Label>
                        <Select onValueChange={setToWalletId} disabled={!fromWalletId} value={toWalletId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                 {fromWalletId !== 'main' && <SelectItem value="main">Main Wallet</SelectItem>}
                                {allWallets.filter(w => w.id !== fromWalletId).map(wallet => (
                                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Move</Label>
                        <Input id="amount" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!fromWalletId || !toWalletId} />
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setStep('review')} disabled={!amount || !fromWalletId || !toWalletId}>Review Move</Button>
        </div>
    );

    const renderReview = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Review Move</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">You are moving</span>
                        <span className="text-2xl font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                     <Separator />
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">From</p>
                         <p className="font-medium">{fromWallet?.name}</p>
                    </div>
                     <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium">{toWallet?.name}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-medium">Free</span>
                    </div>
                </CardContent>
            </Card>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                <Button className="w-full" onClick={handleMove} disabled={isSubmitting}>
                    {isSubmitting && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Move
                </Button>
            </div>
        </div>
    );
    
    const renderSuccess = () => (
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icons.move className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Move Successful!</h2>
                <p className="text-muted-foreground">You have successfully moved {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to {toWallet?.name}.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">From</span>
                        <span className="font-medium">{fromWallet?.name || 'Main Wallet'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-medium">{toWallet?.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">TXM{Date.now()}</span>
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" asChild>
                <Link href="/wallets">Done</Link>
            </Button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/wallets"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Move Funds</h1>
                    <p className="text-sm text-muted-foreground">
                        Transfer money between your wallets.
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

    