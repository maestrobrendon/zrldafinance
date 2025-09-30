
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function GeneralSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
                    <Link href="/settings"><Icons.arrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">General Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage privacy, data, and other settings.
                    </p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Control how your information is shared.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="social-feed">Social Feed Visibility</Label>
                        <Switch id="social-feed" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="contact-sync">Sync Contacts</Label>
                        <Switch id="contact-sync" defaultChecked />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Data & Storage</CardTitle>
                     <CardDescription>Manage your app data and storage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="font-medium">Clear Cache</p>
                        <Button variant="outline">Clear</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                            <Label>Deactivate Account</Label>
                            <p className="text-sm text-muted-foreground">Temporarily disable your account.</p>
                        </div>
                        <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">Deactivate</Button>
                    </div>
                     <div className="flex items-center justify-between">
                        <div>
                            <Label>Delete Account</Label>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and data.</p>
                        </div>
                        <Button variant="destructive">Delete</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
