
"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountSettingsPage() {
    const { toast } = useToast();
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || 'https://picsum.photos/seed/1/100/100');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.displayName || "");
            setEmail(user.email || "");
            setAvatarUrl(user.photoURL || 'https://picsum.photos/seed/1/100/100');
        }
    }, [user]);

    const handleSaveChanges = async () => {
        if (!user) return;

        try {
            await updateProfile(user, {
                displayName: name,
                photoURL: avatarUrl,
            });
            await setDoc(doc(db, "users", user.uid), {
                displayName: name,
                photoURL: avatarUrl
            }, { merge: true });

            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                // For prototype, we'll use localStorage to 'store' the image
                // In a real app, you would upload this to Firebase Storage
                localStorage.setItem(`avatar_${user?.uid}`, result);
                setAvatarUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };
    
     useEffect(() => {
        if(user) {
            const storedAvatar = localStorage.getItem(`avatar_${user.uid}`);
            if (storedAvatar) {
                setAvatarUrl(storedAvatar);
            }
        }
    }, [user]);


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/settings"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Account Information</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your personal and bank details.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>
                        Update your personal information. Click the avatar to change it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                         <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                            <AvatarImage src={avatarUrl} alt={name} />
                            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                         <Button variant="outline" onClick={handleAvatarClick}>Change Avatar</Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ztag">@Ztag</Label>
                            <Input id="ztag" defaultValue="@alex.doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" defaultValue="+1 234 567 890" />
                        </div>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Linked Accounts</CardTitle>
                    <CardDescription>
                        Manage your connected bank accounts and cards.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Icons.creditCard className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Mastercard **** 1234</p>
                                <p className="text-sm text-muted-foreground">Expires 12/25</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Icons.wallet className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">GTBank - ****6789</p>
                                <p className="text-sm text-muted-foreground">Savings Account</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    <Button variant="outline">
                        <Icons.add className="mr-2 h-4 w-4" />
                        Add New Account or Card
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
