
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { user } from "@/lib/data";

const settingsItems = [
  { href: "/settings/account", icon: Icons['user-cog'], label: "Account Information", description: "Manage your personal and bank details." },
  { href: "/settings/security", icon: Icons.shield, label: "Security", description: "PIN, biometrics, 2FA, and more." },
  { href: "/settings/preferences", icon: Icons['sliders-horizontal'], label: "Preferences", description: "Currency, language, and appearance." },
  { href: "/settings/notifications", icon: Icons.notification, label: "Notifications", description: "Email, SMS, and push notifications." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
            <Link href="/dashboard"><Icons.arrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and app settings.
          </p>
        </div>
      </div>
        
      <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="avatar" />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">@alex.doe</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings/account">Edit Profile</Link>
          </Button>
      </div>

      <div className="space-y-4">
        {settingsItems.map((item) => (
          <Link href={item.href} key={item.label} className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

       <div className="space-y-4">
        <Link href="/support" className="block">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-semibold">Help & Support</p>
                    <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
            </Card>
        </Link>
         <Card className="border-destructive/50">
            <CardContent className="p-4 flex items-center justify-between">
                <p className="font-semibold text-destructive">Logout</p>
            </CardContent>
        </Card>
       </div>

    </div>
  );
}
