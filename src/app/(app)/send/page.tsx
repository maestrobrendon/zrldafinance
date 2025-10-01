
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, writeBatch, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth";

const zrldaFriends = [
    { id: 'f1', name: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/2/100/100', handle: '@jane.doe' },
    { id: 'f2', name: 'John Smith', avatarUrl: 'https://picsum.photos/seed/3/100/100', handle: '@john.smith' },
    { id: 'f3', name: 'Emily White', avatarUrl: 'https://picsum.photos/seed/4/100/100', handle: '@emily.white' },
]

const activeCircles = [
    { id: 'c1', name: "Night Out w/the Boys!"},
    { id: 'c2', name: "Girl's Trip"},
]

export default function SendPage() {
    const { toast } = useToast();
    const [step, setStep] = useState('form'); // form, review, success
    const searchParams = useSearchParams()
    const source = searchParams.get('source');
    const isZcashFlow = source === 'zcash';

    const [activeTab, setActiveTab] = useState(isZcashFlow ? 'zrlda' : 'bank');
    
    // Form state
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<(typeof zrldaFriends)[0] | null>(null);
    const [selectedCircle, setSelectedCircle] = useState<(typeof activeCircles)[0] | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [mainBalance, setMainBalance] = useState(0);
    const [zcashBalance, setZcashBalance] = useState(0);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setMainBalance(userDoc.data().balance || 0);
                    setZcashBalance(userDoc.data().zcashBalance || 0);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const balanceToShow = isZcashFlow ? zcashBalance : mainBalance;

    const handleSelectFriend = (friend: (typeof zrldaFriends)[0]) => {
        setSelectedFriend(friend);
        setAmount('');
        setNote('');
    }

    const handleSend = async () => {
        if (!user || !amount || !selectedFriend) return;

        setIsSubmitting(true);
        const sendAmount = parseFloat(amount);

        if (isNaN(sendAmount) || sendAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid amount' });
            setIsSubmitting(false);
            return;
        }

        if (sendAmount > balanceToShow) {
            toast({ variant: 'destructive', title: 'Insufficient Funds' });
            setIsSubmitting(false);
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);

        if (isZcashFlow) {
            batch.update(userDocRef, { zcashBalance: zcashBalance - sendAmount });
        } else {
            batch.update(userDocRef, { balance: mainBalance - sendAmount });
        }

        const transactionRef = doc(collection(db, "transactions"));
        batch.set(transactionRef, {
            userId: user.uid,
            amount: sendAmount,
            type: 'payment',
            status: 'completed',
            timestamp: new Date(),
            description: `Sent to ${selectedFriend.name}`,
            category: 'Wallet',
            to: selectedFriend.handle,
            note: note,
        });

        try {
            await batch.commit();
            setStep('success');
             // Manually update balance for UI responsiveness
            if (isZcashFlow) {
                setZcashBalance(prev => prev - sendAmount);
            } else {
                setMainBalance(prev => prev - sendAmount);
            }
        } catch (error) {
            console.error("Send error:", error);
            toast({ variant: 'destructive', title: 'Send Failed', description: 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setStep('form');
        setAmount('');
        setNote('');
        setSelectedFriend(null);
    }

    const renderForm = () => (
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className={cn("grid w-full", isZcashFlow ? "grid-cols-2" : "grid-cols-3")}>
                {!isZcashFlow && <TabsTrigger value="bank">Bank</TabsTrigger>}
                <TabsTrigger value="zrlda">Zrlda User</TabsTrigger>
                <TabsTrigger value="circle">Circle</TabsTrigger>
            </TabsList>
            {!isZcashFlow && (
                <TabsContent value="bank">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send to Bank Account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank">Bank</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gtb">Guaranty Trust Bank</SelectItem>
                                        <SelectItem value="zenith">Zenith Bank</SelectItem>
                                        <SelectItem value="firstbank">First Bank</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-number">Account Number</Label>
                                <Input id="account-number" placeholder="Enter account number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note">Note (Optional)</Label>
                                <Input id="note" placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
            <TabsContent value="zrlda">
                 <Card>
                    <CardHeader>
                        <CardTitle>Send to Zrlda User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedFriend ? (
                            <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={selectedFriend.avatarUrl} alt={selectedFriend.name} />
                                            <AvatarFallback>{selectedFriend.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{selectedFriend.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedFriend.handle}</p>
                                        </div>
                                    </div>
                                    <Button variant="link" onClick={() => setSelectedFriend(null)}>Change</Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount-zrlda">Amount</Label>
                                    <Input id="amount-zrlda" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note-zrlda">Note (Optional)</Label>
                                    <Input id="note-zrlda" placeholder="For the weekend!" value={note} onChange={(e) => setNote(e.target.value)} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name or @username" className="pl-10" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">Recents</p>
                                <div className="space-y-3">
                                    {zrldaFriends.map(friend => (
                                        <div key={friend.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{friend.name}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleSelectFriend(friend)}>Select</Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="circle">
                <Card>
                    <CardHeader>
                        <CardTitle>Send to Circle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select a Circle</Label>
                            {activeCircles.map(circle => (
                                <Card key={circle.id} className={cn("p-4 flex justify-between items-center cursor-pointer", selectedCircle?.id === circle.id && 'border-primary')} onClick={() => setSelectedCircle(circle)}>
                                    <p className="font-medium">{circle.name}</p>
                                    <Icons.chevronRight className="h-4 w-4" />
                                </Card>
                            ))}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="amount-circle">Amount</Label>
                            <Input id="amount-circle" type="number" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!selectedCircle} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
             <Button className="w-full mt-6" onClick={() => setStep('review')} disabled={!amount}>Review Transfer</Button>
        </Tabs>
    );

    const renderReview = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Review Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">You are sending</span>
                        <span className="text-2xl font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                     <Separator />
                    {activeTab === 'zrlda' && selectedFriend && (
                         <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">To</p>
                             <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedFriend.avatarUrl} alt={selectedFriend.name} />
                                    <AvatarFallback>{selectedFriend.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{selectedFriend.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedFriend.handle}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {note && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Note</p>
                            <p className="font-medium">{note}</p>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                </CardContent>
            </Card>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                <Button className="w-full" onClick={handleSend} disabled={isSubmitting}>
                    {isSubmitting && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Send
                </Button>
            </div>
        </div>
    );

    const renderSuccess = () => (
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icons.send className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Transfer Successful!</h2>
                <p className="text-muted-foreground">You have successfully sent {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} to {selectedFriend?.name}.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-medium">{selectedFriend?.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">TX{Date.now()}</span>
                    </div>
                </CardContent>
            </Card>
            <div className="w-full flex gap-4">
                <Button variant="outline" className="w-full">Share Receipt</Button>
                <Button className="w-full" onClick={resetForm}>Done</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href={isZcashFlow ? "/zcash" : "/dashboard"}><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Send Money</h1>
                    <p className="text-sm text-muted-foreground">
                        Your {isZcashFlow ? "ZCash" : "Main"} balance: {' '}
                        <span className="font-bold text-primary">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balanceToShow)}
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

    