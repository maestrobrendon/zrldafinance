
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/settings"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose what you want to be notified about.
                    </p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>Sent to your mobile device.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-all">Everything</Label>
                        <Switch id="push-all" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-debits">Debits & Credits</Label>
                        <Switch id="push-debits" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-requests">Money Requests</Label>
                        <Switch id="push-requests" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="push-offers">Special Offers</Label>
                        <Switch id="push-offers" />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                     <CardDescription>Sent to your email address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="email-all">Everything</Label>
                        <Switch id="email-all" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-receipts">Transaction Receipts</Label>
                        <Switch id="email-receipts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-reports">Monthly Reports</Label>
                        <Switch id="email-reports" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="email-news">Product News & Updates</Label>
                        <Switch id="email-news" />
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
