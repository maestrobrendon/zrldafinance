
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/settings"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Security</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your PIN, biometrics, and 2FA.
                    </p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Login & Recovery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="create-pin">Change PIN</Label>
                        <p className="text-sm text-muted-foreground">
                        Update your 4-digit transaction PIN.
                        </p>
                    </div>
                    <Button variant="outline">Change PIN</Button>
                    </div>
                    <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="biometrics">Enable Biometrics</Label>
                        <p className="text-sm text-muted-foreground">
                        Use Face ID or fingerprint for login.
                        </p>
                    </div>
                    <Switch id="biometrics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                         Not enabled.
                        </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Devices & Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4">
                         <p className="font-medium">iPhone 14 Pro Max</p>
                         <p className="text-sm text-green-500">This device</p>
                    </div>
                     <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">Macbook Pro</p>
                            <p className="text-sm text-muted-foreground">Last seen: 2 days ago</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                    </div>
                    <Button variant="destructive" className="w-full">Logout from all devices</Button>
                </CardContent>
            </Card>

        </div>
    )
}
