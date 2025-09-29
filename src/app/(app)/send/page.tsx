
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { user } from "@/lib/data";
import Link from "next/link";

const zrldaFriends = [
    { id: 'f1', name: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/2/100/100' },
    { id: 'f2', name: 'John Smith', avatarUrl: 'https://picsum.photos/seed/3/100/100' },
    { id: 'f3', name: 'Emily White', avatarUrl: 'https://picsum.photos/seed/4/100/100' },
]

const activeCircles = [
    { id: 'c1', name: "Night Out w/the Boys!"},
    { id: 'c2', name: "Girl's Trip"},
]

export default function SendPage() {
    const [step, setStep] = useState('form'); // form, review, success
    const [activeTab, setActiveTab] = useState('bank');

    const renderForm = () => (
        <Tabs defaultValue="bank" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bank">Bank</TabsTrigger>
                <TabsTrigger value="zrlda">Zrlda User</TabsTrigger>
                <TabsTrigger value="circle">Circle</TabsTrigger>
            </TabsList>
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
                            <Input id="amount" type="number" placeholder="₦0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="note">Note (Optional)</Label>
                            <Input id="note" placeholder="What's this for?" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="zrlda">
                 <Card>
                    <CardHeader>
                        <CardTitle>Send to Zrlda User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                    <Button variant="ghost" size="sm">Select</Button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount-zrlda">Amount</Label>
                            <Input id="amount-zrlda" type="number" placeholder="₦0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="note-zrlda">Note (Optional)</Label>
                            <Input id="note-zrlda" placeholder="For the weekend!" />
                        </div>
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
                                <Card key={circle.id} className="p-4 flex justify-between items-center">
                                    <p className="font-medium">{circle.name}</p>
                                    <Icons.chevronRight className="h-4 w-4" />
                                </Card>
                            ))}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="amount-circle">Amount</Label>
                            <Input id="amount-circle" type="number" placeholder="₦0.00" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
             <Button className="w-full mt-6" onClick={() => setStep('review')}>Review Transfer</Button>
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
                        <span className="text-2xl font-bold">₦10,000.00</span>
                    </div>
                     <Separator />
                    {activeTab === 'bank' && (
                         <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">To</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <Icons.wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Jane Doe</p>
                                    <p className="text-sm text-muted-foreground">GTBank - 0123456789</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'zrlda' && (
                         <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">To</p>
                             <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={zrldaFriends[0].avatarUrl} alt={zrldaFriends[0].name} />
                                    <AvatarFallback>{zrldaFriends[0].name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{zrldaFriends[0].name}</p>
                                    <p className="text-sm text-muted-foreground">@jane.doe</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="font-medium">₦25.00</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>₦10,025.00</span>
                    </div>
                </CardContent>
            </Card>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('form')}>Back</Button>
                <Button className="w-full" onClick={() => setStep('success')}>Confirm & Send</Button>
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
                <p className="text-muted-foreground">You have successfully sent ₦10,000.00 to Jane Doe.</p>
            </div>
            <Card className="w-full text-left">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">₦10,000.00</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-medium">Jane Doe</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">TX123456789</span>
                    </div>
                </CardContent>
            </Card>
            <div className="w-full flex gap-4">
                <Button variant="outline" className="w-full">Share Receipt</Button>
                <Button className="w-full" onClick={() => setStep('form')}>Done</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/dashboard"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Send Money</h1>
                    <p className="text-sm text-muted-foreground">
                        Your current balance: {' '}
                        <span className="font-bold text-primary">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(51440.43)}
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
