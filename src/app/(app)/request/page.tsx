
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

const zrldaFriends = [
    { id: 'f1', name: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/2/100/100', handle: '@jane.doe' },
    { id: 'f2', name: 'John Smith', avatarUrl: 'https://picsum.photos/seed/3/100/100', handle: '@john.smith' },
    { id: 'f3', name: 'Emily White', avatarUrl: 'https://picsum.photos/seed/4/100/100', handle: '@emily.white' },
]

export default function RequestPage() {
    const router = useRouter();
    const [step, setStep] = useState('form'); // form, review, success
    const [selectedFriend, setSelectedFriend] = useState<(typeof zrldaFriends)[0] | null>(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [zcashBalance, setZcashBalance] = useState(0);
    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setZcashBalance(userDoc.data().zcashBalance || 0);
                }
            }
        });
        return () => unsubscribe();
    }, []);


    const handleSelectFriend = (friend: (typeof zrldaFriends)[0]) => {
        setSelectedFriend(friend);
    };

    const renderForm = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Request From</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="relative">
                        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name or @username" className="pl-10" />
                    </div>

                    {selectedFriend ? (
                         <div className="space-y-4 pt-4">
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
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mt-4">Recents</p>
                            <div className="space-y-3 mt-2">
                                {zrldaFriends.map(friend => (
                                    <div key={friend.id} className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md" onClick={() => handleSelectFriend(friend)}>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-medium">{friend.name}</p>
                                        </div>
                                        <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Button className="w-full mt-6" onClick={() => setStep('review')} disabled={!selectedFriend || !amount}>Review Request</Button>
        </div>
    );

    const renderReview = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Review Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">You are requesting</span>
                        <span className="text-2xl font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))}</span>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">From</p>
                         <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={selectedFriend?.avatarUrl} alt={selectedFriend?.name} />
                                <AvatarFallback>{selectedFriend?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{selectedFriend?.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedFriend?.handle}</p>
                            </div>
                        </div>
                    </div>
                     {note && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Note</p>
                            <p className="font-medium">{note}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                <Button className="w-full" onClick={() => setStep('success')}>Confirm & Request</Button>
            </div>
        </div>
    );

    const renderSuccess = () => (
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icons.receive className="h-10 w-10 text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Request Sent!</h2>
                <p className="text-muted-foreground">You have successfully requested {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount))} from {selectedFriend?.name}.</p>
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
                        <span className="text-muted-foreground">Request ID</span>
                        <span className="font-medium">REQ{Date.now()}</span>
                    </div>
                </CardContent>
            </Card>
            <div className="w-full flex gap-4">
                <Button variant="outline" className="w-full">Share</Button>
                <Button className="w-full" asChild>
                    <Link href="/zcash">Done</Link>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => router.back()}>
                    <Icons.arrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Request Money</h1>
                    <p className="text-sm text-muted-foreground">
                        Your ZCash balance: {' '}
                        <span className="font-bold text-primary">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(zcashBalance)}
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

    
