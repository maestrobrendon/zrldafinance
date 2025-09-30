
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { mainBalance } from "@/lib/data";
import Link from "next/link";

export default function MovePage() {
    const [step, setStep] = useState('form'); // form, review, success
    const [fromWalletId, setFromWalletId] = useState<string | null>(null);
    const [toWalletId, setToWalletId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');

    const fromWallet = null; // Replace with actual data fetching
    const toWallet = null; // Replace with actual data fetching
    const allWallets: any[] = []; // Replace with actual data fetching
    
    const renderForm = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Move Funds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>From</Label>
                        <Select onValueChange={setFromWalletId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="main">Main Wallet ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mainBalance.balance)})</SelectItem>
                                {allWallets.map(wallet => (
                                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name} ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.balance)})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {fromWallet && <p className="text-sm text-muted-foreground">Available balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((fromWallet as any).balance)}</p>}
                    <div className="space-y-2">
                        <Label>To</Label>
                        <Select onValueChange={setToWalletId} disabled={!fromWallet}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                {allWallets.filter(w => w.id !== fromWalletId).map(wallet => (
                                    <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Move</Label>
                        <Input id="amount" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!fromWallet || !toWallet} />
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setStep('review')} disabled={!amount || !fromWallet || !toWallet}>Review Move</Button>
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
                         <p className="font-medium">{(fromWallet as any)?.name}</p>
                    </div>
                     <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium">{(toWallet as any)?.name}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-medium">Free</span>
                    </div>
                </CardContent>
            </Card>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                <Button className="w-full" onClick={() => setStep('success')}>Confirm & Move</Button>
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
                <p className="text-muted-foreground">You have successfully moved {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to {(toWallet as any)?.name}.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">From</span>
                        <span className="font-medium">{(fromWallet as any)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-medium">{(toWallet as any)?.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">TXM123456789</span>
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setStep('form')}>Done</Button>
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
