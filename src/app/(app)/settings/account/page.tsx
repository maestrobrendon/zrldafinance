
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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountSettingsPage() {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [ztag, setZtag] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [canEditZtag, setCanEditZtag] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setName(user.displayName || "");
                setEmail(user.email || "");
                setAvatarUrl(user.photoURL || undefined);

                // Fetch additional user data from Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setZtag(userData.ztag || "");
                    setPhone(userData.phone || "");

                    // Implement logic to check if ztag can be edited (once a month)
                    const lastUpdated = userData.ztagLastUpdated?.toDate();
                    if (lastUpdated) {
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        if (lastUpdated > oneMonthAgo) {
                            setCanEditZtag(false);
                        }
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSaveChanges = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsSaving(true);
        
        // This simulates a file upload by generating a new placeholder URL.
        const newPhotoURL = newAvatarFile 
            ? `https://picsum.photos/seed/${Math.random()}/100/100` 
            : avatarUrl; // Keep current URL if no new file is selected

        const updatedProfile = {
            displayName: name,
            photoURL: newPhotoURL,
        };

        try {
            // Update Firebase Auth profile
            await updateProfile(user, updatedProfile);

            // Update Firestore document
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                name: name,
                photoURL: newPhotoURL,
                phone: phone,
                ztag: ztag,
                updatedAt: serverTimestamp(),
                // If ztag was changed, update the timestamp
                // ztagLastUpdated: serverTimestamp() 
            }, { merge: true });

            setAvatarUrl(newPhotoURL); // Update local state to reflect new URL
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
            setNewAvatarFile(null); // Reset file input state
        } catch (error: any) {
             console.error("Update error:", error.message);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "An error occurred while saving your profile.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatarUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                            <AvatarImage src={avatarUrl || undefined} alt={name} />
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
                             <p className="text-xs text-muted-foreground">Email address cannot be changed in this prototype.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ztag">@Ztag</Label>
                            <Input id="ztag" value={ztag} onChange={(e) => setZtag(e.target.value)} disabled={!canEditZtag || isSaving} />
                            {!canEditZtag && <p className="text-xs text-muted-foreground">You can only change your @Ztag once every 30 days.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving && <Icons.logo className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
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
