
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const linkedBanks = [
    { id: 'b1', name: 'Guaranty Trust Bank', last4: '... 2345' },
    { id: 'b2', name: 'Zenith Bank', last4: '... 8890' },
]

export default function TopUpPage() {
    const { toast } = useToast();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [step, setStep] = useState('select'); // select, form, success

    const handleCopy = () => {
        navigator.clipboard.writeText("0123456789");
        toast({
            title: "Copied!",
            description: "Account number copied to clipboard.",
        });
    };

    const renderSelectMethod = () => (
        <div className="space-y-4">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMethod('account')}>
                <CardHeader>
                    <CardTitle>Dedicated Account Number</CardTitle>
                    <CardDescription>Transfer to your unique account to top up.</CardDescription>
                </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMethod('card')}>
                <CardHeader>
                    <CardTitle>Top Up with Card</CardTitle>
                    <CardDescription>Use your debit or credit card.</CardDescription>
                </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMethod('bank')}>
                <CardHeader>
                    <CardTitle>Top Up from Linked Bank</CardTitle>
                    <CardDescription>Directly debit a linked bank account.</CardDescription>
                </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMethod('qr')}>
                <CardHeader>
                    <CardTitle>Top Up via QR Code</CardTitle>
                    <CardDescription>Scan a code to pay.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
    
    const renderForm = () => {
        if (!selectedMethod) return null;

        return (
            <div className="space-y-6">
                 <Button variant="ghost" onClick={() => setSelectedMethod(null)} className="mb-4">
                    <Icons.chevronLeft className="mr-2 h-4 w-4" /> Back to methods
                </Button>

                {selectedMethod === 'account' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Dedicated Account</CardTitle>
                            <CardDescription>Transfer to this account to fund your Zrlda wallet instantly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg text-center space-y-2">
                                <p className="text-sm text-muted-foreground">Zrlda Finance Bank</p>
                                <p className="text-2xl font-bold tracking-widest">0123456789</p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="w-full" onClick={handleCopy}>
                                    <Icons.copy className="mr-2 h-4 w-4" /> Copy
                                </Button>
                                 <Button className="w-full">
                                    <Icons.share className="mr-2 h-4 w-4" /> Share
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedMethod === 'card' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Top Up with Card</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" placeholder="0000 0000 0000 0000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input id="expiry" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input id="cvv" placeholder="123" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" placeholder="₦0.00" />
                            </div>
                             <Button className="w-full" onClick={() => setStep('success')}>Top Up</Button>
                        </CardContent>
                    </Card>
                )}

                {selectedMethod === 'bank' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Up from Linked Bank</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label>Select a linked account</Label>
                                {linkedBanks.map(bank => (
                                    <Card key={bank.id} className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted">
                                        <div>
                                            <p className="font-medium">{bank.name}</p>
                                            <p className="text-sm text-muted-foreground">{bank.last4}</p>
                                        </div>
                                        <Icons.chevronRight className="h-4 w-4" />
                                    </Card>
                                ))}
                                <Button variant="link" className="p-0">
                                    <Icons.add className="mr-2 h-4 w-4" /> Add new account
                                </Button>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="amount-bank">Amount</Label>
                                <Input id="amount-bank" type="number" placeholder="₦0.00" />
                            </div>
                            <Button className="w-full" onClick={() => setStep('success')}>Top Up</Button>
                        </CardContent>
                    </Card>
                )}

                {selectedMethod === 'qr' && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Scan to Top Up</CardTitle>
                             <CardDescription>Scan this QR code with your banking app to top up your wallet.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-white p-4 rounded-lg">
                                <Icons.qrCode className="h-48 w-48 text-black" />
                            </div>
                            <p className="text-sm text-muted-foreground">or save image</p>
                            <Button className="w-full" onClick={() => setStep('success')}>Done</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
    
     const renderSuccess = () => (
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icons.add className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Top Up Successful!</h2>
                <p className="text-muted-foreground">You have successfully added ₦10,000.00 to your wallet.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">₦10,000.00</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">New Balance</span>
                        <span className="font-medium">₦61,465.43</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">TX987654321</span>
                    </div>
                </CardContent>
            </Card>
            <Button className="w-full" onClick={() => { setStep('select'); setSelectedMethod(null); }}>Done</Button>
        </div>
    );


    return (
        <div className="space-y-8">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/dashboard"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Top Up Wallet</h1>
                    <p className="text-sm text-muted-foreground">
                        Your current balance: {' '}
                        <span className="font-bold text-primary">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(51440.43)}
                        </span>
                    </p>
                </div>
                 <div className="w-9"></div>
            </div>

            {step === 'select' && renderSelectMethod()}
            {step === 'form' && renderForm()}
            {step === 'success' && renderSuccess()}
        </div>
    );
}
