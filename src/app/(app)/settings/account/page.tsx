
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { user } from "@/lib/data";

export default function AccountSettingsPage() {
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
                    Update your personal information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ztag">@Ztag</Label>
                        <Input id="ztag" defaultValue="@alex.doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 234 567 890" />
                    </div>
                    <Button>Save Changes</Button>
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
